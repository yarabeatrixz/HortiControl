import { describe, expect, it, vi } from "vitest";
import { criarApiEscrita } from "./apiEscrita";

const URL_API = "https://api.exemplo.test/";

/** `fetch` falso que responde sempre com `status` e `corpo`, e guarda as chamadas. */
function fetchQueResponde(status, corpo = { ok: true }) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  }));
}

function criarApi({ fetch = fetchQueResponde(200), token = "token-1" } = {}) {
  return {
    fetch,
    api: criarApiEscrita({ urlBase: URL_API, obterToken: async () => token, fetch }),
  };
}

const ultimaChamada = (fetch) => {
  const [url, opcoes] = fetch.mock.calls.at(-1);
  return { url, ...opcoes, corpo: opcoes.body ? JSON.parse(opcoes.body) : undefined };
};

describe("apiEscrita (fetch mockado, sem rede)", () => {
  it("envia o token do usuário logado no cabeçalho Authorization", async () => {
    const { api, fetch } = criarApi();
    await api.encerrarOferta("oferta-1");
    const chamada = ultimaChamada(fetch);
    expect(chamada.url).toBe("https://api.exemplo.test/offers/oferta-1/end");
    expect(chamada.method).toBe("POST");
    expect(chamada.headers.Authorization).toBe("Bearer token-1");
  });

  it("produto novo vai por POST e produto existente por PUT no id", async () => {
    const { api, fetch } = criarApi();
    await api.salvarProduto({ name: "Alface", category: "Folhas", unit: "un", price: 3, quantity: 10 });
    expect(ultimaChamada(fetch)).toMatchObject({ url: `${URL_API}products`, method: "POST" });

    await api.salvarProduto({ id: "produto-1", name: "Alface", category: "Folhas", unit: "un", price: 3, quantity: 10 });
    expect(ultimaChamada(fetch)).toMatchObject({ url: `${URL_API}products/produto-1`, method: "PUT" });
  });

  it("manda só os campos que a rota aceita (o dono vem do token, não do corpo)", async () => {
    const { api, fetch } = criarApi();
    await api.registrarDespesa({
      type: "Custo",
      description: "Adubo",
      amount: "50",
      producerId: "user-produtor",
    });
    const chamada = ultimaChamada(fetch);
    expect(chamada.headers["Content-Type"]).toBe("application/json");
    expect(chamada.corpo).toEqual({ type: "Custo", description: "Adubo", amount: "50" });
  });

  it("criarPedido devolve o pedido criado pela API", async () => {
    const pedido = { id: "pedido-9", orderNumber: "#HL-000009" };
    const { api, fetch } = criarApi({ fetch: fetchQueResponde(201, { ok: true, order: pedido }) });
    const resposta = await api.criarPedido({
      type: "offer",
      sourceId: "oferta-1",
      productId: "produto-1",
      buyerId: "user-comprador",
      quantity: 2,
      storeId: "loja-1",
    });
    expect(resposta).toEqual({ order: pedido });
    expect(ultimaChamada(fetch).corpo).not.toHaveProperty("buyerId");
  });

  it("pagamento manda o método no corpo", async () => {
    const { api, fetch } = criarApi();
    await api.pagarPedido("pedido-1", "Pix");
    expect(ultimaChamada(fetch)).toMatchObject({
      url: `${URL_API}orders/pedido-1/pay`,
      corpo: { method: "Pix" },
    });
  });

  it("erro de regra da API vira Error com a mensagem dela", async () => {
    const { api } = criarApi({
      fetch: fetchQueResponde(422, { error: "Quantidade maior que o estoque" }),
    });
    await expect(api.criarOferta({ productId: "produto-1" })).rejects.toThrow(
      "Quantidade maior que o estoque",
    );
  });

  it("401 sem mensagem pede para entrar de novo", async () => {
    const { api } = criarApi({ fetch: fetchQueResponde(401, {}) });
    await expect(api.excluirDespesa("despesa-1")).rejects.toThrow("Sua sessão expirou");
  });

  it("sem login não chama a API", async () => {
    const { api, fetch } = criarApi({ token: null });
    await expect(api.excluirProduto("produto-1")).rejects.toThrow("Sua sessão expirou");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falha de rede vira mensagem clara para o usuário", async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const { api } = criarApi({ fetch });
    await expect(api.salvarLoja({ name: "Loja" })).rejects.toThrow(
      "Não foi possível falar com o servidor",
    );
  });
});
