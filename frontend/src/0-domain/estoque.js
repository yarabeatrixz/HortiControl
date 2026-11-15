// Regras de estoque, perdas e despesas do produtor (puras).
// Mesmo contrato das demais regras: { ok, state } ou { ok: false, error }.

import { MOTIVOS_PERDA, STATUS_ESTOQUE, TIPO_DESPESA, TIPO_MOVIMENTO } from "./constants";
import { num } from "./format";
import { falha, novoId, substituir } from "./util";

/** OK, baixo (quantidade ≤ mínimo) ou zerado. Sem mínimo definido, só avisa quando zera. */
export function statusEstoque(produto) {
  const quantidade = num(produto.quantity);
  if (quantidade <= 0) return STATUS_ESTOQUE.ZERADO;
  if (quantidade <= num(produto.minQuantity)) return STATUS_ESTOQUE.BAIXO;
  return STATUS_ESTOQUE.OK;
}

export const precisaRepor = (produto) => statusEstoque(produto) !== STATUS_ESTOQUE.OK;

function movimentar(estado, produto, movimento, novaQuantidade) {
  return {
    ok: true,
    state: {
      ...estado,
      products: substituir(estado.products, produto.id, (item) => ({
        ...item,
        quantity: novaQuantidade,
      })),
      stockMovements: [movimento, ...(estado.stockMovements || [])],
    },
  };
}

/** Entrada de mercadoria (colheita, compra): soma ao estoque e registra o custo. */
export function registrarEntrada(estado, dados, agora = new Date()) {
  const produto = estado.products.find((item) => item.id === dados.productId);
  if (!produto) return falha("Selecione um produto");
  const quantidade = num(dados.quantity);
  const custoUnitario = num(dados.unitCost);
  if (quantidade <= 0) return falha("Informe uma quantidade válida");
  if (custoUnitario < 0) return falha("O custo não pode ser negativo");
  const movimento = {
    id: novoId("mov"),
    type: TIPO_MOVIMENTO.ENTRADA,
    producerId: produto.producerId,
    productId: produto.id,
    quantity: quantidade,
    unitCost: custoUnitario,
    note: dados.note?.trim() ?? "",
    createdAt: agora.toISOString(),
  };
  return movimentar(estado, produto, movimento, num(produto.quantity) + quantidade);
}

/** Perda (estragou, avaria…): tira do estoque e guarda o motivo. */
export function registrarPerda(estado, dados, agora = new Date()) {
  const produto = estado.products.find((item) => item.id === dados.productId);
  if (!produto) return falha("Selecione um produto");
  const quantidade = num(dados.quantity);
  if (quantidade <= 0) return falha("Informe uma quantidade válida");
  if (quantidade > num(produto.quantity)) return falha("A perda é maior que o estoque atual");
  if (!MOTIVOS_PERDA.includes(dados.reason)) return falha("Selecione o motivo da perda");
  const movimento = {
    id: novoId("mov"),
    type: TIPO_MOVIMENTO.PERDA,
    producerId: produto.producerId,
    productId: produto.id,
    quantity: quantidade,
    reason: dados.reason,
    note: dados.note?.trim() ?? "",
    createdAt: agora.toISOString(),
  };
  return movimentar(estado, produto, movimento, num(produto.quantity) - quantidade);
}

/** Custo ou investimento que não é entrada de mercadoria (adubo, frete, estufa…). */
export function registrarDespesa(estado, dados, agora = new Date()) {
  const valor = num(dados.amount);
  if (!dados.description?.trim()) return falha("Descreva o custo ou investimento");
  if (!Object.values(TIPO_DESPESA).includes(dados.type))
    return falha("Escolha se é custo ou investimento");
  if (valor <= 0) return falha("Informe um valor maior que zero");
  const despesa = {
    id: novoId("despesa"),
    producerId: dados.producerId,
    type: dados.type,
    description: dados.description.trim(),
    amount: valor,
    createdAt: agora.toISOString(),
  };
  return { ok: true, state: { ...estado, expenses: [despesa, ...(estado.expenses || [])] } };
}

export function excluirDespesa(estado, despesaId) {
  if (!(estado.expenses || []).some((item) => item.id === despesaId))
    return falha("Registro não encontrado");
  return {
    ok: true,
    state: { ...estado, expenses: estado.expenses.filter((item) => item.id !== despesaId) },
  };
}
