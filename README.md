# 🥬 HortiControl — Controle de Estoque

## Sobre o projeto

O HortiControl é um projeto acadêmico de Engenharia de Software que propõe o desenvolvimento de um sistema para auxiliar pequenos mercados e mercearias no controle de estoque de verduras e legumes.

## Objetivo

Facilitar o gerenciamento de produtos, entradas, vendas, perdas e quantidades disponíveis, contribuindo para uma gestão mais organizada e redução de desperdícios.

## Funcionalidades

- Cadastro de produtos.
- Registro de entrada de mercadorias.
- Consulta de estoque.
- Registro de vendas.
- Controle de perdas.
- Registro de divergências.
- Controle de custos e investimentos.
- Alertas de estoque baixo.
- Relatórios e indicadores.

> ⚠️ **Alinhar com a equipe:** o front-end entregue em `frontend/` é o **HortiLink**, um marketplace que conecta produtores, compradores e lojas parceiras (pontos de retirada) do Alto Tietê. O escopo acima descreve controle de estoque. Definir qual nome e escopo valem para o projeto.

## Estrutura do projeto

| Pasta | Conteúdo | Status |
|---|---|---|
| [`frontend/`](frontend/) | Interface web (React 19 + Vite), em camadas de Clean Architecture | ✅ funcional com dados fictícios |
| [`backend/`](backend/) | API e regras no servidor | ⏳ a fazer ([guia](docs/BACKEND.md)) |
| [`database/`](database/) | Modelagem e scripts do banco de dados | ⏳ a fazer |
| [`docs/`](docs/) | [Arquitetura](docs/ARQUITETURA.md) e [contrato com o back-end](docs/BACKEND.md) | ✅ |
| [`tests/`](tests/) | Testes integrados front + back | ⏳ (os testes do front ficam em `frontend/src`) |
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
