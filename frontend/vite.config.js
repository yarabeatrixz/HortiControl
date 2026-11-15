import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const camada = (pasta) => fileURLToPath(new URL(`./src/${pasta}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
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
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
