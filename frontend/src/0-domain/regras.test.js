import { describe, expect, it } from "vitest";
import { estadoInicial } from "../test/fixtures";
import { ORIGEM, STATUS_OFERTA, STATUS_PEDIDO, STATUS_PROPOSTA } from "./constants";
import { num } from "./format";
import {
  aceitarProposta,
  autenticar,
  cadastrarUsuario,
  confirmarEntregaNaLoja,
  criarOferta,
  criarPedidoDireto,
  criarProposta,
  encerrarOferta,
  excluirProduto,
  pagarPedido,
  recusarProposta,
  salvarLoja,
  salvarProduto,
  statusOferta,
} from "./regras";

const ofertaValida = {
  productId: "produto-1",
  quantity: "10",
  promotionalPrice: "2,50",
  city: "Mogi das Cruzes",
  validityDays: "3",
  storeIds: ["loja-1"],
};

const compraDaOferta = {
  type: ORIGEM.OFERTA,
  sourceId: "oferta-1",
  productId: "produto-1",
  buyerId: "user-comprador",
  quantity: 5,
  storeId: "loja-1",
};

describe("num", () => {
  it("aceita vírgula e ponto de milhar", () => {
    expect(num("1.234,5")).toBe(1234.5);
    expect(num("2.5")).toBe(2.5);
    expect(num("abc")).toBe(0);
  });
});

describe("usuários", () => {
  const novo = {
    role: "comprador",
    name: "Ana",
    city: "Suzano",
    email: "ana@x.com",
    password: "123456",
  };

  it("cadastra usuário e normaliza o e-mail", () => {
    const r = cadastrarUsuario(estadoInicial(), { ...novo, email: " ANA@X.com " });
    expect(r.ok).toBe(true);
    expect(r.user.email).toBe("ana@x.com");
    expect(r.state.users).toContainEqual(r.user);
  });

  it("recusa e-mail repetido e senha curta", () => {
    const estado = estadoInicial();
    expect(cadastrarUsuario(estado, { ...novo, email: "comprador@hortilink.com" }).error).toMatch(
      /já está cadastrado/,
    );
    expect(cadastrarUsuario(estado, { ...novo, password: "123" }).error).toMatch(/6 caracteres/);
  });

  it("produtor novo começa sem pontos de retirada", () => {
    const r = cadastrarUsuario(estadoInicial(), { ...novo, role: "produtor" });
    expect(r.user.pickupStoreIds).toEqual([]);
  });

  it("autentica só com e-mail, senha e perfil corretos", () => {
    const { users } = estadoInicial();
    const credenciais = { email: "produtor@hortilink.com", password: "123456", role: "produtor" };
    expect(autenticar(users, credenciais)?.id).toBe("user-produtor");
    expect(autenticar(users, { ...credenciais, role: "comprador" })).toBeNull();
    expect(autenticar(users, { ...credenciais, password: "errada" })).toBeNull();
  });
});

describe("produtos", () => {
  it("cria produto novo com id e números convertidos", () => {
    const r = salvarProduto(estadoInicial(), {
      producerId: "user-produtor",
      name: " Couve ",
      category: "Verduras",
      unit: "mç",
      price: "3,20",
      quantity: "15",
    });
    expect(r.ok).toBe(true);
    expect(r.state.products[0]).toMatchObject({ name: "Couve", price: 3.2, quantity: 15 });
    expect(r.state.products[0].id).toMatch(/^produto-/);
  });

  it("recusa produto sem nome ou com preço zero", () => {
    expect(salvarProduto(estadoInicial(), { name: "", price: 1, quantity: 1 }).ok).toBe(false);
    expect(salvarProduto(estadoInicial(), { name: "X", price: 0, quantity: 1 }).ok).toBe(false);
  });

  it("excluir produto remove as ofertas dele", () => {
    const r = excluirProduto(estadoInicial(), "produto-1");
    expect(r.state.products.some((p) => p.id === "produto-1")).toBe(false);
    expect(r.state.offers.some((o) => o.productId === "produto-1")).toBe(false);
  });
});

describe("ofertas", () => {
  it("calcula status: ativa, esgotada e encerrada por validade", () => {
    const { offers } = estadoInicial();
    expect(statusOferta(offers.find((o) => o.id === "oferta-1"))).toBe(STATUS_OFERTA.ATIVA);
    expect(statusOferta(offers.find((o) => o.id === "oferta-2"))).toBe(STATUS_OFERTA.ESGOTADA);
    expect(statusOferta(offers.find((o) => o.id === "oferta-3"))).toBe(STATUS_OFERTA.ENCERRADA);
  });

  it("publica oferta válida", () => {
    const r = criarOferta(estadoInicial(), ofertaValida);
    expect(r.ok).toBe(true);
    expect(r.state.offers[0]).toMatchObject({
      quantity: 10,
      promotionalPrice: 2.5,
      storeIds: ["loja-1"],
    });
  });

  it.each([
    [{ quantity: "0" }, /quantidade válida/],
    [{ promotionalPrice: "0" }, /preço promocional válido/],
    [{ promotionalPrice: "9" }, /menor que o preço normal/],
    [{ city: " " }, /cidade/],
    [{ validityDays: "0" }, /validade/],
    [{ storeIds: [] }, /ponto de retirada/],
    [{ quantity: "999" }, /supera o estoque/],
  ])("recusa oferta inválida %o", (alteracao, mensagem) => {
    const r = criarOferta(estadoInicial(), { ...ofertaValida, ...alteracao });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(mensagem);
  });

  it("encerra oferta ativa e não encerra duas vezes", () => {
    const r = encerrarOferta(estadoInicial(), "oferta-1");
    expect(statusOferta(r.state.offers.find((o) => o.id === "oferta-1"))).toBe(
      STATUS_OFERTA.ENCERRADA,
    );
    expect(encerrarOferta(r.state, "oferta-1").ok).toBe(false);
  });
});

