# Banco de dados

Pasta reservada para a modelagem (diagrama ER) e os scripts (migrations e seed fictício).

O formato atual dos dados usado pelo front-end está em [`../docs/BACKEND.md`](../docs/BACKEND.md#entidades-formato-atual-dos-dados) (`users`, `products`, `offers`, `stores`, `orders`, `proposals`). Os dados fictícios de exemplo estão em [`../packages/dominio/src/exemplo.ts`](../packages/dominio/src/exemplo.ts). As migrations do Supabase (tabelas + RLS) ficam em `../supabase/` a partir da fase 2.
