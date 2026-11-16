# Política de segurança — HortiLink

Software proprietário de **Bruna Cristiny Franco** ([licença](LICENSE)). Esta política diz como relatar uma falha e quais regras de segurança o projeto segue.

## Versões cobertas

| Versão | Suporte de segurança |
|---|---|
| `main` (versão em produção) | ✅ |
| Branches de trabalho (`feat/*`, `fix/*`) | ❌ (corrigidas ao virar PR) |

## Como relatar uma vulnerabilidade

1. **Não abra issue pública.** Use o relato privado do GitHub: aba **Security → Report a vulnerability** deste repositório. Se não tiver acesso, fale com a autora pelo GitHub ([@Bruna-Franco-Dev](https://github.com/Bruna-Franco-Dev)).
2. Diga o que é, onde está (arquivo, rota ou tela), como reproduzir e qual o impacto.
3. **Nunca** mande senha, chave ou dado pessoal real no relato.

| Etapa | Prazo |
|---|---|
| Confirmação de recebimento | até 3 dias úteis |
| Avaliação de gravidade (alta, média, baixa) | até 7 dias |
| Correção de falha alta ou crítica | até 14 dias |
| Aviso de correção para quem relatou | junto com o merge da correção |

Testes de segurança só no **modo demo** (localhost) ou num projeto Supabase próprio. São proibidos ataques de negação de serviço, engenharia social e acesso a dados de outras pessoas.

## Regras do projeto (valem para todo PR)

**Segredos**
- `.env` nunca vai para o git (`.gitignore`). Os modelos ficam em `.env.example` e `frontend/.env.demo`, sem valores secretos.
- A chave **secreta** do Supabase (`sb_secret_…` / `service_role`) só existe em `backend/.env`. O front recebe só variáveis `VITE_*` públicas e **se recusa a abrir** se receber uma chave secreta (`frontend/src/configRemota.js`).
- A API se recusa a subir se a chave publicável for colocada no lugar da secreta (`backend/src/3-frameworks/config/ambiente.ts`).

**Banco (Supabase)**
- RLS ligado **e forçado** em toda tabela; o cliente só tem `SELECT`, e só no que lhe diz respeito. Toda escrita passa pela API.
- Toda migration nova repete o padrão: `enable` + `force row level security`, `revoke all` de `anon` e `authenticated`, depois só os `grant` necessários. As tabelas futuras já nascem sem privilégio (`0002_endurecimento.sql`); a `service_role` (só no servidor) recebe as escritas por `grant` explícito (`0003_grants_service_role.sql`).
- Antes de cada entrega, rodar `supabase/auditoria/auditoria-completa.sql` (somente leitura) e comparar com o resultado esperado no cabeçalho do arquivo.
- `supabase/seed.sql` tem senha pública (`123456`): **só** em projeto de teste, nunca em produção.

**API**
- Login conferido antes de qualquer validação; perfil e dono conferidos no caso de uso; o dono vem sempre do token, nunca do corpo.
- Corpo validado por esquema (campos extras recusados, tamanho máximo, formato da foto), limite de 1,5 MB, 120 requisições por minuto por IP, cabeçalhos de segurança (helmet).
- Modo demo (login falso) só em `127.0.0.1` e nunca com `NODE_ENV=production`.

**Front**
- Content-Security-Policy no build (scripts só do próprio site; conexões só com a API e o Supabase configurados).
- Sem `dangerouslySetInnerHTML`, `eval` ou HTML montado com dado do usuário.
- Foto do produto: JPG, PNG ou WebP de até 1 MB.

**Dependências e CI**
- Dependabot abre PRs semanais (npm/pnpm e GitHub Actions). Falha de segurança em dependência entra na fila de correção acima.
- `pnpm check` (lint, tipos, testes e build) e o CI verdes antes de qualquer merge.

## Documentos relacionados

- [Auditoria de segurança](docs/AUDITORIA-SEGURANCA.md): achados, evidências e correções aplicadas.
- [OWASP Top 10](docs/OWASP-TOP10.md): como o projeto trata cada categoria.
- [Manutenção](docs/MANUTENCAO.md): checklist de segurança para mudanças.
