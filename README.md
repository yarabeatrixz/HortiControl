# 🥬 HortiLink — Hortaliças do Alto Tietê

## Sobre o projeto

O HortiLink é um projeto acadêmico de Engenharia de Software: um sistema web que conecta **produtores** de verduras e legumes do Alto Tietê a **compradores** (restaurantes, sacolões, mercados e famílias), com retirada em **lojas parceiras**. Além da venda, o produtor controla o próprio estoque: entradas, perdas, custos e indicadores.

Projeto individual: front-end, back-end e banco de dados por **Bruna Cristiny Franco** (desenvolvedora full-stack). Software proprietário: veja a [licença](#licença).

## Objetivo

Facilitar o gerenciamento de produtos, entradas, vendas, perdas e quantidades disponíveis, aproximando quem produz de quem compra. O resultado esperado é uma gestão mais organizada, preço justo e menos desperdício.

## Perfis de acesso

| Perfil | O que faz |
|---|---|
| **Produtor** | Cadastra produtos, controla o estoque (entradas, perdas, alertas), publica ofertas, acompanha vendas, custos e relatórios |
| **Comprador** | Encontra ofertas e catálogos dos produtores, compra, paga (checkout simulado) e acompanha a retirada |
| **Loja parceira** | Cadastra o ponto de coleta e vê os pedidos que serão retirados ali |

## Funcionalidades

| Funcionalidade | Onde no app (perfil Produtor) | Status |
|---|---|---|
| Cadastro de produtos | Catálogo → Cadastrar produto (foto, categoria, unidade, preço, quantidade, estoque mínimo) | ✅ |
| Registro de entrada de mercadorias | Estoque → Registrar entrada (quantidade, custo por unidade, observação) | ✅ |
| Consulta de estoque | Estoque → tabela com quantidade, mínimo e situação de cada produto | ✅ |
| Registro de vendas | Pedidos dos compradores geram vendas numeradas (`#HL-000001`); Minhas vendas tem filtros e totais | ✅ |
| Controle de perdas | Estoque → Registrar perda (quantidade e motivo) | ✅ |
| Registro de entradas | Estoque → Movimentações (histórico de entradas e perdas, com filtro) | ✅ |
| Controle de custos e investimentos | Custos → custos do dia a dia e investimentos, com totais | ✅ |
| Alertas de estoque baixo | Aviso no Catálogo e no Estoque quando o produto chega ao estoque mínimo | ✅ |
| Relatórios e indicadores | Relatórios → receita, gastos, resultado, perdas e tabela por produto, por período | ✅ |
| Ofertas promocionais (queima de estoque) | Ofertas → criar e encerrar | ✅ |
| Compra com retirada em loja parceira | Perfil Comprador → Ofertas / Produtores → Comprar → Checkout | ✅ |

> O front-end tem dois modos: **demo** (dados fictícios no navegador, sem configuração) e **conectado** (lê do Supabase e grava pela API em TypeScript), ligado pelas variáveis de `frontend/.env.example` ([guia do back-end](docs/BACKEND.md)).

## Estrutura (monorepo pnpm)

| Pasta | Conteúdo | Status |
|---|---|---|
| [`packages/dominio/`](packages/dominio/) | `@hortilink/dominio`: regras de negócio puras em TypeScript estrito, usadas pelo front e pelo back | ✅ 42 testes |
| [`packages/banco/`](packages/banco/) | `@hortilink/banco`: tradução pura entre as tabelas do Supabase e o estado do domínio (front e back) | ✅ 8 testes |
| [`frontend/`](frontend/) | Interface web (React 19 + Vite), em camadas de Clean Architecture | ✅ modo demo (dados fictícios) · 🟡 modo conectado (Supabase + API) pronto, falta o projeto Supabase |
| [`backend/`](backend/) | API em TypeScript (Fastify), em camadas de Clean Architecture | ✅ rotas de escrita com login (fase 3) |
| `supabase/` | Migrations SQL (tabelas + RLS) e seed fictício | 🟡 pronto, falta aplicar no Supabase |
| [`docs/`](docs/) | [Arquitetura](docs/ARQUITETURA.md), [contrato do back-end](docs/BACKEND.md) e tutorial em vídeo/áudio | ✅ |
| `.github/` | CI (lint, tipos, testes e build a cada push/PR) e Dependabot (dependências e Actions) | ✅ |

## Como rodar

Pré-requisitos: Node 22+ e pnpm 10 (`npm i -g pnpm`).

```bash
pnpm install
pnpm dev      # front-end em http://localhost:5173 e API em http://localhost:3333
pnpm check    # lint + tipos + testes + build de todos os pacotes
```

Para o modo conectado, copie `frontend/.env.example` → `frontend/.env` e `backend/.env.example` → `backend/.env` e preencha (os `.env` não vão para o git; a `service_role` fica **só** no `backend/.env`).

Contas de demonstração (senha `123456`, **só para teste**: não aplique o `supabase/seed.sql` num projeto em produção): `produtor@hortilink.com`, `comprador@hortilink.com`, `loja@hortilink.com`. Mais detalhes em [`frontend/README.md`](frontend/README.md) e [`backend/README.md`](backend/README.md).

## Segurança

- [Auditoria de segurança](docs/AUDITORIA-SEGURANCA.md) do código (autenticação, autorização, injeções, API) e do banco Supabase (RLS e políticas).
- Escritas só pela API, que confere login, perfil e dono; o cliente só **lê** do banco, protegido por RLS em todas as tabelas.
- Segredos fora do git (`.env*` no `.gitignore`); o front só recebe variáveis públicas `VITE_*`.
- **Dependabot** ([`.github/dependabot.yml`](.github/dependabot.yml)) abre PRs semanais de atualização das dependências npm/pnpm e das GitHub Actions. Os alertas e as atualizações de segurança são ligados em *Settings → Code security* do repositório.

## Fluxo de trabalho

1. Uma branch por tarefa (`feat/...`, `fix/...`, `docs/...`).
2. Commits pequenos no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat(backend): ...`).
3. Pull Request com descrição e checklist; merge só com o CI verde e depois de revisão (checklist próprio + revisão de código automatizada).

## Equipe

- Bruna Cristiny Franco — Desenvolvedora Full-Stack

## Metodologia

Desenvolvimento organizado em três Sprints, utilizando Scrum e Kanban.

## Informações acadêmicas

- Universidade: Universidade de Mogi das Cruzes (UMC).
- Curso: Engenharia de Software.
- Disciplina: Métodos Ágeis.
- Projeto: M2 — 2026.02.

## Licença

Copyright (c) 2026 **Bruna Cristiny Franco**. Todos os direitos reservados.
Software proprietário: é proibido copiar, modificar, distribuir ou usar comercialmente sem autorização por escrito da autora. Texto completo em [`LICENSE`](LICENSE).
