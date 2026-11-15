// Monta o servidor Fastify: CORS, tradução de erros e rotas. Não abre porta:
// quem chama decide (main.ts em produção; testes usam `app.inject` sem rede).

import cors from "@fastify/cors";
import Fastify, { type FastifyError, type FastifyInstance } from "fastify";
import type { CasosDeUso } from "../../1-application/casosDeUso";
import { ErroDeAplicacao, type MotivoErro } from "../../1-application/erros";
import type { VerificadorDeTokenPort } from "../../1-application/portas";
import { registrarRotasApi } from "../../2-adapters/http/rotasApi";
import { registrarRotasSaude } from "../../2-adapters/http/rotasSaude";
import type { Ambiente } from "../config/ambiente";

const STATUS_POR_MOTIVO: Record<MotivoErro, number> = {
  "nao-autenticado": 401,
  proibido: 403,
  "nao-encontrado": 404,
  regra: 422,
};

export interface DependenciasServidor {
  casos: CasosDeUso;
  verificador: VerificadorDeTokenPort;
}

export function criarServidor(
  ambiente: Pick<Ambiente, "origemFrontend">,
  dependencias?: DependenciasServidor,
  opcoes = { log: false },
): FastifyInstance {
  // removeAdditional: false → campo desconhecido no corpo é recusado (400), não apagado em silêncio.
  const app = Fastify({ logger: opcoes.log, ajv: { customOptions: { removeAdditional: false } } });

  app.register(cors, {
    origin: ambiente.origemFrontend,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Erros viram { error: "mensagem" } com o status certo; o front mostra a mensagem.
  app.setErrorHandler((erro: FastifyError | ErroDeAplicacao, _requisicao, resposta) => {
    if (erro instanceof ErroDeAplicacao) {
      return resposta.code(STATUS_POR_MOTIVO[erro.motivo]).send({ error: erro.message });
    }
    if (erro.validation) {
      return resposta.code(400).send({ error: "Dados inválidos: confira os campos enviados" });
    }
    app.log.error(erro);
    return resposta.code(500).send({ error: "Erro inesperado no servidor. Tente de novo." });
  });

  registrarRotasSaude(app);
  if (dependencias) registrarRotasApi(app, dependencias.casos, dependencias.verificador);
  return app;
}
