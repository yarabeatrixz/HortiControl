// Loja parceira: cadastro do ponto de coleta (um por usuário com perfil loja).

import type { Estado, Loja, Resultado } from "./tipos";
import { falha, novoId, substituir, texto } from "./util";

export interface DadosLoja {
  name: string;
  address: string;
  city: string;
  hours: string;
}

const CAMPOS_OBRIGATORIOS = ["name", "address", "city", "hours"] as const;

export function salvarLoja(estado: Estado, userId: string, dados: DadosLoja): Resultado {
  if (CAMPOS_OBRIGATORIOS.some((campo) => !texto(dados[campo])))
    return falha("Preencha todos os dados do ponto de coleta");

  const existente = estado.stores.find((item) => item.userId === userId);
  const loja: Loja = {
    ...existente,
    id: existente?.id ?? novoId("loja"),
    userId,
    name: texto(dados.name),
    address: texto(dados.address),
    city: texto(dados.city),
    hours: texto(dados.hours),
  };
  return {
    ok: true,
    state: {
      ...estado,
      stores: existente ? substituir(estado.stores, loja.id, () => loja) : [loja, ...estado.stores],
    },
  };
}
