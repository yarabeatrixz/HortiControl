import { PackageCheck } from "lucide-react";
import { useState } from "react";
import { STATUS_PEDIDO, brl } from "@domain";
import { EmptyState } from "../../components/base/EmptyState";
import { PageTitle } from "../../components/base/PageTitle";
import { SearchBox } from "../../components/base/SearchBox";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";
import { buscaPorNumero, totalPedido } from "../orderFilters";

const PARA_RETIRADA = [STATUS_PEDIDO.PAGO, STATUS_PEDIDO.ENTREGUE_NA_LOJA];

/** Pedidos pagos que serão (ou já foram) entregues na loja para retirada. */
export function StoreOrders() {
  const { currentUser, stores, orders, products, users } = useApp();
  const store = stores.find((item) => item.userId === currentUser.id);
  const [search, setSearch] = useState("");
  const list = orders.filter(
    (order) =>
      order.storeId === store?.id &&
      PARA_RETIRADA.includes(order.status) &&
      buscaPorNumero(order, search),
  );

  return (
    <>
      <PageTitle
        eyebrow="RETIRADAS"
        title="Pedidos para retirada"
        description="Compras confirmadas que serão retiradas em sua loja."
      />
      <SearchBox
        className="order-search"
        value={search}
        onChange={setSearch}
        placeholder="Buscar pelo número do pedido"
      />
      {list.length ? (
        <div className="list-cards">
          {list.map((order) => {
            const product = products.find((item) => item.id === order.productId);
            const producer = users.find((item) => item.id === order.producerId);
            const buyer = users.find((item) => item.id === order.buyerId);
            const chegou = order.status === STATUS_PEDIDO.ENTREGUE_NA_LOJA;
            return (
              <article className="order-card" key={order.id}>
                <span className="order-icon">
                  <PackageCheck size={24} aria-hidden="true" />
                </span>
                <div>
                  <strong className="order-number">{order.orderNumber}</strong>
                  <h3>{product?.name}</h3>
                  <p>
                    {order.quantity} {product?.unit}
                  </p>
                </div>
                <div className="store-order-status">
                  <StatusBadge status={order.status} />
                  <small>{chegou ? "Na loja" : "A chegar"}</small>
                </div>
                <div>
                  <small>PRODUTOR</small>
                  <b>{producer?.name}</b>
                </div>
                <div>
                  <small>COMPRADOR</small>
                  <b>{buyer?.name}</b>
                </div>
                <strong>{brl(totalPedido(order))}</strong>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PackageCheck}
          title={store ? "Nenhum pedido para retirada" : "Cadastre seu ponto de coleta"}
        />
      )}
    </>
  );
}
