# HortiLink · Front-end

Aplicação web (React 19 + Vite 8) do marketplace de hortaliças do Alto Tietê. Perfis: **Produtor**, **Comprador** e **Loja parceira** (ponto de retirada).

> Modo demonstração: sem back-end. Os dados ficam no `localStorage` do navegador e começam com dados fictícios.

## Como rodar

Pré-requisitos: Node 22+ e pnpm 10 (`npm i -g pnpm`).

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `pnpm dev` | servidor de desenvolvimento |
| `pnpm test` | testes (regras, casos de uso e fluxos de tela) |
| `pnpm test:watch` | testes em modo observação |
| `pnpm lint` | análise estática (oxlint) |
| `pnpm format` | formata o código (oxfmt) |
| `pnpm build` | gera o site estático em `dist/` |
| `pnpm check` | lint + testes + build (rodar antes de abrir PR) |

### Contas de demonstração (senha `123456`)
- `produtor@hortilink.com` · `comprador@hortilink.com` · `loja@hortilink.com`
- Checkout (simulado): cartão `4111 1111 1111 1111` aprova; `4000 0000 0000 0002` recusa.
- Para voltar aos dados iniciais, limpe o armazenamento do site no navegador.

## Arquitetura (resumo)

```
src/
  0-domain/        regras puras + constantes      (não importa nada de fora)
  1-application/   casos de uso + portas          (importa só o domínio)
  2-adapters/      localStorage fake + seed       (implementa as portas)
  3-frameworks/ui/ React: state, layout, components, screens
  composition.js   escolhe o adapter e monta os casos de uso
```

Detalhes, diagrama e "como acrescentar": [`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md).
Integração com o back-end: [`../docs/BACKEND.md`](../docs/BACKEND.md).

## O que já funciona

| Perfil | Funcionalidades |
|---|---|
| Todos | login e cadastro por perfil, com mensagens de erro claras |
| Produtor | catálogo (CRUD com foto), ofertas promocionais (criar/encerrar), pontos de retirada, minhas vendas (filtros e totais), marcar pedido como entregue na loja |
| Comprador | ofertas ativas por categoria, catálogos e perfil dos produtores, compra com escolha do ponto de retirada, checkout simulado (Pix/cartão), minhas compras, acompanhar pedido |
| Loja parceira | cadastro do ponto de coleta, pedidos para retirada |

## Testes

- `src/0-domain/regras.test.js`: regras de negócio (validações, estoque, status).
- `src/1-application/useCases.test.js`: casos de uso com repositório em memória.
- `src/3-frameworks/ui/App.test.jsx`: fluxos completos na tela (login, compra + pagamento, cartão recusado, publicar oferta, cadastrar produto, entrega na loja, pedidos da loja).
