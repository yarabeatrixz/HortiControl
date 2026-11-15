// Autenticação das rotas: lê "Authorization: Bearer <token>" e anexa o id do
// usuário à requisição. Rota sem token válido responde 401.

import type { FastifyInstance, FastifyRequest } from "fastify";
import { naoAutenticado } from "../../1-application/erros";
import type { VerificadorDeTokenPort } from "../../1-application/portas";

declare module "fastify" {
  interface FastifyRequest {
    /** Id do usuário logado (preenchido pelo hook de autenticação). */
    userId: string;
  }
}

const tokenDe = (requisicao: FastifyRequest): string | null => {
  const [tipo, token] = (requisicao.headers.authorization ?? "").split(" ");
  return tipo === "Bearer" && token ? token : null;
};

/** Exige login em todas as rotas registradas dentro deste escopo do Fastify. */
export function exigirLogin(app: FastifyInstance, verificador: VerificadorDeTokenPort): void {
  app.decorateRequest("userId", "");
  // onRequest roda ANTES da validação do corpo: quem não está logado recebe 401, sem pistas do formato.
  app.addHook("onRequest", async (requisicao) => {
    const token = tokenDe(requisicao);
    const userId = token ? await verificador.verificar(token) : null;
    if (!userId) throw naoAutenticado();
    requisicao.userId = userId;
  });
}
