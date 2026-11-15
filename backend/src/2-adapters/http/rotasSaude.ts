// Rota de saúde: confirma que a API está no ar (usada por deploy e monitoramento).

import type { FastifyInstance } from "fastify";

export interface RespostaSaude {
  status: "ok";
  servico: "hortilink-api";
  horario: string;
}

export function registrarRotasSaude(app: FastifyInstance, agora: () => Date = () => new Date()): void {
  app.get("/saude", async (): Promise<RespostaSaude> => ({
    status: "ok",
    servico: "hortilink-api",
    horario: agora().toISOString(),
  }));
}
