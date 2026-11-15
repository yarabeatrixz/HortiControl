import { Clock3, Store } from "lucide-react";

/** Ícone + nome, endereço e horário de uma loja parceira. */
export function StoreDetails({ store, showHours = true }) {
  return (
    <>
      <span className="pickup-icon">
        <Store size={19} aria-hidden="true" />
      </span>
      <span>
        <b>{store.name}</b>
        <small>
          {store.address} · {store.city}
        </small>
        {showHours && (
          <small>
            <Clock3 size={12} aria-hidden="true" /> {store.hours}
          </small>
        )}
      </span>
    </>
  );
}
