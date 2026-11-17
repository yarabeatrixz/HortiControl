import { describe, expect, it } from "vitest";
import { criarExemplo } from "./exemplo";
import { type DadosLoja, salvarLoja } from "./lojas";
import { falhaDe, porId, sucesso } from "./testes";

const loja: DadosLoja = { name: "Sacolão", address: "Rua A, 1", city: "Suzano", hours: "8h às 18h" };

describe("lojas", () => {
  it("cria loja para usuário sem loja e atualiza a existente mantendo os outros dados", () => {
    const criada = sucesso(salvarLoja(criarExemplo(), "user-novo", loja));
    expect(criada.state.stores[0]).toMatchObject({ ...loja, userId: "user-novo" });

    const atualizada = sucesso(salvarLoja(criarExemplo(), "user-loja", { ...loja, name: "Novo nome" }));
    expect(porId(atualizada.state.stores, "loja-1")).toMatchObject({ name: "Novo nome", distanceKm: 1.2 });
  });

  it("exige todos os campos", () => {
    expect(falhaDe(salvarLoja(criarExemplo(), "user-loja", { ...loja, hours: "" }))).toMatch(/Preencha todos/);
  });
});
