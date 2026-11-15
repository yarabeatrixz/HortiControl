// Esquemas JSON do corpo das requisições (validados pelo Fastify antes da rota).
// Validam só FORMATO; regras de negócio ficam no domínio.

const texto = { type: "string", minLength: 1 } as const;
const textoOpcional = { type: "string" } as const;
/** Números podem chegar como texto de formulário ("2,50"); o domínio converte. */
const numero = { type: ["number", "string"] } as const;
const listaDeIds = { type: "array", items: texto } as const;

const objeto = (propriedades: Record<string, object>, obrigatorios: string[]) =>
  ({
    type: "object",
    additionalProperties: false,
    properties: propriedades,
    required: obrigatorios,
  }) as const;

export const esquemaProduto = objeto(
  {
    id: textoOpcional,
    name: textoOpcional,
    category: texto,
    unit: texto,
    price: numero,
    quantity: numero,
    minQuantity: numero,
    photo: textoOpcional,
  },
  ["name", "category", "unit", "price", "quantity"],
);

export const esquemaOferta = objeto(
  {
    productId: texto,
    quantity: numero,
    promotionalPrice: numero,
    city: textoOpcional,
    validityDays: numero,
    storeIds: listaDeIds,
  },
  ["productId", "quantity", "promotionalPrice", "city", "validityDays", "storeIds"],
);

export const esquemaPontosRetirada = objeto({ storeIds: listaDeIds }, ["storeIds"]);

export const esquemaPedido = objeto(
  {
    type: { type: "string", enum: ["offer", "product"] },
    sourceId: texto,
    productId: texto,
    quantity: numero,
    storeId: textoOpcional,
  },
  ["type", "sourceId", "productId", "quantity", "storeId"],
);

export const esquemaPagamento = objeto(
  { method: { type: "string", enum: ["Pix", "Cartão de crédito"] } },
  ["method"],
);

export const esquemaLoja = objeto(
  { name: textoOpcional, address: textoOpcional, city: textoOpcional, hours: textoOpcional },
  ["name", "address", "city", "hours"],
);

export const esquemaEntrada = objeto(
  { productId: texto, quantity: numero, unitCost: numero, note: textoOpcional },
  ["productId", "quantity", "unitCost"],
);

export const esquemaPerda = objeto(
  { productId: texto, quantity: numero, reason: textoOpcional, note: textoOpcional },
  ["productId", "quantity", "reason"],
);

export const esquemaDespesa = objeto(
  { type: textoOpcional, description: textoOpcional, amount: numero },
  ["type", "description", "amount"],
);
