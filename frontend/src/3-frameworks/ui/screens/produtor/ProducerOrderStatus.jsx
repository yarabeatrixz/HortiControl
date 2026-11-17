import { PackageCheck } from "lucide-react";
import { useState } from "react";
import { STATUS_PEDIDO, dataCurta } from "@hortilink/dominio";
import { Button } from "../../components/base/Button";
import { ConfirmModal } from "../../components/base/ConfirmModal";
import { EmptyState } from "../../components/base/EmptyState";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { PageTitle } from "../../components/base/PageTitle";
import { ProductImage } from "../../components/ProductImage";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";

export function ProducerOrderStatus() {
  const { currentUser, orders, products, users, stores, confirmOrderDelivered } = useApp();
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [error, setError] = useState("");
  const list = orders.filter((order) => order.producerId === currentUser.id);
  const storeOf = (order) => stores.find((item) => item.id === order.storeId);

  const confirmDelivery = async () => {
    try {
      await confirmOrderDelivered(deliveryOrder.id);
    } catch (err) {
      setError(err.message);
    }
    setDeliveryOrder(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO"
        title="Atualizar status do pedido"
        description="Confirme quando os produtos pagos forem entregues no ponto de retirada."
      />
      <ErrorMessage>{error}</ErrorMessage>
      {list.length ? (
        <div className="sales-list">
          {list.map((order) => {
            const product = products.find((item) => item.id === order.productId);
            const buyer = users.find((item) => item.id === order.buyerId);
            return (
              <article className="sale-card status-update-card" key={order.id}>
                <ProductImage product={product} />
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
                    {order.quantity} {product?.unit} · {buyer?.name}
                  </small>
                  <small>Retirada em {storeOf(order)?.name}</small>
                </span>
                {order.status === STATUS_PEDIDO.PAGO && (
                  <Button className="delivery-button" onClick={() => setDeliveryOrder(order)}>
                    Marcar como entregue na loja
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={PackageCheck} title="Nenhum pedido para atualizar." />
      )}
      {deliveryOrder && (
        <ConfirmModal
          icon={PackageCheck}
          title="Confirmar entrega"
          confirmLabel="Confirmar"
          onConfirm={confirmDelivery}
          onClose={() => setDeliveryOrder(null)}
        >
          Confirma que o pedido <b>{deliveryOrder.orderNumber}</b> foi entregue na loja{" "}
          <b>{storeOf(deliveryOrder)?.name}</b>?
        </ConfirmModal>
      )}
    </>
  );
}
