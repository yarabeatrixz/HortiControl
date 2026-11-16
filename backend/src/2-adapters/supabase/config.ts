// Configuração de que os adapters do Supabase precisam. Declarada aqui (camada 2)
// para a dependência apontar para dentro: 3-frameworks/config lê o .env e
// monta este formato; os adapters não conhecem a camada de frameworks.

export interface ConfigSupabase {
  url: string;
  /** Ignora o RLS: usada SÓ aqui no servidor, nunca no front-end. */
  chaveServiceRole: string;
}
