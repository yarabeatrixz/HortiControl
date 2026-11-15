import { describe, expect, it } from "vitest";
import { estadoInicial } from "../test/fixtures";
import {
  MOTIVOS_PERDA,
  STATUS_ESTOQUE,
  STATUS_PEDIDO,
  TIPO_DESPESA,
  TIPO_MOVIMENTO,
} from "./constants";
import {
  excluirDespesa,
  registrarDespesa,
  registrarEntrada,
  registrarPerda,
  statusEstoque,
} from "./estoque";
import { calcularIndicadores } from "./indicadores";
import { salvarProduto } from "./regras";

const produto = (estado, id) => estado.products.find((item) => item.id === id);

describe("status do estoque (alerta de estoque baixo)", () => {
  it("ok acima do mínimo, baixo no mínimo ou abaixo, zerado sem quantidade", () => {
    expect(statusEstoque({ quantity: 31, minQuantity: 30 })).toBe(STATUS_ESTOQUE.OK);
    expect(statusEstoque({ quantity: 30, minQuantity: 30 })).toBe(STATUS_ESTOQUE.BAIXO);
    expect(statusEstoque({ quantity: 0, minQuantity: 30 })).toBe(STATUS_ESTOQUE.ZERADO);
  });

  it("sem estoque mínimo definido só alerta quando zera", () => {
    expect(statusEstoque({ quantity: 1 })).toBe(STATUS_ESTOQUE.OK);
  });

  it("o seed tem um produto com estoque baixo (cheiro-verde)", () => {
    expect(statusEstoque(produto(estadoInicial(), "produto-3"))).toBe(STATUS_ESTOQUE.BAIXO);
  });

  it("produto aceita estoque mínimo e recusa valor negativo", () => {
    const base = { name: "Couve", price: 3, quantity: 10, producerId: "user-produtor" };
    expect(
      salvarProduto(estadoInicial(), { ...base, minQuantity: "5" }).state.products[0].minQuantity,
    ).toBe(5);
    expect(salvarProduto(estadoInicial(), { ...base, minQuantity: "-1" }).ok).toBe(false);
  });
});

describe("entrada de mercadoria", () => {
  it("soma ao estoque e registra o custo", () => {
    const r = registrarEntrada(estadoInicial(), {
      productId: "produto-3",
      quantity: "20",
      unitCost: "0,80",
      note: " colheita ",
    });
    expect(r.ok).toBe(true);
    expect(produto(r.state, "produto-3").quantity).toBe(60);
    expect(r.state.stockMovements[0]).toMatchObject({
      type: TIPO_MOVIMENTO.ENTRADA,
      quantity: 20,
      unitCost: 0.8,
      note: "colheita",
      producerId: "user-produtor",
    });
  });

  it("recusa quantidade zero e custo negativo", () => {
    expect(registrarEntrada(estadoInicial(), { productId: "produto-1", quantity: 0 }).ok).toBe(
      false,
    );
    expect(
      registrarEntrada(estadoInicial(), { productId: "produto-1", quantity: 1, unitCost: -1 }).ok,
    ).toBe(false);
  });
});

describe("perdas", () => {
  const perda = { productId: "produto-1", quantity: "5", reason: MOTIVOS_PERDA[0] };

  it("tira do estoque e guarda o motivo", () => {
    const r = registrarPerda(estadoInicial(), perda);
    expect(produto(r.state, "produto-1").quantity).toBe(115);
    expect(r.state.stockMovements[0]).toMatchObject({
      type: TIPO_MOVIMENTO.PERDA,
      reason: MOTIVOS_PERDA[0],
    });
  });

  it("recusa perda maior que o estoque e sem motivo", () => {
    expect(registrarPerda(estadoInicial(), { ...perda, quantity: 999 }).error).toMatch(
      /maior que o estoque/,
    );
    expect(registrarPerda(estadoInicial(), { ...perda, reason: "" }).error).toMatch(/motivo/);
  });
});

describe("custos e investimentos", () => {
  const despesa = {
    producerId: "user-produtor",
    type: TIPO_DESPESA.CUSTO,
    description: "Frete",
    amount: "50",
  };

  it("registra e exclui", () => {
    const r = registrarDespesa(estadoInicial(), despesa);
    expect(r.state.expenses[0]).toMatchObject({ description: "Frete", amount: 50 });
    const semDespesa = excluirDespesa(r.state, r.state.expenses[0].id);
    expect(semDespesa.state.expenses.some((item) => item.description === "Frete")).toBe(false);
  });

  it("exige descrição, tipo válido e valor positivo", () => {
    expect(registrarDespesa(estadoInicial(), { ...despesa, description: "" }).ok).toBe(false);
    expect(registrarDespesa(estadoInicial(), { ...despesa, type: "Outro" }).ok).toBe(false);
    expect(registrarDespesa(estadoInicial(), { ...despesa, amount: 0 }).ok).toBe(false);
  });
});

describe("relatórios e indicadores", () => {
  it("calcula receita só de pedidos pagos, gastos, perdas e resultado", () => {
    const i = calcularIndicadores(estadoInicial(), "user-produtor");
    // seed: pedido-2 pago (12 × 2,20); pedido-1 aguardando pagamento não conta
    expect(i.receita).toBeCloseTo(26.4);
    expect(i.pedidos).toBe(1);
    expect(i.custoEntradas).toBeCloseTo(88); // 80 × 1,10
    expect(i.custos).toBe(85);
    expect(i.investimentos).toBe(420);
    expect(i.resultado).toBeCloseTo(26.4 - 88 - 85 - 420);
    expect(i.perdasQuantidade).toBe(6);
    expect(i.valorPerdido).toBeCloseTo(15); // 6 × 2,50
    expect(i.estoqueBaixo.map((p) => p.id)).toEqual(["produto-3"]);
    expect(i.porProduto[0].product.id).toBe("produto-1");
  });

  it("respeita o filtro de período e não mistura produtores", () => {
    const nada = calcularIndicadores(estadoInicial(), "user-produtor", () => false);
    expect(nada.receita).toBe(0);
    expect(nada.gastoTotal).toBe(0);
    const outro = calcularIndicadores(estadoInicial(), "user-produtor-2");
    expect(outro.custos).toBe(0);
    expect(outro.porProduto.map((p) => p.product.id)).toEqual(["produto-4"]);
  });

  it("pedido entregue na loja continua contando como venda", () => {
    const estado = estadoInicial();
    estado.orders = estado.orders.map((o) =>
      o.id === "pedido-2" ? { ...o, status: STATUS_PEDIDO.ENTREGUE_NA_LOJA } : o,
    );
    expect(calcularIndicadores(estado, "user-produtor").pedidos).toBe(1);
  });
});
