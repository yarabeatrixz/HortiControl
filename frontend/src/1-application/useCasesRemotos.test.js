import { describe, expect, it, vi } from "vitest";
import { criarCasosDeUsoRemotos } from "./useCasesRemotos";

const PRODUTOR = { id: "user-produtor", role: "produtor", name: "Sítio", city: "Mogi", email: "" };

/** Portas falsas: leitura devolve um estado fixo; escrita e auth só registram as chamadas. */
function criarPortas({ logado = PRODUTOR.id } = {}) {
  const estado = { users: [PRODUTOR], products: [], offers: [], orders: [] };
  return {
    leitura: { carregar: vi.fn(async () => estado) },
    autenticacao: {
      entrar: vi.fn(async () => PRODUTOR.id),
      cadastrar: vi.fn(async () => PRODUTOR.id),
      sair: vi.fn(async () => {}),
      usuarioAtual: vi.fn(async () => logado),
    },
    escrita: {
      salvarProduto: vi.fn(async () => {}),
      salvarPontosRetirada: vi.fn(async () => {}),
      criarPedido: vi.fn(async () => ({ order: { id: "pedido-1" } })),
    },
    estado,
  };
}

describe("casos de uso remotos (Supabase + API)", () => {
  it("sem login devolve estado vazio, sem ler o banco", async () => {
    const portas = criarPortas({ logado: null });
    const estado = await criarCasosDeUsoRemotos(portas).carregarEstado();
    expect(estado.users).toEqual([]);
    expect(portas.leitura.carregar).not.toHaveBeenCalled();
  });

  it("entrar devolve o usuário e o estado lido do banco", async () => {
    const portas = criarPortas();
    const { user, state } = await criarCasosDeUsoRemotos(portas).entrar({
      email: "produtor@exemplo.test",
      password: "123456",
      role: "produtor",
    });
    expect(user).toEqual(PRODUTOR);
    expect(state).toBe(portas.estado);
  });

  it("cadastro com senha curta falha antes de chamar o Supabase", async () => {
    const portas = criarPortas();
    await expect(
      criarCasosDeUsoRemotos(portas).cadastrar({
        role: "comprador",
        name: "Ana",
        city: "Suzano",
        email: "ana@exemplo.test",
        password: "123",
      }),
    ).rejects.toThrow("A senha precisa ter pelo menos");
    expect(portas.autenticacao.cadastrar).not.toHaveBeenCalled();
  });

  it("escreve pela API e devolve o estado relido", async () => {
    const portas = criarPortas();
    const resultado = await criarCasosDeUsoRemotos(portas).salvarProduto({ name: "Alface" });
    expect(portas.escrita.salvarProduto).toHaveBeenCalledWith({ name: "Alface" });
    expect(resultado).toEqual({ ok: true, state: portas.estado });
  });

  it("criarPedido repassa o pedido da API junto com o estado", async () => {
    const portas = criarPortas();
    const { order, state } = await criarCasosDeUsoRemotos(portas).criarPedido({ quantity: 1 });
    expect(order).toEqual({ id: "pedido-1" });
    expect(state).toBe(portas.estado);
  });

  it("pontos de retirada usam quem está logado (o userId não vai para a API)", async () => {
    const portas = criarPortas();
    await criarCasosDeUsoRemotos(portas).salvarPontosRetirada(PRODUTOR.id, ["loja-1"]);
    expect(portas.escrita.salvarPontosRetirada).toHaveBeenCalledWith(["loja-1"]);
  });

  it("erro da API chega à tela e o estado não é relido", async () => {
    const portas = criarPortas();
    portas.escrita.salvarProduto.mockRejectedValue(new Error("Informe o preço"));
    await expect(criarCasosDeUsoRemotos(portas).salvarProduto({})).rejects.toThrow(
      "Informe o preço",
    );
    expect(portas.leitura.carregar).not.toHaveBeenCalled();
  });

  it("propostas ainda não têm rota na API", async () => {
    await expect(criarCasosDeUsoRemotos(criarPortas()).criarProposta({})).rejects.toThrow(
      "Propostas ainda não estão disponíveis",
    );
  });
});
