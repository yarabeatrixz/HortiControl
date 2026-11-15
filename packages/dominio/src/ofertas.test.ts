import { describe, expect, it } from "vitest";
import { STATUS_OFERTA } from "./constantes";
import { criarExemplo } from "./exemplo";
import { criarOferta, type DadosOferta, encerrarOferta, statusOferta } from "./ofertas";
import { falhaDe, porId, sucesso } from "./testes";

const ofertaValida: DadosOferta = {
  productId: "produto-1",
  quantity: "10",
  promotionalPrice: "2,50",
  city: "Mogi das Cruzes",
  validityDays: "3",
  storeIds: ["loja-1"],
};

describe("ofertas", () => {
  it("calcula status: ativa, esgotada e encerrada por validade", () => {
    const { offers } = criarExemplo();
    expect(statusOferta(porId(offers, "oferta-1"))).toBe(STATUS_OFERTA.ATIVA);
    expect(statusOferta(porId(offers, "oferta-2"))).toBe(STATUS_OFERTA.ESGOTADA);
    expect(statusOferta(porId(offers, "oferta-3"))).toBe(STATUS_OFERTA.ENCERRADA);
  });

  it("publica oferta válida", () => {
    const { state } = sucesso(criarOferta(criarExemplo(), ofertaValida));
    expect(state.offers[0]).toMatchObject({ quantity: 10, promotionalPrice: 2.5, storeIds: ["loja-1"] });
  });

  it.each<[Partial<DadosOferta>, RegExp]>([
    [{ quantity: "0" }, /quantidade válida/],
    [{ promotionalPrice: "0" }, /preço promocional válido/],
    [{ promotionalPrice: "9" }, /menor que o preço normal/],
    [{ city: " " }, /cidade/],
    [{ validityDays: "0" }, /validade/],
    [{ storeIds: [] }, /ponto de retirada/],
    [{ quantity: "999" }, /supera o estoque/],
  ])("recusa oferta inválida %o", (alteracao, mensagem) => {
    expect(falhaDe(criarOferta(criarExemplo(), { ...ofertaValida, ...alteracao }))).toMatch(mensagem);
  });

  it("encerra oferta ativa e não encerra duas vezes", () => {
    const { state } = sucesso(encerrarOferta(criarExemplo(), "oferta-1"));
    expect(statusOferta(porId(state.offers, "oferta-1"))).toBe(STATUS_OFERTA.ENCERRADA);
    expect(falhaDe(encerrarOferta(state, "oferta-1"))).toMatch(/não está mais ativa/);
  });
});
