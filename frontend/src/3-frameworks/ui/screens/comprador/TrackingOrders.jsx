import { ChevronRight, Clock3, PackageCheck } from "lucide-react";
import { useState } from "react";
import { STATUS_PEDIDO } from "@domain";
import { EmptyState } from "../../components/base/EmptyState";
import { PageTitle } from "../../components/base/PageTitle";
import { SearchBox } from "../../components/base/SearchBox";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";
import { buscaPorNumero } from "../orderFilters";

const EM_ANDAMENTO = [
  STATUS_PEDIDO.PAGO,
  STATUS_PEDIDO.ENTREGUE_NA_LOJA,
  STATUS_PEDIDO.PRONTO_PARA_RETIRADA,
];

export function TrackingOrders({ open }) {
  const { currentUser, orders, products, stores } = useApp();
  const [search, setSearch] = useState("");
  const list = orders.filter(
    (order) =>
      order.buyerId === currentUser.id &&
      EM_ANDAMENTO.includes(order.status) &&
      buscaPorNumero(order, search),
  );

  return (
    <>
      <PageTitle
        eyebrow="EM ANDAMENTO"
        title="Acompanhar pedido"
        description="Acompanhe a entrega e a movimentação dos seus pedidos."
      />
      <SearchBox
        className="order-search"
        value={search}
        onChange={setSearch}
        placeholder="Buscar pelo número do pedido"
      />
      {list.length ? (
        <div className="tracking-list">
          {list.map((order) => {
            const product = products.find((item) => item.id === order.productId);
            const store = stores.find((item) => item.id === order.storeId);
            return (
              <button onClick={() => open(order.id)} key={order.id}>
                <span className="tracking-list-icon">
                  <PackageCheck size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>{order.orderNumber}</strong>
                  <b>{product?.name}</b>
                  <small>{store?.name}</small>
                </span>
                <StatusBadge status={order.status} />
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Clock3} title="Nenhum pedido em andamento." />
      )}
    </>
  );
}
