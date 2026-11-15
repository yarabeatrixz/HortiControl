// Portas (contratos) que a camada de aplicação precisa do mundo externo.
// Em JS não há `interface`; os contratos ficam documentados em JSDoc.

/**
 * Porta de saída: onde o estado da aplicação é lido e gravado.
 * Implementações: `2-adapters/localStorageRepository.js` (fake atual).
 * Futuro: `2-adapters/apiRepository.js` chamando o back-end.
 *
 * @typedef {object} RepositorioPort
 * @property {() => Promise<Estado>} carregar
 * @property {(estado: Estado) => Promise<void>} salvar
 * @property {() => Promise<string|null>} carregarSessao   id do usuário logado
 * @property {(userId: string|null) => Promise<void>} salvarSessao
 */

/**
 * @typedef {object} Estado
 * @property {object[]} users
 * @property {object[]} products
 * @property {object[]} offers
 * @property {object[]} stores
 * @property {object[]} orders
 * @property {object[]} proposals
 * @property {number} nextOrderNumber
 */

export {};
