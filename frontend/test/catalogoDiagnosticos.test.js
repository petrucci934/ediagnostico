import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catalogoDiagnosticos,
  filtrarCatalogo,
  resultadoCatalogo,
} from "../src/catalogoDiagnosticos.js";
import { obterRoteiroDiagnostico } from "../src/roteiroDiagnostico.js";

test("catálogo distingue códigos de fabricantes diferentes sem transformar 10 em E010", () => {
  assert.equal(catalogoDiagnosticos.length, 14);
  assert.equal(new Set(catalogoDiagnosticos.map((item) => item.id)).size, 14);
  assert.deepEqual(
    filtrarCatalogo({ busca: "10" }).map((item) => item.fabricante),
    ["Xiaomi", "Ninebot"],
  );
  assert.equal(filtrarCatalogo({ busca: "E010" }).length, 0);
  assert.equal(
    filtrarCatalogo({ busca: "8", fabricante: "Bafang" })[0].codigo,
    "08",
  );
  assert.equal(
    filtrarCatalogo({ busca: "10", fabricante: "Segway" })[0].fabricante,
    "Ninebot",
  );
  assert.equal(
    filtrarCatalogo({ busca: "21", fabricante: "Xiaomi" })[0].componente,
    "Bateria / BMS",
  );
  assert.equal(
    filtrarCatalogo({ busca: "21", fabricante: "Bafang" })[0].componente,
    "Sensor de velocidade",
  );
});

test("busca combina assunto sem acento, fabricante e componente", () => {
  assert.equal(
    filtrarCatalogo({
      busca: "comunicacao",
      fabricante: "Bafang",
      componente: "Comunicação",
    })[0].codigo,
    "30",
  );
  assert.equal(filtrarCatalogo({ busca: "inexistente" }).length, 0);
});

test("Xiaomi 10 usa referência Mi e não herda a ficha do Scooter 5 Plus", () => {
  const ficha = filtrarCatalogo({ busca: "10", fabricante: "Xiaomi" })[0];
  assert.match(ficha.modelo, /M365/);
  assert.doesNotMatch(ficha.modelo, /5 Plus/);
  assert.match(ficha.roteiro.url, /KA-07514/);
  assert.match(ficha.roteiro.sintomas, /motor sem resposta/);
  assert.ok(ficha.roteiro.verificacoes.length > 1);
  assert.doesNotMatch(ficha.roteiro.verificacoes.join(" "), /[45][ -]?pinos/i);
  const outraFicha = filtrarCatalogo({ busca: "14", fabricante: "Xiaomi" })[0];
  assert.equal(outraFicha.modelo, "Electric Scooter 5 Plus");
});

test("todas as fichas possuem sequência própria sem substituir códigos ou compatibilidades", () => {
  assert.equal(catalogoDiagnosticos.length, 14);
  for (const ficha of catalogoDiagnosticos) {
    assert.ok(ficha.roteiro.verificacoes.length >= 2, ficha.id);
    assert.ok(ficha.roteiro.observacao.length > 25, ficha.id);
    assert.ok(ficha.roteiro.proximoPasso.length > 25, ficha.id);
    assert.doesNotMatch(
      ficha.roteiro.sintomas,
      /^Sintomas específicos não documentados/,
      ficha.id,
    );
  }
  assert.equal(
    new Set(catalogoDiagnosticos.map((item) => item.roteiro.proximoPasso)).size,
    14,
  );
  assert.equal(
    filtrarCatalogo({ busca: "motor sem resposta", fabricante: "Xiaomi" })[0]
      .codigo,
    "10",
  );
  const bafang08 = filtrarCatalogo({ busca: "08", fabricante: "Bafang" })[0];
  assert.match(bafang08.roteiro.verificacoes[0], /FM\/RM/);
  assert.match(bafang08.roteiro.url, /202209091004265437/);
});

test("cada ficha tem fonte oficial, validação pendente e roteiro associado ao fabricante correto", () => {
  for (const item of catalogoDiagnosticos) {
    const resultado = resultadoCatalogo(item);
    assert.equal(resultado.resultados[0].verification_status, "pending");
    assert.ok(["critical", "warning"].includes(resultado.resultados[0].severity));
    assert.equal(resultado.resultados[0].severity_origin, "external_reference");
    assert.ok(
      ["www.mi.com", "store.segway.com", "www.bafang-e.com"].includes(
        new URL(item.roteiro.url).hostname,
      ),
    );
    assert.equal(obterRoteiroDiagnostico(resultado), item.roteiro);
    assert.equal(
      obterRoteiroDiagnostico({ ...resultado, codigo: "E010" }),
      null,
    );
  }
  const revisao = filtrarCatalogo({ busca: "19", fabricante: "Ninebot" })[0];
  assert.equal(revisao.estado, "Definição pendente");
  assert.doesNotMatch(revisao.descricao, /temperatura/i);
});
