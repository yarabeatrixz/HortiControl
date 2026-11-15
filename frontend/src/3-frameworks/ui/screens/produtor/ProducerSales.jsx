import { Banknote, Boxes, ChevronRight, Clock3, PackageCheck, TrendingUp } from "lucide-react";
import { useState } from "react";
import { STATUS_PEDIDO, brl, dataCurta } from "@domain";
import { EmptyState } from "../../components/base/EmptyState";
import { Field } from "../../components/base/Field";
import { PageTitle } from "../../components/base/PageTitle";
import { SearchBox } from "../../components/base/SearchBox";
import { SummaryCard } from "../../components/base/SummaryCard";
import { ProductImage } from "../../components/ProductImage";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";
import { dentroDoPeriodo, PERIODOS, totalPedido } from "../orderFilters";

export function ProducerSales({ open }) {
  const { currentUser, orders, products, users, stores } = useApp();
  const [period, setPeriod] = useState("30 dias");
  const [status, setStatus] = useState("Todos");
  const [productId, setProductId] = useState("Todos");
  const [search, setSearch] = useState("");
  const [dates, setDates] = useState({ from: "", to: "" });
  const producerProducts = products.filter((item) => item.producerId === currentUser.id);
  const termo = search.trim().toLowerCase();

  const list = orders.filter(
    (order) =>
      order.producerId === currentUser.id &&
      dentroDoPeriodo(order.acceptedAt ?? order.createdAt, period, dates) &&
      (status === "Todos" || order.status === status) &&
      (productId === "Todos" || order.productId === productId) &&
      (!termo || order.orderNumber.toLowerCase().includes(termo)),
  );
  const total = list.reduce((sum, order) => sum + totalPedido(order), 0);
  const quantity = list.reduce((sum, order) => sum + order.quantity, 0);
  const awaitingPayment = list.filter(
    (order) => order.status === STATUS_PEDIDO.AGUARDANDO_PAGAMENTO,
  ).length;

  return (
    <>
      <PageTitle
        eyebrow="RESULTADOS"
        title="Minhas vendas"
        description="Acompanhe pagamentos, entregas e retiradas dos pedidos."
      />
      <div className="summary-grid">
        <SummaryCard label="Total vendido" value={brl(total)} icon={Banknote} />
        <SummaryCard label="Pedidos" value={list.length} icon={PackageCheck} />
        <SummaryCard label="Quantidade vendida" value={quantity} icon={Boxes} />
        <SummaryCard label="Aguardando pagamento" value={awaitingPayment} icon={Clock3} />
      </div>
      <div className="sales-filters">
        <SearchBox
          className="order-search"
          value={search}
          onChange={setSearch}
          placeholder="Buscar pelo número do pedido"
        />
        <select aria-label="Período" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {[...PERIODOS.filter((item) => item !== "Todos"), "Personalizado"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Todos</option>
          {Object.values(STATUS_PEDIDO).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Produto"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option>Todos</option>
          {producerProducts.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {period === "Personalizado" && (
        <div className="custom-dates">
          <Field
            label="De"
            type="date"
            value={dates.from}
            onChange={(e) => setDates({ ...dates, from: e.target.value })}
          />
          <Field
            label="Até"
            type="date"
            value={dates.to}
            onChange={(e) => setDates({ ...dates, to: e.target.value })}
          />
        </div>
      )}
      {list.length ? (
        <div className="sales-list">
          {list.map((order) => {
            const product = products.find((item) => item.id === order.productId);
            const buyer = users.find((item) => item.id === order.buyerId);
            const store = stores.find((item) => item.id === order.storeId);
            return (
              <button
                type="button"
                className="sale-card"
                onClick={() => open(order.id)}
                key={order.id}
              >
                <ProductImage product={product} alt="" />
                <span className="sale-main">
                  <span className="sale-top">
                    <span>
                      <strong className="order-number">{order.orderNumber}</strong>
                      <small>{dataCurta(order.createdAt)}</small>
                    </span>
                    <StatusBadge status={order.status} />
                  </span>
                  <b>{product?.name}</b>
                  <small>
                    {order.quantity} {product?.unit} · {brl(order.unitPrice)} por {product?.unit}
                  </small>
                  <small>
                    {buyer?.name} · Retirada em {store?.name}
                  </small>
                </span>
                <strong className="sale-total">{brl(totalPedido(order))}</strong>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={TrendingUp} title="Você ainda não tem vendas." />
      )}
    </>
  );
}
