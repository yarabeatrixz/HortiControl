import { criarSeed } from "@adapters/mock/seed";

/** Estado inicial fictício (o mesmo do modo demonstração). */
export const estadoInicial = () => criarSeed();

/** Repositório em memória que cumpre a RepositorioPort (fake para testes). */
export function criarRepositorioEmMemoria(estado = criarSeed()) {
  let dados = structuredClone(estado);
  let sessao = null;
  return {
    carregar: async () => structuredClone(dados),
    salvar: async (novo) => {
      dados = structuredClone(novo);
    },
    carregarSessao: async () => sessao,
    salvarSessao: async (userId) => {
      sessao = userId;
    },
    espiar: () => dados,
  };
}
