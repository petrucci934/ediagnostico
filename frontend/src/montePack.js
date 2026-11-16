export const limitesPack = { serie: 12, paralelo: 8 };

export function calcularPack({ serie, paralelo, tensao, capacidade }) {
  const valores = [serie, paralelo, tensao, capacidade].map((v) =>
    typeof v === "string" && !v.trim()
      ? NaN
      : Number(String(v).replace(",", ".")),
  );
  const [s, p, v, ah] = valores;
  if (
    !valores.every(Number.isFinite) ||
    !Number.isInteger(s) ||
    !Number.isInteger(p) ||
    s < 1 ||
    s > limitesPack.serie ||
    p < 1 ||
    p > limitesPack.paralelo ||
    v < 0.01 ||
    v > 10 ||
    ah < 0.01 ||
    ah > 100
  )
    return null;
  return {
    configuracao: `${s}S${p}P`,
    celulas: s * p,
    tensao: s * v,
    capacidade: p * ah,
    energia: s * v * p * ah,
  };
}

// Uma coluna é um grupo paralelo. A orientação alterna entre colunas.
export function polaridadePack(grupo, face) {
  return (grupo % 2 === 0) === (face === "superior") ? "+" : "−";
}

export function conexoesPack(serie, paralelo, face) {
  const chapas = [];
  for (let g = 0; g < serie; g++) {
    chapas.push({
      id: `${face}-grupo-${g}`,
      tipo: "paralelo",
      grupo: g,
      terminais: Array.from({ length: paralelo }, (_, c) => ({
        grupo: g,
        celula: c,
        polo: polaridadePack(g, face),
      })),
    });
    if (g < serie - 1 && polaridadePack(g, face) === "+") {
      chapas.push({
        id: `${face}-serie-${g}`,
        tipo: "serie",
        grupo: g,
        terminais: [
          { grupo: g, celula: 0, polo: "+" },
          { grupo: g + 1, celula: 0, polo: "−" },
        ],
      });
    }
  }
  return chapas;
}

// Pontos de leitura: B0 = negativo geral; Bn = positivo do grupo n.
// Cada nó aparece uma vez, na ponte de série ou no terminal livre.
export function pontosBmsPack(serie, face) {
  const pontos = [];
  if (face === "inferior") pontos.push({ numero: 0, grupo: 0, ponte: false });
  for (let g = 0; g < serie; g++) {
    if (polaridadePack(g, face) === "+")
      pontos.push({ numero: g + 1, grupo: g, ponte: g < serie - 1 });
  }
  return pontos;
}
