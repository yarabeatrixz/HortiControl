// Monta o servidor Fastify e registra as rotas. Não abre porta: quem chama
// decide (main.ts em produção; testes usam `app.inject` sem rede).

import Fastify, { type FastifyInstance } from "fastify";
import { registrarRotasSaude } from "../../2-adapters/http/rotasSaude";
import type { Ambiente } from "../config/ambiente";

export function criarServidor(ambiente: Pick<Ambiente, "origemFrontend">, opcoes = { log: false }): FastifyInstance {
  const app = Fastify({ logger: opcoes.log });

  app.addHook("onSend", async (_requisicao, resposta) => {
    resposta.header("Access-Control-Allow-Origin", ambiente.origemFrontend);
    resposta.header("Vary", "Origin");
  });

  registrarRotasSaude(app);
  return app;
}
