// Teste ponta a ponta: Supabase real + API local (http://127.0.0.1:3333).
// Cria 3 contas de teste (@hortilink.test, senha aleatória), faz o fluxo completo
// pela API e apaga as contas e os pedidos no fim. Lê as chaves de backend/.env e
// frontend/.env sem imprimir nada delas.
// Uso (na raiz, com a API rodando no modo conectado):  node tests/e2e-supabase.mjs
import { existsSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const raiz = fileURLToPath(new URL("..", import.meta.url));
for (const f of ["backend/.env", "frontend/.env"]) {
  if (!existsSync(`${raiz}/${f}`)) {
    console.error(`Falta ${f} (copie do .env.example e preencha). Este teste usa o Supabase real.`);
    process.exit(1);
  }
}
const env = (f) =>
  Object.fromEntries(
    readFileSync(f, "utf8")
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
  );
const be = env(`${raiz}/backend/.env`);
const fe = env(`${raiz}/frontend/.env`);
const SB = be.SUPABASE_URL,
  SECRETA = be.SUPABASE_SERVICE_ROLE_KEY,
  PUB = fe.VITE_SUPABASE_ANON_KEY;
const API = "http://127.0.0.1:3333";
const senha = randomBytes(12).toString("base64url");
const sufixo = randomBytes(3).toString("hex");
let falhas = 0;
const ok = (cond, msg, extra = "") => {
  console.log(`${cond ? "OK  " : "FALHA"} ${msg} ${extra}`);
  if (!cond) falhas++;
};

async function j(url, opts = {}) {
  const r = await fetch(url, opts);
  const t = await r.text();
  let b;
  try {
    b = JSON.parse(t);
  } catch {
    b = t;
  }
  return { status: r.status, body: b };
}
const admin = {
  apikey: SECRETA,
  authorization: `Bearer ${SECRETA}`,
  "content-type": "application/json",
};

async function criarConta(role, name) {
  const email = `teste-${role}-${sufixo}@hortilink.test`;
  const r = await j(`${SB}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin,
    body: JSON.stringify({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { role, name, city: "Campinas" },
    }),
  });
  ok(r.status === 200, `criar conta ${role}`, r.status !== 200 ? JSON.stringify(r.body) : "");
  const login = await j(`${SB}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "content-type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });
  ok(login.status === 200, `login ${role} com a chave pública`);
  return { id: r.body.id, token: login.body.access_token };
}
const api = (token, metodo, rota, corpo) =>
  j(`${API}${rota}`, {
    method: metodo,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(corpo ? { "content-type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
const ler = (token, tabela, filtro = "") =>
  j(`${SB}/rest/v1/${tabela}?select=*${filtro}`, {
    headers: { apikey: PUB, authorization: `Bearer ${token}` },
  });

const contas = [];
try {
  const loja = await criarConta("loja", "Loja Teste");
  contas.push(loja);
  const prod = await criarConta("produtor", "Produtor Teste");
  contas.push(prod);
  const comp = await criarConta("comprador", "Comprador Teste");
  contas.push(comp);

  const perfil = await j(`${SB}/rest/v1/users?select=id,role,name,city&id=eq.${prod.id}`, {
    headers: { apikey: PUB, authorization: `Bearer ${prod.token}` },
  });
  ok(
    perfil.status === 200 && perfil.body[0]?.role === "produtor",
    "gatilho criou o perfil com o papel certo",
  );

  // Segurança
  ok(
    (
      await api(null, "POST", "/products", {
        name: "x",
        category: "Verduras",
        unit: "kg",
        price: 1,
        quantity: 1,
      })
    ).status === 401,
    "sem login → 401",
  );
  ok(
    (
      await api(comp.token, "POST", "/products", {
        name: "x",
        category: "Verduras",
        unit: "kg",
        price: 1,
        quantity: 1,
      })
    ).status === 403,
    "comprador criando produto → 403",
  );
  const escritaDireta = await j(`${SB}/rest/v1/products`, {
    method: "POST",
    headers: {
      apikey: PUB,
      authorization: `Bearer ${prod.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      producer_id: prod.id,
      name: "hack",
      category: "Verduras",
      unit: "kg",
      price: 1,
      quantity: 1,
    }),
  });
  ok(
    escritaDireta.status >= 400,
    "escrita direta no Supabase com token do usuário é bloqueada",
    `(${escritaDireta.status})`,
  );

  // Fluxo
  const r1 = await api(loja.token, "PUT", "/stores/me", {
    name: "Ponto Centro",
    address: "Rua A, 10",
    city: "Campinas",
    hours: "8h às 18h",
  });
  ok(
    r1.status < 300,
    "loja salva o ponto de retirada",
    r1.status >= 300 ? JSON.stringify(r1.body) : "",
  );
  const lojas = await ler(prod.token, "stores");
  const lojaId = lojas.body.find?.((s) => s.user_id === loja.id)?.id;
  ok(!!lojaId, "produtor enxerga a loja (leitura com RLS)");

  const r2 = await api(prod.token, "POST", "/products", {
    name: "Alface",
    category: "Verduras",
    unit: "kg",
    price: 10,
    quantity: 20,
  });
  ok(r2.status < 300, "produtor cadastra produto", r2.status >= 300 ? JSON.stringify(r2.body) : "");
  const prods = await ler(prod.token, "products", `&producer_id=eq.${prod.id}`);
  const produtoId = prods.body[0]?.id;
  ok(!!produtoId, "produto gravado no banco");

  const r3 = await api(prod.token, "POST", "/offers", {
    productId: produtoId,
    quantity: 5,
    promotionalPrice: 7,
    city: "Campinas",
    validityDays: 3,
    storeIds: [lojaId],
  });
  ok(r3.status < 300, "produtor cria oferta", r3.status >= 300 ? JSON.stringify(r3.body) : "");
  const ofertas = await ler(comp.token, "offers", `&producer_id=eq.${prod.id}`);
  const ofertaId = ofertas.body[0]?.id;
  ok(!!ofertaId, "comprador vê a oferta");

  const r4 = await api(comp.token, "POST", "/orders", {
    type: "offer",
    sourceId: ofertaId,
    productId: produtoId,
    quantity: 2,
    storeId: lojaId,
  });
  ok(r4.status < 300, "comprador faz pedido", r4.status >= 300 ? JSON.stringify(r4.body) : "");
  const pedidos = await ler(comp.token, "orders");
  const pedidoId = pedidos.body[0]?.id;
  ok(
    !!pedidoId,
    "pedido gravado",
    pedidos.body[0] ? `status=${pedidos.body[0].status}` : JSON.stringify(pedidos.body),
  );

  const r5 = await api(comp.token, "POST", `/orders/${pedidoId}/pay`, { method: "Pix" });
  ok(r5.status < 300, "comprador paga (simulado)", r5.status >= 300 ? JSON.stringify(r5.body) : "");
  const r6 = await api(prod.token, "POST", `/orders/${pedidoId}/delivered`);
  ok(
    r6.status < 300,
    "produtor marca entregue na loja",
    r6.status >= 300 ? JSON.stringify(r6.body) : "",
  );

  const pedidoFinal = await ler(comp.token, "orders", `&id=eq.${pedidoId}`);
  console.log("     status final do pedido:", pedidoFinal.body[0]?.status);
  const eventos = await ler(comp.token, "order_timeline", `&order_id=eq.${pedidoId}`);
  console.log("     linha do tempo:", (eventos.body || []).map?.((e) => e.label).join(" → "));
  const estoque = await ler(prod.token, "offers", `&id=eq.${ofertaId}`);
  console.log(
    "     oferta depois do pedido:",
    JSON.stringify(estoque.body[0] && { quantity: estoque.body[0].quantity }),
  );

  const pedidosDaLoja = await ler(prod.token, "orders");
  console.log("     pedidos que o produtor enxerga:", pedidosDaLoja.body.length);
} catch (e) {
  falhas++;
  console.log("ERRO", e.message);
} finally {
  // Pedidos guardam histórico (FK sem cascade): apaga os das contas de teste antes das contas.
  const ids = contas.map((c) => c.id).filter(Boolean);
  if (ids.length) {
    await j(`${SB}/rest/v1/orders?buyer_id=in.(${ids.join(",")})`, {
      method: "DELETE",
      headers: admin,
    });
  }
  for (const c of contas.reverse()) {
    if (!c.id) continue;
    const d = await j(`${SB}/auth/v1/admin/users/${c.id}`, { method: "DELETE", headers: admin });
    console.log(
      `limpeza: conta de teste apagada → ${d.status}`,
      d.status >= 300 ? JSON.stringify(d.body) : "",
    );
  }
  console.log(falhas ? `\n${falhas} falha(s)` : "\nTudo certo");
  process.exitCode = falhas ? 1 : 0;
}
