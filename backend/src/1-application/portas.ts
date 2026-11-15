// Portas: o que a aplicação precisa do mundo de fora. Os adapters (memória,
// Supabase) implementam estes contratos; os casos de uso só conhecem as portas.

import type { Estado } from "@hortilink/dominio";

/**
 * Onde o estado é lido e gravado.
 * `salvar(antes, depois)` recebe as duas versões para o adapter gravar só o que mudou.
 */
export interface RepositorioPort {
  carregar(): Promise<Estado>;
  salvar(antes: Estado, depois: Estado): Promise<void>;
}

/** Confere o token enviado pelo front (Bearer) e devolve o id do usuário, ou null. */
export interface VerificadorDeTokenPort {
  verificar(token: string): Promise<string | null>;
}

/** Fonte de "agora", injetável para testes determinísticos. */
export type Relogio = () => Date;
