# 🥬 HortiLink — Hortaliças do Alto Tietê

## Sobre o projeto

O HortiLink é um projeto acadêmico de Engenharia de Software: um sistema web que conecta **produtores** de verduras e legumes do Alto Tietê a **compradores** (restaurantes, sacolões, mercados e famílias), com retirada em **lojas parceiras**. Além da venda, o produtor controla o próprio estoque: entradas, perdas, custos e indicadores.

Projeto individual: front-end, back-end e banco de dados por Bruna (desenvolvedora full-stack).

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

> Hoje o front-end funciona com **dados fictícios no navegador**. A API (TypeScript + Supabase) está em construção ([guia do back-end](docs/BACKEND.md)).

## Estrutura (monorepo pnpm)

| Pasta | Conteúdo | Status |
|---|---|---|
| [`packages/dominio/`](packages/dominio/) | `@hortilink/dominio`: regras de negócio puras em TypeScript estrito, usadas pelo front e pelo back | ✅ 42 testes |
| [`packages/banco/`](packages/banco/) | `@hortilink/banco`: tradução pura entre as tabelas do Supabase e o estado do domínio (front e back) | ✅ 8 testes |
| [`frontend/`](frontend/) | Interface web (React 19 + Vite), em camadas de Clean Architecture | ✅ modo demo (dados fictícios) · 🟡 modo conectado (Supabase + API) pronto, falta o projeto Supabase |
| [`backend/`](backend/) | API em TypeScript (Fastify), em camadas de Clean Architecture | ✅ rotas de escrita com login (fase 3) |
| `supabase/` | Migrations SQL (tabelas + RLS) e seed fictício | 🟡 pronto, falta aplicar no Supabase |
| [`docs/`](docs/) | [Arquitetura](docs/ARQUITETURA.md), [contrato do back-end](docs/BACKEND.md) e tutorial em vídeo/áudio | ✅ |
| `.github/workflows/` | CI: lint, tipos, testes e build de todos os pacotes a cada push/PR | ✅ |

## Como rodar

Pré-requisitos: Node 22+ e pnpm 10 (`npm i -g pnpm`).

```bash
pnpm install
pnpm dev      # front-end em http://localhost:5173 e API em http://localhost:3333
pnpm check    # lint + tipos + testes + build de todos os pacotes
```

Contas de demonstração (senha `123456`): `produtor@hortilink.com`, `comprador@hortilink.com`, `loja@hortilink.com`. Mais detalhes em [`frontend/README.md`](frontend/README.md) e [`backend/README.md`](backend/README.md).

## Fluxo de trabalho

1. Uma branch por tarefa (`feat/...`, `fix/...`, `docs/...`).
2. Commits pequenos no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat(backend): ...`).
3. Pull Request com descrição e checklist; merge só com o CI verde e depois de revisão (checklist próprio + revisão de código automatizada).

## Equipe

- Bruna — Desenvolvedora Full-Stack

## Metodologia

Desenvolvimento organizado em três Sprints, utilizando Scrum e Kanban.

## Informações acadêmicas

- Universidade: Universidade de Mogi das Cruzes (UMC).
- Curso: Engenharia de Software.
- Disciplina: Métodos Ágeis.
- Projeto: M2 — 2026.02.
