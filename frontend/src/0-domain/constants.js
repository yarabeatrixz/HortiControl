// Listas fixas e enums do domínio. Os valores (strings) são gravados nos dados,
// então o back-end deve usar exatamente os mesmos.

export const PERFIS = [
  { id: "produtor", nome: "Produtor" },
  { id: "comprador", nome: "Comprador" },
  { id: "loja", nome: "Loja parceira" },
];

export const nomePerfil = (perfilId) => PERFIS.find((perfil) => perfil.id === perfilId)?.nome;

export const CATEGORIAS = [
  "Frutas",
  "Verduras",
  "Legumes",
  "Raízes",
  "Grãos",
  "Temperos",
  "Laticínios",
];

export const UNIDADES = [
  "kg",
  "g",
  "t",
  "L",
  "mL",
  "un",
  "mç",
  "dz",
  "cx",
  "sc",
  "saco",
  "bdj",
  "cumb",
  "eng",
  "pct",
  "fd",
  "pt",
  "pç",
  "tb",
  "lt",
  "bag",
];

export const STATUS_OFERTA = {
  ATIVA: "Ativa",
  ESGOTADA: "Esgotada",
  ENCERRADA: "Encerrada",
};

export const STATUS_PROPOSTA = {
  AGUARDANDO: "Aguardando fornecedor",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
};

export const STATUS_PEDIDO = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pago",
  ENTREGUE_NA_LOJA: "Entregue na loja",
  PRONTO_PARA_RETIRADA: "Pronto para retirada",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

/** Rótulos gravados em `pedido.timeline[].label`. */
export const EVENTO_PEDIDO = {
  REALIZADO: "Pedido realizado",
  PROPOSTA_ACEITA: "Proposta aceita",
  PAGAMENTO_APROVADO: "Pagamento aprovado",
  ENTREGUE_NA_LOJA: "Produto entregue na loja",
  PRONTO_PARA_RETIRADA: "Pronto para retirada",
  RETIRADO: "Retirado",
};

export const METODO_PAGAMENTO = {
  PIX: "Pix",
  CARTAO: "Cartão de crédito",
};

/** Tipo da origem de uma compra/proposta. */
export const ORIGEM = {
  OFERTA: "offer",
  CATALOGO: "product",
};

export const SENHA_MINIMA = 6;

// ------------------------------------------------- Estoque e financeiro

export const TIPO_MOVIMENTO = {
  ENTRADA: "Entrada",
  PERDA: "Perda",
};

export const MOTIVOS_PERDA = [
  "Estragou / passou do ponto",
  "Avaria no transporte",
  "Pragas ou clima",
  "Sobra não vendida",
  "Outro",
];

export const STATUS_ESTOQUE = {
  OK: "Estoque ok",
  BAIXO: "Estoque baixo",
  ZERADO: "Sem estoque",
};

/** Custo = gasto do dia a dia (adubo, frete, embalagem); investimento = bem durável. */
export const TIPO_DESPESA = {
  CUSTO: "Custo",
  INVESTIMENTO: "Investimento",
};
