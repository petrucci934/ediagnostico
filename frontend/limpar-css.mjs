import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const arquivo = path.resolve("src/App.css");
const pastaRelatorio = path.resolve("relatorio-css");
const modo = process.argv.includes("--aplicar");

if (!fs.existsSync(arquivo)) {
  console.error("Arquivo não encontrado:", arquivo);
  process.exit(1);
}

const original = fs.readFileSync(arquivo, "utf8");
const raiz = postcss.parse(original, { from: arquivo });

let declaracoesRemovidas = 0;
let blocosRemovidos = 0;

// Remove declarações idênticas repetidas dentro da mesma regra.
raiz.walkRules((regra) => {
  const vistas = new Set();

  regra.walkDecls((decl) => {
    const chave = `${decl.prop}:${decl.value}:${decl.important}`;

    if (vistas.has(chave)) {
      if (modo) {
        decl.remove();
      }
      declaracoesRemovidas++;
    } else {
      vistas.add(chave);
    }
  });
});

// Identifica regras integralmente idênticas no mesmo contexto CSS.
const regrasVistas = new Map();
const duplicatas = [];

raiz.walkRules((regra) => {
  const declaracoes = [];

  regra.each((no) => {
    if (no.type === "decl") {
      declaracoes.push(
        `${no.prop}:${no.value}${no.important ? "!important" : ""}`
      );
    } else {
      declaracoes.push(`outro:${no.toString()}`);
    }
  });

  if (declaracoes.length === 0) return;

  const contexto = [];
  let pai = regra.parent;

  while (pai && pai.type !== "root") {
    contexto.unshift(`${pai.type}:${pai.name || ""}:${pai.params || ""}`);
    pai = pai.parent;
  }

  const assinatura = JSON.stringify({
    contexto,
    seletor: regra.selector,
    declaracoes,
  });

  if (regrasVistas.has(assinatura)) {
    const primeira = regrasVistas.get(assinatura);

    duplicatas.push({
      seletor: regra.selector,
      linhaOriginal: primeira.linha,
      linhaDuplicada: regra.source?.start?.line ?? "?",
    });

    if (modo) {
      regra.remove();
      blocosRemovidos++;
    }
  } else {
    regrasVistas.set(assinatura, {
      linha: regra.source?.start?.line ?? "?",
    });
  }
});

const relatorioDuplicatas = [
  "DUPLICAÇÕES CSS ENCONTRADAS",
  ...(
    duplicatas.length
      ? duplicatas.map((item) =>
          `${item.seletor}: linha ${item.linhaDuplicada} repete a linha ${item.linhaOriginal}`
        )
      : ["Nenhuma duplicação integral encontrada."]
  ),
].join("\n");

fs.writeFileSync(
  path.resolve("relatorio-css/duplicatas.txt"),
  relatorioDuplicatas + "\n"
);

// Procura classes e IDs declarados no CSS e não encontrados
// literalmente nos arquivos de código. São apenas candidatos.
const arquivosCodigo = [];
const extensoes = new Set([".jsx", ".tsx", ".js", ".ts", ".html"]);

function percorrer(diretorio) {
  if (!fs.existsSync(diretorio)) return;

  for (const item of fs.readdirSync(diretorio, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git", "relatorio-css"].includes(item.name)) {
      continue;
    }

    const caminho = path.join(diretorio, item.name);

    if (item.isDirectory()) {
      percorrer(caminho);
    } else if (extensoes.has(path.extname(item.name))) {
      arquivosCodigo.push({
        caminho,
        conteudo: fs.readFileSync(caminho, "utf8"),
      });
    }
  }
}

percorrer(path.resolve("src"));
percorrer(path.resolve("public"));

const codigo = arquivosCodigo.map((f) => f.conteudo).join("\n");
const candidatos = new Set();

raiz.walkRules((regra) => {
  const regex = /(?:^|[\s>+~,(])([.#][a-zA-Z_][\w-]*)/g;
  let resultado;

  while ((resultado = regex.exec(regra.selector)) !== null) {
    const seletor = resultado[1];
    const tipo = seletor[0];
    const nome = seletor.slice(1);

    // Classes/IDs podem ser montados dinamicamente pelo React.
    const padrao = tipo === "."
      ? new RegExp(`\\b${nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`)
      : new RegExp(`#${nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);

    if (!padrao.test(codigo)) {
      candidatos.add(seletor);
    }
  }
});

fs.mkdirSync(pastaRelatorio, { recursive: true });

const relatorio = [
  "RELATÓRIO DE AUDITORIA CSS",
  `Modo: ${modo ? "APLICAÇÃO" : "SIMULAÇÃO"}`,
  `Declarações repetidas encontradas: ${declaracoesRemovidas}`,
  `Blocos idênticos encontrados: ${blocosRemovidos}`,
  "",
  "Seletores possivelmente não utilizados (revisar manualmente):",
  ...(candidatos.size
    ? [...candidatos].sort().map((s) => `- ${s}`)
    : ["Nenhum candidato encontrado."]),
  "",
  "Atenção: candidatos não são prova de que um seletor está sem uso.",
].join("\n");

fs.writeFileSync(
  path.join(pastaRelatorio, "auditoria.txt"),
  relatorio + "\n"
);

if (modo) {
  const backup = `${arquivo}.bak-limpeza`;
  fs.copyFileSync(arquivo, backup);
  fs.writeFileSync(arquivo, raiz.toString());
  console.log("CSS atualizado:", arquivo);
  console.log("Backup original:", backup);
} else {
  console.log("SIMULAÇÃO: nenhum arquivo CSS foi alterado.");
}

console.log(relatorio);
console.log("\nRelatório salvo em relatorio-css/auditoria.txt");
