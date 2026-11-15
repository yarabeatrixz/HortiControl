import { TriangleAlert } from "lucide-react";
import { precisaRepor } from "@domain";

/** Aviso com os produtos no estoque mínimo ou zerados. Some quando não há nenhum. */
export function LowStockAlert({ products, action }) {
  const baixos = products.filter(precisaRepor);
  if (!baixos.length) return null;
  return (
    <div className="alert-banner" role="alert">
      <TriangleAlert size={18} aria-hidden="true" />
      <span>
        <b>
          {baixos.length === 1
            ? "1 produto precisa de reposição"
            : `${baixos.length} produtos precisam de reposição`}
        </b>
        <small>
          {baixos
            .map((produto) => `${produto.name} (${produto.quantity} ${produto.unit})`)
            .join(" · ")}
        </small>
      </span>
      {action}
    </div>
  );
}
