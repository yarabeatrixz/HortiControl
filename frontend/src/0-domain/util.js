// Utilitários internos do domínio (não exportados no index público).

export const falha = (error) => ({ ok: false, error });

export const novoId = (prefixo) => `${prefixo}-${crypto.randomUUID()}`;

export const substituir = (lista, id, alterar) =>
  lista.map((item) => (item.id === id ? alterar(item) : item));
