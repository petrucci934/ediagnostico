const { test } = require("node:test");
const assert = require("node:assert/strict");
const { configuracaoBanco, origensAdicionais } = require("../src/configHospedagem");

test("mantém configuração local e exige certificado válido quando TLS é ativado", () => {
  const config = configuracaoBanco({ DB_HOST: "localhost", DB_NAME: "teste", DB_SSL: "true" });
  assert.equal(config.host, "localhost");
  assert.equal(config.port, 5432);
  assert.equal(config.database, "teste");
  assert.deepEqual(config.ssl, { rejectUnauthorized: true });
});

test("DATABASE_URL tem prioridade sem sobrescrever os parâmetros TLS do provedor", () => {
  const config = configuracaoBanco({ DATABASE_URL: "postgres://example/db?sslmode=verify-full", DB_HOST: "localhost", DB_SSL: "true" });
  assert.equal(config.connectionString, "postgres://example/db?sslmode=verify-full");
  assert.equal(config.host, undefined);
  assert.equal(config.ssl, undefined);
});

test("origen extras não introduzem curingas implícitos", () => {
  assert.deepEqual(origensAdicionais({}), []);
  assert.deepEqual(origensAdicionais({ CORS_ORIGINS: " https://teste.example, ,https://outro.example " }), ["https://teste.example", "https://outro.example"]);
});
