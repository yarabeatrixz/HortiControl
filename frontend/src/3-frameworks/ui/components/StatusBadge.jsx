import { STATUS_OFERTA, STATUS_PEDIDO, STATUS_PROPOSTA } from "@domain";

const TOM_POR_STATUS = {
  [STATUS_PROPOSTA.AGUARDANDO]: "waiting",
  [STATUS_PEDIDO.AGUARDANDO_PAGAMENTO]: "waiting",
  [STATUS_PROPOSTA.RECUSADA]: "rejected",
  [STATUS_PEDIDO.CANCELADO]: "rejected",
  [STATUS_OFERTA.ESGOTADA]: "sold",
  [STATUS_OFERTA.ENCERRADA]: "sold",
  [STATUS_PEDIDO.RETIRADO]: "sold",
  [STATUS_PEDIDO.ENTREGUE_NA_LOJA]: "info",
};

/** Etiqueta colorida para status de oferta, proposta ou pedido. */
export function StatusBadge({ status, tone = TOM_POR_STATUS[status] ?? "accepted" }) {
  return <span className={`status status-${tone}`}>{status}</span>;
}
