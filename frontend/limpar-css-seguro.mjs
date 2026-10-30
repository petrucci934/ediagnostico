import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const arquivo = path.resolve("src/App.css");
const pastaRelatorio = path.resolve("relatorio-css");
const aplicar = process.argv.includes("--aplicar");

if (!fs.existsSync(arquivo)) {
  console.error(`Arquivo não encontrado: ${arquivo}`);
  process.exit(1);
}

const original = fs.readFileSync(arquivo, "utf8");
const raiz = postcss.parse(original, { from: arquivo });

let declaracoesRemovidas = 0;
let regrasVaziasRemovidas = 0;
let blocosVaziosRemovidos = 0;

// 1. Remove declarações rigorosamente idênticas
// somente dentro do mesmo bloco CSS, preservando a última.
raiz.walkRules((regra) => {
  if (!regra.nodes) return;

  const vistas = new Map();

  for (const no of [...regra.nodes]) {
    if (no.type !== "decl") continue;

    const chave = JSON.stringify([
      no.prop,
      no.value,
      no.important,
    ]);

    if (vistas.has(chave)) {
      vistas.get(chave).remove();
      declaracoesRemovidas++;
    }

    vistas.set(chave, no);
  }
});

// 2. Remove regras sem declarações nem conteúdo.
raiz.walkRules((regra) => {
  const temConteudo = regra.nodes?.some(
    (no) => no.type !== "comment",
  );

  if (!temConteudo) {
    regra.remove();
    regrasVaziasRemovidas++;
  }
});

// 3. Remove @media e outros blocos vazios.
// Percorre de dentro para fora para tratar blocos aninhados.
raiz.walkAtRules((bloco) => {
  if (!bloco.nodes) return;

  const temConteudo = bloco.nodes.some(
    (no) => no.type !== "comment",
  );

  if (!temConteudo) {
    bloco.remove();
    blocosVaziosRemovidos++;
  }
});

// 4. Identifica seletores repetidos, mas não os apaga.
const ocorrencias = new Map();

raiz.walkRules((regra) => {
  const seletor = regra.selector?.trim();
  if (!seletor) return;

  if (!ocorrencias.has(seletor)) {
    ocorrencias.set(seletor, []);
  }

  ocorrencias.get(seletor).push(regra.source?.start?.line ?? "?");
});

const repetidos = [...ocorrencias.entries()]
  .filter(([, linhas]) => linhas.length > 1)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([seletor, linhas]) =>
    `${seletor}\n  Ocorrências: ${linhas.join(", ")}`,
  );

const resultado = raiz.toString();
const mudou = resultado !== original;

fs.mkdirSync(pastaRelatorio, { recursive: true });

const relatorio = [
  "LIMPEZA CSS SEGURA",
  `Modo: ${aplicar ? "APLICAÇÃO" : "SIMULAÇÃO"}`,
  `Arquivo: ${arquivo}`,
  `Declarações duplicadas removidas: ${declaracoesRemovidas}`,
  `Regras vazias removidas: ${regrasVaziasRemovidas}`,
  `Blocos vazios removidos: ${blocosVaziosRemovidos}`,
  `Arquivo modificado: ${mudou ? "sim" : "não"}`,
  "",
  "SELETORES REPETIDOS PARA REVISÃO MANUAL",
  "As ocorrências abaixo não foram apagadas automaticamente.",
  "",
  repetidos.length
    ? repetidos.join("\n\n")
    : "Nenhum seletor repetido encontrado.",
].join("\n");

fs.writeFileSync(
  path.join(pastaRelatorio, "limpeza-segura.txt"),
  relatorio + "\n",
);

if (aplicar && mudou) {
  const data = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backup = `${arquivo}.backup-seguro-${data}`;
  fs.copyFileSync(arquivo, backup);
  fs.writeFileSync(arquivo, resultado, "utf8");

  console.log(`Backup criado: ${backup}`);
  console.log("CSS atualizado.");
} else if (!aplicar) {
  console.log("SIMULAÇÃO: o App.css não foi alterado.");
} else {
  console.log("Nenhuma alteração necessária.");
}

console.log(relatorio);
console.log("\nRelatório: relatorio-css/limpeza-segura.txt");
