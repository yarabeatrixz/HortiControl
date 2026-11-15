// Custos e investimentos do produtor que não são entrada de mercadoria.

import { TIPO_DESPESA, type TipoDespesa } from "./constantes";
import { num } from "./formatacao";
import type { Despesa, Estado, Numerico, Resultado } from "./tipos";
import { falha, novoId, texto } from "./util";

export interface DadosDespesa {
  producerId: string;
  type: string;
  description: string;
  amount: Numerico;
}

const ehTipoDespesa = (valor: string): valor is TipoDespesa =>
  (Object.values(TIPO_DESPESA) as string[]).includes(valor);

export function registrarDespesa(estado: Estado, dados: DadosDespesa, agora: Date = new Date()): Resultado {
  const valor = num(dados.amount);
  if (!texto(dados.description)) return falha("Descreva o custo ou investimento");
  if (!ehTipoDespesa(dados.type)) return falha("Escolha se é custo ou investimento");
  if (valor <= 0) return falha("Informe um valor maior que zero");
  const despesa: Despesa = {
    id: novoId("despesa"),
    producerId: dados.producerId,
    type: dados.type,
    description: texto(dados.description),
    amount: valor,
    createdAt: agora.toISOString(),
  };
  return { ok: true, state: { ...estado, expenses: [despesa, ...estado.expenses] } };
}

export function excluirDespesa(estado: Estado, despesaId: string): Resultado {
  if (!estado.expenses.some((item) => item.id === despesaId)) return falha("Registro não encontrado");
  return { ok: true, state: { ...estado, expenses: estado.expenses.filter((item) => item.id !== despesaId) } };
}
