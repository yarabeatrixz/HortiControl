// Adapter da porta `LeituraPort`: lê as tabelas com a anon key e o login do usuário
// (o RLS da migration decide o que ele vê) e traduz para o Estado do domínio com o
// mesmo mapeamento da API (@hortilink/banco).

import { paraEstado, TABELAS } from "@hortilink/banco";

/** users: o cliente só pode ler as colunas públicas (sem e-mail). */
const COLUNAS = { users: "id, role, name, city" };

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} cliente
 * @returns {import("@application/ports").LeituraPort}
 */
export function criarSupabaseLeitura(cliente) {
  async function lerTabela(tabela) {
    const { data, error } = await cliente.from(tabela).select(COLUNAS[tabela] ?? "*");
    if (error) throw new Error("Não foi possível carregar os dados. Recarregue a página.");
    return [tabela, data ?? []];
  }

  return {
    async carregar() {
      const lidas = await Promise.all(TABELAS.map(lerTabela));
      return paraEstado(Object.fromEntries(lidas));
    },
  };
}
