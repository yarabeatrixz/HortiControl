# Instruções para agentes de IA (front-end HortiLink)

React 19 + Vite 8, JavaScript (JSX) com JSDoc, CSS próprio em `src/3-frameworks/ui/styles.css` (sem Tailwind). Gerenciador: **pnpm**.

## Arquitetura (obrigatória)

Clean Architecture em camadas numeradas; detalhes em `../docs/ARQUITETURA.md`.

- `src/0-domain/`: regras puras. Não importar React, `localStorage`, `fetch` nem outras camadas.
- `src/1-application/`: casos de uso assíncronos + portas. Importa só `@domain`.
- `src/2-adapters/`: implementações das portas (hoje `localStorageRepository` + `mock/seed.js`).
- `src/3-frameworks/ui/`: React. Telas usam só `useApp()` e `@domain`; nunca `@adapters` nem `localStorage`.
- `src/composition.js`: único lugar que escolhe implementações.

## Convenções

- Componentes em PascalCase, **um por arquivo**; hooks `useAlgo.js`; o resto em camelCase.
- Domínio em português (`criarOferta`, `STATUS_PEDIDO`); props/componentes existentes em inglês: manter o que já existe.
- Regra devolve `{ ok, state }` / `{ ok: false, error }`; mensagens de erro em português, claras para o usuário.
- Ações na tela: `try { await acao() } catch (err) { setError(err.message) }`.
- `components/base/` não pode conhecer o domínio.
- Não abstrair com menos de 2 usos reais (YAGNI). Sem dados reais no seed/testes.

## Antes de entregar

```bash
pnpm check   # lint + testes + build
```

Regra nova = teste novo em `regras.test.js`; fluxo novo de tela = teste em `App.test.jsx`.
