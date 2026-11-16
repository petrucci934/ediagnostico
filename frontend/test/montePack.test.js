import test from "node:test";
import assert from "node:assert/strict";
import {
  calcularPack,
  conexoesPack,
  polaridadePack,
  pontosBmsPack,
} from "../src/montePack.js";

test("exemplo 3S2P e entrada decimal com vírgula", () => {
  const r = calcularPack({
    serie: 3,
    paralelo: 2,
    tensao: "3,7",
    capacidade: "2,5",
  });
  assert.equal(r.configuracao, "3S2P");
  assert.equal(r.celulas, 6);
  assert.ok(Math.abs(r.tensao - 11.1) < 1e-10);
  assert.equal(r.capacidade, 5);
  assert.ok(Math.abs(r.energia - 55.5) < 1e-10);
});

test("rejeita entradas vazias, não finitas, fora dos limites e S/P fracionários", () => {
  const base = { serie: 3, paralelo: 2, tensao: 3.7, capacidade: 2.5 };
  for (const [campo, valores] of Object.entries({
    serie: ["", 0, 13, 1.5],
    paralelo: ["", 0, 9, 2.5],
    tensao: ["", 0, -1, 11, Infinity],
    capacidade: ["", 0, -1, 101, NaN],
  })) {
    for (const valor of valores)
      assert.equal(calcularPack({ ...base, [campo]: valor }), null);
  }
});

test("todas as configurações: duas faces formam exatamente S+1 nós, sem curto e sem células desconectadas", () => {
  for (let s = 1; s <= 12; s++)
    for (let p = 1; p <= 8; p++) {
      const parent = new Map();
      const key = (t) => `${t.grupo}:${t.celula}:${t.polo}`;
      const find = (a) => {
        if (!parent.has(a)) parent.set(a, a);
        if (parent.get(a) !== a) parent.set(a, find(parent.get(a)));
        return parent.get(a);
      };
      const unir = (a, b) => parent.set(find(a), find(b));
      let pontes = 0;
      for (const face of ["superior", "inferior"]) {
        for (const chapa of conexoesPack(s, p, face)) {
          const [primeiro, ...resto] = chapa.terminais;
          find(key(primeiro));
          for (const t of resto) unir(key(primeiro), key(t));
          if (chapa.tipo === "serie") {
            pontes++;
            assert.equal(primeiro.polo, "+");
            assert.equal(resto[0].polo, "−");
            assert.equal(resto[0].grupo, primeiro.grupo + 1);
          } else
            assert.ok(
              chapa.terminais.every(
                (t) => t.polo === polaridadePack(chapa.grupo, face),
              ),
            );
        }
      }
      assert.equal(pontes, s - 1);
      assert.equal(new Set([...parent.keys()].map(find)).size, s + 1);
      const esperado = new Map();
      for (let g = 0; g < s; g++)
        for (let c = 0; c < p; c++) {
          // O negativo de G1 é nó 0; positivo de G1/negativo de G2 é nó 1 etc.
          for (const polo of ["−", "+"]) {
            const no = g + (polo === "+" ? 1 : 0);
            const raiz = find(key({ grupo: g, celula: c, polo }));
            if (esperado.has(no)) assert.equal(raiz, esperado.get(no));
            else esperado.set(no, raiz);
          }
          assert.notEqual(find(`${g}:${c}:+`), find(`${g}:${c}:−`));
        }
      assert.equal(new Set(esperado.values()).size, s + 1);
      assert.equal(polaridadePack(0, "inferior"), "−");
      assert.notEqual(
        polaridadePack(s - 1, "superior"),
        polaridadePack(s - 1, "inferior"),
      );
    }
});

test("BMS: B0 até BS aparecem uma vez, no positivo de cada grupo e negativo geral", () => {
  for (let s = 1; s <= 12; s++) {
    const pontos = ["superior", "inferior"].flatMap((face) =>
      pontosBmsPack(s, face).map((p) => ({ ...p, face })),
    );
    assert.deepEqual(
      pontos.map((p) => p.numero).sort((a, b) => a - b),
      Array.from({ length: s + 1 }, (_, i) => i),
    );
    for (const p of pontos) {
      assert.equal(p.grupo, Math.max(0, p.numero - 1));
      assert.equal(polaridadePack(p.grupo, p.face), p.numero === 0 ? "−" : "+");
      assert.equal(p.ponte, p.numero > 0 && p.numero < s);
    }
  }
});
