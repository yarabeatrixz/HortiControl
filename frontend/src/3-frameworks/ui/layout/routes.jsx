// Mapa de telas: qual componente aparece para cada aba e para cada rota.

import { METODO_PAGAMENTO, ORIGEM } from "@domain";
import { BuyerOffers } from "../screens/comprador/BuyerOffers";
import { Checkout } from "../screens/comprador/Checkout";
import { MyPurchases } from "../screens/comprador/MyPurchases";
import { OrderTracking } from "../screens/comprador/OrderTracking";
import { PaymentApproved, PaymentDeclined } from "../screens/comprador/PaymentResult";
import { ProducerPublic } from "../screens/comprador/ProducerPublic";
import { ProducersCatalog } from "../screens/comprador/ProducersCatalog";
import { PurchaseForm } from "../screens/comprador/PurchaseForm";
import { TrackingOrders } from "../screens/comprador/TrackingOrders";
import { StoreOrders } from "../screens/loja/StoreOrders";
import { StoreProfile } from "../screens/loja/StoreProfile";
import { OfferForm } from "../screens/produtor/OfferForm";
import { ProducerCatalog } from "../screens/produtor/ProducerCatalog";
import { ProducerOffers } from "../screens/produtor/ProducerOffers";
import { ProducerOrderStatus } from "../screens/produtor/ProducerOrderStatus";
import { ProducerPickupPoints } from "../screens/produtor/ProducerPickupPoints";
import { ProducerSales } from "../screens/produtor/ProducerSales";
import { ProductForm } from "../screens/produtor/ProductForm";
import { SaleDetail } from "../screens/produtor/SaleDetail";

/** Tela da aba atual do menu. */
export function TabScreen({ role, tab, setRoute }) {
  const abrir = (name, params = {}) => setRoute({ name, ...params });

  if (role === "produtor") {
    if (tab === "ofertas") return <ProducerOffers create={() => abrir("oferta")} />;
    if (tab === "pontos-retirada") return <ProducerPickupPoints />;
    if (tab === "vendas") return <ProducerSales open={(id) => abrir("venda", { id })} />;
    if (tab === "status-pedidos") return <ProducerOrderStatus />;
    return (
      <ProducerCatalog
        create={() => abrir("produto")}
        edit={(id) => abrir("produto", { id })}
        offer={(id) => abrir("oferta", { id })}
      />
    );
  }
  if (role === "comprador") {
    if (tab === "produtores")
      return <ProducersCatalog open={(id) => abrir("produtor-publico", { id })} />;
    if (tab === "compras")
      return (
        <MyPurchases
          open={(id) => abrir("rastreio", { id })}
          pay={(id) => abrir("checkout", { id })}
        />
      );
    if (tab === "acompanhar") return <TrackingOrders open={(id) => abrir("rastreio", { id })} />;
    return <BuyerOffers buy={(id) => abrir("compra", { id, type: ORIGEM.OFERTA })} />;
  }
  return tab === "pedidos" ? <StoreOrders /> : <StoreProfile />;
}

/** Tela aberta por cima da aba (formulários, detalhes e fluxo de pagamento). */
export function RouteScreen({ route, setRoute, abrirAba }) {
  const fechar = () => setRoute(null);
  switch (route.name) {
    case "produto":
      return <ProductForm id={route.id} back={fechar} />;
    case "oferta":
      return <OfferForm id={route.id} back={fechar} />;
    case "venda":
      return <SaleDetail id={route.id} back={fechar} />;
    case "produtor-publico":
      return (
        <ProducerPublic
          id={route.id}
          back={fechar}
          buy={(productId) =>
            setRoute({
              name: "compra",
              id: productId,
              type: ORIGEM.CATALOGO,
              back: { name: "produtor-publico", id: route.id },
            })
          }
        />
      );
    case "compra":
      return (
        <PurchaseForm
          id={route.id}
          type={route.type}
          back={() => setRoute(route.back ?? null)}
          checkout={(orderId) => setRoute({ name: "checkout", id: orderId })}
        />
      );
    case "checkout":
      return (
        <Checkout
          key={`${route.id}-${route.method}`}
          id={route.id}
          initialMethod={route.method}
          back={fechar}
          success={(method) => setRoute({ name: "pagamento-aprovado", id: route.id, method })}
          declined={() => setRoute({ name: "pagamento-recusado", id: route.id })}
        />
      );
    case "pagamento-aprovado":
      return (
        <PaymentApproved
          id={route.id}
          method={route.method}
          goOrders={() => abrirAba("compras")}
          goOffers={() => abrirAba("ofertas")}
        />
      );
    case "pagamento-recusado":
      return (
        <PaymentDeclined
          id={route.id}
          retry={() =>
            setRoute({ name: "checkout", id: route.id, method: METODO_PAGAMENTO.CARTAO })
          }
          pix={() => setRoute({ name: "checkout", id: route.id, method: METODO_PAGAMENTO.PIX })}
        />
      );
    case "rastreio":
      return <OrderTracking id={route.id} back={fechar} />;
    default:
      return null;
  }
}
