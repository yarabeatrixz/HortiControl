// Esquemas JSON do corpo das requisições (validados pelo Fastify antes da rota).
// Validam só FORMATO; regras de negócio ficam no domínio.

const texto = { type: "string", minLength: 1, maxLength: 120 } as const;
const textoOpcional = { type: "string", maxLength: 120 } as const;
const textoLongo = { type: "string", maxLength: 500 } as const;
/** Foto: imagem PNG/JPEG/WebP em base64 (até ~1 MB) ou endereço https; vazio = sem foto. */
const foto = {
  type: "string",
  maxLength: 1_400_000,
  pattern: "^$|^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$|^https://[^\\s<>\"]+$",
} as const;
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
    photo: foto,
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
  { name: textoOpcional, address: { type: "string", maxLength: 200 }, city: textoOpcional, hours: textoOpcional },
  ["name", "address", "city", "hours"],
);

export const esquemaEntrada = objeto(
  { productId: texto, quantity: numero, unitCost: numero, note: textoLongo },
  ["productId", "quantity", "unitCost"],
);

export const esquemaPerda = objeto(
  { productId: texto, quantity: numero, reason: textoOpcional, note: textoLongo },
  ["productId", "quantity", "reason"],
);

export const esquemaDespesa = objeto(
  { type: textoOpcional, description: textoLongo, amount: numero },
  ["type", "description", "amount"],
);
