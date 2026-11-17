// Repositório em memória: para testes e para rodar a API sem Supabase (modo demo).
// Os dados somem quando o processo para.

import type { Estado } from "@hortilink/dominio";
import type { RepositorioPort } from "../../1-application/portas";

export function criarRepositorioEmMemoria(inicial: Estado): RepositorioPort & { espiar(): Estado } {
  let estado = structuredClone(inicial);
  return {
    async carregar() {
      return structuredClone(estado);
    },
    async salvar(_antes, depois) {
      estado = structuredClone(depois);
    },
    espiar: () => estado,
  };
}
