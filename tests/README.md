# Testes integrados

Testes de ponta a ponta entre front-end e back-end (quando a API existir).

Os testes unitários ficam junto do código (padrão do Vitest) e rodam todos com `pnpm test` na raiz:
- `backend/src/**/*.test.ts`: API (servidor, rotas, configuração)
- `packages/dominio/src/*.test.ts`: regras de negócio (um arquivo por agregado)
- `frontend/src/1-application/useCases.test.js`: casos de uso
- `frontend/src/3-frameworks/ui/App.test.jsx`: fluxos de tela
