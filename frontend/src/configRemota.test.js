import { describe, expect, it } from "vitest";
import { lerConfigRemota } from "./configRemota";

describe("lerConfigRemota", () => {
  it("sem variáveis fica no modo demo", () => {
    expect(lerConfigRemota({})).toBeNull();
  });

  it("com as três variáveis liga o modo conectado", () => {
    expect(
      lerConfigRemota({
        VITE_API_URL: "https://api.exemplo.test",
        VITE_SUPABASE_URL: "https://projeto.supabase.co",
        VITE_SUPABASE_ANON_KEY: " chave-anon ",
      }),
    ).toEqual({
      urlApi: "https://api.exemplo.test",
      urlSupabase: "https://projeto.supabase.co",
      chaveAnonSupabase: "chave-anon",
    });
  });

  it("configuração pela metade avisa o que falta", () => {
    expect(() => lerConfigRemota({ VITE_API_URL: "https://api.exemplo.test" })).toThrow(
      "falta VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY",
    );
  });
});
