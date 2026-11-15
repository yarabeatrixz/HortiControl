// Filtros de apresentação compartilhados pelas listas de pedidos.

const DIA_MS = 24 * 60 * 60 * 1000;

export const PERIODOS = ["Todos", "Hoje", "7 dias", "30 dias"];

/** `periodo` = um de PERIODOS ou "Personalizado" (usa `datas.from`/`datas.to`, AAAA-MM-DD). */
export function dentroDoPeriodo(dataIso, periodo, datas = {}, agora = Date.now()) {
  const dias = (agora - new Date(dataIso).getTime()) / DIA_MS;
  if (periodo === "Hoje") return dias < 1;
  if (periodo === "7 dias") return dias <= 7;
  if (periodo === "30 dias") return dias <= 30;
  if (periodo === "Personalizado") {
    const data = new Date(dataIso);
    return (
      (!datas.from || data >= new Date(datas.from)) &&
      (!datas.to || data <= new Date(`${datas.to}T23:59:59`))
    );
  }
  return true;
}

export const totalPedido = (pedido) => pedido.quantity * pedido.unitPrice;

export const buscaPorNumero = (pedido, termo) =>
  !termo.trim() || pedido.orderNumber.toLowerCase().includes(termo.trim().toLowerCase());
