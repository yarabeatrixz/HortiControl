// Verifica o token de sessão do Supabase Auth enviado pelo front (Bearer).
// O Supabase confere assinatura e expiração; devolvemos só o id do usuário.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { VerificadorDeTokenPort } from "../../1-application/portas";
import type { ConfigSupabase } from "../../3-frameworks/config/ambiente";
import { clienteServidor } from "./repositorioSupabase";

export function criarVerificadorSupabase(
  config: ConfigSupabase,
  cliente: SupabaseClient = clienteServidor(config),
): VerificadorDeTokenPort {
  return {
    async verificar(token) {
      const { data, error } = await cliente.auth.getUser(token);
      return error || !data.user ? null : data.user.id;
    },
  };
}
