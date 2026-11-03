import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { filtrarArtigos } from "../src/bibliotecaUtils.js";
const artigos = JSON.parse(
  readFileSync(
    new URL("../src/data/artigos-biblioteca.json", import.meta.url),
    "utf8",
  ),
);

test("busca ignora acentos e encontra conteúdo no corpo do texto", () => {
  assert.ok(
    filtrarArtigos(artigos, { busca: "TENSAO NOMINAL" }).some(
      (a) => a.id === "baterias-etiqueta",
    ),
  );
  assert.equal(
    filtrarArtigos(artigos, { busca: "osciloscopio", categoria: "Baterias" })[0]
      .id,
    "baterias-avaliacao-tecnica",
  );
});
test("combina termos de pesquisa com categoria, nível e fabricante", () => {
  assert.equal(
    filtrarArtigos(artigos, {
      busca: "bancada evidencias",
      categoria: "Baterias",
      nivel: "Intermediário",
      fabricante: "Geral",
    }).length,
    1,
  );
  assert.equal(
    filtrarArtigos(artigos, {
      busca: "bancada",
      categoria: "Baterias",
      nivel: "Introdutório",
    }).length,
    0,
  );
  assert.equal(
    filtrarArtigos(artigos, { categoria: "Categoria inexistente" }).length,
    0,
  );
  assert.equal(
    filtrarArtigos(artigos, { busca: "palavra-inexistente" }).length,
    0,
  );
});
test("ordena sem modificar o catálogo e restaura todos os textos ao limpar", () => {
  const ids = artigos.map((a) => a.id);
  const ordenados = filtrarArtigos(artigos, { ordem: "titulo" });
  assert.deepEqual(
    ordenados.map((a) => a.titulo),
    [...artigos]
      .map((a) => a.titulo)
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
  );
  assert.deepEqual(
    artigos.map((a) => a.id),
    ids,
  );
  assert.equal(filtrarArtigos(artigos).length, 84);
});
test("documentos possuem identificadores únicos para navegação por seções", () => {
  const anchors = artigos.flatMap((artigo) => [
    artigo.id,
    ...artigo.secoes.map((secao) => `${artigo.id}-${secao.id}`),
    `${artigo.id}-referencias`,
  ]);
  assert.equal(anchors.length, new Set(anchors).size);
});

test("a categoria Baterias cobre os quinze temas na ordem de estudo", () => {
  const bateria = filtrarArtigos(artigos, {
    categoria: "Baterias",
    ordem: "trilha",
  });
  assert.equal(bateria.length, 15);
  assert.deepEqual(
    bateria.map((a) => a.ordem),
    Array.from({ length: 15 }, (_, i) => i + 1),
  );
  assert.equal(new Set(bateria.map((a) => a.tema)).size, 15);
  assert.equal(bateria[4].id, "baterias-celulas-18650");
  assert.equal(bateria[5].id, "baterias-celulas-21700");
  assert.equal(bateria[10].id, "baterias-desbalanceamento");
  assert.equal(bateria[11].id, "baterias-avaliacao-tecnica");
});
test("os novos temas entram na pesquisa e nos filtros de nível", () => {
  assert.equal(
    filtrarArtigos(artigos, { busca: "18650", nivel: "Intermediário" }).some(
      (a) => a.id === "baterias-celulas-18650",
    ),
    true,
  );
  assert.equal(
    filtrarArtigos(artigos, { busca: "desbalanceamento" }).some(
      (a) => a.id === "baterias-desbalanceamento",
    ),
    true,
  );
  assert.equal(
    filtrarArtigos(artigos, {
      busca: "transporte",
      nivel: "Introdutório",
    }).some((a) => a.id === "baterias-armazenamento-transporte"),
    true,
  );
});

test("as seis categorias têm todos os 84 conteúdos em sequência", () => {
  const esperado = {
    Baterias: 15,
    "Bicicletas Elétricas": 15,
    Controladoras: 16,
    "Fluxos de Diagnóstico": 5,
    "Patinetes Elétricos": 16,
    "Scooters Elétricas": 17,
  };
  assert.deepEqual(
    new Set(artigos.map((a) => a.categoria)),
    new Set(Object.keys(esperado)),
  );
  for (const [categoria, quantidade] of Object.entries(esperado)) {
    const textos = filtrarArtigos(artigos, { categoria });
    assert.equal(textos.length, quantidade, categoria);
    assert.deepEqual(
      textos.map((a) => a.ordem),
      Array.from({ length: quantidade }, (_, i) => i + 1),
      categoria,
    );
    assert.equal(
      new Set(textos.map((a) => a.tema)).size,
      quantidade,
      categoria,
    );
  }
});
test("cada leitura tem corpo próprio, seções navegáveis e referências", () => {
  const paragrafos = new Set();
  for (const artigo of artigos) {
    assert.ok(artigo.secoes.length >= 4, artigo.id);
    assert.ok(artigo.fontes.length > 0, artigo.id);
    for (const fonte of artigo.fontes)
      assert.equal(new URL(fonte.url).protocol, "https:");
    const palavras = artigo.secoes
      .flatMap((s) => s.blocos.flatMap((b) => b.itens ?? [b.texto]))
      .join(" ")
      .split(/\s+/);
    assert.ok(palavras.length >= 120, artigo.id);
    for (const secao of artigo.secoes)
      for (const bloco of secao.blocos) {
        if (bloco.texto?.length > 100) {
          assert.ok(
            !paragrafos.has(bloco.texto),
            `Parágrafo repetido: ${artigo.id}`,
          );
          paragrafos.add(bloco.texto);
        }
      }
  }
});
test("pesquisa alcança as cinco novas categorias com e sem acentos", () => {
  for (const [categoria, busca, id] of [
    ["Bicicletas Elétricas", "cadencia", "bicicletas-pas"],
    ["Controladoras", "gate", "controladoras-gate-driver"],
    ["Fluxos de Diagnóstico", "recarga", "fluxos-nao-carrega"],
    ["Patinetes Elétricos", "iluminacao", "patinetes-iluminacao"],
    ["Scooters Elétricas", "conversor", "scooters-dcdc"],
  ])
    assert.ok(
      filtrarArtigos(artigos, { categoria, busca }).some((a) => a.id === id),
      categoria,
    );
});
