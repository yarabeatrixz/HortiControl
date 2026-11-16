# Testes de usabilidade — 15/11/2026

## Método
- **Avaliação heurística** (10 heurísticas de Nielsen) + **testes de tarefa** guiados por roteiro, feitos pelo Claude (IA) no navegador, no **modo demo** (`pnpm --filter hortilink-frontend dev:demo`).
- Telas: desktop (1024 px) e celular (375 × 812).
- Checagens de acessibilidade: idioma da página, rótulos de campos, texto alternativo de imagens, foco visível e uso só pelo teclado.
- **Limite:** não substitui teste com pessoas reais (produtores, compradores e lojistas do Alto Tietê). Recomendação: repetir as tarefas com 5 usuários e aplicar o questionário SUS (ver o fim do documento).

## Tarefas

| # | Perfil | Tarefa | Tela | Resultado | Ações |
|---|---|---|---|---|---|
| T1 | Produtor | Entrar na plataforma | desktop | ✅ concluída; o alerta de estoque baixo aparece logo no catálogo | 4 |
| T2 | Produtor | Cadastrar produto (primeiro vazio, depois válido) | desktop | ✅ concluída; o produto aparece no topo do catálogo | 7 |
| T3 | Comprador | Comprar oferta, escolher a retirada e pagar com Pix | celular | ✅ concluída; tela "Pagamento aprovado" com número, valor e local | 7 |
| T4 | Loja | Entrar **só com o teclado** e ver os pedidos para retirada | desktop | ✅ concluída; o pedido pago da T3 aparece na lista | 8 teclas |
| T5 | Todos | Build de produção com CSP | desktop | ✅ sem erros no console; fontes e imagens carregam | — |

## Pontos fortes
- **Visibilidade do status:** alerta de estoque baixo, selo "Ambiente de teste — nenhum valor é cobrado" no checkout, status do pedido ("Pago", "A chegar").
- **Correspondência com o mundo real:** vocabulário do produtor (catálogo, oferta, ponto de retirada), preço em R$ com a unidade.
- **Prevenção de erros:** quantidade com botões − / +, limite de quantidade disponível, só pontos de retirada válidos.
- **Responsivo:** no celular, menu inferior com 4 abas e botões grandes; formulários em uma coluna.
- **Acessibilidade básica:** `lang="pt-BR"`, todos os campos com rótulo, todas as imagens com `alt`, foco visível (`:focus-visible`), uso completo pelo teclado.

## Problemas encontrados

| # | Heurística (Nielsen) | Problema | Gravidade (0–4) | Sugestão |
|---|---|---|---|---|
| U1 | 9. Ajudar a reconhecer e corrigir erros | Login com campos vazios mostra "E-mail ou senha incorretos" em vez de pedir para preencher | 2 | Mensagem "Preencha e-mail e senha" |
| U2 | 1. Visibilidade do status | Depois de salvar um produto não aparece confirmação ("Produto salvo") | 2 | Aviso curto de sucesso |
| U3 | 2. Correspondência com o mundo real | Produto sem foto recebe uma foto genérica (cenoura), que pode parecer outro produto | 2 | Imagem neutra com o ícone da categoria |
| U4 | 2. Correspondência com o mundo real | Siglas de unidade pouco claras na lista (`cumb`, `eng`, `bdj`, `fd`, `pt`) | 1 | Mostrar o nome completo ("bandeja", "fardo"…) |
| U5 | 3. Controle e liberdade | A URL não muda entre telas: voltar do navegador, recarregar ou compartilhar link perde a tela atual | 2 | React Router (decisão registrada como futura) |
| U6 | 5. Prevenção de erros | O pedido é criado (e o estoque reservado) ao clicar em "Ir para pagamento"; checkout abandonado deixa pedido "Aguardando pagamento" | 2 | Cancelar automaticamente após o prazo do Pix |
| U7 | 7. Flexibilidade e eficiência | A loja vê os pedidos, mas não tem ação para marcar "Retirado" (US08 incompleta) | 3 | Botão "Confirmar retirada" |
| U8 | Acessibilidade (WAI-ARIA) | Os cartões de perfil (`role="radio"`) recebem Tab um por um e não respondem às setas | 1 | Padrão *radiogroup*: Tab entra no grupo, setas trocam |

Escala de gravidade de Nielsen: 0 = não é problema · 1 = cosmético · 2 = pequeno · 3 = grande · 4 = catástrofe.

## Próximos passos
1. Corrigir U7 (grave para o fluxo da loja) e U1/U2/U3 (rápidos).
2. Teste com usuários reais: 5 pessoas por perfil, as mesmas tarefas T1–T4, medindo tempo, erros e conclusão.
3. Aplicar o **SUS** (System Usability Scale) no fim: 10 afirmações de 1 a 5; nota acima de 68 = acima da média.

### Questionário SUS (para aplicar com usuários)
1. Eu usaria o HortiLink com frequência.
2. Achei o HortiLink mais complicado do que precisava.
3. Achei o HortiLink fácil de usar.
4. Precisaria de ajuda de alguém técnico para usar.
5. As funções estão bem integradas.
6. Há muita inconsistência no sistema.
7. A maioria das pessoas aprenderia a usar rapidamente.
8. Achei o sistema muito trabalhoso de usar.
9. Me senti confiante usando o sistema.
10. Precisei aprender muitas coisas antes de conseguir usar.
