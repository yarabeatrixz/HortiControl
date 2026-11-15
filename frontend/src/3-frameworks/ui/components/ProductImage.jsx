const FOTO_PADRAO =
  "https://images.unsplash.com/photo-1663441041768-7fc660ae49d9?auto=format&fit=crop&w=900&q=85";

/** Foto do produto; usa uma imagem genérica quando o produto não tem foto. */
export function ProductImage({ product, src = product?.photo, alt = product?.name ?? "" }) {
  return <img src={src || FOTO_PADRAO} alt={alt} loading="lazy" />;
}
