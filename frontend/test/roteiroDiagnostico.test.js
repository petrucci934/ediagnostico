import { test } from "node:test";
import assert from "node:assert/strict";
import { obterRoteiroDiagnostico } from "../src/roteiroDiagnostico.js";

test("referência E7000 não é atribuída a outro fabricante, subcódigo ou resultado ambíguo", () => {
  const resultado = (codigo, marcas) => ({
    codigo,
    resultados: marcas.map((manufacturer) => ({ manufacturer })),
  });
  const roteiro = obterRoteiroDiagnostico(resultado("E010", ["SHIMANO"]));
  assert.match(roteiro.aplicabilidade, /E7000/);
  assert.match(roteiro.causas, /não determina a peça/);
  assert.equal(new URL(roteiro.url).hostname, "si.shimano.com");
  for (const entrada of [
    resultado("10", ["SHIMANO"]),
    resultado("E01030", ["SHIMANO"]),
    resultado("E010", ["Xiaomi"]),
    resultado("E010", ["SHIMANO", "Xiaomi"]),
    resultado("E010", []),
  ]) {
    assert.equal(obterRoteiroDiagnostico(entrada), null);
  }
});
