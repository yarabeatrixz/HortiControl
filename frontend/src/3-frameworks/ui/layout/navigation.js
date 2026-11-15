import {
  BadgePercent,
  Boxes,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Sprout,
  Store,
} from "lucide-react";

/** Abas do menu por perfil: a primeira é a inicial. */
export const NAV = {
  produtor: [
    { id: "catalogo", label: "Catálogo", icon: Boxes },
    { id: "ofertas", label: "Ofertas", icon: BadgePercent },
    { id: "pontos-retirada", label: "Pontos de retirada", icon: MapPin },
    { id: "vendas", label: "Minhas vendas", icon: PackageCheck },
    { id: "status-pedidos", label: "Atualizar status", icon: CheckCircle2 },
  ],
  comprador: [
    { id: "ofertas", label: "Ofertas", icon: BadgePercent },
    { id: "produtores", label: "Produtores", icon: Sprout },
    { id: "compras", label: "Minhas compras", icon: PackageCheck },
    { id: "acompanhar", label: "Acompanhar", icon: Clock3 },
  ],
  loja: [
    { id: "ponto", label: "Meu ponto", icon: Store },
    { id: "pedidos", label: "Pedidos", icon: PackageCheck },
  ],
};
