// Ofertas promocionais ("queima de estoque") criadas a partir do catálogo.

import { STATUS_OFERTA, type StatusOferta } from "./constantes";
import { num } from "./formatacao";
import type { Estado, Numerico, Oferta, Resultado } from "./tipos";
import { falha, novoId, substituir, texto } from "./util";

export interface DadosOferta {
  productId: string;
  quantity: Numerico;
  promotionalPrice: Numerico;
  city: string;
  validityDays: Numerico;
  storeIds: string[];
}

export function statusOferta(oferta: Oferta, agora: Date = new Date()): StatusOferta {
  if (oferta.endedAt) return STATUS_OFERTA.ENCERRADA;
  if (oferta.quantity <= 0) return STATUS_OFERTA.ESGOTADA;
  const limite = new Date(oferta.createdAt);
  limite.setDate(limite.getDate() + oferta.validityDays);
  return agora > limite ? STATUS_OFERTA.ENCERRADA : STATUS_OFERTA.ATIVA;
}

export const ofertaAtiva = (oferta: Oferta, agora?: Date): boolean =>
  statusOferta(oferta, agora) === STATUS_OFERTA.ATIVA;

export function criarOferta(estado: Estado, dados: DadosOferta, agora: Date = new Date()): Resultado {
  const produto = estado.products.find((item) => item.id === dados.productId);
  if (!produto) return falha("Selecione um produto");
  const quantidade = num(dados.quantity);
  const preco = num(dados.promotionalPrice);
  if (quantidade <= 0) return falha("Informe uma quantidade válida");
  if (preco <= 0) return falha("Informe um preço promocional válido");
  if (preco >= produto.price) return falha("O preço promocional deve ser menor que o preço normal");
  if (!texto(dados.city)) return falha("Informe a cidade");
  if (num(dados.validityDays) <= 0) return falha("Informe a validade em dias");
  if (!dados.storeIds.length) return falha("Selecione ao menos um ponto de retirada");
  if (quantidade > produto.quantity) return falha("A quantidade da oferta supera o estoque do produto");

  const oferta: Oferta = {
    id: novoId("oferta"),
    producerId: produto.producerId,
    productId: produto.id,
    quantity: quantidade,
    promotionalPrice: preco,
    city: texto(dados.city),
    validityDays: num(dados.validityDays),
    storeIds: dados.storeIds,
    createdAt: agora.toISOString(),
  };
  return { ok: true, state: { ...estado, offers: [oferta, ...estado.offers] } };
}

export function encerrarOferta(estado: Estado, ofertaId: string, agora: Date = new Date()): Resultado {
  const oferta = estado.offers.find((item) => item.id === ofertaId);
  if (!oferta || !ofertaAtiva(oferta, agora)) return falha("Esta oferta não está mais ativa");
  return {
    ok: true,
    state: {
      ...estado,
      offers: substituir(estado.offers, ofertaId, (item) => ({ ...item, endedAt: agora.toISOString() })),
    },
  };
}
