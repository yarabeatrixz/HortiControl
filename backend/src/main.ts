// Ponto de entrada da API: lê o ambiente, monta as dependências e abre a porta.

import { montarDependencias } from "./composition";
import { lerAmbiente } from "./3-frameworks/config/ambiente";
import { criarServidor } from "./3-frameworks/http/servidor";

const ambiente = lerAmbiente();
const app = criarServidor(ambiente, montarDependencias(ambiente), { log: true });

if (ambiente.modo === "demo") {
  app.log.warn('Modo DEMO: dados em memória e login "Bearer demo:<id>". Configure o Supabase no .env para dados reais.');
}

try {
  await app.listen({ port: ambiente.porta, host: ambiente.host });
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
