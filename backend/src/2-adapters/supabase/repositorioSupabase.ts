// RepositorioPort sobre o Supabase (Postgres via PostgREST), com a service_role.
// Este arquivo só faz I/O: a tradução e o cálculo de mudanças estão em mapeamento.ts.
//
// Limite conhecido (MVP): as operações de um salvamento não são uma transação.
// Próximo passo: uma função SQL `aplicar_mudancas(jsonb)` para gravar tudo de uma vez.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RepositorioPort } from "../../1-application/portas";
import type { ConfigSupabase } from "../../3-frameworks/config/ambiente";
import { calcularOperacoes, chavesDaTabela, type Linhas, type Operacao, paraEstado, type Tabela } from "./mapeamento";

const TABELAS: Tabela[] = [
  "profiles",
  "stores",
  "producer_pickup_stores",
  "products",
  "offers",
  "offer_stores",
  "proposals",
  "orders",
  "order_events",
  "stock_movements",
  "expenses",
];

export function clienteServidor(config: ConfigSupabase): SupabaseClient {
  return createClient(config.url, config.chaveServiceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function criarRepositorioSupabase(config: ConfigSupabase, cliente = clienteServidor(config)): RepositorioPort {
  async function lerTabela(tabela: Tabela) {
    const { data, error } = await cliente.from(tabela).select("*");
    if (error) throw new Error(`Falha ao ler ${tabela}: ${error.message}`);
    return data ?? [];
  }

  async function executar(operacao: Operacao): Promise<void> {
    if (operacao.tipo === "gravar") {
      const chaves = chavesDaTabela(operacao.tabela as Exclude<Tabela, "profiles">);
      const { error } = await cliente.from(operacao.tabela).upsert(operacao.linhas, { onConflict: chaves.join(",") });
      if (error) throw new Error(`Falha ao gravar ${operacao.tabela}: ${error.message}`);
      return;
    }
    for (const chave of operacao.chaves) {
      const { error } = await cliente.from(operacao.tabela).delete().match(chave);
      if (error) throw new Error(`Falha ao apagar de ${operacao.tabela}: ${error.message}`);
    }
  }

  return {
    async carregar() {
      const lidas = await Promise.all(TABELAS.map(async (tabela) => [tabela, await lerTabela(tabela)] as const));
      return paraEstado(Object.fromEntries(lidas) as unknown as Linhas);
    },
    async salvar(antes, depois) {
      for (const operacao of calcularOperacoes(antes, depois)) await executar(operacao);
    },
  };
}
