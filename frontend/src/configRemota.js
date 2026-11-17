// Lê as variáveis VITE_* que ligam o MODO CONECTADO (Supabase + API).
// Nenhuma definida → modo demo (localStorage). Só algumas → erro claro, para não
// cair no modo demo sem querer.

const VARIAVEIS = {
  urlApi: "VITE_API_URL",
  urlSupabase: "VITE_SUPABASE_URL",
  chaveAnonSupabase: "VITE_SUPABASE_ANON_KEY",
};

/** Chave nova secreta (sb_secret_…) ou JWT antigo com papel service_role: nunca no navegador. */
function pareceChaveSecreta(chave) {
  if (chave.startsWith("sb_secret_")) return true;
  const [, carga] = chave.split(".");
  if (!carga) return false;
  try {
    return JSON.parse(atob(carga.replace(/-/g, "+").replace(/_/g, "/"))).role === "service_role";
  } catch {
    return false;
  }
}

/**
 * @param {Record<string, string|undefined>} env  normalmente `import.meta.env`
 * @returns {{ urlApi: string, urlSupabase: string, chaveAnonSupabase: string } | null}
 */
export function lerConfigRemota(env) {
  const valores = Object.fromEntries(
    Object.entries(VARIAVEIS).map(([chave, nome]) => [chave, env[nome]?.trim() ?? ""]),
  );
  const faltando = Object.entries(VARIAVEIS)
    .filter(([chave]) => !valores[chave])
    .map(([, nome]) => nome);

  if (faltando.length === Object.keys(VARIAVEIS).length) return null;
  if (faltando.length) {
    throw new Error(`Configuração incompleta no .env do front: falta ${faltando.join(", ")}`);
  }
  if (pareceChaveSecreta(valores.chaveAnonSupabase)) {
    throw new Error(
      "VITE_SUPABASE_ANON_KEY recebeu uma chave SECRETA. No front vai só a chave publicável (sb_publishable_…).",
    );
  }
  return valores;
}
