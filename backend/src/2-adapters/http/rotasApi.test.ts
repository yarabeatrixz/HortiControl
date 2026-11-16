import { criarExemplo } from "@hortilink/dominio/exemplo";
import { describe, expect, it } from "vitest";
import { criarCasosDeUso } from "../../1-application/casosDeUso";
import { criarServidor } from "../../3-frameworks/http/servidor";
import { criarRepositorioEmMemoria } from "../memoria/repositorioEmMemoria";
import { verificadorDemo } from "../memoria/verificadorDemo";

const ORIGEM = "http://localhost:5173";
const agora = new Date("2026-11-15T12:00:00.000Z");

function montar() {
  const repositorio = criarRepositorioEmMemoria(criarExemplo(agora));
  const casos = criarCasosDeUso({ repositorio, relogio: () => agora });
  const app = criarServidor({ origemFrontend: ORIGEM }, { casos, verificador: verificadorDemo });
  const como = (userId: string) => ({ authorization: `Bearer demo:${userId}` });
  return { app, repositorio, como };
}

const produto = { name: "Couve", category: "Verduras", unit: "mç", price: "3,20", quantity: 10 };

describe("rotas da API", () => {
  it("sem token responde 401 com mensagem clara", async () => {
    const { app } = montar();
    const resposta = await app.inject({ method: "POST", url: "/products", payload: produto });
    expect(resposta.statusCode).toBe(401);
    expect(resposta.json()).toEqual({ error: "Faça login para continuar" });
  });

  it("sem token, o login é conferido antes do corpo (401, não 400)", async () => {
    const { app } = montar();
    const resposta = await app.inject({ method: "POST", url: "/products", payload: {} });
    expect(resposta.statusCode).toBe(401);
  });

  it("token inválido responde 401", async () => {
    const { app } = montar();
    const resposta = await app.inject({
      method: "DELETE",
      url: "/expenses/x",
      headers: { authorization: "Bearer token-falso" },
    });
    expect(resposta.statusCode).toBe(401);
  });

  it("produtor cadastra produto (201) e ele vai para o repositório", async () => {
    const { app, repositorio, como } = montar();
    const resposta = await app.inject({ method: "POST", url: "/products", headers: como("user-produtor"), payload: produto });
    expect(resposta.statusCode).toBe(201);
    expect(repositorio.espiar().products[0]).toMatchObject({ name: "Couve", price: 3.2, producerId: "user-produtor" });
  });

  it("recusa foto que não é imagem e texto longo demais (400)", async () => {
    const { app, como } = montar();
    const enviar = (payload: object) =>
      app.inject({ method: "POST", url: "/products", headers: como("user-produtor"), payload: { ...produto, ...payload } });
    expect((await enviar({ photo: "data:text/html;base64,PHNjcmlwdD4=" })).statusCode).toBe(400);
    expect((await enviar({ photo: "javascript:alert(1)" })).statusCode).toBe(400);
    expect((await enviar({ name: "x".repeat(121) })).statusCode).toBe(400);
    expect((await enviar({ photo: "data:image/png;base64,iVBORw0KGgo=" })).statusCode).toBe(201);
  });

  it("oferta com ponto de retirada inexistente responde 404", async () => {
    const { app, repositorio, como } = montar();
    const produtoDoProdutor = repositorio.espiar().products.find((p) => p.producerId === "user-produtor");
    const resposta = await app.inject({
      method: "POST",
      url: "/offers",
      headers: como("user-produtor"),
      payload: {
        productId: produtoDoProdutor?.id,
        quantity: 1,
        promotionalPrice: "0,50",
        city: "Mogi das Cruzes",
        validityDays: 2,
        storeIds: ["loja-que-nao-existe"],
      },
    });
    expect(resposta.statusCode).toBe(404);
  });

  it("perfil errado responde 403", async () => {
    const { app, como } = montar();
    const resposta = await app.inject({ method: "POST", url: "/products", headers: como("user-comprador"), payload: produto });
    expect(resposta.statusCode).toBe(403);
  });

  it("corpo fora do formato responde 400 (campo faltando ou campo extra)", async () => {
    const { app, como } = montar();
    const semPreco = await app.inject({ method: "POST", url: "/products", headers: como("user-produtor"), payload: { name: "X" } });
    expect(semPreco.statusCode).toBe(400);
    const campoExtra = await app.inject({
      method: "POST",
      url: "/products",
      headers: como("user-produtor"),
      payload: { ...produto, producerId: "user-produtor-2" },
    });
    expect(campoExtra.statusCode).toBe(400);
  });

  it("regra do domínio violada responde 422 com a mensagem do domínio", async () => {
    const { app, como } = montar();
    const resposta = await app.inject({
      method: "POST",
      url: "/stock/losses",
      headers: como("user-produtor"),
      payload: { productId: "produto-1", quantity: 999, reason: "Outro" },
    });
    expect(resposta.statusCode).toBe(422);
    expect(resposta.json()).toEqual({ error: "A perda é maior que o estoque atual" });
  });

  it("recurso de outro usuário responde 403 e inexistente responde 404", async () => {
    const { app, como } = montar();
    const deOutro = await app.inject({ method: "DELETE", url: "/products/produto-1", headers: como("user-produtor-2") });
    expect(deOutro.statusCode).toBe(403);
    const inexistente = await app.inject({ method: "DELETE", url: "/products/nao-existe", headers: como("user-produtor") });
    expect(inexistente.statusCode).toBe(404);
  });

  it("comprador cria pedido, recebe o número e paga", async () => {
    const { app, repositorio, como } = montar();
    const criado = await app.inject({
      method: "POST",
      url: "/orders",
      headers: como("user-comprador"),
      payload: { type: "offer", sourceId: "oferta-1", productId: "produto-1", quantity: 2, storeId: "loja-1" },
    });
    expect(criado.statusCode).toBe(201);
    const { order } = criado.json();
    expect(order.orderNumber).toBe("#HL-000003");

    const pago = await app.inject({ method: "POST", url: `/orders/${order.id}/pay`, headers: como("user-comprador"), payload: { method: "Pix" } });
    expect(pago.statusCode).toBe(200);
    expect(repositorio.espiar().orders.find((o) => o.id === order.id)?.status).toBe("Pago");
  });

  it("responde ao preflight de CORS do navegador com Authorization liberado", async () => {
    const { app } = montar();
    const resposta = await app.inject({
      method: "OPTIONS",
      url: "/orders",
      headers: { origin: ORIGEM, "access-control-request-method": "POST", "access-control-request-headers": "authorization,content-type" },
    });
    expect(resposta.statusCode).toBe(204);
    expect(resposta.headers["access-control-allow-origin"]).toBe(ORIGEM);
    expect(String(resposta.headers["access-control-allow-headers"]).toLowerCase()).toContain("authorization");
  });
});
