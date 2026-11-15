// Lê e valida as variáveis de ambiente uma única vez, na inicialização.
// Falta de configuração vira erro claro logo no início, não um bug no meio do uso.

export interface ConfigSupabase {
  url: string;
  /** Ignora o RLS: usada SÓ aqui no servidor, nunca no front-end. */
  chaveServiceRole: string;
}

export interface Ambiente {
  porta: number;
  host: string;
  /** Origem do front-end liberada no CORS (ex.: http://localhost:5173). */
  origemFrontend: string;
  /**
   * "supabase" quando as chaves do Supabase estão no .env; senão "demo"
   * (dados de exemplo em memória e login de demonstração, só para desenvolvimento).
   */
  modo: "demo" | "supabase";
  supabase: ConfigSupabase | null;
}

export function lerAmbiente(variaveis: Record<string, string | undefined> = process.env): Ambiente {
  const porta = Number(variaveis.PORT ?? 3333);
  if (!Number.isInteger(porta) || porta <= 0) {
    throw new Error(`PORT inválida: "${variaveis.PORT}". Use um número inteiro, ex.: 3333.`);
  }

  const url = variaveis.SUPABASE_URL?.trim();
  const chaveServiceRole = variaveis.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (Boolean(url) !== Boolean(chaveServiceRole)) {
    throw new Error("Informe SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY juntas (ou nenhuma, para o modo demo).");
  }
  const supabase = url && chaveServiceRole ? { url, chaveServiceRole } : null;

  if (!supabase && variaveis.NODE_ENV === "production") {
    throw new Error("Em produção a API exige o Supabase: o modo demo aceita login falso e é só para desenvolvimento.");
  }

  return {
    porta,
    host: variaveis.HOST ?? "0.0.0.0",
    origemFrontend: variaveis.FRONTEND_ORIGIN ?? "http://localhost:5173",
    modo: supabase ? "supabase" : "demo",
    supabase,
  };
}
