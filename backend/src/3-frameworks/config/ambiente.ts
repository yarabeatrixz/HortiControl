// Lê e valida as variáveis de ambiente uma única vez, na inicialização.
// Falta de configuração vira erro claro logo no início, não um bug no meio do uso.

export interface Ambiente {
  porta: number;
  host: string;
  /** Origem do front-end liberada no CORS (ex.: http://localhost:5173). */
  origemFrontend: string;
}

export function lerAmbiente(variaveis: Record<string, string | undefined> = process.env): Ambiente {
  const porta = Number(variaveis.PORT ?? 3333);
  if (!Number.isInteger(porta) || porta <= 0) {
    throw new Error(`PORT inválida: "${variaveis.PORT}". Use um número inteiro, ex.: 3333.`);
  }
  return {
    porta,
    host: variaveis.HOST ?? "0.0.0.0",
    origemFrontend: variaveis.FRONTEND_ORIGIN ?? "http://localhost:5173",
  };
}
