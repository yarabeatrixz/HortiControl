export const brl = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

/** Converte "1.234,5" / "1234.5" / 12 em número; inválido vira 0. */
export const num = (valor) => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "").trim();
  const normalizado = texto.includes(",") ? texto.replace(/\./g, "").replace(",", ".") : texto;
  const resultado = Number(normalizado);
  return Number.isFinite(resultado) ? resultado : 0;
};

export const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR");

export const dataHora = (iso) => new Date(iso).toLocaleString("pt-BR");

export const km = (distancia) => `${String(distancia).replace(".", ",")} km`;

export const inicial = (nome) => nome?.charAt(0) ?? "";
