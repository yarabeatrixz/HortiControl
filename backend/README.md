# HortiLink · Back-end

API do HortiLink em **TypeScript estrito** (Fastify), em Clean Architecture. As regras de negócio vêm do pacote compartilhado `@hortilink/dominio`: o servidor roda **as mesmas regras** que o front-end, sendo a fonte da verdade. Banco e login: **Supabase** (a partir da fase 2).

## Camadas

```
src/
├── 1-application/      (fase 3) casos de uso por agregado + portas (interfaces TS)
├── 2-adapters/http/    rotas Fastify finas; recebem, validam e delegam ao caso de uso
├── 3-frameworks/
│   ├── config/         ambiente.ts: variáveis de ambiente lidas e validadas na inicialização
│   └── http/           servidor.ts: monta o Fastify e registra as rotas (sem abrir porta)
└── main.ts             lê o ambiente, monta o servidor e abre a porta
```

Dependências só para dentro: `3-frameworks → 2-adapters → 1-application → @hortilink/dominio`. Detalhes em [`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md); contrato das rotas em [`../docs/BACKEND.md`](../docs/BACKEND.md).

## Como rodar

```bash
pnpm install                              # na raiz do monorepo
cp backend/.env.example backend/.env      # e preencha (o .env não vai para o git)
pnpm --filter @hortilink/backend dev      # http://localhost:3333/saude
```

| Script | O que faz |
|---|---|
| `pnpm dev` | API com recarga automática (tsx watch) |
| `pnpm start` | API sem recarga |
| `pnpm lint` | análise estática (oxlint) |
| `pnpm typecheck` | checagem de tipos (`tsc --noEmit`, modo estrito) |
| `pnpm test` | testes (Vitest; rotas testadas com `app.inject`, sem rede) |
| `pnpm check` | lint + tipos + testes |

## Variáveis de ambiente

Veja [`.env.example`](.env.example): `PORT`, `HOST`, `FRONTEND_ORIGIN` e, a partir da fase 2, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

> A `SUPABASE_SERVICE_ROLE_KEY` ignora o RLS: fica **só** no `.env` do back-end. Nunca no front-end, no git ou em mensagens.

## Rotas

| Método | Rota | Status |
|---|---|---|
| `GET` | `/saude` | ✅ confirma que a API está no ar |
| demais | ver `docs/BACKEND.md` | ⏳ fase 3 |
