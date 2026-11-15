// Content-Security-Policy do build: o navegador só carrega scripts do próprio site
// e só conversa com a API e o Supabase configurados. Defesa extra contra XSS
// (a sessão do Supabase fica no localStorage). Usada pelo vite.config.js.

/** Origem (protocolo + host + porta) de uma URL, ou null se a URL não for válida. */
const origemDe = (url) => {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
};

/**
 * @param {{ VITE_API_URL?: string, VITE_SUPABASE_URL?: string }} env
 * @returns {string} valor do cabeçalho/meta Content-Security-Policy
 */
export function montarPoliticaDeConteudo(env) {
  const conexoes = ["'self'", origemDe(env.VITE_API_URL), origemDe(env.VITE_SUPABASE_URL)].filter(
    Boolean,
  );
  const diretivas = {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    // Fotos dos produtos: base64 (data:) ou https; imagens de fundo do Unsplash.
    "img-src": ["'self'", "data:", "https:"],
    "connect-src": conexoes,
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
  return Object.entries(diretivas)
    .map(([nome, valores]) => `${nome} ${valores.join(" ")}`)
    .join("; ");
}
