// Casos de uso: orquestram regras do domínio + repositório (porta).
// Não conhecem React, localStorage nem fetch. Todos são assíncronos para que
// trocar o adapter fake por uma API não mude nada nas telas.

import * as dominio from "@hortilink/dominio";

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
      const user = dominio.autenticar(estado.users, credenciais);
      if (!user) throw new Error("E-mail ou senha incorretos");
      await repositorio.salvarSessao(user.id);
      return { user, state: estado };
    },
    async cadastrar(dados) {
      const resultado = await executar(dominio.cadastrarUsuario, dados);
      await repositorio.salvarSessao(resultado.user.id);
      return resultado;
    },
    sair: () => repositorio.salvarSessao(null),

    salvarProduto: (dados) => executar(dominio.salvarProduto, dados),
    excluirProduto: (id) => executar(dominio.excluirProduto, id),
    criarOferta: (dados) => executar(dominio.criarOferta, dados),
    encerrarOferta: (id) => executar(dominio.encerrarOferta, id),
    salvarPontosRetirada: (userId, storeIds) =>
      executar(dominio.salvarPontosRetirada, userId, storeIds),

    criarPedido: (dados) => executar(dominio.criarPedidoDireto, dados),
    pagarPedido: (id, metodo) => executar(dominio.pagarPedido, id, metodo),
    confirmarEntregaNaLoja: (id) => executar(dominio.confirmarEntregaNaLoja, id),

    criarProposta: (dados) => executar(dominio.criarProposta, dados),
    aceitarProposta: (id) => executar(dominio.aceitarProposta, id),
    recusarProposta: (id) => executar(dominio.recusarProposta, id),

    salvarLoja: (userId, dados) => executar(dominio.salvarLoja, userId, dados),

    registrarEntrada: (dados) => executar(dominio.registrarEntrada, dados),
    registrarPerda: (dados) => executar(dominio.registrarPerda, dados),
    registrarDespesa: (dados) => executar(dominio.registrarDespesa, dados),
    excluirDespesa: (id) => executar(dominio.excluirDespesa, id),
  };
}
