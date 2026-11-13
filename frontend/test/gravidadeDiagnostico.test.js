import { test } from "node:test";
import assert from "node:assert/strict";
import { obterGravidade } from "../src/gravidadeDiagnostico.js";

test("não converte ausência de gravidade em risco baixo", () => {
  for (const linhas of [
    [],
    [{}],
    [{ severity: "unknown" }],
    [{ severity: "inexistente" }],
  ]) {
    assert.equal(obterGravidade(linhas).chave, "unknown");
    assert.equal(obterGravidade(linhas).rotulo, "Não classificada");
  }
});
test("normaliza o nível cadastrado sem escolher o primeiro em resultados divergentes", () => {
  assert.equal(obterGravidade([{ severity: " HIGH " }]).rotulo, "Alta");
  assert.equal(
    obterGravidade([{ severity: "high" }, { severity: "high" }]).chave,
    "high",
  );
  assert.equal(
    obterGravidade([{ severity: "low" }, { severity: "critical" }]).chave,
    "mixed",
  );
  assert.equal(obterGravidade([{ severity: "high" }, {}]).chave, "mixed");
});
