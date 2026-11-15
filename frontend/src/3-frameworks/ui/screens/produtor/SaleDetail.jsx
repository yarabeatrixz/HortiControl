import { EVENTO_PEDIDO, brl, dataHora } from "@hortilink/dominio";
import { BackButton } from "../../components/base/BackButton";
import { OrderTimeline } from "../../components/OrderTimeline";
import { ProductImage } from "../../components/ProductImage";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";
import { totalPedido } from "../orderFilters";

const ETAPAS_VENDA = [
  { label: "Pedido realizado", event: EVENTO_PEDIDO.REALIZADO },
  { label: "Pagamento aprovado", event: EVENTO_PEDIDO.PAGAMENTO_APROVADO },
  { label: "Produto entregue na loja", event: EVENTO_PEDIDO.ENTREGUE_NA_LOJA },
  { label: "Retirado", event: EVENTO_PEDIDO.RETIRADO },
];

export function SaleDetail({ id, back }) {
  const { orders, products, users, stores } = useApp();
  const order = orders.find((item) => item.id === id);
  if (!order) return null;
  const product = products.find((item) => item.id === order.productId);
  const buyer = users.find((item) => item.id === order.buyerId);
  const store = stores.find((item) => item.id === order.storeId);
  // Pedido vindo de proposta começa com "Proposta aceita" em vez de "Pedido realizado".
  const etapas = order.proposalId
    ? [{ label: "Proposta aceita", event: EVENTO_PEDIDO.PROPOSTA_ACEITA }, ...ETAPAS_VENDA.slice(1)]
    : ETAPAS_VENDA;

  return (
    <div className="detail-page">
      <BackButton onClick={back}>Voltar às vendas</BackButton>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">DETALHE DA VENDA</span>
          <h1>{order.orderNumber}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="detail-grid">
        <section className="form-card">
          <div className="selected-product">
            <ProductImage product={product} />
            <div>
              <small>PRODUTO</small>
              <h3>{product?.name}</h3>
              <p>
                {order.quantity} {product?.unit} × {brl(order.unitPrice)}
              </p>
              <b>{brl(totalPedido(order))}</b>
            </div>
          </div>
          <div className="detail-data">
            <span>
              <small>COMPRADOR</small>
              <b>{buyer?.name}</b>
            </span>
            <span>
              <small>DATA DO PEDIDO</small>
              <b>{dataHora(order.createdAt)}</b>
            </span>
            <span>
              <small>LOJA DE RETIRADA</small>
              <b>{store?.name}</b>
              <small>
                {store?.address} · {store?.city}
              </small>
            </span>
            <span>
              <small>HORÁRIO</small>
              <b>{store?.hours}</b>
            </span>
          </div>
        </section>
        <section className="form-card">
          <h2>Linha do tempo</h2>
          <OrderTimeline order={order} steps={etapas} />
        </section>
      </div>
    </div>
  );
}
