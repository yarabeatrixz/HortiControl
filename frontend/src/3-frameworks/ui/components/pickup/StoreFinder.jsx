import { LocateFixed, MapPin, Store, X } from "lucide-react";
import { Button } from "../base/Button";
import { SearchBox } from "../base/SearchBox";
import { RAIOS_KM } from "./useNearbyStores";

/** Chips com os pontos já escolhidos; clicar remove. */
export function SelectedStoreChips({ stores, selectedIds, onRemove }) {
  if (!selectedIds.length) return null;
  return (
    <div className="selected-chips">
      {selectedIds.map((storeId) => (
        <button type="button" key={storeId} onClick={() => onRemove(storeId)}>
          {stores.find((item) => item.id === storeId)?.name} <X size={13} aria-label="Remover" />
        </button>
      ))}
    </div>
  );
}

/** Busca por texto, botão "usar minha localização", raio e mapa ilustrativo. */
export function StoreFinder({ finder, userCity }) {
  const { search, setSearch, radius, setRadius, visibleStores } = finder;
  return (
    <>
      <div className="location-tools">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Buscar ponto por nome ou endereço"
        />
        <Button
          type="button"
          variant="secondary"
          icon={LocateFixed}
          onClick={() => setSearch(userCity)}
        >
          Usar minha localização
        </Button>
      </div>
      <div className="radius-row" role="group" aria-label="Raio de busca">
        <b>Raio de busca</b>
        {RAIOS_KM.map((item) => (
          <button
            type="button"
            className={radius === item ? "active" : ""}
            aria-pressed={radius === item}
            onClick={() => setRadius(item)}
            key={item}
          >
            {item === "Todos" ? item : `${item} km`}
          </button>
        ))}
      </div>
      {/* Mapa ilustrativo (sem geolocalização real). */}
      <div className="mini-map" aria-hidden="true">
        <div className="map-road road-one" />
        <div className="map-road road-two" />
        <span className="map-user-pin">
          <MapPin size={20} />
        </span>
        {visibleStores.map((store, index) => (
          <span className={`map-store-pin pin-${index + 1}`} key={store.id}>
            <Store size={15} />
          </span>
        ))}
        <small>
          <MapPin size={12} /> Local buscado
          <Store size={12} /> Lojas parceiras
        </small>
      </div>
    </>
  );
}
