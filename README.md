# 🥬 HortiLink — Hortaliças do Alto Tietê

## Sobre o projeto

O HortiLink é um projeto acadêmico de Engenharia de Software: um sistema web que conecta **produtores** de verduras e legumes do Alto Tietê a **compradores** (restaurantes, sacolões, mercados e famílias), com retirada em **lojas parceiras**. Além da venda, o produtor controla o próprio estoque: entradas, perdas, custos e indicadores.

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

> Hoje o front-end funciona com **dados fictícios no navegador**. A API e o banco de dados são a próxima etapa ([guia para o back-end](docs/BACKEND.md)).

## Estrutura do projeto

| Pasta | Conteúdo | Status |
|---|---|---|
| [`frontend/`](frontend/) | Interface e telas do sistema (React 19 + Vite), em camadas de Clean Architecture | ✅ funcional com dados fictícios |
| [`backend/`](backend/) | Lógica e funcionalidades no servidor (API) | ⏳ a fazer ([guia](docs/BACKEND.md)) |
| [`database/`](database/) | Modelagem e scripts do banco de dados | ⏳ a fazer |
| [`docs/`](docs/) | Documentação e diagramas: [arquitetura](docs/ARQUITETURA.md) e [contrato com o back-end](docs/BACKEND.md) | ✅ |
| [`tests/`](tests/) | Testes de funcionalidades integrados (front + back) | ⏳ (os 60 testes do front ficam em `frontend/src`) |
| `.github/workflows/` | CI: lint, testes e build do front a cada push/PR | ✅ |

## Como rodar o front-end

```bash
cd frontend
pnpm install
pnpm dev      # http://localhost:5173
pnpm check    # lint + testes + build
```

Contas de demonstração (senha `123456`): `produtor@hortilink.com`, `comprador@hortilink.com`, `loja@hortilink.com`. Mais detalhes em [`frontend/README.md`](frontend/README.md).

## Fluxo de trabalho

1. Criar uma branch por tarefa (`feat/...`, `fix/...`, `docs/...`).
2. Commits pequenos no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat(frontend): ...`).
3. Abrir Pull Request; o CI precisa ficar verde e alguém da equipe revisa antes do merge.

## Equipe

- Yara — Scrum Master e organização do projeto.
- Bruna — Desenvolvedora Front-end.
- Laura — Desenvolvedora Back-end.

## Metodologia

Desenvolvimento organizado em três Sprints, utilizando Scrum e Kanban.

## Informações acadêmicas

- Universidade: Universidade de Mogi das Cruzes (UMC).
- Curso: Engenharia de Software.
- Disciplina: Métodos Ágeis.
- Projeto: M2 — 2026.02.
