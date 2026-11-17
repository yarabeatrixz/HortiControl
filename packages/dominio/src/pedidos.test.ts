import { describe, expect, it } from "vitest";
import { EVENTO_PEDIDO, METODO_PAGAMENTO, ORIGEM, STATUS_PEDIDO } from "./constantes";
import { criarExemplo } from "./exemplo";
import { confirmarEntregaNaLoja, criarPedidoDireto, pagarPedido } from "./pedidos";
import { compraDaOferta, falhaDe, porId, sucesso } from "./testes";

describe("pedidos", () => {
  it("compra de oferta cria pedido numerado e baixa estoque da oferta e do produto", () => {
    const r = sucesso(criarPedidoDireto(criarExemplo(), compraDaOferta));
    expect(r.order).toMatchObject({
      orderNumber: "#HL-000003",
      status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
      unitPrice: 2.2,
    });
    expect(r.state.nextOrderNumber).toBe(4);
    expect(porId(r.state.offers, "oferta-1").quantity).toBe(55);
    expect(porId(r.state.products, "produto-1").quantity).toBe(115);
  });

  it("compra do catálogo usa preço normal e pontos do produtor", () => {
    const r = sucesso(
      criarPedidoDireto(criarExemplo(), {
        ...compraDaOferta,
        type: ORIGEM.CATALOGO,
        sourceId: "produto-1",
        storeId: "loja-2",
      }),
    );
    expect(r.order.unitPrice).toBe(3.5);
  });

  it("recusa quantidade acima da disponível, oferta encerrada e ponto fora da oferta", () => {
    const estado = criarExemplo();
    expect(falhaDe(criarPedidoDireto(estado, { ...compraDaOferta, quantity: 61 }))).toMatch(/acima/);
    expect(
      falhaDe(criarPedidoDireto(estado, { ...compraDaOferta, sourceId: "oferta-3", productId: "produto-3" })),
    ).toMatch(/não está mais disponível/);
    expect(falhaDe(criarPedidoDireto(estado, { ...compraDaOferta, storeId: "loja-x" }))).toMatch(
      /ponto de retirada/,
    );
  });

  it("paga pedido aguardando pagamento e registra na linha do tempo", () => {
    const agora = new Date("2026-11-15T12:00:00.000Z");
    const { state } = sucesso(pagarPedido(criarExemplo(), "pedido-1", METODO_PAGAMENTO.PIX, agora));
    const pedido = porId(state.orders, "pedido-1");
    expect(pedido.status).toBe(STATUS_PEDIDO.PAGO);
    expect(pedido.paymentMethod).toBe(METODO_PAGAMENTO.PIX);
    expect(pedido.timeline.at(-1)).toEqual({ label: EVENTO_PEDIDO.PAGAMENTO_APROVADO, at: agora.toISOString() });
    expect(falhaDe(pagarPedido(state, "pedido-1", METODO_PAGAMENTO.PIX))).toMatch(/não está aguardando/);
  });

  it("só confirma entrega na loja de pedido pago", () => {
    expect(falhaDe(confirmarEntregaNaLoja(criarExemplo(), "pedido-1"))).toMatch(/Só pedidos pagos/);
    const { state } = sucesso(confirmarEntregaNaLoja(criarExemplo(), "pedido-2"));
    expect(porId(state.orders, "pedido-2").status).toBe(STATUS_PEDIDO.ENTREGUE_NA_LOJA);
  });
});
