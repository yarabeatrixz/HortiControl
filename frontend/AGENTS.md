# Instruções para agentes de IA (front-end HortiLink)

React 19 + Vite 8, JavaScript (JSX) com JSDoc, CSS próprio em `src/3-frameworks/ui/styles.css` (sem Tailwind). Gerenciador: **pnpm**, num monorepo (instale pela raiz).

## Arquitetura (obrigatória)

Clean Architecture em camadas numeradas; detalhes em `../docs/ARQUITETURA.md`.

- `@hortilink/dominio` (`../packages/dominio`): regras puras em TypeScript, compartilhadas com o back-end. Regra nova entra **lá**, com teste.
- `src/1-application/`: casos de uso assíncronos + portas. Importa só `@hortilink/dominio`.
- `src/2-adapters/`: implementações das portas. Modo demo: `localStorageRepository` + `mock/seed.js`. Modo conectado: `supabaseLeitura` (lê com a anon key, RLS), `supabaseAutenticacao` (Supabase Auth) e `apiEscrita` (`fetch` + Bearer nas rotas da API).
- `src/3-frameworks/ui/`: React. Telas usam só `useApp()` e `@hortilink/dominio`; nunca `@adapters` nem `localStorage`.
- `src/composition.js`: único lugar que escolhe implementações. Com `VITE_API_URL` + `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (ver `.env.example`) usa o modo conectado; sem elas, o modo demo.

## Convenções

- Componentes em PascalCase, **um por arquivo**; hooks `useAlgo.js`; o resto em camelCase.
- Domínio em português (`criarOferta`, `STATUS_PEDIDO`); props/componentes existentes em inglês: manter o que já existe.
- Regra devolve `{ ok, state }` / `{ ok: false, error }`; mensagens de erro em português, claras para o usuário.
- Ações na tela: `try { await acao() } catch (err) { setError(err.message) }`.
- `components/base/` não pode conhecer o domínio.
- Não abstrair com menos de 2 usos reais (YAGNI). Sem dados reais no seed/testes.

## Antes de entregar

```bash
pnpm check   # na raiz: lint + tipos + testes + build de todos os pacotes
```

Regra nova = teste novo no `*.test.ts` do agregado em `packages/dominio`; fluxo novo de tela = teste em `App.test.jsx`.
