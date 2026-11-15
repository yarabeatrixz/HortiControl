import { BadgePercent, MapPin, Sprout } from "lucide-react";
import { useState } from "react";
import { CATEGORIAS, brl, ofertaAtiva } from "@domain";
import { Button } from "../../components/base/Button";
import { EmptyState } from "../../components/base/EmptyState";
import { PageTitle } from "../../components/base/PageTitle";
import { ProductImage } from "../../components/ProductImage";
import { useApp } from "../../state/AppProvider";

export function BuyerOffers({ buy }) {
  const { offers, products, users } = useApp();
  const [category, setCategory] = useState("Todas");
  const list = offers
    .filter((offer) => ofertaAtiva(offer))
    .map((offer) => ({ offer, product: products.find((p) => p.id === offer.productId) }))
    .filter(({ product }) => product && (category === "Todas" || product.category === category));

  return (
    <>
      <PageTitle
        eyebrow="OFERTAS DA REGIÃO"
        title="Produtos frescos, preços melhores"
        description="Negocie diretamente com produtores e retire em uma loja parceira."
      />
      <div className="filter-row" role="group" aria-label="Filtrar por categoria">
        {["Todas", ...CATEGORIAS].map((item) => (
          <button
            className={category === item ? "active" : ""}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="market-grid">
          {list.map(({ offer, product }) => {
            const producer = users.find((user) => user.id === offer.producerId);
            return (
              <article className="market-card" key={offer.id}>
                <div className="market-image">
                  <ProductImage product={product} />
                  <span>
                    <BadgePercent size={14} aria-hidden="true" /> OFERTA
                  </span>
                </div>
                <div className="market-body">
                  <small>{product.category}</small>
                  <h3>{product.name}</h3>
                  <p>
                    <Sprout size={14} aria-hidden="true" />
                    {producer?.name}
                  </p>
                  <p>
                    <MapPin size={14} aria-hidden="true" />
                    {offer.city}
                  </p>
                  <div className="market-stock">
                    {offer.quantity} {product.unit} disponíveis
                  </div>
                  <div className="market-price">
                    <s>{brl(product.price)}</s>
                    <strong>
                      {brl(offer.promotionalPrice)}
                      <small> / {product.unit}</small>
                    </strong>
                  </div>
                  <Button className="full" onClick={() => buy(offer.id)}>
                    Comprar
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BadgePercent}
          title="Nenhuma oferta no momento"
          text="Tente outra categoria ou volte mais tarde."
        />
      )}
    </>
  );
}
