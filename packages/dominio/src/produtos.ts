// Catálogo do produtor: cadastrar, editar e excluir produtos.

import type { Categoria, Unidade } from "./constantes";
import { num } from "./formatacao";
import type { Estado, Numerico, Produto, Resultado } from "./tipos";
import { falha, novoId, substituir, texto } from "./util";

export interface DadosProduto {
  /** Ausente ao cadastrar; presente ao editar. */
  id?: string | undefined;
  producerId: string;
  name: string;
  category: Categoria;
  unit: Unidade;
  price: Numerico;
  quantity: Numerico;
  minQuantity?: Numerico;
  photo?: string;
}

export function salvarProduto(estado: Estado, dados: DadosProduto): Resultado {
  const price = num(dados.price);
  const quantity = num(dados.quantity);
  const minQuantity = num(dados.minQuantity);
  if (!texto(dados.name) || price <= 0 || quantity <= 0) {
    return falha("Preencha nome, preço e quantidade com valores válidos");
  }
  if (minQuantity < 0) return falha("O estoque mínimo não pode ser negativo");

  const existente = dados.id ? estado.products.find((item) => item.id === dados.id) : undefined;
  const produto: Produto = {
    ...dados,
    id: existente?.id ?? novoId("produto"),
    name: texto(dados.name),
    price,
    quantity,
    minQuantity,
  };
  return {
    ok: true,
    state: {
      ...estado,
      products: existente
        ? substituir(estado.products, produto.id, () => produto)
        : [produto, ...estado.products],
    },
  };
}

/** Excluir um produto remove também as ofertas dele. */
export function excluirProduto(estado: Estado, produtoId: string): Resultado {
  return {
    ok: true,
    state: {
      ...estado,
      products: estado.products.filter((item) => item.id !== produtoId),
      offers: estado.offers.filter((item) => item.productId !== produtoId),
    },
  };
}
