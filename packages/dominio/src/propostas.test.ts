import { describe, expect, it } from "vitest";
import { STATUS_PROPOSTA } from "./constantes";
import { criarExemplo } from "./exemplo";
import { aceitarProposta, criarProposta, recusarProposta } from "./propostas";
import { compraDaOferta, falhaDe, porId, sucesso } from "./testes";

const comProposta = () => sucesso(criarProposta(criarExemplo(), compraDaOferta)).state;

describe("propostas (US04/US05)", () => {
  it("cria proposta aguardando fornecedor", () => {
    expect(comProposta().proposals[0]?.status).toBe(STATUS_PROPOSTA.AGUARDANDO);
  });

  it("aceitar cria pedido e reserva estoque; não decide duas vezes", () => {
    const estado = comProposta();
    const id = estado.proposals[0]?.id ?? "";
    const r = sucesso(aceitarProposta(estado, id));
    expect(porId(r.state.proposals, id).status).toBe(STATUS_PROPOSTA.ACEITA);
    expect(r.order.proposalId).toBe(id);
    expect(porId(r.state.offers, "oferta-1").quantity).toBe(55);
    expect(falhaDe(aceitarProposta(r.state, id))).toMatch(/não está mais disponível/);
    expect(falhaDe(recusarProposta(r.state, id))).toMatch(/não está mais disponível/);
  });

  it("recusar muda o status", () => {
    const estado = comProposta();
    const id = estado.proposals[0]?.id ?? "";
    const { state } = sucesso(recusarProposta(estado, id));
    expect(porId(state.proposals, id).status).toBe(STATUS_PROPOSTA.RECUSADA);
  });
});
