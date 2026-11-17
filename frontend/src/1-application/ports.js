// Portas (contratos) que a camada de aplicação precisa do mundo externo.
// Em JS não há `interface`; os contratos ficam documentados em JSDoc.

/**
 * Porta de saída: onde o estado da aplicação é lido e gravado.
 * Usada só no MODO DEMO: `2-adapters/localStorageRepository.js`.
 *
 * @typedef {object} RepositorioPort
 * @property {() => Promise<Estado>} carregar
 * @property {(estado: Estado) => Promise<void>} salvar
 * @property {() => Promise<string|null>} carregarSessao   id do usuário logado
 * @property {(userId: string|null) => Promise<void>} salvarSessao
 */

/**
 * Portas do MODO CONECTADO (Supabase + API): o front lê do banco e escreve pela API.
 *
 * @typedef {object} LeituraPort   implementação: `2-adapters/supabaseLeitura.js`
 * @property {() => Promise<Estado>} carregar   o que o RLS deixa o usuário logado ver
 *
 * @typedef {object} AutenticacaoPort   implementação: `2-adapters/supabaseAutenticacao.js`
 * @property {(credenciais: {email: string, password: string, role: string}) => Promise<string>} entrar   devolve o id
 * @property {(dados: {role: string, name: string, city: string, email: string, password: string}) => Promise<string>} cadastrar
 * @property {() => Promise<void>} sair
 * @property {() => Promise<string|null>} usuarioAtual
 *
 * @typedef {object} EscritaPort   implementação: `2-adapters/apiEscrita.js` (rotas em docs/BACKEND.md)
 * Um método por rota; cada um lança `Error(mensagem)` se a API recusar.
 * @property {(dados: object) => Promise<void>} salvarProduto
 * @property {(id: string) => Promise<void>} excluirProduto
 * @property {(dados: object) => Promise<void>} criarOferta
 * @property {(id: string) => Promise<void>} encerrarOferta
 * @property {(storeIds: string[]) => Promise<void>} salvarPontosRetirada
 * @property {(dados: object) => Promise<{order: object}>} criarPedido
 * @property {(id: string, metodo: string) => Promise<void>} pagarPedido
 * @property {(id: string) => Promise<void>} confirmarEntregaNaLoja
 * @property {(dados: object) => Promise<void>} salvarLoja
 * @property {(dados: object) => Promise<void>} registrarEntrada
 * @property {(dados: object) => Promise<void>} registrarPerda
 * @property {(dados: object) => Promise<void>} registrarDespesa
 * @property {(id: string) => Promise<void>} excluirDespesa
 */

/**
 * @typedef {object} Estado
 * @property {object[]} users
 * @property {object[]} products
 * @property {object[]} offers
 * @property {object[]} stores
 * @property {object[]} orders
 * @property {object[]} proposals
 * @property {object[]} stockMovements
 * @property {object[]} expenses
 * @property {number} nextOrderNumber
 */

export {};
