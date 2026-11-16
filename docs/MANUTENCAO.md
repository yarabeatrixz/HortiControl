# Manual de manutenção — HortiLink

Para quem for mexer no projeto (incluindo a própria autora no futuro): como rodar, onde mudar cada coisa e o que conferir antes de entregar.

## 1. Ambiente

| Ferramenta | Versão |
|---|---|
| Node.js | 22 ou mais novo |
| pnpm | 10.34.3 (`npx --yes pnpm@10.34.3 …` se não estiver instalado) |
| Conta Supabase | só para o modo conectado |

```bash
pnpm install          # na raiz (instala todos os pacotes do monorepo)
pnpm check            # lint + tipos + testes + build de tudo
```

### Modos de execução

| Modo | Como | Para quê |
|---|---|---|
| Demo | `pnpm --filter hortilink-frontend dev:demo` | apresentar e testar telas; dados no navegador, contas `*@hortilink.com` / `123456` |
| Conectado | `frontend/.env` + `backend/.env` preenchidos, depois `pnpm dev` | dados reais no Supabase, login pelo Supabase Auth |
| API demo | `pnpm --filter @hortilink/backend dev` sem Supabase no `.env` | testar a API sozinha (`Bearer demo:<id>`), só em `127.0.0.1` |

Variáveis: veja `frontend/.env.example` e `backend/.env.example`. A chave **secreta** do Supabase vai **só** em `backend/.env`.

## 2. Onde mudar cada coisa (Clean Architecture)

| Quero… | Onde | Teste |
|---|---|---|
| mudar uma regra de negócio (preço, estoque, oferta…) | `packages/dominio/src/<agregado>.ts` | `<agregado>.test.ts` |
| criar uma ação nova no app | caso de uso em `frontend/src/1-application` **e** rota + caso de uso em `backend/src` | `useCases*.test.js`, `rotasApi.test.ts` |
| mudar uma tela | `frontend/src/3-frameworks/ui/screens/<perfil>/` | `App.test.jsx` |
| mudar o visual | `frontend/src/3-frameworks/ui/styles/NN-*.css` (a ordem dos arquivos importa) | revisão visual |
| criar coluna ou tabela | nova migration `supabase/migrations/000N_*.sql` + `packages/banco/src/mapeamento.ts` | `mapeamento.test.ts` |
| trocar de onde vêm os dados | **só** `frontend/src/composition.js` / `backend/src/composition.ts` | — |

Regra da dependência: `dominio` não importa nada de fora; `1-application` não conhece React, `fetch` nem Supabase; as telas não importam adapters.

## 3. Checklist antes de cada PR

- [ ] `pnpm check` verde na raiz.
- [ ] Regra nova tem teste no domínio; tela nova tem teste em `App.test.jsx`.
- [ ] Nenhum `.env`, chave ou senha real no `git diff`.
- [ ] Migration nova: `enable` + `force row level security`, `revoke all … from anon, authenticated` e só os `grant select` necessários; tabelas de dono com policy `auth.uid()`.
- [ ] Depois de aplicar a migration: rodar `supabase/auditoria/auditoria-completa.sql` e comparar com o esperado.
- [ ] Rota nova na API: esquema com `additionalProperties: false` e `maxLength`, perfil e dono conferidos no caso de uso, teste de 401/403.
- [ ] Commit no padrão Conventional Commits (`feat(frontend): …`) e PR com o que mudou, como testar e o checklist.

## 4. Rotinas

| Quando | O quê |
|---|---|
| Toda semana | Revisar os PRs do Dependabot: CI verde → merge; versão maior → ler o changelog antes |
| Todo mês | `pnpm audit`; rodar a auditoria do Supabase; conferir usuários e uso no painel |
| A cada entrega | Atualizar `docs/AUDITORIA-SEGURANCA.md` se algo de segurança mudou |
| Se uma chave vazar | Gerar uma chave nova no Supabase (API Keys), desativar a antiga, trocar no `.env`, conferir os logs do Auth |

## 5. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Configuração incompleta no .env do front" | faltou uma das 3 variáveis `VITE_*` | preencher as três ou nenhuma |
| "recebeu uma chave SECRETA" (front) | `sb_secret_…` em `frontend/.env` | trocar pela chave publicável e **gerar outra chave secreta** (a antiga foi exposta) |
| "Informe SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY juntas" | só uma das duas no `backend/.env` | preencher a chave secreta |
| "Modo demo só escuta neste computador" | `HOST=0.0.0.0` sem Supabase | usar `HOST=127.0.0.1` ou configurar o Supabase |
| Testes do front quebram só na sua máquina | — | os testes forçam o modo demo; rode `pnpm install` e confira a versão do Node |
| Tudo dá 401 no modo conectado | sessão expirada ou API em modo demo | entrar de novo; conferir o `backend/.env` |
| 429 "Muitas requisições" | limite de 120 por minuto | esperar 1 minuto |

## 6. Limites conhecidos (dívida técnica)

Escritas sem transação, pagamento simulado, perfil escolhido no cadastro, URL fixa (sem React Router), fotos em base64 (a fase 5 leva para o Supabase Storage). Detalhes em [OWASP-TOP10.md](OWASP-TOP10.md) (A06) e [TESTES-USABILIDADE.md](TESTES-USABILIDADE.md).
