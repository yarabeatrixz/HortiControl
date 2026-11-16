import { describe, expect, it } from "vitest";
import { montarPoliticaDeConteudo } from "./politicaDeConteudo";

describe("montarPoliticaDeConteudo", () => {
  it("modo demo: scripts e conexões só do próprio site", () => {
    const politica = montarPoliticaDeConteudo({});
    expect(politica).toContain("script-src 'self'");
    expect(politica).toContain("connect-src 'self'");
    expect(politica).toContain("object-src 'none'");
    expect(politica).not.toContain("unsafe-inline");
  });

  it("modo conectado: libera só as origens da API e do Supabase", () => {
    const politica = montarPoliticaDeConteudo({
      VITE_API_URL: "http://localhost:3333/",
      VITE_SUPABASE_URL: "https://projeto.supabase.co",
    });
    expect(politica).toContain(
      "connect-src 'self' http://localhost:3333 https://projeto.supabase.co",
    );
  });

  it("ignora URL inválida em vez de abrir a política", () => {
    expect(montarPoliticaDeConteudo({ VITE_API_URL: "não é url" })).toContain("connect-src 'self';");
  });
});
