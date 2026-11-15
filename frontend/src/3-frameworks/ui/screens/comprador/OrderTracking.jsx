import { MapPin } from "lucide-react";
import { EVENTO_PEDIDO } from "@domain";
import { BackButton } from "../../components/base/BackButton";
import { OrderTimeline } from "../../components/OrderTimeline";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";

const ETAPAS_ENTREGA = [
  { label: "Pedido confirmado", event: EVENTO_PEDIDO.PAGAMENTO_APROVADO },
  { label: "Produto entregue na loja", event: EVENTO_PEDIDO.ENTREGUE_NA_LOJA },
  { label: "Pronto para retirada", event: EVENTO_PEDIDO.PRONTO_PARA_RETIRADA },
  { label: "Retirado", event: EVENTO_PEDIDO.RETIRADO },
];

export function OrderTracking({ id, back }) {
  const { orders, products, stores } = useApp();
  const order = orders.find((item) => item.id === id);
  if (!order) return null;
  const product = products.find((item) => item.id === order.productId);
  const store = stores.find((item) => item.id === order.storeId);

  return (
    <div className="tracking-page">
      <BackButton onClick={back}>Voltar aos pedidos</BackButton>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">ACOMPANHAMENTO DO PEDIDO</span>
          <h1>{order.orderNumber}</h1>
          <p>{product?.name}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <section className="tracking-card">
        <h2>Linha do tempo</h2>
        <OrderTimeline order={order} steps={ETAPAS_ENTREGA} />
        <div className="where-pickup">
          <span>
            <MapPin size={20} aria-hidden="true" />
          </span>
          <div>
            <small>ONDE RETIRAR</small>
            <b>{store?.name}</b>
            <p>
              {store?.address} · {store?.city}
              <br />
              {store?.hours}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
