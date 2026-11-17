// Utilitários internos do domínio (não fazem parte da API pública).

import type { Falha } from "./tipos";

// `crypto.randomUUID` existe no navegador e no Node 19+; declarado aqui para o
// domínio não depender dos tipos do DOM nem do Node.
declare const crypto: { randomUUID(): string };

export const falha = (error: string): Falha => ({ ok: false, error });

/** Id novo no formato UUID, o mesmo tipo usado nas tabelas do banco. */
export const novoId = (): string => crypto.randomUUID();

export const substituir = <T extends { id: string }>(
  lista: T[],
  id: string,
  alterar: (item: T) => T,
): T[] => lista.map((item) => (item.id === id ? alterar(item) : item));

export const texto = (valor: unknown): string => String(valor ?? "").trim();
