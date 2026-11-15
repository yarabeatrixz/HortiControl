// Ponto de entrada da API: lê o ambiente, monta o servidor e abre a porta.

import { lerAmbiente } from "./3-frameworks/config/ambiente";
import { criarServidor } from "./3-frameworks/http/servidor";

const ambiente = lerAmbiente();
const app = criarServidor(ambiente, { log: true });

try {
  await app.listen({ port: ambiente.porta, host: ambiente.host });
} catch (erro) {
  app.log.error(erro);
  process.exit(1);
}
