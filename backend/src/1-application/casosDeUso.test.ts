import { METODO_PAGAMENTO, MOTIVOS_PERDA, ORIGEM, STATUS_PEDIDO, TIPO_DESPESA } from "@hortilink/dominio";
import { criarExemplo } from "@hortilink/dominio/exemplo";
import { describe, expect, it } from "vitest";
import { criarRepositorioEmMemoria } from "../2-adapters/memoria/repositorioEmMemoria";
import { criarCasosDeUso } from "./casosDeUso";
import { ErroDeAplicacao } from "./erros";

const agora = new Date("2026-11-15T12:00:00.000Z");
const PRODUTOR = "user-produtor";
const OUTRO_PRODUTOR = "user-produtor-2";
const COMPRADOR = "user-comprador";
const LOJA = "user-loja";

function montar() {
  const repositorio = criarRepositorioEmMemoria(criarExemplo(agora));
  return { repositorio, casos: criarCasosDeUso({ repositorio, relogio: () => agora }) };
}

/** Espera que a promessa falhe com um ErroDeAplicacao do motivo informado. */
async function falhaCom(promessa: Promise<unknown>, motivo: ErroDeAplicacao["motivo"]) {
  await expect(promessa).rejects.toBeInstanceOf(ErroDeAplicacao);
  await expect(promessa).rejects.toMatchObject({ motivo });
}

const compra = {
  type: ORIGEM.OFERTA,
  sourceId: "oferta-1",
  productId: "produto-1",
  quantity: 2,
  storeId: "loja-1",
};

describe("autenticação e perfis", () => {
  it("usuário inexistente não é autenticado", async () => {
    const { casos } = montar();
    await falhaCom(casos.registrarDespesa("ninguem", { type: TIPO_DESPESA.CUSTO, description: "x", amount: 1 }), "nao-autenticado");
  });

  it("comprador não pode cadastrar produto e produtor não pode comprar", async () => {
    const { casos } = montar();
    await falhaCom(
      casos.salvarProduto(COMPRADOR, { name: "Couve", category: "Verduras", unit: "mç", price: 3, quantity: 10 }),
      "proibido",
    );
    await falhaCom(casos.criarPedido(PRODUTOR, compra), "proibido");
  });
});

describe("produtor", () => {
  it("cadastra produto sempre em nome de quem está logado", async () => {
    const { casos, repositorio } = montar();
    await casos.salvarProduto(PRODUTOR, { name: "Couve", category: "Verduras", unit: "mç", price: 3, quantity: 10 });
    expect(repositorio.espiar().products[0]).toMatchObject({ name: "Couve", producerId: PRODUTOR });
  });

  it("não edita, exclui nem movimenta estoque de produto de outro produtor", async () => {
    const { casos } = montar();
    await falhaCom(
      casos.salvarProduto(OUTRO_PRODUTOR, { id: "produto-1", name: "X", category: "Verduras", unit: "kg", price: 1, quantity: 1 }),
      "proibido",
    );
    await falhaCom(casos.excluirProduto(OUTRO_PRODUTOR, "produto-1"), "proibido");
    await falhaCom(casos.registrarEntrada(OUTRO_PRODUTOR, { productId: "produto-1", quantity: 1, unitCost: 1 }), "proibido");
    await falhaCom(casos.encerrarOferta(OUTRO_PRODUTOR, "oferta-1"), "proibido");
  });

  it("registra perda do próprio produto e grava o novo estoque", async () => {
    const { casos, repositorio } = montar();
    await casos.registrarPerda(PRODUTOR, { productId: "produto-1", quantity: 5, reason: MOTIVOS_PERDA[0] });
    expect(repositorio.espiar().products.find((p) => p.id === "produto-1")?.quantity).toBe(115);
  });

  it("violação de regra do domínio vira erro de regra com a mensagem do domínio", async () => {
    const { casos, repositorio } = montar();
    const antes = structuredClone(repositorio.espiar());
    await expect(casos.registrarPerda(PRODUTOR, { productId: "produto-1", quantity: 999, reason: MOTIVOS_PERDA[0] })).rejects.toMatchObject({
      motivo: "regra",
      message: "A perda é maior que o estoque atual",
    });
    expect(repositorio.espiar()).toEqual(antes);
  });

  it("produto inexistente dá não encontrado", async () => {
    const { casos } = montar();
    await falhaCom(casos.excluirProduto(PRODUTOR, "produto-x"), "nao-encontrado");
  });

  it("despesa é registrada em nome do produtor logado e só ele exclui", async () => {
    const { casos, repositorio } = montar();
    await casos.registrarDespesa(PRODUTOR, { type: TIPO_DESPESA.CUSTO, description: "Frete", amount: 30 });
    const despesa = repositorio.espiar().expenses[0];
    expect(despesa).toMatchObject({ producerId: PRODUTOR, amount: 30 });
    await falhaCom(casos.excluirDespesa(OUTRO_PRODUTOR, despesa?.id ?? ""), "proibido");
  });

  it("só aceita pontos de retirada que existem", async () => {
    const { casos } = montar();
    await falhaCom(casos.salvarPontosRetirada(PRODUTOR, ["loja-inexistente"]), "nao-encontrado");
  });
});

describe("comprador e loja", () => {
  it("compra em nome de quem está logado e só ele paga", async () => {
    const { casos, repositorio } = montar();
    const { order } = await casos.criarPedido(COMPRADOR, compra);
    expect(order.buyerId).toBe(COMPRADOR);
    await falhaCom(casos.pagarPedido(PRODUTOR, order.id, METODO_PAGAMENTO.PIX), "proibido");
    await casos.pagarPedido(COMPRADOR, order.id, METODO_PAGAMENTO.PIX);
    expect(repositorio.espiar().orders.find((o) => o.id === order.id)?.status).toBe(STATUS_PEDIDO.PAGO);
  });

  it("só o produtor do pedido confirma a entrega na loja", async () => {
    const { casos } = montar();
    await falhaCom(casos.confirmarEntregaNaLoja(OUTRO_PRODUTOR, "pedido-2"), "proibido");
    await expect(casos.confirmarEntregaNaLoja(PRODUTOR, "pedido-2")).resolves.toMatchObject({ ok: true });
  });

  it("loja salva o próprio ponto de coleta", async () => {
    const { casos, repositorio } = montar();
    await casos.salvarLoja(LOJA, { name: "Mercado Novo", address: "Rua B, 2", city: "Suzano", hours: "8h às 17h" });
    expect(repositorio.espiar().stores.find((s) => s.userId === LOJA)?.name).toBe("Mercado Novo");
    await falhaCom(casos.salvarLoja(COMPRADOR, { name: "X", address: "Y", city: "Z", hours: "W" }), "proibido");
  });
});
