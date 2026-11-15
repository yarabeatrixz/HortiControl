import { describe, expect, it } from "vitest";
import { STATUS_PEDIDO, ORIGEM } from "@domain";
import { criarRepositorioEmMemoria } from "../test/fixtures";
import { criarCasosDeUso } from "./useCases";

describe("casos de uso", () => {
  it("entrar grava a sessão; credencial errada lança erro claro", async () => {
    const repositorio = criarRepositorioEmMemoria();
    const casos = criarCasosDeUso(repositorio);
    await expect(
      casos.entrar({ email: "x@x.com", password: "123456", role: "produtor" }),
    ).rejects.toThrow("E-mail ou senha incorretos");
    await casos.entrar({ email: "loja@hortilink.com", password: "123456", role: "loja" });
    expect(await repositorio.carregarSessao()).toBe("user-loja");
  });

  it("cadastrar salva o usuário e já entra", async () => {
    const repositorio = criarRepositorioEmMemoria();
    const { user } = await criarCasosDeUso(repositorio).cadastrar({
      role: "comprador",
      name: "Ana",
      city: "Suzano",
      email: "ana@x.com",
      password: "123456",
    });
    expect(repositorio.espiar().users.some((u) => u.id === user.id)).toBe(true);
    expect(await repositorio.carregarSessao()).toBe(user.id);
  });

  it("persiste o resultado da regra (pedido + pagamento)", async () => {
    const repositorio = criarRepositorioEmMemoria();
    const casos = criarCasosDeUso(repositorio);
    const { order } = await casos.criarPedido({
      type: ORIGEM.OFERTA,
      sourceId: "oferta-1",
      productId: "produto-1",
      buyerId: "user-comprador",
      quantity: 2,
      storeId: "loja-1",
    });
    await casos.pagarPedido(order.id, "Pix");
    const salvo = repositorio.espiar().orders.find((o) => o.id === order.id);
    expect(salvo.status).toBe(STATUS_PEDIDO.PAGO);
  });

  it("regra que falha não grava nada", async () => {
    const repositorio = criarRepositorioEmMemoria();
    const antes = structuredClone(repositorio.espiar());
    await expect(criarCasosDeUso(repositorio).encerrarOferta("oferta-3")).rejects.toThrow(
      /não está mais ativa/,
    );
    expect(repositorio.espiar()).toEqual(antes);
  });
});
