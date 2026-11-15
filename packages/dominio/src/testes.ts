// Auxiliares só para testes: deixam as asserções curtas e com tipos corretos.

import type { DadosCompra } from "./compra";
import { ORIGEM } from "./constantes";
import type { Resultado } from "./tipos";

/** Compra válida de 5 kg da oferta de alface dos dados de exemplo. */
export const compraDaOferta: DadosCompra = {
  type: ORIGEM.OFERTA,
  sourceId: "oferta-1",
  productId: "produto-1",
  buyerId: "user-comprador",
  quantity: 5,
  storeId: "loja-1",
};

type Sucesso<R> = Extract<R, { ok: true }>;

/** Garante que a regra deu certo e devolve o resultado já tipado como sucesso. */
export function sucesso<R extends Resultado<object>>(resultado: R): Sucesso<R> {
  if (!resultado.ok) throw new Error(`Esperava sucesso, veio a falha: "${resultado.error}"`);
  return resultado as Sucesso<R>;
}

/** Garante que a regra falhou e devolve a mensagem de erro. */
export function falhaDe(resultado: Resultado<object>): string {
  if (resultado.ok) throw new Error("Esperava falha, mas a regra deu certo");
  return resultado.error;
}

/** Busca por id e falha o teste se não achar. */
export function porId<T extends { id: string }>(lista: T[], id: string): T {
  const item = lista.find((atual) => atual.id === id);
  if (!item) throw new Error(`Item "${id}" não encontrado`);
  return item;
}
