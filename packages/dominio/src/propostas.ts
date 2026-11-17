// Propostas (US04/US05): regras prontas e testadas. A tela atual usa compra
// direta; manter ou remover é decisão de produto (ver Auditoria BAIXA-004).

import { EVENTO_PEDIDO, ORIGEM, STATUS_PEDIDO, STATUS_PROPOSTA } from "./constantes";
import { type DadosCompra, numeroPedido, reservarEstoque, validarCompra } from "./compra";
import { num } from "./formatacao";
import type { Estado, Pedido, Proposta, Resultado } from "./tipos";
import { falha, novoId, substituir } from "./util";

export function criarProposta(estado: Estado, dados: DadosCompra, agora: Date = new Date()): Resultado {
  const validacao = validarCompra(estado, dados, agora);
  if (!validacao.ok) return validacao;
  const { produto, oferta } = validacao;
  const proposta: Proposta = {
    id: novoId(),
    type: dados.type,
    sourceId: oferta?.id ?? produto.id,
    producerId: produto.producerId,
    buyerId: dados.buyerId,
    productId: produto.id,
    quantity: num(dados.quantity),
    unitPrice: oferta ? oferta.promotionalPrice : produto.price,
    storeId: dados.storeId,
    status: STATUS_PROPOSTA.AGUARDANDO,
    createdAt: agora.toISOString(),
  };
  return { ok: true, state: { ...estado, proposals: [proposta, ...estado.proposals] } };
}

const propostaPendente = (estado: Estado, propostaId: string): Proposta | undefined =>
  estado.proposals.find((item) => item.id === propostaId && item.status === STATUS_PROPOSTA.AGUARDANDO);

/** Aceitar reserva o estoque e cria o pedido; uma proposta não é decidida duas vezes. */
export function aceitarProposta(
  estado: Estado,
  propostaId: string,
  agora: Date = new Date(),
): Resultado<{ order: Pedido }> {
  const proposta = propostaPendente(estado, propostaId);
  if (!proposta) return falha("Esta proposta não está mais disponível");
  const produto = estado.products.find((item) => item.id === proposta.productId);
  if (!produto || produto.quantity < proposta.quantity)
    return falha("Estoque insuficiente para aceitar esta proposta");

  const momento = agora.toISOString();
  const sequencia = estado.nextOrderNumber || 1;
  const { status: _statusDaProposta, orderId: _semPedido, ...dadosDaProposta } = proposta;
  const order: Pedido = {
    ...dadosDaProposta,
    id: novoId(),
    proposalId: propostaId,
    orderNumber: numeroPedido(sequencia),
    status: STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
    acceptedAt: momento,
    timeline: [{ label: EVENTO_PEDIDO.PROPOSTA_ACEITA, at: momento }],
  };
  return {
    ok: true,
    order,
    state: {
      ...estado,
      nextOrderNumber: sequencia + 1,
      ...reservarEstoque(estado, {
        produtoId: produto.id,
        ofertaId: proposta.type === ORIGEM.OFERTA ? proposta.sourceId : undefined,
        quantidade: proposta.quantity,
      }),
      proposals: substituir(estado.proposals, propostaId, (item) => ({
        ...item,
        status: STATUS_PROPOSTA.ACEITA,
        orderId: order.id,
      })),
      orders: [order, ...estado.orders],
    },
  };
}

export function recusarProposta(estado: Estado, propostaId: string): Resultado {
  if (!propostaPendente(estado, propostaId)) return falha("Esta proposta não está mais disponível");
  return {
    ok: true,
    state: {
      ...estado,
      proposals: substituir(estado.proposals, propostaId, (item) => ({
        ...item,
        status: STATUS_PROPOSTA.RECUSADA,
      })),
    },
  };
}
