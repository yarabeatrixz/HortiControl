// Indicadores do produtor (relatórios). Função pura: recebe o estado e o período.

import { STATUS_PEDIDO, TIPO_DESPESA, TIPO_MOVIMENTO } from "./constants";
import { precisaRepor } from "./estoque";

/** Pedidos que contam como venda realizada (pagos em diante). */
const VENDA_CONFIRMADA = [
  STATUS_PEDIDO.PAGO,
  STATUS_PEDIDO.ENTREGUE_NA_LOJA,
  STATUS_PEDIDO.PRONTO_PARA_RETIRADA,
  STATUS_PEDIDO.RETIRADO,
];

const soma = (lista, valor) => lista.reduce((total, item) => total + valor(item), 0);

/**
 * @param {object} estado
 * @param {string} producerId
 * @param {(dataIso: string) => boolean} noPeriodo  filtro de datas (ex.: últimos 30 dias)
 */
export function calcularIndicadores(estado, producerId, noPeriodo = () => true) {
  const produtos = estado.products.filter((item) => item.producerId === producerId);
  const precoDe = (productId) => produtos.find((item) => item.id === productId)?.price ?? 0;

  const vendas = (estado.orders || []).filter(
    (pedido) =>
      pedido.producerId === producerId &&
      VENDA_CONFIRMADA.includes(pedido.status) &&
      noPeriodo(pedido.paidAt ?? pedido.createdAt),
  );
  const movimentos = (estado.stockMovements || []).filter(
    (mov) => mov.producerId === producerId && noPeriodo(mov.createdAt),
  );
  const entradas = movimentos.filter((mov) => mov.type === TIPO_MOVIMENTO.ENTRADA);
  const perdas = movimentos.filter((mov) => mov.type === TIPO_MOVIMENTO.PERDA);
  const despesas = (estado.expenses || []).filter(
    (item) => item.producerId === producerId && noPeriodo(item.createdAt),
  );
  const totalDespesas = (tipo) =>
    soma(
      despesas.filter((item) => item.type === tipo),
      (item) => item.amount,
    );

  const receita = soma(vendas, (pedido) => pedido.quantity * pedido.unitPrice);
  const custoEntradas = soma(entradas, (mov) => mov.quantity * mov.unitCost);
  const custos = totalDespesas(TIPO_DESPESA.CUSTO);
  const investimentos = totalDespesas(TIPO_DESPESA.INVESTIMENTO);

  const porProduto = produtos
    .map((produto) => {
      const doProduto = (lista) => lista.filter((item) => item.productId === produto.id);
      return {
        product: produto,
        vendido: soma(doProduto(vendas), (pedido) => pedido.quantity),
        receita: soma(doProduto(vendas), (pedido) => pedido.quantity * pedido.unitPrice),
        entradas: soma(doProduto(entradas), (mov) => mov.quantity),
        perdas: soma(doProduto(perdas), (mov) => mov.quantity),
      };
    })
    .sort((a, b) => b.receita - a.receita);

  return {
    receita,
    pedidos: vendas.length,
    custoEntradas,
    custos,
    investimentos,
    gastoTotal: custoEntradas + custos + investimentos,
    resultado: receita - custoEntradas - custos - investimentos,
    perdasQuantidade: soma(perdas, (mov) => mov.quantity),
    // Valor de venda que deixou de entrar por causa das perdas (preço do catálogo).
    valorPerdido: soma(perdas, (mov) => mov.quantity * precoDe(mov.productId)),
    estoqueBaixo: produtos.filter(precisaRepor),
    porProduto,
  };
}
