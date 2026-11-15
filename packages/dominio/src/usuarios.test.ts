import { describe, expect, it } from "vitest";
import { criarExemplo } from "./exemplo";
import { num } from "./formatacao";
import { falhaDe, sucesso } from "./testes";
import { autenticar, cadastrarUsuario, type DadosCadastro } from "./usuarios";

const novo: DadosCadastro = {
  role: "comprador",
  name: "Ana",
  city: "Suzano",
  email: "ana@x.com",
  password: "123456",
};

describe("num", () => {
  it("aceita vírgula e ponto de milhar", () => {
    expect(num("1.234,5")).toBe(1234.5);
    expect(num("2.5")).toBe(2.5);
    expect(num("abc")).toBe(0);
  });
});

describe("usuários", () => {
  it("cadastra usuário e normaliza o e-mail", () => {
    const r = sucesso(cadastrarUsuario(criarExemplo(), { ...novo, email: " ANA@X.com " }));
    expect(r.user.email).toBe("ana@x.com");
    expect(r.state.users).toContainEqual(r.user);
  });

  it("recusa e-mail repetido e senha curta", () => {
    const estado = criarExemplo();
    expect(falhaDe(cadastrarUsuario(estado, { ...novo, email: "comprador@hortilink.com" }))).toMatch(
      /já está cadastrado/,
    );
    expect(falhaDe(cadastrarUsuario(estado, { ...novo, password: "123" }))).toMatch(/6 caracteres/);
  });

  it("produtor novo começa sem pontos de retirada", () => {
    const r = sucesso(cadastrarUsuario(criarExemplo(), { ...novo, role: "produtor" }));
    expect(r.user.pickupStoreIds).toEqual([]);
  });

  it("autentica só com e-mail, senha e perfil corretos", () => {
    const { users } = criarExemplo();
    const credenciais = { email: "produtor@hortilink.com", password: "123456", role: "produtor" } as const;
    expect(autenticar(users, credenciais)?.id).toBe("user-produtor");
    expect(autenticar(users, { ...credenciais, role: "comprador" })).toBeNull();
    expect(autenticar(users, { ...credenciais, password: "errada" })).toBeNull();
  });
});
