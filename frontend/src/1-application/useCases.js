// Casos de uso: orquestram regras do domínio + repositório (porta).
// Não conhecem React, localStorage nem fetch. Todos são assíncronos para que
// trocar o adapter fake por uma API não mude nada nas telas.

import * as regras from "@domain/regras";

/** @param {import("./ports").RepositorioPort} repositorio */
export function criarCasosDeUso(repositorio) {
  /** Carrega o estado, aplica a regra e grava. Lança `Error(mensagem)` se a regra falhar. */
  const executar = async (regra, ...args) => {
    const estado = await repositorio.carregar();
    const resultado = regra(estado, ...args);
    if (!resultado.ok) throw new Error(resultado.error);
    await repositorio.salvar(resultado.state);
    return resultado;
  };

  return {
    carregarEstado: () => repositorio.carregar(),
    carregarSessao: () => repositorio.carregarSessao(),

    async entrar(credenciais) {
      const estado = await repositorio.carregar();
      const user = regras.autenticar(estado.users, credenciais);
      if (!user) throw new Error("E-mail ou senha incorretos");
      await repositorio.salvarSessao(user.id);
      return { user, state: estado };
    },
    async cadastrar(dados) {
      const resultado = await executar(regras.cadastrarUsuario, dados);
      await repositorio.salvarSessao(resultado.user.id);
      return resultado;
    },
    sair: () => repositorio.salvarSessao(null),

    salvarProduto: (dados) => executar(regras.salvarProduto, dados),
    excluirProduto: (id) => executar(regras.excluirProduto, id),
    criarOferta: (dados) => executar(regras.criarOferta, dados),
    encerrarOferta: (id) => executar(regras.encerrarOferta, id),
    salvarPontosRetirada: (userId, storeIds) =>
      executar(regras.salvarPontosRetirada, userId, storeIds),

    criarPedido: (dados) => executar(regras.criarPedidoDireto, dados),
    pagarPedido: (id, metodo) => executar(regras.pagarPedido, id, metodo),
    confirmarEntregaNaLoja: (id) => executar(regras.confirmarEntregaNaLoja, id),

    criarProposta: (dados) => executar(regras.criarProposta, dados),
    aceitarProposta: (id) => executar(regras.aceitarProposta, id),
    recusarProposta: (id) => executar(regras.recusarProposta, id),

    salvarLoja: (userId, dados) => executar(regras.salvarLoja, userId, dados),
  };
}
