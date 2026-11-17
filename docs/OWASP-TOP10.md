# OWASP Top 10 no HortiLink

Como o projeto trata cada categoria do **OWASP Top 10 (edição 2025)**. A coluna "Situação" mostra o estado em 16/11/2026, depois das correções da [auditoria](AUDITORIA-SEGURANCA.md).

Legenda: ✅ tratado · 🟡 tratado em parte (limite conhecido) · ⏳ fica para depois

| # | Categoria | Situação |
|---|---|---|
| A01 | Quebra de controle de acesso | ✅ |
| A02 | Configuração de segurança incorreta | ✅ |
| A03 | Falhas na cadeia de suprimentos de software | ✅ |
| A04 | Falhas de criptografia | ✅ |
| A05 | Injeção | ✅ |
| A06 | Design inseguro | 🟡 |
| A07 | Falhas de autenticação | 🟡 |
| A08 | Falhas de integridade de software ou dados | 🟡 |
| A09 | Falhas de log e alerta de segurança | ⏳ |
| A10 | Tratamento incorreto de condições excepcionais | ✅ |

---

## A01 — Quebra de controle de acesso ✅
- **Banco:** RLS ligado e **forçado** nas 11 tabelas; `anon` sem nenhum privilégio; `authenticated` só com `SELECT`. Pedidos, propostas, estoque e despesas só aparecem para os envolvidos ou para o dono. Conferido no banco real com `supabase/auditoria/auditoria-completa.sql`.
- **API:** toda escrita confere o login (`exigirLogin`), o perfil (`exigirPerfil`) e o dono (`doUsuario`) no servidor. O dono vem do token, nunca do corpo (campos extras são recusados com 400). Sem IDOR: produto, oferta, pedido e despesa de outra pessoa → 403.
- **Tabelas futuras:** nascem sem privilégio para o cliente (`0002_endurecimento.sql` e a opção "não expor novas tabelas" desligada no projeto).
- Testes: `backend/src/2-adapters/http/rotasApi.test.ts`, `backend/src/1-application/casosDeUso.test.ts`.

## A02 — Configuração de segurança incorreta ✅
- O modo demo (login falso) **não sobe** com `NODE_ENV=production` nem fora de `127.0.0.1`.
- A API recusa a chave publicável no lugar da secreta; o front recusa chave secreta no `.env` e configuração pela metade.
- Cabeçalhos de segurança na API (`@fastify/helmet`), CORS liberado para uma única origem e CSP no build do front.
- Supabase: RLS automático ligado em tabelas novas, senha mínima de 8 caracteres no Auth.

## A03 — Falhas na cadeia de suprimentos ✅
- `pnpm-lock.yaml` versionado e CI com `pnpm install --frozen-lockfile`.
- Dependabot semanal (npm/pnpm e GitHub Actions). `pnpm audit` em 15/11/2026: nenhuma vulnerabilidade conhecida.
- Poucas dependências de execução (React, Fastify, supabase-js, plugins oficiais do Fastify).

## A04 — Falhas de criptografia ✅
- Senhas ficam só no Supabase Auth (bcrypt com sal); a API nunca vê a senha.
- Ids com `crypto.randomUUID()`; tokens de sessão emitidos e conferidos pelo Supabase.
- Transporte HTTPS para o Supabase; HSTS na API (helmet). Em produção, a API e o front devem ficar atrás de HTTPS.
- Limite conhecido: o **modo demo** guarda senhas em texto puro no `localStorage` do próprio navegador. É só demonstração e não tem servidor.

## A05 — Injeção ✅
- **SQL:** só o construtor de consultas do `supabase-js` (parametrizado). O único SQL montado por texto é o gerador do seed, com dados fixos e aspas escapadas.
- **XSS:** o React escapa todo texto; não há `dangerouslySetInnerHTML`. A CSP do build bloqueia scripts de fora, e a foto só aceita `data:image/(png|jpeg|webp)` ou `https://` (API e banco).
- **Comando e código:** sem `child_process`, `eval` ou `new Function`.

## A06 — Design inseguro 🟡
- Regras de negócio num pacote só (`@hortilink/dominio`), rodadas no servidor como fonte da verdade.
- **Limites conhecidos (documentados):**
  - Escritas sem transação: duas compras simultâneas podem vender acima do estoque. Próximo passo: função SQL `aplicar_mudancas(jsonb)`.
  - Pagamento **simulado**: o comprador marca a própria compra como paga.
  - Perfil **loja/produtor** escolhido no cadastro, sem verificação.

## A07 — Falhas de autenticação 🟡
- Supabase Auth com senha mínima de 8 caracteres (no painel do Auth e na regra do domínio). Com a confirmação de e-mail ligada no painel, o cadastro só entra depois da confirmação; o front já trata esse caso.
- A API valida o token em toda requisição (`auth.getUser`).
- Limite de 120 requisições por minuto por IP na API.
- **Limites:** sem MFA; a proteção contra senhas vazadas exige o plano Pro do Supabase; o `seed.sql` tem senha pública (só para projeto de teste).

## A08 — Falhas de integridade de software ou dados 🟡
- Validação dupla: esquema JSON na API + regras do domínio + `check` constraints no banco (preço > 0, quantidade ≥ 0, tamanhos, formato da foto).
- CI roda lint, tipos, testes e build em cada PR.
- **Limite:** sem transação nas escritas (ver A06).

## A09 — Falhas de log e alerta ⏳
- A API registra erros inesperados no log do Fastify sem devolver detalhes ao cliente. O Supabase guarda os logs de Auth e do banco.
- **Falta:** alerta para muitos 401/403/429, retenção e monitoramento em produção (fase 5, junto com o deploy).

## A10 — Tratamento incorreto de condições excepcionais ✅
- Tratador único de erros: `{ error }` com status certo (400/401/403/404/413/422/429) e 500 genérico, sem pilha.
- Domínio sem `throw` (erros como valor); entrada numérica inválida vira 0 e é recusada pelas regras.
- O front mostra mensagens claras para falha de rede, sessão expirada e configuração errada.
