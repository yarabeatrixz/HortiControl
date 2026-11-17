// Tradução PURA entre as linhas do banco (snake_case, supabase/migrations) e o
// Estado do domínio (camelCase), mais o cálculo do que mudou entre dois estados.
// Sem I/O: testável sem banco. Leitura serve ao front e à API; gravação, só à API.

import type {
  Despesa,
  Estado,
  EventoLinhaDoTempo,
  Loja,
  MovimentoEstoque,
  Oferta,
  Pedido,
  Produto,
  Proposta,
  Usuario,
} from "@hortilink/dominio";

/** Uma linha qualquer de tabela, como vem/vai do PostgREST. */
export type Linha = Record<string, unknown>;

export interface Linhas {
  users: Linha[];
  stores: Linha[];
  producer_pickup_stores: Linha[];
  products: Linha[];
  offers: Linha[];
  offer_stores: Linha[];
  proposals: Linha[];
  orders: Linha[];
  order_timeline: Linha[];
  stock_movements: Linha[];
  expenses: Linha[];
}

export type Tabela = keyof Linhas;

/** Todas as tabelas que formam o Estado (a leitura completa passa por todas). */
export const TABELAS: Tabela[] = [
  "users",
  "stores",
  "producer_pickup_stores",
  "products",
  "offers",
  "offer_stores",
  "proposals",
  "orders",
  "order_timeline",
  "stock_movements",
  "expenses",
];

const n = (valor: unknown): number => Number(valor);
const s = (valor: unknown): string => String(valor);
const opcional = <T>(valor: unknown, converter: (v: unknown) => T): T | undefined =>
  valor === null || valor === undefined ? undefined : converter(valor);
const nuloSeVazio = <T>(valor: T | undefined): T | null => (valor === undefined ? null : valor);
const numeroDoPedido = (orderNumber: string): number => Number(orderNumber.replace(/\D/g, "")) || 0;

// ---------------------------------------------------------------- Banco → domínio

