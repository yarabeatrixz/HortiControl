// Erros da aplicação com um motivo. A camada HTTP converte o motivo em status:
// nao-autenticado → 401 · proibido → 403 · nao-encontrado → 404 · regra → 422.

export type MotivoErro = "nao-autenticado" | "proibido" | "nao-encontrado" | "regra";

export class ErroDeAplicacao extends Error {
  constructor(
    readonly motivo: MotivoErro,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroDeAplicacao";
  }
}

export const naoAutenticado = () =>
  new ErroDeAplicacao("nao-autenticado", "Faça login para continuar");
export const proibido = (mensagem = "Você não tem permissão para esta ação") =>
  new ErroDeAplicacao("proibido", mensagem);
export const naoEncontrado = (mensagem: string) => new ErroDeAplicacao("nao-encontrado", mensagem);
export const violouRegra = (mensagem: string) => new ErroDeAplicacao("regra", mensagem);
