// Pedidos: compra direta, pagamento e entrega na loja parceira.

import {
  EVENTO_PEDIDO,
  type EventoPedido,
  type MetodoPagamento,
  STATUS_PEDIDO,
  type StatusPedido,
} from "./constantes";
import { type DadosCompra, numeroPedido, reservarEstoque, validarCompra } from "./compra";
import { num } from "./formatacao";
import type { Estado, Pedido, Resultado } from "./tipos";
import { falha, novoId, substituir } from "./util";

export function criarPedidoDireto(
  estado: Estado,
  dados: DadosCompra,
  agora: Date = new Date(),
): Resultado<{ order: Pedido }> {
  const validacao = validarCompra(estado, dados, agora);
  if (!validacao.ok) return validacao;
  const { produto, oferta } = validacao;
  const momento = agora.toISOString();
  const sequencia = estado.nextOrderNumber || 1;
  const order: Pedido = {
    id: novoId("pedido"),
    orderNumber: numeroPedido(sequencia),
    type: dados.type,
    sourceId: oferta?.id ?? produto.id,
    producerId: produto.producerId,
    buyerId: dados.buyerId,
    productId: produto.id,
    quantity: num(dados.quantity),
    unitPrice: oferta ? oferta.promotionalPrice : produto.price,
    storeId: dados.storeId,
    status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
    createdAt: momento,
    timeline: [{ label: EVENTO_PEDIDO.REALIZADO, at: momento }],
  };
  return {
    ok: true,
    order,
    state: {
      ...estado,
      nextOrderNumber: sequencia + 1,
      ...reservarEstoque(estado, { produtoId: produto.id, ofertaId: oferta?.id, quantidade: order.quantity }),
      orders: [order, ...estado.orders],
    },
  };
}

/** Muda o status do pedido e registra o evento na linha do tempo. */
function avancarPedido(
  estado: Estado,
  pedidoId: string,
  mudanca: { status: StatusPedido; evento: EventoPedido; momento: string; extras: Partial<Pedido> },
): Estado {
  return {
    ...estado,
    orders: substituir(estado.orders, pedidoId, (pedido) => ({
      ...pedido,
      ...mudanca.extras,
      status: mudanca.status,
      timeline: [...pedido.timeline, { label: mudanca.evento, at: mudanca.momento }],
    })),
  };
}

export function pagarPedido(
  estado: Estado,
  pedidoId: string,
  metodo: MetodoPagamento,
  agora: Date = new Date(),
): Resultado {
  const pedido = estado.orders.find((item) => item.id === pedidoId);
  if (pedido?.status !== STATUS_PEDIDO.AGUARDANDO_PAGAMENTO)
    return falha("Este pedido não está aguardando pagamento");
  const momento = agora.toISOString();
  return {
    ok: true,
    state: avancarPedido(estado, pedidoId, {
      status: STATUS_PEDIDO.PAGO,
      evento: EVENTO_PEDIDO.PAGAMENTO_APROVADO,
      momento,
      extras: { paymentMethod: metodo, paidAt: momento },
    }),
  };
}

export function confirmarEntregaNaLoja(estado: Estado, pedidoId: string, agora: Date = new Date()): Resultado {
  const pedido = estado.orders.find((item) => item.id === pedidoId);
  if (pedido?.status !== STATUS_PEDIDO.PAGO)
    return falha("Só pedidos pagos podem ser marcados como entregues");
  const momento = agora.toISOString();
  return {
    ok: true,
    state: avancarPedido(estado, pedidoId, {
      status: STATUS_PEDIDO.ENTREGUE_NA_LOJA,
      evento: EVENTO_PEDIDO.ENTREGUE_NA_LOJA,
      momento,
      extras: { deliveredAt: momento },
    }),
  };
}