export function paraEstado(linhas: Linhas): Estado {
  const pontosDe = (produtorId: string) =>
    linhas.producer_pickup_stores.filter((l) => l.producer_id === produtorId).map((l) => s(l.store_id));
  const lojasDaOferta = (ofertaId: string) =>
    linhas.offer_stores.filter((l) => l.offer_id === ofertaId).map((l) => s(l.store_id));
  const eventosDo = (pedidoId: string): EventoLinhaDoTempo[] =>
    linhas.order_timeline
      .filter((l) => l.order_id === pedidoId)
      .map((l) => ({ label: l.label as EventoLinhaDoTempo["label"], at: s(l.created_at) }))
      .sort((a, b) => a.at.localeCompare(b.at));

  const users: Usuario[] = linhas.users.map((l) => ({
    id: s(l.id),
    role: l.role as Usuario["role"],
    name: s(l.name),
    city: s(l.city),
    // O RLS só mostra o e-mail ao servidor (service_role); no front ele vem vazio.
    email: s(l.email ?? ""),
    ...(l.role === "produtor" ? { pickupStoreIds: pontosDe(s(l.id)) } : {}),
  }));

  const orders: Pedido[] = linhas.orders.map((l) => ({
    id: s(l.id),
    orderNumber: s(l.order_number),
    type: l.type as Pedido["type"],
    sourceId: s(l.source_id),
    producerId: s(l.producer_id),
    buyerId: s(l.buyer_id),
    productId: s(l.product_id),
    quantity: n(l.quantity),
    unitPrice: n(l.unit_price),
    storeId: s(l.store_id),
    status: l.status as Pedido["status"],
    createdAt: s(l.created_at),
    timeline: eventosDo(s(l.id)),
    proposalId: opcional(l.proposal_id, s),
    acceptedAt: opcional(l.accepted_at, s),
    paidAt: opcional(l.paid_at, s),
    paymentMethod: opcional(l.payment_method, (v) => v as NonNullable<Pedido["paymentMethod"]>),
    deliveredAt: opcional(l.delivered_at, s),
  }));

  return {
    users,
    stores: linhas.stores.map(
      (l): Loja => ({
        id: s(l.id),
        userId: s(l.user_id),
        name: s(l.name),
        address: s(l.address),
        city: s(l.city),
        hours: s(l.hours),
        distanceKm: opcional(l.distance_km, n),
      }),
    ),
    products: linhas.products.map(
      (l): Produto => ({
        id: s(l.id),
        producerId: s(l.producer_id),
        name: s(l.name),
        category: l.category as Produto["category"],
        unit: l.unit as Produto["unit"],
        price: n(l.price),
        quantity: n(l.quantity),
        minQuantity: n(l.min_quantity),
        photo: opcional(l.photo, s),
      }),
    ),
    offers: linhas.offers.map(
      (l): Oferta => ({
        id: s(l.id),
        producerId: s(l.producer_id),
        productId: s(l.product_id),
        quantity: n(l.quantity),
        promotionalPrice: n(l.promotional_price),
        city: s(l.city),
        validityDays: n(l.validity_days),
        storeIds: lojasDaOferta(s(l.id)),
        createdAt: s(l.created_at),
        endedAt: opcional(l.ended_at, s),
      }),
    ),
    proposals: linhas.proposals.map(
      (l): Proposta => ({
        id: s(l.id),
        type: l.type as Proposta["type"],
        sourceId: s(l.source_id),
        producerId: s(l.producer_id),
        buyerId: s(l.buyer_id),
        productId: s(l.product_id),
        quantity: n(l.quantity),
        unitPrice: n(l.unit_price),
        storeId: s(l.store_id),
        status: l.status as Proposta["status"],
        createdAt: s(l.created_at),
        orderId: linhas.orders.find((o) => o.proposal_id === l.id)?.id as string | undefined,
      }),
    ),
    orders,
    stockMovements: linhas.stock_movements.map(
      (l): MovimentoEstoque => ({
        id: s(l.id),
        type: l.type as MovimentoEstoque["type"],
        producerId: s(l.producer_id),
        productId: s(l.product_id),
        quantity: n(l.quantity),
        unitCost: opcional(l.unit_cost, n),
        reason: opcional(l.reason, (v) => v as NonNullable<MovimentoEstoque["reason"]>),
        note: s(l.note ?? ""),
        createdAt: s(l.created_at),
      }),
    ),
    expenses: linhas.expenses.map(
      (l): Despesa => ({
        id: s(l.id),
        producerId: s(l.producer_id),
        type: l.type as Despesa["type"],
        description: s(l.description),
        amount: n(l.amount),
        createdAt: s(l.created_at),
      }),
    ),
    nextOrderNumber: Math.max(0, ...orders.map((o) => numeroDoPedido(o.orderNumber))) + 1,
  };
}

// ---------------------------------------------------------------- Domínio → banco

/** Linhas de cada tabela que o servidor grava (users é criada pelo Auth). */
export function paraLinhas(estado: Estado): Omit<Linhas, "users"> {
  return {
    stores: estado.stores.map((x) => ({
      id: x.id, user_id: x.userId, name: x.name, address: x.address, city: x.city, hours: x.hours,
      distance_km: nuloSeVazio(x.distanceKm),
    })),
    producer_pickup_stores: estado.users.flatMap((u) =>
      (u.pickupStoreIds ?? []).map((storeId) => ({ producer_id: u.id, store_id: storeId })),
    ),
    products: estado.products.map((x) => ({
      id: x.id, producer_id: x.producerId, name: x.name, category: x.category, unit: x.unit,
      price: x.price, quantity: x.quantity, min_quantity: x.minQuantity ?? 0, photo: nuloSeVazio(x.photo || undefined),
    })),
    offers: estado.offers.map((x) => ({
      id: x.id, producer_id: x.producerId, product_id: x.productId, quantity: x.quantity,
      promotional_price: x.promotionalPrice, city: x.city, validity_days: x.validityDays,
      created_at: x.createdAt, ended_at: nuloSeVazio(x.endedAt),
    })),
    offer_stores: estado.offers.flatMap((o) => o.storeIds.map((storeId) => ({ offer_id: o.id, store_id: storeId }))),
    proposals: estado.proposals.map((x) => ({
      id: x.id, type: x.type, source_id: x.sourceId, producer_id: x.producerId, buyer_id: x.buyerId,
      product_id: x.productId, quantity: x.quantity, unit_price: x.unitPrice, store_id: x.storeId,
      status: x.status, created_at: x.createdAt,
    })),
    orders: estado.orders.map((x) => ({
      id: x.id, order_number: x.orderNumber, type: x.type, source_id: x.sourceId, producer_id: x.producerId,
      buyer_id: x.buyerId, product_id: x.productId, quantity: x.quantity, unit_price: x.unitPrice,
      store_id: x.storeId, status: x.status, proposal_id: nuloSeVazio(x.proposalId),
      payment_method: nuloSeVazio(x.paymentMethod), created_at: x.createdAt,
      accepted_at: nuloSeVazio(x.acceptedAt), paid_at: nuloSeVazio(x.paidAt), delivered_at: nuloSeVazio(x.deliveredAt),
    })),
    order_timeline: estado.orders.flatMap((o) => o.timeline.map((e) => ({ order_id: o.id, label: e.label, created_at: e.at }))),
    stock_movements: estado.stockMovements.map((x) => ({
      id: x.id, type: x.type, producer_id: x.producerId, product_id: x.productId, quantity: x.quantity,
      unit_cost: nuloSeVazio(x.unitCost), reason: nuloSeVazio(x.reason), note: x.note, created_at: x.createdAt,
    })),
    expenses: estado.expenses.map((x) => ({
      id: x.id, producer_id: x.producerId, type: x.type, description: x.description, amount: x.amount,
      created_at: x.createdAt,
    })),
  };
}

