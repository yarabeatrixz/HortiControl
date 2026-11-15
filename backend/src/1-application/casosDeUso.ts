// Casos de uso da API: quem pode fazer o quê (perfil e dono) + as regras do
// domínio. O domínio valida o NEGÓCIO; aqui se valida a AUTORIZAÇÃO.
// Toda escrita do sistema passa por aqui (o cliente só lê do banco, via RLS).

import {
  confirmarEntregaNaLoja,
  criarOferta,
  criarPedidoDireto,
  type DadosCompra,
  type DadosDespesa,
  type DadosEntrada,
  type DadosLoja,
  type DadosOferta,
  type DadosPerda,
  type DadosProduto,
  encerrarOferta,
  type Estado,
  excluirDespesa,
  excluirProduto,
  type MetodoPagamento,
  pagarPedido,
  type Perfil,
  registrarDespesa,
  registrarEntrada,
  registrarPerda,
  type Resultado,
  salvarLoja,
  salvarPontosRetirada,
  salvarProduto,
  type Usuario,
} from "@hortilink/dominio";
import { naoAutenticado, naoEncontrado, proibido, violouRegra } from "./erros";
import type { Relogio, RepositorioPort } from "./portas";

type Sucesso<E extends object> = Extract<Resultado<E>, { ok: true }>;

/** Dados de produto vindos do cliente: o dono é sempre quem está logado. */
export type EntradaProduto = Omit<DadosProduto, "producerId">;
/** Dados de compra vindos do cliente: o comprador é sempre quem está logado. */
export type EntradaCompra = Omit<DadosCompra, "buyerId">;
/** Dados de despesa vindos do cliente: o produtor é sempre quem está logado. */
export type EntradaDespesa = Omit<DadosDespesa, "producerId">;

export interface Dependencias {
  repositorio: RepositorioPort;
  relogio?: Relogio;
}

export function criarCasosDeUso({ repositorio, relogio = () => new Date() }: Dependencias) {
  /**
   * Carrega o estado, identifica o usuário, roda `regra` e grava o resultado.
   * `regra` pode lançar erros de autorização antes de chamar o domínio.
   */
  async function executar<E extends object>(
    userId: string,
    regra: (estado: Estado, usuario: Usuario, agora: Date) => Resultado<E>,
  ): Promise<Sucesso<E>> {
    const antes = await repositorio.carregar();
    const usuario = antes.users.find((item) => item.id === userId);
    if (!usuario) throw naoAutenticado();
    const resultado = regra(antes, usuario, relogio());
    if (!resultado.ok) throw violouRegra(resultado.error);
    await repositorio.salvar(antes, resultado.state);
    return resultado as Sucesso<E>;
  }

  const exigirPerfil = (usuario: Usuario, perfil: Perfil) => {
    if (usuario.role !== perfil) throw proibido(`Ação disponível só para o perfil ${perfil}`);
  };

  /** Busca por id e confere se pertence ao usuário (campo de dono informado). */
  function doUsuario<T extends { id: string }>(
    lista: T[],
    id: string,
    dono: (item: T) => string,
    usuario: Usuario,
    nome: string,
  ): T {
    const item = lista.find((atual) => atual.id === id);
    if (!item) throw naoEncontrado(`${nome} não encontrado`);
    if (dono(item) !== usuario.id) throw proibido(`Este ${nome.toLowerCase()} não é seu`);
    return item;
  }

  /** Toda loja citada precisa existir (evita oferta ligada a ponto inexistente). */
  const exigirLojas = (estado: Estado, storeIds: string[]) => {
    const lojaInexistente = storeIds.find((id) => !estado.stores.some((loja) => loja.id === id));
    if (lojaInexistente) throw naoEncontrado("Ponto de retirada não encontrado");
  };

  return {
    // ------------------------------------------------------------ Produtor
    salvarProduto: (userId: string, dados: EntradaProduto) =>
      executar(userId, (estado, usuario) => {
        exigirPerfil(usuario, "produtor");
        if (dados.id) doUsuario(estado.products, dados.id, (p) => p.producerId, usuario, "Produto");
        return salvarProduto(estado, { ...dados, producerId: usuario.id });
      }),

    excluirProduto: (userId: string, produtoId: string) =>
      executar(userId, (estado, usuario) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.products, produtoId, (p) => p.producerId, usuario, "Produto");
        return excluirProduto(estado, produtoId);
      }),

    criarOferta: (userId: string, dados: DadosOferta) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.products, dados.productId, (p) => p.producerId, usuario, "Produto");
        exigirLojas(estado, dados.storeIds);
        return criarOferta(estado, dados, agora);
      }),

    encerrarOferta: (userId: string, ofertaId: string) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.offers, ofertaId, (o) => o.producerId, usuario, "Oferta");
        return encerrarOferta(estado, ofertaId, agora);
      }),

    salvarPontosRetirada: (userId: string, storeIds: string[]) =>
      executar(userId, (estado, usuario) => {
        exigirPerfil(usuario, "produtor");
        exigirLojas(estado, storeIds);
        return salvarPontosRetirada(estado, usuario.id, storeIds);
      }),

    confirmarEntregaNaLoja: (userId: string, pedidoId: string) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.orders, pedidoId, (o) => o.producerId, usuario, "Pedido");
        return confirmarEntregaNaLoja(estado, pedidoId, agora);
      }),

    registrarEntrada: (userId: string, dados: DadosEntrada) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.products, dados.productId, (p) => p.producerId, usuario, "Produto");
        return registrarEntrada(estado, dados, agora);
      }),

    registrarPerda: (userId: string, dados: DadosPerda) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.products, dados.productId, (p) => p.producerId, usuario, "Produto");
        return registrarPerda(estado, dados, agora);
      }),

    registrarDespesa: (userId: string, dados: EntradaDespesa) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "produtor");
        return registrarDespesa(estado, { ...dados, producerId: usuario.id }, agora);
      }),

    excluirDespesa: (userId: string, despesaId: string) =>
      executar(userId, (estado, usuario) => {
        exigirPerfil(usuario, "produtor");
        doUsuario(estado.expenses, despesaId, (d) => d.producerId, usuario, "Registro");
        return excluirDespesa(estado, despesaId);
      }),

    // ------------------------------------------------------------ Comprador
    criarPedido: (userId: string, dados: EntradaCompra) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "comprador");
        return criarPedidoDireto(estado, { ...dados, buyerId: usuario.id }, agora);
      }),

    /** Pagamento SIMULADO (modo demonstração); provedor real fica para a fase 5. */
    pagarPedido: (userId: string, pedidoId: string, metodo: MetodoPagamento) =>
      executar(userId, (estado, usuario, agora) => {
        exigirPerfil(usuario, "comprador");
        doUsuario(estado.orders, pedidoId, (o) => o.buyerId, usuario, "Pedido");
        return pagarPedido(estado, pedidoId, metodo, agora);
      }),

    // ------------------------------------------------------------ Loja parceira
    salvarLoja: (userId: string, dados: DadosLoja) =>
      executar(userId, (estado, usuario) => {
        exigirPerfil(usuario, "loja");
        return salvarLoja(estado, usuario.id, dados);
      }),
  };
}

export type CasosDeUso = ReturnType<typeof criarCasosDeUso>;
