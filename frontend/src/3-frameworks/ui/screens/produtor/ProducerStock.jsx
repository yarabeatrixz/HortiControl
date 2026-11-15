import { ArrowDownToLine, ArrowUpFromLine, History, Warehouse } from "lucide-react";
import { useState } from "react";
import { TIPO_MOVIMENTO, brl, dataHora, statusEstoque } from "@hortilink/dominio";
import { Button } from "../../components/base/Button";
import { EmptyState } from "../../components/base/EmptyState";
import { PageTitle } from "../../components/base/PageTitle";
import { LowStockAlert } from "../../components/LowStockAlert";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";

const FILTROS = ["Todos", TIPO_MOVIMENTO.ENTRADA, TIPO_MOVIMENTO.PERDA];

/** Consulta de estoque + histórico de entradas e perdas do produtor. */
export function ProducerStock({ move }) {
  const { currentUser, products, stockMovements = [] } = useApp();
  const [filter, setFilter] = useState("Todos");
  const meusProdutos = products.filter((product) => product.producerId === currentUser.id);
  const nomeDe = (id) => products.find((product) => product.id === id);
  const historico = stockMovements.filter(
    (mov) => mov.producerId === currentUser.id && (filter === "Todos" || mov.type === filter),
  );

  return (
    <>
      <PageTitle
        eyebrow="CONTROLE DE ESTOQUE"
        title="Estoque"
        description="Consulte as quantidades, registre entradas de mercadoria e perdas."
        action={
          <div className="page-actions">
            <Button
              variant="secondary"
              icon={ArrowUpFromLine}
              onClick={() => move(TIPO_MOVIMENTO.PERDA)}
            >
              Registrar perda
            </Button>
            <Button icon={ArrowDownToLine} onClick={() => move(TIPO_MOVIMENTO.ENTRADA)}>
              Registrar entrada
            </Button>
          </div>
        }
      />
      <LowStockAlert products={meusProdutos} />
      {meusProdutos.length ? (
        <div className="table-card">
          <table className="data-table">
            <caption className="sr-only">Estoque atual por produto</caption>
            <thead>
              <tr>
                <th scope="col">Produto</th>
                <th scope="col">Em estoque</th>
                <th scope="col">Mínimo</th>
                <th scope="col">Situação</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {meusProdutos.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    {product.name}
                    <small>
                      {product.category} · {brl(product.price)}/{product.unit}
                    </small>
                  </th>
                  <td>
                    {product.quantity} {product.unit}
                  </td>
                  <td>{product.minQuantity ? `${product.minQuantity} ${product.unit}` : "—"}</td>
                  <td>
                    <StatusBadge status={statusEstoque(product)} />
                  </td>
                  <td className="row-actions">
                    <button
                      type="button"
                      aria-label={`Registrar entrada de ${product.name}`}
                      onClick={() => move(TIPO_MOVIMENTO.ENTRADA, product.id)}
                    >
                      + Entrada
                    </button>
                    <button
                      type="button"
                      aria-label={`Registrar perda de ${product.name}`}
                      onClick={() => move(TIPO_MOVIMENTO.PERDA, product.id)}
                    >
                      − Perda
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Warehouse}
          title="Cadastre produtos no catálogo para controlar o estoque"
        />
      )}

      <div className="section-heading">
        <h2>Movimentações</h2>
        <div className="filter-row" role="group" aria-label="Filtrar movimentações">
          {FILTROS.map((item) => (
            <button
              type="button"
              className={filter === item ? "active" : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item === "Todos" ? "Todas" : `${item}s`}
            </button>
          ))}
        </div>
      </div>
      {historico.length ? (
        <ul className="movement-list">
          {historico.map((mov) => {
            const product = nomeDe(mov.productId);
            const entrada = mov.type === TIPO_MOVIMENTO.ENTRADA;
            return (
              <li key={mov.id} className={entrada ? "in" : "out"}>
                <span className="movement-icon" aria-hidden="true">
                  {entrada ? <ArrowDownToLine size={17} /> : <ArrowUpFromLine size={17} />}
                </span>
                <span>
                  <b>
                    {mov.type}: {entrada ? "+" : "−"}
                    {mov.quantity} {product?.unit} de {product?.name ?? "produto excluído"}
                  </b>
                  <small>
                    {dataHora(mov.createdAt)}
                    {entrada
                      ? ` · custo ${brl(mov.unitCost)}/${product?.unit ?? "un"} = ${brl(mov.quantity * mov.unitCost)}`
                      : ` · ${mov.reason}`}
                    {mov.note ? ` · ${mov.note}` : ""}
                  </small>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={History} title="Nenhuma movimentação registrada" />
      )}
    </>
  );
}
