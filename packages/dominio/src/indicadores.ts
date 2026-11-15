// Indicadores do produtor (relatórios). Função pura: recebe o estado e o período.

import { STATUS_PEDIDO, type StatusPedido, TIPO_DESPESA, type TipoDespesa, TIPO_MOVIMENTO } from "./constantes";
import { precisaRepor } from "./estoque";
import type { DataIso, Estado, Produto } from "./tipos";

/** Pedidos que contam como venda realizada (pagos em diante). */
const VENDA_CONFIRMADA: readonly StatusPedido[] = [
  STATUS_PEDIDO.PAGO,
  STATUS_PEDIDO.ENTREGUE_NA_LOJA,
  STATUS_PEDIDO.PRONTO_PARA_RETIRADA,
  STATUS_PEDIDO.RETIRADO,
];

export interface IndicadorProduto {
  product: Produto;
  vendido: number;
  receita: number;
  entradas: number;
  perdas: number;
}

export interface Indicadores {
  receita: number;
  pedidos: number;
  custoEntradas: number;
  custos: number;
  investimentos: number;
  gastoTotal: number;
  resultado: number;
  perdasQuantidade: number;
  /** Valor de venda que deixou de entrar por causa das perdas (preço do catálogo). */
  valorPerdido: number;
  estoqueBaixo: Produto[];
  porProduto: IndicadorProduto[];
}

const soma = <T>(lista: T[], valor: (item: T) => number): number =>
  lista.reduce((total, item) => total + valor(item), 0);

/**
 * @param noPeriodo filtro de datas, ex.: últimos 30 dias. Sem filtro, considera tudo.
 */
export function calcularIndicadores(
  estado: Pick<Estado, "products" | "orders" | "stockMovements" | "expenses">,
  producerId: string,
  noPeriodo: (data: DataIso) => boolean = () => true,
): Indicadores {
  const produtos = estado.products.filter((item) => item.producerId === producerId);
  const precoDe = (productId: string) => produtos.find((item) => item.id === productId)?.price ?? 0;

  const vendas = estado.orders.filter(
    (pedido) =>
      pedido.producerId === producerId &&
      VENDA_CONFIRMADA.includes(pedido.status) &&
      noPeriodo(pedido.paidAt ?? pedido.createdAt),
  );
  const movimentos = estado.stockMovements.filter(
    (mov) => mov.producerId === producerId && noPeriodo(mov.createdAt),
  );
  const entradas = movimentos.filter((mov) => mov.type === TIPO_MOVIMENTO.ENTRADA);
  const perdas = movimentos.filter((mov) => mov.type === TIPO_MOVIMENTO.PERDA);
  const despesas = estado.expenses.filter((item) => item.producerId === producerId && noPeriodo(item.createdAt));
  const totalDespesas = (tipo: TipoDespesa) =>
    soma(
      despesas.filter((item) => item.type === tipo),
      (item) => item.amount,
    );

  const receita = soma(vendas, (pedido) => pedido.quantity * pedido.unitPrice);
  const custoEntradas = soma(entradas, (mov) => mov.quantity * (mov.unitCost ?? 0));
  const custos = totalDespesas(TIPO_DESPESA.CUSTO);
  const investimentos = totalDespesas(TIPO_DESPESA.INVESTIMENTO);

  const porProduto = produtos
    .map((produto): IndicadorProduto => {
      const doProduto = <T extends { productId: string }>(lista: T[]) =>
        lista.filter((item) => item.productId === produto.id);
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
    valorPerdido: soma(perdas, (mov) => mov.quantity * precoDe(mov.productId)),
    estoqueBaixo: produtos.filter(precisaRepor),
    porProduto,
  };
}