// ---------------------------------------------------------------- Diferenças

export type Operacao =
  | { tipo: "gravar"; tabela: Tabela; linhas: Linha[] }
  | { tipo: "apagar"; tabela: Tabela; chaves: Linha[] };

/** Chave de cada tabela (as de ligação não têm `id`). */
const CHAVES: Record<Exclude<Tabela, "users">, string[]> = {
  stores: ["id"],
  producer_pickup_stores: ["producer_id", "store_id"],
  products: ["id"],
  offers: ["id"],
  offer_stores: ["offer_id", "store_id"],
  proposals: ["id"],
  orders: ["id"],
  order_timeline: ["order_id", "label", "created_at"],
  stock_movements: ["id"],
  expenses: ["id"],
};

/** Ordem que respeita as chaves estrangeiras: pais antes de filhos ao gravar. */
const ORDEM: Exclude<Tabela, "users">[] = [
  "stores",
  "producer_pickup_stores",
  "products",
  "offers",
  "offer_stores",
  "proposals",
  "orders",
  "order_timeline",
  "stock_movements",
  "expenses",
];

const chaveDe = (tabela: Exclude<Tabela, "users">, linha: Linha) =>
  CHAVES[tabela].map((campo) => String(linha[campo])).join("|");

const soChave = (tabela: Exclude<Tabela, "users">, linha: Linha): Linha =>
  Object.fromEntries(CHAVES[tabela].map((campo) => [campo, linha[campo]]));

/**
 * O que gravar e apagar para o banco sair de `antes` e chegar em `depois`.
 * Grava pais antes de filhos e apaga filhos antes de pais.
 */
export function calcularOperacoes(antes: Estado, depois: Estado): Operacao[] {
  const linhasAntes = paraLinhas(antes);
  const linhasDepois = paraLinhas(depois);
  const gravar: Operacao[] = [];
  const apagar: Operacao[] = [];

  for (const tabela of ORDEM) {
    const anteriores = new Map(linhasAntes[tabela].map((l) => [chaveDe(tabela, l), JSON.stringify(l)]));
    const atuais = new Set(linhasDepois[tabela].map((l) => chaveDe(tabela, l)));

    const mudadas = linhasDepois[tabela].filter((l) => anteriores.get(chaveDe(tabela, l)) !== JSON.stringify(l));
    if (mudadas.length) gravar.push({ tipo: "gravar", tabela, linhas: mudadas });

    const removidas = linhasAntes[tabela].filter((l) => !atuais.has(chaveDe(tabela, l)));
    if (removidas.length) apagar.unshift({ tipo: "apagar", tabela, chaves: removidas.map((l) => soChave(tabela, l)) });
  }
  return [...apagar, ...gravar];
}

export const chavesDaTabela = (tabela: Exclude<Tabela, "users">): string[] => CHAVES[tabela];
