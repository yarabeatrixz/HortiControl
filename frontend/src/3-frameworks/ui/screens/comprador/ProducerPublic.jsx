import { MapPin, Store } from "lucide-react";
import { brl, inicial } from "@domain";
import { BackButton } from "../../components/base/BackButton";
import { Button } from "../../components/base/Button";
import { EmptyState } from "../../components/base/EmptyState";
import { PageTitle } from "../../components/base/PageTitle";
import { ProductImage } from "../../components/ProductImage";
import { useApp } from "../../state/AppProvider";

/** Perfil público de um produtor, com o catálogo para compra direta. */
export function ProducerPublic({ id, back, buy }) {
  const { users, products, stores } = useApp();
  const producer = users.find((user) => user.id === id);
  if (!producer) return null;
  const list = products.filter((product) => product.producerId === id && product.quantity > 0);
  const pickupStores = stores.filter((store) => producer.pickupStoreIds?.includes(store.id));

  return (
    <div>
      <BackButton onClick={back}>Voltar aos produtores</BackButton>
      <section className="public-profile-hero">
        <div className="public-profile-info">
          <span className="avatar xlarge">{inicial(producer.name)}</span>
          <div>
            <span className="eyebrow">PRODUTOR HORTILINK</span>
            <h1>{producer.name}</h1>
            <p>
              <MapPin size={15} aria-hidden="true" />
              {producer.city}
            </p>
          </div>
        </div>
        <div className="public-profile-count">
          <b>{list.length}</b>
          <span>produtos disponíveis</span>
        </div>
      </section>
      <div className="public-pickups">
        <Store size={18} aria-hidden="true" />
        <div>
          <b>Pontos de retirada disponíveis</b>
          <p>
            {pickupStores.map((store) => `${store.name} · ${store.city}`).join("  •  ") ||
              "Nenhum ponto selecionado"}
          </p>
        </div>
      </div>
      <PageTitle
        eyebrow="CATÁLOGO DO PRODUTOR"
        title="Produtos disponíveis"
        description="Escolha um produto e defina onde deseja retirar."
      />
      {list.length ? (
        <div className="product-grid">
          {list.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <ProductImage product={product} />
                <span>{product.category}</span>
              </div>
              <div className="product-body">
                <h3>{product.name}</h3>
                <p className="stock">
                  {product.quantity} {product.unit} disponíveis
                </p>
                <div className="product-price">
                  <strong>{brl(product.price)}</strong>
                  <small>/ {product.unit}</small>
                </div>
                <Button
                  className="full"
                  disabled={!pickupStores.length}
                  onClick={() => buy(product.id)}
                >
                  Comprar
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum produto disponível" />
      )}
    </div>
  );
}
