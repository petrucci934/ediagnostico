import { test } from "node:test";
import assert from "node:assert/strict";
import {
  atualizarHistorico,
  validarHistorico,
  restaurarFiltrosHistorico,
} from "../src/historicoConsultas.js";

test("salva e reabre referência do catálogo preservando origem, código e modelo", () => {
  const entrada = {
    codigo: "08",
    fabricante: "Bafang",
    modelo: "Família e display a confirmar",
    referenciaId: "bafang-08",
    fabricanteId: "5",
  };
  const historico = atualizarHistorico(
    [],
    entrada,
    new Date("2026-11-13T17:00:00Z"),
  );
  const salvo = JSON.parse(JSON.stringify(historico));
  assert.equal(salvo[0].codigo, "08");
  assert.equal(salvo[0].referenciaId, "bafang-08");
  assert.equal(salvo[0].origem, "catalogo");
  assert.equal(salvo[0].modeloId, "");
  assert.equal(atualizarHistorico(salvo, entrada).length, 1);
});

test("consultas de fabricantes diferentes não são confundidas e repetir move para o início", () => {
  let historico = atualizarHistorico([], {
    codigo: "10",
    fabricante: "Xiaomi",
    referenciaId: "xiaomi-10",
  });
  historico = atualizarHistorico(historico, {
    codigo: "10",
    fabricante: "Ninebot",
    referenciaId: "ninebot-10",
  });
  assert.equal(historico.length, 2);
  historico = atualizarHistorico(historico, {
    codigo: "10",
    fabricante: "Xiaomi",
    referenciaId: "xiaomi-10",
  });
  assert.deepEqual(
    historico.map((item) => item.fabricante),
    ["Xiaomi", "Ninebot"],
  );
});

test("restaura modelo por ID dentro do fabricante e mantém compatibilidade com histórico antigo", () => {
  const fabricantes = [
    { id: 2, name: "SHIMANO" },
    { id: 3, name: "Segway" },
  ];
  const modelos = [
    { id: 7, manufacturer_id: 2, model_name: "Modelo A" },
    { id: 8, manufacturer_id: 3, model_name: "Modelo A" },
  ];
  assert.deepEqual(
    restaurarFiltrosHistorico(
      { fabricante: "Nome antigo", fabricanteId: "2", modeloId: "7" },
      fabricantes,
      modelos,
    ),
    { fabricanteId: "2", modeloId: "7" },
  );
  assert.deepEqual(
    restaurarFiltrosHistorico(
      { fabricante: "SHIMANO", modelo: "Modelo A" },
      fabricantes,
      modelos,
    ),
    { fabricanteId: "2", modeloId: "7" },
  );
  assert.equal(
    restaurarFiltrosHistorico({ fabricante: "Ninebot" }, fabricantes, modelos)
      .fabricanteId,
    "3",
  );
  assert.equal(
    restaurarFiltrosHistorico(
      { fabricanteId: "2", modeloId: "8" },
      fabricantes,
      modelos,
    ).modeloId,
    "",
  );
});

test("histórico inválido não derruba a tela", () => {
  assert.deepEqual(validarHistorico({ codigo: "E010" }), []);
  assert.deepEqual(
    validarHistorico([null, {}, { codigo: "E010", fabricante: "SHIMANO" }]),
    [{ codigo: "E010", fabricante: "SHIMANO" }],
  );
});
