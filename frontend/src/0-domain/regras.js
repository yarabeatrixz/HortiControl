// Regras de negócio PURAS (camada 0: sem React, sem storage, sem rede).
// Cada função recebe o estado atual e devolve `{ ok: true, state, ... }` ou
// `{ ok: false, error }`. É o contrato que o back-end deve reproduzir: cada
// regra que altera estado corresponde a uma operação da API (ver docs/BACKEND.md).

import {
  EVENTO_PEDIDO,
  ORIGEM,
  SENHA_MINIMA,
  STATUS_OFERTA,
  STATUS_PEDIDO,
  STATUS_PROPOSTA,
} from "./constants";
import { num } from "./format";

const falha = (error) => ({ ok: false, error });

export const novoId = (prefixo) => `${prefixo}-${crypto.randomUUID()}`;

const numeroPedido = (sequencia) => `#HL-${String(sequencia).padStart(6, "0")}`;

const substituir = (lista, id, alterar) =>
  lista.map((item) => (item.id === id ? alterar(item) : item));

// ---------------------------------------------------------------- Usuários

export function validarCadastro(usuarios, dados) {
  if (!dados.name?.trim() || !dados.city?.trim() || !dados.email?.trim() || !dados.password) {
    return falha("Preencha nome, cidade, e-mail e senha");
  }
  const email = dados.email.trim().toLowerCase();
  if (usuarios.some((usuario) => usuario.email.toLowerCase() === email)) {
    return falha("Este e-mail já está cadastrado");
  }
  if (String(dados.password).length < SENHA_MINIMA) {
    return falha(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres`);
  }
  return { ok: true };
}

/** Só para o modo demonstração: a senha é comparada em texto puro. */
export function autenticar(usuarios, { email, password, role }) {
  return (
    usuarios.find(
      (usuario) =>
        usuario.email.toLowerCase() === String(email).trim().toLowerCase() &&
        usuario.password === password &&
        usuario.role === role,
    ) ?? null
  );
}

export function cadastrarUsuario(estado, dados) {
  const validacao = validarCadastro(estado.users, dados);
  if (!validacao.ok) return validacao;
  const user = {
    id: novoId("user"),
    role: dados.role,
    name: dados.name.trim(),
    city: dados.city.trim(),
    email: dados.email.trim().toLowerCase(),
    password: dados.password,
    ...(dados.role === "produtor" ? { pickupStoreIds: [] } : {}),
  };
  return { ok: true, user, state: { ...estado, users: [...estado.users, user] } };
}

export function salvarPontosRetirada(estado, userId, storeIds) {
  return {
    ok: true,
    state: {
      ...estado,
      users: substituir(estado.users, userId, (user) => ({ ...user, pickupStoreIds: storeIds })),
    },
  };
}

// ---------------------------------------------------------------- Produtos

export function salvarProduto(estado, dados) {
  const price = num(dados.price);
  const quantity = num(dados.quantity);
  if (!dados.name?.trim() || price <= 0 || quantity <= 0) {
    return falha("Preencha nome, preço e quantidade com valores válidos");
  }
  const produto = { ...dados, name: dados.name.trim(), price, quantity };
  const existe = estado.products.some((item) => item.id === produto.id);
  return {
    ok: true,
    state: {
      ...estado,
      products: existe
        ? substituir(estado.products, produto.id, () => produto)
        : [{ ...produto, id: novoId("produto") }, ...estado.products],
    },
  };
}

/** Excluir um produto remove também as ofertas dele. */
export function excluirProduto(estado, produtoId) {
  return {
    ok: true,
    state: {
      ...estado,
      products: estado.products.filter((item) => item.id !== produtoId),
      offers: estado.offers.filter((item) => item.productId !== produtoId),
    },
  };
}

// ---------------------------------------------------------------- Ofertas

export function statusOferta(oferta, agora = new Date()) {
  if (oferta.endedAt) return STATUS_OFERTA.ENCERRADA;
  if (Number(oferta.quantity) <= 0) return STATUS_OFERTA.ESGOTADA;
  const limite = new Date(oferta.createdAt);
  limite.setDate(limite.getDate() + Number(oferta.validityDays));
  return agora > limite ? STATUS_OFERTA.ENCERRADA : STATUS_OFERTA.ATIVA;
}

export const ofertaAtiva = (oferta, agora) => statusOferta(oferta, agora) === STATUS_OFERTA.ATIVA;

export function criarOferta(estado, dados, agora = new Date()) {
  const produto = estado.products.find((item) => item.id === dados.productId);
  if (!produto) return falha("Selecione um produto");
  if (num(dados.quantity) <= 0) return falha("Informe uma quantidade válida");
  if (num(dados.promotionalPrice) <= 0) return falha("Informe um preço promocional válido");
  if (num(dados.promotionalPrice) >= num(produto.price))
    return falha("O preço promocional deve ser menor que o preço normal");
  if (!dados.city?.trim()) return falha("Informe a cidade");
  if (num(dados.validityDays) <= 0) return falha("Informe a validade em dias");
  if (!dados.storeIds?.length) return falha("Selecione ao menos um ponto de retirada");
  if (num(dados.quantity) > num(produto.quantity))
    return falha("A quantidade da oferta supera o estoque do produto");
  const oferta = {
    id: novoId("oferta"),
    producerId: produto.producerId,
    productId: produto.id,
    quantity: num(dados.quantity),
    promotionalPrice: num(dados.promotionalPrice),
    city: dados.city.trim(),
    validityDays: num(dados.validityDays),
    storeIds: dados.storeIds,
    createdAt: agora.toISOString(),
  };
  return { ok: true, state: { ...estado, offers: [oferta, ...estado.offers] } };
}

export function encerrarOferta(estado, ofertaId, agora = new Date()) {
  const oferta = estado.offers.find((item) => item.id === ofertaId);
  if (!oferta || !ofertaAtiva(oferta, agora)) return falha("Esta oferta não está mais ativa");
  return {
    ok: true,
    state: {
      ...estado,
      offers: substituir(estado.offers, ofertaId, (item) => ({
        ...item,
        endedAt: agora.toISOString(),
      })),
    },
  };
}

// ---------------------------------------------------- Origem de uma compra

/**
 * Resolve produto/oferta/pontos permitidos de uma compra ou proposta e valida
 * quantidade e ponto de retirada. Regra comum a pedido direto e proposta.
 */
function validarCompra(estado, dados, agora) {
  const produto = estado.products.find((item) => item.id === dados.productId);
  if (!produto) return falha("Este produto não está mais disponível");
  const oferta =
    dados.type === ORIGEM.OFERTA ? estado.offers.find((item) => item.id === dados.sourceId) : null;
  if (dados.type === ORIGEM.OFERTA && (!oferta || !ofertaAtiva(oferta, agora)))
    return falha("Esta oferta não está mais disponível");
  const disponivel = oferta ? oferta.quantity : produto.quantity;
  if (num(dados.quantity) <= 0) return falha("Informe uma quantidade válida");
  if (num(dados.quantity) > num(disponivel)) return falha("Quantidade acima da disponível");
  const produtor = estado.users.find((item) => item.id === produto.producerId);
  const lojasPermitidas = oferta ? oferta.storeIds : produtor?.pickupStoreIds || [];
  if (!lojasPermitidas.includes(dados.storeId))
    return falha("Selecione um ponto de retirada disponível");
  return { ok: true, produto, oferta };
}

/** Baixa a quantidade do produto e, se for compra de oferta, da oferta também. */
function reservarEstoque(estado, { produtoId, ofertaId, quantidade }) {
  return {
    products: substituir(estado.products, produtoId, (item) => ({
      ...item,
      quantity: item.quantity - quantidade,
    })),
    offers: ofertaId
      ? substituir(estado.offers, ofertaId, (item) => ({
          ...item,
          quantity: item.quantity - quantidade,
        }))
      : estado.offers,
  };
}

// ---------------------------------------------------------------- Pedidos

export function criarPedidoDireto(estado, dados, agora = new Date()) {
  const validacao = validarCompra(estado, dados, agora);
  if (!validacao.ok) return validacao;
  const { produto, oferta } = validacao;
  const momento = agora.toISOString();
  const sequencia = Number(estado.nextOrderNumber || 1);
  const order = {
    id: novoId("pedido"),
    type: dados.type,
    sourceId: oferta?.id || produto.id,
    producerId: produto.producerId,
    buyerId: dados.buyerId,
    productId: produto.id,
    quantity: num(dados.quantity),
    unitPrice: oferta ? oferta.promotionalPrice : produto.price,
    storeId: dados.storeId,
    orderNumber: numeroPedido(sequencia),
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
      ...reservarEstoque(estado, {
        produtoId: produto.id,
        ofertaId: oferta?.id,
        quantidade: order.quantity,
      }),
      orders: [order, ...(estado.orders || [])],
    },
  };
}

const registrarEvento = (pedido, status, label, momento, extras = {}) => ({
  ...pedido,
  ...extras,
  status,
  timeline: [...(pedido.timeline || []), { label, at: momento }],
});

export function pagarPedido(estado, pedidoId, metodo, agora = new Date()) {
  const pedido = estado.orders.find((item) => item.id === pedidoId);
  if (!pedido || pedido.status !== STATUS_PEDIDO.AGUARDANDO_PAGAMENTO)
    return falha("Este pedido não está aguardando pagamento");
  const momento = agora.toISOString();
  return {
    ok: true,
    state: {
      ...estado,
      orders: substituir(estado.orders, pedidoId, (item) =>
        registrarEvento(item, STATUS_PEDIDO.PAGO, EVENTO_PEDIDO.PAGAMENTO_APROVADO, momento, {
          paymentMethod: metodo,
          paidAt: momento,
        }),
      ),
    },
  };
}

export function confirmarEntregaNaLoja(estado, pedidoId, agora = new Date()) {
  const pedido = estado.orders.find((item) => item.id === pedidoId);
  if (!pedido || pedido.status !== STATUS_PEDIDO.PAGO)
    return falha("Só pedidos pagos podem ser marcados como entregues");
  const momento = agora.toISOString();
  return {
    ok: true,
    state: {
      ...estado,
      orders: substituir(estado.orders, pedidoId, (item) =>
        registrarEvento(
          item,
          STATUS_PEDIDO.ENTREGUE_NA_LOJA,
          EVENTO_PEDIDO.ENTREGUE_NA_LOJA,
          momento,
          { deliveredAt: momento },
        ),
      ),
    },
  };
}

// --------------------------------------------- Propostas (US04/US05/US06)
// Regras prontas e testadas, mas a UI atual usa compra direta (ver docs/BACKEND.md).

export function criarProposta(estado, dados, agora = new Date()) {
  const validacao = validarCompra(estado, dados, agora);
  if (!validacao.ok) return validacao;
  const { produto, oferta } = validacao;
  const proposta = {
    id: novoId("proposta"),
    type: dados.type,
    sourceId: oferta?.id || produto.id,
    producerId: produto.producerId,
    buyerId: dados.buyerId,
    productId: produto.id,
    quantity: num(dados.quantity),
    unitPrice: oferta ? oferta.promotionalPrice : produto.price,
    storeId: dados.storeId,
    status: STATUS_PROPOSTA.AGUARDANDO,
    createdAt: agora.toISOString(),
  };
  return {
    ok: true,
    state: { ...estado, proposals: [proposta, ...(estado.proposals || [])] },
  };
}

export function aceitarProposta(estado, propostaId, agora = new Date()) {
  const proposta = estado.proposals.find((item) => item.id === propostaId);
  if (!proposta || proposta.status !== STATUS_PROPOSTA.AGUARDANDO)
    return falha("Esta proposta não está mais disponível");
  const produto = estado.products.find((item) => item.id === proposta.productId);
  if (!produto || produto.quantity < proposta.quantity)
    return falha("Estoque insuficiente para aceitar esta proposta");
  const momento = agora.toISOString();
  const sequencia = Number(estado.nextOrderNumber || 1);
  const order = {
    ...proposta,
    id: novoId("pedido"),
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
        ofertaId: proposta.type === ORIGEM.OFERTA ? proposta.sourceId : null,
        quantidade: proposta.quantity,
      }),
      proposals: substituir(estado.proposals, propostaId, (item) => ({
        ...item,
        status: STATUS_PROPOSTA.ACEITA,
        orderId: order.id,
      })),
      orders: [order, ...(estado.orders || [])],
    },
  };
}

export function recusarProposta(estado, propostaId) {
  const proposta = estado.proposals.find((item) => item.id === propostaId);
  if (!proposta || proposta.status !== STATUS_PROPOSTA.AGUARDANDO)
    return falha("Esta proposta não está mais disponível");
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

// ---------------------------------------------------------------- Lojas

export function salvarLoja(estado, userId, dados) {
  const campos = ["name", "address", "city", "hours"];
  if (campos.some((campo) => !String(dados[campo] ?? "").trim()))
    return falha("Preencha todos os dados do ponto de coleta");
  const existente = estado.stores.find((item) => item.userId === userId);
  const loja = {
    ...existente,
    ...Object.fromEntries(campos.map((campo) => [campo, dados[campo].trim()])),
    id: existente?.id ?? novoId("loja"),
    userId,
  };
  return {
    ok: true,
    state: {
      ...estado,
      stores: existente
        ? substituir(estado.stores, existente.id, () => loja)
        : [loja, ...estado.stores],
    },
  };
}
