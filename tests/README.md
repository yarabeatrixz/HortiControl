# Testes integrados

Testes de ponta a ponta entre front-end e back-end (quando a API existir).

Os testes do front-end ficam junto do código (padrão do Vitest) e rodam com `cd frontend && pnpm test`:
- `frontend/src/0-domain/regras.test.js`: regras de negócio
- `frontend/src/1-application/useCases.test.js`: casos de uso
- `frontend/src/3-frameworks/ui/App.test.jsx`: fluxos de tela
