import { useState } from "react";

export const RAIOS_KM = ["5", "10", "20", "Todos"];
const DISTANCIA_DESCONHECIDA_KM = 24.5;

/** Filtra lojas por texto e raio e ordena da mais próxima para a mais distante. */
export function useNearbyStores(stores) {
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState("10");
  const termo = search.trim().toLowerCase();
  const visibleStores = stores
    .map((store) => ({ ...store, distance: store.distanceKm ?? DISTANCIA_DESCONHECIDA_KM }))
    .filter(
      (store) =>
        (!termo || `${store.name} ${store.address} ${store.city}`.toLowerCase().includes(termo)) &&
        (radius === "Todos" || store.distance <= Number(radius)),
    )
    .sort((a, b) => a.distance - b.distance);
  return { search, setSearch, radius, setRadius, visibleStores };
}
