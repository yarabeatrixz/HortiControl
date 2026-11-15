import { describe, expect, it } from "vitest";
import { criarExemplo } from "./exemplo";
import { type DadosProduto, excluirProduto, salvarProduto } from "./produtos";
import { falhaDe, sucesso } from "./testes";

const couve: DadosProduto = {
  producerId: "user-produtor",
  name: " Couve ",
  category: "Verduras",
  unit: "mç",
  price: "3,20",
  quantity: "15",
};

describe("produtos", () => {
  it("cria produto novo com id e números convertidos", () => {
    const { state } = sucesso(salvarProduto(criarExemplo(), couve));
    expect(state.products[0]).toMatchObject({ name: "Couve", price: 3.2, quantity: 15 });
    expect(state.products[0]?.id).toMatch(/^produto-/);
  });

  it("edita produto existente sem trocar o id", () => {
    const { state } = sucesso(salvarProduto(criarExemplo(), { ...couve, id: "produto-1", name: "Alface roxa" }));
    expect(state.products.find((item) => item.id === "produto-1")?.name).toBe("Alface roxa");
    expect(state.products).toHaveLength(criarExemplo().products.length);
  });

  it("recusa produto sem nome, com preço zero ou estoque mínimo negativo", () => {
    expect(falhaDe(salvarProduto(criarExemplo(), { ...couve, name: "" }))).toMatch(/valores válidos/);
    expect(falhaDe(salvarProduto(criarExemplo(), { ...couve, price: 0 }))).toMatch(/valores válidos/);
    expect(falhaDe(salvarProduto(criarExemplo(), { ...couve, minQuantity: "-1" }))).toMatch(/negativo/);
  });

  it("aceita estoque mínimo informado como texto", () => {
    const { state } = sucesso(salvarProduto(criarExemplo(), { ...couve, minQuantity: "5" }));
    expect(state.products[0]?.minQuantity).toBe(5);
  });

  it("excluir produto remove as ofertas dele", () => {
    const { state } = sucesso(excluirProduto(criarExemplo(), "produto-1"));
    expect(state.products.some((item) => item.id === "produto-1")).toBe(false);
    expect(state.offers.some((item) => item.productId === "produto-1")).toBe(false);
  });
});
