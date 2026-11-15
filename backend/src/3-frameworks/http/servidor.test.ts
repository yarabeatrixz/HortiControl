import { describe, expect, it } from "vitest";
import { lerAmbiente } from "../config/ambiente";
import { criarServidor } from "./servidor";

describe("servidor", () => {
  it("GET /saude responde ok com CORS para o front-end", async () => {
    const app = criarServidor({ origemFrontend: "http://localhost:5173" });
    const resposta = await app.inject({ method: "GET", url: "/saude" });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.json()).toMatchObject({ status: "ok", servico: "hortilink-api" });
    expect(resposta.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    await app.close();
  });

  it("rota inexistente devolve 404", async () => {
    const app = criarServidor({ origemFrontend: "http://localhost:5173" });
    const resposta = await app.inject({ method: "GET", url: "/nao-existe" });
    expect(resposta.statusCode).toBe(404);
    await app.close();
  });
});

describe("ambiente", () => {
  it("usa padrões seguros quando nada é informado", () => {
    expect(lerAmbiente({})).toEqual({
      porta: 3333,
      host: "0.0.0.0",
      origemFrontend: "http://localhost:5173",
    });
  });

  it("recusa porta inválida com mensagem clara", () => {
    expect(() => lerAmbiente({ PORT: "abc" })).toThrow(/PORT inválida/);
  });
});
