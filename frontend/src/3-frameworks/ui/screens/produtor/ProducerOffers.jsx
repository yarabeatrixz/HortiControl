import { MapPin, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { STATUS_OFERTA, brl, statusOferta } from "@domain";
import { Button } from "../../components/base/Button";
import { ConfirmModal } from "../../components/base/ConfirmModal";
import { EmptyState } from "../../components/base/EmptyState";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { PageTitle } from "../../components/base/PageTitle";
import { ProductImage } from "../../components/ProductImage";
import { StatusBadge } from "../../components/StatusBadge";
import { useApp } from "../../state/AppProvider";

export function ProducerOffers({ create }) {
  const { currentUser, offers, products, stores, endOffer } = useApp();
  const [offerToEnd, setOfferToEnd] = useState(null);
  const [error, setError] = useState("");
  const list = offers
    .filter((offer) => offer.producerId === currentUser.id)
    .map((offer) => ({ offer, product: products.find((p) => p.id === offer.productId) }))
    .filter(({ product }) => product);

  const confirmEnd = async () => {
    try {
      await endOffer(offerToEnd.offer.id);
    } catch (err) {
      setError(err.message);
    }
    setOfferToEnd(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="QUEIMA DE ESTOQUE"
        title="Ofertas promocionais"
        description="Acompanhe ofertas ativas, esgotadas e encerradas."
        action={
          <Button icon={Plus} onClick={create}>
            Nova oferta
          </Button>
        }
      />
      <ErrorMessage>{error}</ErrorMessage>
      {list.length ? (
        <div className="list-cards">
          {list.map(({ offer, product }) => {
            const status = statusOferta(offer);
            const storeNames = offer.storeIds
              .map((id) => stores.find((store) => store.id === id)?.name)
              .filter(Boolean)
              .join(", ");
            return (
              <article className="horizontal-card" key={offer.id}>
                <ProductImage product={product} />
                <div className="horizontal-main">
                  <div className="card-heading">
                    <div>
                      <small>{product.category}</small>
                      <h3>{product.name}</h3>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <p>
                    <MapPin size={14} aria-hidden="true" /> {offer.city} · {storeNames}
                  </p>
                  <div className="offer-metrics">
                    <span>
                      <small>Estoque da oferta</small>
                      <b>
                        {offer.quantity} {product.unit}
                      </b>
                    </span>
                    <span>
                      <small>Preço normal</small>
                      <b className="strike">{brl(product.price)}</b>
                    </span>
                    <span>
                      <small>Preço promocional</small>
                      <b className="green">{brl(offer.promotionalPrice)}</b>
                    </span>
                    <span>
                      <small>Validade</small>
                      <b>{offer.validityDays} dia(s)</b>
                    </span>
                  </div>
                  {status === STATUS_OFERTA.ATIVA && (
                    <div className="offer-actions">
                      <Button
                        variant="danger"
                        className="end-offer-button"
                        onClick={() => setOfferToEnd({ offer, product })}
                      >
                        Encerrar oferta
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Nenhuma oferta criada" />
      )}
      {offerToEnd && (
        <ConfirmModal
          icon={XCircle}
          danger
          title="Encerrar oferta"
          confirmLabel="Encerrar"
          onConfirm={confirmEnd}
          onClose={() => setOfferToEnd(null)}
        >
          Encerrar a oferta de <b>{offerToEnd.product.name}</b>? Ela deixará de aparecer para os
          compradores.
        </ConfirmModal>
      )}
    </>
  );
}
