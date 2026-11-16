import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { montarPoliticaDeConteudo } from "./src/politicaDeConteudo.js";

const camada = (pasta) => fileURLToPath(new URL(`./src/${pasta}`, import.meta.url));

/** Só no build: o servidor de desenvolvimento do Vite precisa de script inline. */
function politicaDeConteudo(env) {
  return {
    name: "hortilink-politica-de-conteudo",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: montarPoliticaDeConteudo(env) },
        injectTo: "head-prepend",
      },
      { tag: "meta", attrs: { name: "referrer", content: "strict-origin-when-cross-origin" } },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), politicaDeConteudo(loadEnv(mode, process.cwd(), "VITE_"))],
  resolve: {
    // Um alias por camada (Clean Architecture). Dependências só apontam para dentro:
    // 3-frameworks → 2-adapters → 1-application → @hortilink/dominio (packages/dominio).
    alias: {
      "@application": camada("1-application"),
      "@adapters": camada("2-adapters"),
      "@ui": camada("3-frameworks/ui"),
    },
  },
  server: { host: true },
  build: { sourcemap: false },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
    // Testes sempre no modo demo, mesmo com um frontend/.env local (sem rede, sem Supabase).
    env: { VITE_API_URL: "", VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" },
  },
}));
