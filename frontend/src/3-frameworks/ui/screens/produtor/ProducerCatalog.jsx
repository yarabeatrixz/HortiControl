import { BadgePercent, Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { brl } from "@domain";
import { Button } from "../../components/base/Button";
import { ConfirmModal } from "../../components/base/ConfirmModal";
import { EmptyState } from "../../components/base/EmptyState";
import { ErrorMessage } from "../../components/base/ErrorMessage";
import { PageTitle } from "../../components/base/PageTitle";
import { ProductImage } from "../../components/ProductImage";
import { useApp } from "../../state/AppProvider";

export function ProducerCatalog({ create, edit, offer }) {
  const { currentUser, products, deleteProduct } = useApp();
  const [productToDelete, setProductToDelete] = useState(null);
  const [error, setError] = useState("");
  const list = products.filter((product) => product.producerId === currentUser.id);

  const confirmDelete = async () => {
    try {
      await deleteProduct(productToDelete.id);
    } catch (err) {
      setError(err.message);
    }
    setProductToDelete(null);
  };

  return (
    <>
      <PageTitle
        eyebrow="MEUS PRODUTOS"
        title="Catálogo da produção"
        description="Organize seus produtos e transforme o estoque em ofertas promocionais."
        action={
          <Button icon={Plus} onClick={create}>
            Cadastrar produto
          </Button>
        }
      />
      <ErrorMessage>{error}</ErrorMessage>
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
                <div className="card-actions">
                  <Button variant="secondary" icon={Edit3} onClick={() => edit(product.id)}>
                    Editar
                  </Button>
                  <Button icon={BadgePercent} onClick={() => offer(product.id)}>
                    Criar oferta
                  </Button>
                  <button
                    className="icon-danger"
                    aria-label={`Excluir ${product.name}`}
                    title="Excluir"
                    onClick={() => setProductToDelete(product)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Seu catálogo está vazio"
          text="Cadastre o primeiro produto da sua produção."
        />
      )}
      {productToDelete && (
        <ConfirmModal
          icon={Trash2}
          danger
          title="Excluir produto"
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onClose={() => setProductToDelete(null)}
        >
          Excluir <b>{productToDelete.name}</b>? As ofertas deste produto também serão removidas.
        </ConfirmModal>
      )}
    </>
  );
}
