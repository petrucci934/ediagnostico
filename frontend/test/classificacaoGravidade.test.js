import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catalogoDiagnosticos,
  resultadoCatalogo,
} from "../src/catalogoDiagnosticos.js";
import { obterGravidade } from "../src/gravidadeDiagnostico.js";

test("aplica a classificação por fabricante e código sem validar automaticamente as fichas", () => {
  const criticos = [
    "xiaomi-10",
    "xiaomi-18",
    "xiaomi-21",
    "xiaomi-24",
    "ninebot-10",
    "ninebot-18",
    "bafang-08",
    "bafang-30",
  ];
  const avisos = [
    "xiaomi-14",
    "xiaomi-15",
    "ninebot-14",
    "ninebot-19",
    "bafang-04",
    "bafang-21",
  ];
  assert.equal(catalogoDiagnosticos.length, criticos.length + avisos.length);
  for (const item of catalogoDiagnosticos) {
    assert.ok(criticos.includes(item.id) || avisos.includes(item.id));
    const esperado = criticos.includes(item.id) ? "critical" : "warning";
    const linhas = resultadoCatalogo(item).resultados;
    assert.equal(linhas[0].severity, esperado);
    assert.equal(
      obterGravidade(linhas).rotulo,
      esperado === "critical" ? "Crítica" : "Atenção",
    );
    assert.equal(linhas[0].verification_status, "pending");
    assert.equal(
      linhas[0].severity_reference_url,
      item.referenciaGravidade.url,
    );
  }
  assert.equal(
    catalogoDiagnosticos.find((item) => item.id === "ninebot-19").estado,
    "Definição pendente",
  );
});
