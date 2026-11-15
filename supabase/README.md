# Supabase (banco e login)

| Arquivo | Conteúdo |
|---|---|
| `migrations/0001_schema.sql` | tabelas (espelham `packages/dominio/src/tipos.ts`), enums, índices, trigger que cria o perfil no cadastro, **RLS em todas as tabelas** |
| `seed.sql` | dados fictícios gerados de `criarExemplo()` (senha de todos: `123456`). Não editar à mão: `pnpm --filter @hortilink/backend gerar:seed` |

## Modelo de segurança

- **RLS ligado e forçado** nas 11 tabelas.
- `anon` (não logado) não acessa nada.
- `authenticated` (logado) **só lê**, e só o que lhe diz respeito: catálogo, ofertas e lojas para todos; pedidos e propostas só para os envolvidos; estoque e despesas só para o próprio produtor. Em `profiles`, só `id, role, name, city` (o e-mail não é exposto).
- **Toda escrita passa pela API** (`backend/`), que roda as regras de `@hortilink/dominio` e grava com a `service_role`. Assim ninguém altera preço, estoque ou status pelo navegador.
- A `service_role` fica só em `backend/.env`. Nunca no front-end, no git ou em mensagens.

## Como aplicar (quando o projeto existir em supabase.com)

1. Crie o projeto (região São Paulo) e copie **Project URL** e **anon key** (Project Settings → API).
2. SQL Editor → cole e rode `migrations/0001_schema.sql`.
3. (Opcional, para demonstração) rode `seed.sql`.
4. Em `backend/.env`: `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

## Conferir depois de aplicar

Rode as queries das skills do Obsidian `Skills/supabase/audit-rls.md` e `audit-policies.md` no SQL Editor. Esperado:
- nenhuma tabela de `public` com `rls_enabled = false`;
- nenhuma policy de escrita para `anon`/`authenticated`;
- grants de `authenticated` só `SELECT`.

> Atenção a migrations futuras: tabela nova em `public` recebe os privilégios padrão do Supabase. Toda migration nova deve repetir o padrão: `enable` + `force row level security`, `revoke all ... from anon, authenticated` e só depois os `grant select` necessários.
