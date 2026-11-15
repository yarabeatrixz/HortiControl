import {
  Banknote,
  Landmark,
  PackageX,
  Receipt,
  Scale,
  ShoppingBag,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { brl, calcularIndicadores, statusEstoque } from "@domain";
import { PageTitle } from "../../components/base/PageTitle";
import { SummaryCard } from "../../components/base/SummaryCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";
import { PERIODOS, dentroDoPeriodo } from "../orderFilters";

/** Relatórios e indicadores: vendas, gastos, perdas e resultado do período. */
export function ProducerReports() {
  const app = useApp();
  const [period, setPeriod] = useState("30 dias");
  const i = calcularIndicadores(app, app.currentUser.id, (data) => dentroDoPeriodo(data, period));

  return (
    <>
      <PageTitle
        eyebrow="RELATÓRIOS"
        title="Indicadores da produção"
        description="Vendas confirmadas, gastos, perdas e resultado no período."
        action={
          <select
            className="period-select"
            aria-label="Período do relatório"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {PERIODOS.map((item) => (
              <option key={item} value={item}>
                {item === "Todos" ? "Todo o período" : item}
              </option>
            ))}
          </select>
        }
      />
      <div className="summary-grid">
        <SummaryCard label="Receita (vendas pagas)" value={brl(i.receita)} icon={Banknote} />
        <SummaryCard label="Gastos totais" value={brl(i.gastoTotal)} icon={Receipt} />
        <SummaryCard label="Resultado" value={brl(i.resultado)} icon={Scale} />
        <SummaryCard label="Pedidos pagos" value={i.pedidos} icon={ShoppingBag} />
      </div>
      <div className="summary-grid">
        <SummaryCard label="Custo das entradas" value={brl(i.custoEntradas)} icon={Truck} />
        <SummaryCard label="Custos" value={brl(i.custos)} icon={Receipt} />
        <SummaryCard label="Investimentos" value={brl(i.investimentos)} icon={Landmark} />
        <SummaryCard
          label="Perdas (venda que deixou de entrar)"
          value={brl(i.valorPerdido)}
          icon={PackageX}
        />
      </div>
      <p className={i.resultado < 0 ? "report-note negative" : "report-note"} role="status">
        {i.resultado < 0
          ? "Os gastos do período superam a receita. Investimentos costumam se pagar ao longo de vários meses."
          : "A receita do período cobre os gastos registrados."}
      </p>

      <div className="section-heading">
        <h2>Por produto</h2>
      </div>
      <div className="table-card">
        <table className="data-table">
          <caption className="sr-only">Vendas, entradas e perdas por produto</caption>
          <thead>
            <tr>
              <th scope="col">Produto</th>
              <th scope="col">Vendido</th>
              <th scope="col">Receita</th>
              <th scope="col">Entradas</th>
              <th scope="col">Perdas</th>
              <th scope="col">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {i.porProduto.map(({ product, vendido, receita, entradas, perdas }) => (
              <tr key={product.id}>
                <th scope="row">{product.name}</th>
                <td>
                  {vendido} {product.unit}
                </td>
                <td>{brl(receita)}</td>
                <td>
                  {entradas} {product.unit}
                </td>
                <td>
                  {perdas} {product.unit}
                </td>
                <td>
                  <StatusBadge status={statusEstoque(product)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!!i.estoqueBaixo.length && (
        <p className="report-note warning">
          <TriangleAlert size={15} aria-hidden="true" /> Repor:{" "}
          {i.estoqueBaixo.map((product) => product.name).join(", ")}
        </p>
      )}
    </>
  );
}
