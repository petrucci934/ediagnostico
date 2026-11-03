const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");

function preparar() {
  const arquivo = path.join(__dirname, "../src/server.js");
  const carregar = createRequire(arquivo);
  const rotas = [];
  const consultas = [];
  const db = {
    async query(sql, valores) {
      consultas.push({ sql, valores });
      return { rows: [{ id: "1", nome: "Cliente" }], rowCount: 1 };
    },
    async connect() {
      throw new Error("Banco indisponível");
    },
  };
  const app = { use() {}, listen() {} };
  for (const metodo of ["get", "post", "put", "delete", "patch"]) {
    app[metodo] = (urls, ...handlers) => {
      for (const url of [urls].flat()) rotas.push({ metodo, url, handlers });
    };
  }
  const express = () => app;
  express.json = () => () => {};
  vm.runInNewContext(fs.readFileSync(arquivo, "utf8"), {
    require(nome) {
      if (nome === "dotenv") return { config() {} };
      if (nome === "express") return express;
      if (nome === "pg")
        return {
          Pool: function () {
            return db;
          },
        };
      return carregar(nome);
    },
    process: { env: { JWT_SECRET: "somente-para-teste" } },
    console: { log() {}, error() {} },
  });
  return {
    consultas,
    rota(metodo, url) {
      const rota = rotas.find((r) => r.metodo === metodo && r.url === url);
      assert.ok(rota, `${metodo} ${url}`);
      return rota;
    },
  };
}
function resposta() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
}

for (const [metodo, url] of [
  ["get", "/api/atendimentos"],
  ["post", "/api/atendimentos"],
  ["patch", "/api/atendimentos/:id/status"],
]) {
  test(`${metodo} ${url} exige autenticação`, async () => {
    const api = preparar();
    const res = resposta();
    const rota = api.rota(metodo, url);
    assert.equal(rota.handlers.length, 3);
    await rota.handlers[0]({ headers: {} }, res, () =>
      assert.fail("Acesso liberado"),
    );
    assert.equal(res.statusCode, 401);
    assert.equal(api.consultas.length, 0);
  });
}
test("Rotas administrativas e comuns compartilham os handlers de clientes", () => {
  const api = preparar();
  for (const [metodo, sufixo] of [
    ["get", ""],
    ["post", ""],
    ["put", "/:id"],
    ["delete", "/:id"],
  ]) {
    const comum = api.rota(metodo, `/api/clientes${sufixo}`);
    const admin = api.rota(metodo, `/api/admin/clientes${sufixo}`);
    assert.equal(comum.handlers.at(-1), admin.handlers.at(-1));
    const res = resposta();
    admin.handlers[1](
      { path: `/api/admin/clientes${sufixo}`, usuario: { perfil: "mecanico" } },
      res,
      () => assert.fail("Acesso administrativo liberado"),
    );
    assert.equal(res.statusCode, 403);
  }
});
test("Catálogo rejeita tipos inválidos sem consultar o banco", async () => {
  const api = preparar();
  for (const metodo of ["post", "put"]) {
    const rota = api.rota(
      metodo,
      "/api/catalogo-oficina" + (metodo === "put" ? "/:id" : ""),
    );
    for (const body of [
      undefined,
      { nome: 123, tipo: "servico", preco: 10 },
      { nome: "Teste", tipo: "servico", categoria: 123 },
      { nome: "Teste", tipo: "servico", preco: 10, maoDeObra: -1 },
      { nome: "Teste", tipo: "servico", preco: 10, maoDeObra: 20 },
    ]) {
      const res = resposta();
      await rota.handlers.at(-1)({ body, params: { id: "1" } }, res);
      assert.equal(res.statusCode, 400);
    }
  }
  assert.equal(api.consultas.length, 0);
});
test("Catálogo preserva valores separados de mão de obra e materiais", async () => {
  const api = preparar();
  const res = resposta();
  await api.rota("post", "/api/catalogo-oficina").handlers.at(-1)(
    {
      body: {
        nome: "Troca",
        tipo: "servico",
        preco: 150,
        maoDeObra: 100,
        materiais: 50,
      },
    },
    res,
  );
  assert.equal(res.statusCode, 201);
  assert.deepEqual(Array.from(api.consultas[0].valores), [
    "Troca",
    "servico",
    null,
    150,
    100,
    50,
  ]);
});
test("Redefinição de senha trata banco indisponível com resposta JSON", async () => {
  const api = preparar();
  const res = resposta();
  await api
    .rota("post", "/api/auth/redefinir-senha")
    .handlers[0](
      { body: { token: "a".repeat(64), senha: "uma-senha-longa-123" } },
      res,
    );
  assert.equal(res.statusCode, 500);
  assert.equal(typeof res.body.erro, "string");
});
test("Cálculos compartilhados mantêm o custo da hora e tratam jornada vazia", async () => {
  const codigo = fs.readFileSync(
    path.join(__dirname, "../../frontend/src/calculosPrecificacao.js"),
    "utf8",
  );
  const { calcularHoras, calcularCustoHora } = await import(
    "data:text/javascript;base64," + Buffer.from(codigo).toString("base64")
  );
  assert.equal(calcularHoras("08:00", "18:00", 60), 9);
  assert.equal(calcularHoras("18:00", "08:00", 0), 0);
  const config = {
    inicioSemana: "08:00",
    fimSemana: "18:00",
    almocoSemana: 60,
    inicioSabado: "08:00",
    fimSabado: "12:00",
    almocoSabado: 0,
    produtividade: 70,
    despesas: { aluguel: 1000 },
  };
  assert.ok(
    Math.abs(calcularCustoHora(config) - 1000 / (((49 * 52) / 12) * 0.7)) <
      1e-10,
  );
  assert.equal(calcularCustoHora({ ...config, produtividade: 0 }), 0);
});
