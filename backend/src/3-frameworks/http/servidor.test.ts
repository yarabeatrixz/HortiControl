import { describe, expect, it } from "vitest";
import { lerAmbiente } from "../config/ambiente";
import { criarServidor } from "./servidor";

const ORIGEM = "http://localhost:5173";

describe("servidor", () => {
  it("GET /saude responde ok com CORS para o front-end", async () => {
    const app = criarServidor({ origemFrontend: ORIGEM });
    const resposta = await app.inject({ method: "GET", url: "/saude", headers: { origin: ORIGEM } });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ status: "ok", servico: "hortilink-api" });
    expect(resposta.headers["access-control-allow-origin"]).toBe(ORIGEM);
    await app.close();
  });

  it("rota inexistente devolve 404", async () => {
    const app = criarServidor({ origemFrontend: ORIGEM });
    const resposta = await app.inject({ method: "GET", url: "/nao-existe" });
    expect(resposta.statusCode).toBe(404);
    await app.close();
  });
});

describe("ambiente", () => {
  it("sem Supabase usa o modo demo e padrões seguros", () => {
    expect(lerAmbiente({})).toEqual({
      porta: 3333,
      host: "0.0.0.0",
      origemFrontend: ORIGEM,
      modo: "demo",
      supabase: null,
    });
  });

  it("com URL e service_role usa o modo supabase", () => {
    const ambiente = lerAmbiente({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "chave" });
    expect(ambiente.modo).toBe("supabase");
    expect(ambiente.supabase).toEqual({ url: "https://x.supabase.co", chaveServiceRole: "chave" });
  });

  it("recusa porta inválida, chave do Supabase pela metade e modo demo em produção", () => {
    expect(() => lerAmbiente({ PORT: "abc" })).toThrow(/PORT inválida/);
    expect(() => lerAmbiente({ SUPABASE_URL: "https://x.supabase.co" })).toThrow(/juntas/);
    expect(() => lerAmbiente({ NODE_ENV: "production" })).toThrow(/exige o Supabase/);
  });
});
