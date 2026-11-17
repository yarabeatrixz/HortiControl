# Testes integrados

Os testes unitários ficam junto do código (padrão do Vitest) e rodam todos com `pnpm test` na raiz:
- `backend/src/**/*.test.ts`: API (servidor, rotas, configuração)
- `packages/dominio/src/*.test.ts`: regras de negócio (um arquivo por agregado)
- `packages/banco/src/*.test.ts`: mapeamento Supabase ↔ domínio
- `frontend/src/**/*.test.js(x)`: casos de uso, adapters e fluxos de tela

## Ponta a ponta com o Supabase real (`e2e-supabase.mjs`)

Usa o banco de verdade e a API local. **Não roda no CI** (precisa das chaves).

1. `backend/.env` e `frontend/.env` preenchidos (ver os `.env.example`).
2. API rodando no modo conectado: `pnpm dev` (ou a tarefa "3. Rodar conectado" do VS Code).
3. Na raiz: `pnpm test:e2e`.

O que faz: cria 3 contas de teste (`teste-<papel>-<aleatório>@hortilink.test`, senha aleatória, e-mail já confirmado), segue o fluxo loja → produtor → comprador (ponto de retirada, produto, oferta, pedido, pagamento, entrega) e confere a segurança (sem login 401, papel errado 403, escrita direta no Supabase bloqueada). No fim apaga os pedidos e as contas, mesmo se algo falhar. Nenhuma chave é impressa.