describe("pedidos", () => {
  it("compra de oferta cria pedido numerado e baixa estoque da oferta e do produto", () => {
    const r = criarPedidoDireto(estadoInicial(), compraDaOferta);
    expect(r.ok).toBe(true);
    expect(r.order).toMatchObject({
      orderNumber: "#HL-000003",
      status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
      unitPrice: 2.2,
    });
    expect(r.state.nextOrderNumber).toBe(4);
    expect(r.state.offers.find((o) => o.id === "oferta-1").quantity).toBe(55);
    expect(r.state.products.find((p) => p.id === "produto-1").quantity).toBe(115);
  });

  it("compra do catálogo usa preço normal e pontos do produtor", () => {
    const r = criarPedidoDireto(estadoInicial(), {
      ...compraDaOferta,
      type: ORIGEM.CATALOGO,
      sourceId: "produto-1",
      storeId: "loja-2",
    });
    expect(r.ok).toBe(true);
    expect(r.order.unitPrice).toBe(3.5);
  });

  it("recusa quantidade acima da disponível, oferta encerrada e ponto fora da oferta", () => {
    const estado = estadoInicial();
    expect(criarPedidoDireto(estado, { ...compraDaOferta, quantity: 61 }).error).toMatch(/acima/);
    expect(
      criarPedidoDireto(estado, { ...compraDaOferta, sourceId: "oferta-3", productId: "produto-3" })
        .error,
    ).toMatch(/não está mais disponível/);
    const semPonto = { ...compraDaOferta, storeId: "loja-x" };
    expect(criarPedidoDireto(estado, semPonto).error).toMatch(/ponto de retirada/);
  });

  it("paga pedido aguardando pagamento e registra na linha do tempo", () => {
    const r = pagarPedido(estadoInicial(), "pedido-1", "Pix");
    const pedido = r.state.orders.find((o) => o.id === "pedido-1");
    expect(pedido.status).toBe(STATUS_PEDIDO.PAGO);
    expect(pedido.paymentMethod).toBe("Pix");
    expect(pedido.timeline.at(-1).label).toBe("Pagamento aprovado");
    expect(pagarPedido(r.state, "pedido-1", "Pix").ok).toBe(false);
  });

  it("só confirma entrega na loja de pedido pago", () => {
    expect(confirmarEntregaNaLoja(estadoInicial(), "pedido-1").ok).toBe(false);
    const r = confirmarEntregaNaLoja(estadoInicial(), "pedido-2");
    expect(r.state.orders.find((o) => o.id === "pedido-2").status).toBe(
      STATUS_PEDIDO.ENTREGUE_NA_LOJA,
    );
  });
});

describe("propostas (US04/US05)", () => {
  const comProposta = () => criarProposta(estadoInicial(), compraDaOferta).state;

  it("cria proposta aguardando fornecedor", () => {
    expect(comProposta().proposals[0].status).toBe(STATUS_PROPOSTA.AGUARDANDO);
  });

  it("aceitar cria pedido e reserva estoque; não decide duas vezes", () => {
    const estado = comProposta();
    const id = estado.proposals[0].id;
    const r = aceitarProposta(estado, id);
    expect(r.state.proposals[0].status).toBe(STATUS_PROPOSTA.ACEITA);
    expect(r.order.proposalId).toBe(id);
    expect(r.state.offers.find((o) => o.id === "oferta-1").quantity).toBe(55);
    expect(aceitarProposta(r.state, id).ok).toBe(false);
    expect(recusarProposta(r.state, id).ok).toBe(false);
  });

  it("recusar muda o status", () => {
    const estado = comProposta();
    const r = recusarProposta(estado, estado.proposals[0].id);
    expect(r.state.proposals[0].status).toBe(STATUS_PROPOSTA.RECUSADA);
  });
});

describe("lojas", () => {
  const loja = { name: "Sacolão", address: "Rua A, 1", city: "Suzano", hours: "8h às 18h" };

  it("cria loja para usuário sem loja e atualiza a existente", () => {
    const criada = salvarLoja(estadoInicial(), "user-novo", loja);
    expect(criada.state.stores[0]).toMatchObject({ ...loja, userId: "user-novo" });
    const atualizada = salvarLoja(estadoInicial(), "user-loja", { ...loja, name: "Novo nome" });
    expect(atualizada.state.stores.find((s) => s.id === "loja-1").name).toBe("Novo nome");
    expect(atualizada.state.stores.find((s) => s.id === "loja-1").distanceKm).toBe(1.2);
  });

  it("exige todos os campos", () => {
    expect(salvarLoja(estadoInicial(), "user-loja", { ...loja, hours: "" }).ok).toBe(false);
  });
});
