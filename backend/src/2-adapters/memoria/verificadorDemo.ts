// Verificador de token do MODO DEMO: aceita "demo:<id-do-usuario>".
// Serve para rodar e testar a API sem Supabase. Nunca é usado em produção
// (a composition root recusa o modo demo com NODE_ENV=production).

import type { VerificadorDeTokenPort } from "../../1-application/portas";

const PREFIXO = "demo:";

export const verificadorDemo: VerificadorDeTokenPort = {
  async verificar(token) {
    return token.startsWith(PREFIXO) && token.length > PREFIXO.length ? token.slice(PREFIXO.length) : null;
  },
};
