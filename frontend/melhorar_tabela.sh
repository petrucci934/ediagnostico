#!/usr/bin/env bash
set -Eeuo pipefail

ARQUIVO="src/TabelaPrecosNeon.jsx"
CSS="src/App.css"
BACKUP_DIR=".backup-tabela-$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$ARQUIVO" || ! -f "$CSS" ]]; then
  echo "ERRO: não encontrei os arquivos esperados."
  echo "Pasta atual: $(pwd)"
  echo "Entre em ~/ediagnostico/frontend e tente novamente."
  exit 1
fi

mkdir -p "$BACKUP_DIR"
cp -p "$ARQUIVO" "$BACKUP_DIR/TabelaPrecosNeon.jsx"
cp -p "$CSS" "$BACKUP_DIR/App.css"

echo "Backups criados em: $BACKUP_DIR"

if ! python3 - "$ARQUIVO" "$CSS" <<'PY'
from pathlib import Path
import re
import sys

jsx_path = Path(sys.argv[1])
css_path = Path(sys.argv[2])

jsx = jsx_path.read_text(encoding="utf-8")
css = css_path.read_text(encoding="utf-8")

# Evita aplicar a mesma alteração duas vezes.
if "EDIAGNOSTICO-CATEGORIAS-SERVICOS-V1" in css:
    print("ERRO: o estilo desta atualização já existe. Nenhuma alteração feita.")
    sys.exit(1)

# Confirma a estrutura esperada antes de modificar qualquer arquivo.
if "const servicos = [" not in jsx:
    print("ERRO: não encontrei a lista de serviços esperada.")
    sys.exit(1)

if jsx.count("servicos.slice(0, 5)") != 1:
    print("ERRO: não encontrei exatamente uma lista de referência antiga.")
    sys.exit(1)

if not re.search(r"<tbody>\s*\{servicos\.map\(\(servico\)", jsx):
    print("ERRO: a tabela não corresponde à estrutura esperada.")
    sys.exit(1)

categorias = {
    "Inspeção de segurança completa": "Segurança e inspeção geral",
    "Ajuste de freios": "Freios",
    "Troca de pastilhas de freio": "Freios",
    "Inspeção e calibragem de pneus": "Pneus e rodas",
    "Troca de pneu": "Pneus e rodas",
    "Inspeção da bateria": "Bateria e sistema elétrico",
    "Inspeção do sistema elétrico": "Bateria e sistema elétrico",
    "Diagnóstico de falha elétrica": "Bateria e sistema elétrico",
    "Inspeção do motor elétrico": "Motor, suspensão e transmissão",
    "Inspeção da suspensão": "Motor, suspensão e transmissão",
    "Lubrificação e ajuste de cabos": "Motor, suspensão e transmissão",
    "Inspeção de iluminação": "Iluminação",
}

# Adiciona a categoria a cada serviço sem modificar tempo, descrição ou preço.
for nome, categoria in categorias.items():
    padrao = re.compile(
        r'(?P<obj>\{\s*nome:\s*["\']'
        + re.escape(nome)
        + r'["\'].*?\bminutos:\s*\d+\s*,?\s*\})',
        re.DOTALL,
    )
    encontrados = list(padrao.finditer(jsx))
    if len(encontrados) != 1:
        print(f"ERRO: esperava encontrar uma definição de '{nome}', encontrei {len(encontrados)}.")
        sys.exit(1)

    trecho = encontrados[0].group("obj")
    if "categoria:" in trecho:
        print(f"ERRO: o serviço '{nome}' já contém uma categoria.")
        sys.exit(1)

    trecho_novo = re.sub(
        r"(\bminutos:\s*\d+)(\s*,?)",
        lambda m: m.group(1) + "," + m.group(2).replace(",", ""),
        trecho,
        count=1,
    )
    trecho_novo = re.sub(
        r"(\bminutos:\s*\d+,)",
        r'\1 categoria: "' + categoria + '"',
        trecho_novo,
        count=1,
    )
    jsx = jsx[:encontrados[0].start("obj")] + trecho_novo + jsx[encontrados[0].end("obj"):]

# Adiciona o helper que seleciona referências conforme a descrição da revisão.
helper = r'''
function obterServicosReferencia(revisao) {
  const texto = `${revisao.nome} ${revisao.descricao}`.toLowerCase();
  const nomes = new Set([
    "Inspeção de segurança completa",
    "Inspeção e calibragem de pneus",
    "Inspeção de iluminação",
  ]);

  if (texto.includes("bateria")) {
    nomes.add("Inspeção da bateria");
  }

  if (
    texto.includes("elétr") ||
    texto.includes("controlador") ||
    texto.includes("carregador")
  ) {
    nomes.add("Inspeção do sistema elétrico");
  }

  if (texto.includes("motor")) {
    nomes.add("Inspeção do motor elétrico");
  }

  if (texto.includes("freio") || texto.includes("pastilha")) {
    nomes.add("Ajuste de freios");
    nomes.add("Troca de pastilhas de freio");
  }

  return servicos.filter((servico) => nomes.has(servico.nome));
}
'''

if "function obterServicosReferencia(revisao)" in jsx:
    print("ERRO: a função de referência já existe.")
    sys.exit(1)

# Insere o helper imediatamente antes do componente principal.
component_match = re.search(r"function TabelaPrecosNeon\b|const TabelaPrecosNeon\s*=", jsx)
if not component_match:
    print("ERRO: não encontrei a declaração do componente TabelaPrecosNeon.")
    sys.exit(1)

jsx = jsx[:component_match.start()] + helper + "\n" + jsx[component_match.start():]

# Importa Fragment para agrupar as linhas de cada categoria.
if re.search(r'import\s*\{[^}]*\bFragment\b', jsx):
    pass
elif re.search(r'import\s*\{\s*useState\s*\}\s*from\s*["\']react["\']', jsx):
    jsx = re.sub(
        r'import\s*\{\s*useState\s*\}\s*from\s*(["\']react["\'])',
        r'import { Fragment, useState } from \1',
        jsx,
        count=1,
    )
else:
    print("ERRO: não encontrei o import esperado de useState do React.")
    sys.exit(1)

# Renderiza um cabeçalho sempre que começa uma nova categoria.
padrao_tbody = re.compile(
    r'<tbody>\s*\{servicos\.map\(\(servico\)\s*=>\s*\(\s*'
    r'<tr key=\{servico\.nome\}>.*?</tr>\s*\)\)\}\s*</tbody>',
    re.DOTALL,
)

novo_tbody = r'''<tbody>
  {servicos.map((servico, index) => (
    <Fragment key={servico.nome}>
      {(index === 0 || servicos[index - 1].categoria !== servico.categoria) && (
        <tr className="linha-categoria-servicos">
          <th colSpan={4} scope="colgroup">{servico.categoria}</th>
        </tr>
      )}
      <tr>
        <th scope="row">{servico.nome}</th>
        <td>{servico.descricao}</td>
        <td>{servico.minutos} min</td>
        <td>{exibirPreco(servico.minutos)}</td>
      </tr>
    </Fragment>
  ))}
</tbody>'''

jsx, quantidade = padrao_tbody.subn(novo_tbody, jsx, count=1)
if quantidade != 1:
    print("ERRO: não consegui substituir a tabela com segurança.")
    sys.exit(1)

# A lista de referência deixa de exibir os mesmos cinco serviços em toda revisão.
jsx = jsx.replace(
    "servicos.slice(0, 5).map((servico) => (",
    "obterServicosReferencia(revisao).map((servico) => (",
    1,
)

# Estilo específico da tabela: preserva o restante do CSS.
css_extra = r'''

/* EDIAGNOSTICO-CATEGORIAS-SERVICOS-V1 */
.servicos-individuais-neon .tabela-precos-rolagem {
  overflow-x: auto;
  border: 1px solid #263b50;
  border-radius: 12px;
  background: #0b1422;
  scrollbar-width: thin;
  scrollbar-color: #47734b #101c2b;
}

.servicos-individuais-neon .tabela-precos-rolagem table {
  width: 100%;
  min-width: 620px;
  border-collapse: separate;
  border-spacing: 0;
}

.servicos-individuais-neon .tabela-precos-rolagem thead th {
  padding: 15px 14px;
  background: #142438;
  color: #b3f36b;
  font-size: 0.9rem;
  text-align: left;
  border-bottom: 1px solid #354b60;
}

.servicos-individuais-neon .tabela-precos-rolagem tbody th,
.servicos-individuais-neon .tabela-precos-rolagem tbody td {
  padding: 13px 14px;
  border-bottom: 1px solid #203247;
  text-align: left;
  vertical-align: top;
}

.servicos-individuais-neon .tabela-precos-rolagem tbody tr:not(.linha-categoria-servicos):hover {
  background: rgba(179, 243, 107, 0.055);
}

.servicos-individuais-neon .tabela-precos-rolagem tbody th[scope="row"] {
  color: #f1f6fb;
  font-weight: 600;
}

.servicos-individuais-neon .tabela-precos-rolagem td:last-child {
  color: #b3f36b;
  white-space: nowrap;
  font-weight: 700;
}

.servicos-individuais-neon .tabela-precos-rolagem .linha-categoria-servicos th {
  padding: 11px 14px;
  background: #172c35;
  color: #b3f36b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-top: 1px solid #355748;
  border-bottom: 1px solid #355748;
}

@media (max-width: 700px) {
  .servicos-individuais-neon .tabela-precos-rolagem {
    border-radius: 9px;
  }

  .servicos-individuais-neon .tabela-precos-rolagem thead th,
  .servicos-individuais-neon .tabela-precos-rolagem tbody th,
  .servicos-individuais-neon .tabela-precos-rolagem tbody td {
    padding: 11px 10px;
    font-size: 0.88rem;
  }
}
'''

# Verificações finais em memória, antes de gravar os arquivos.
if jsx.count("obterServicosReferencia(revisao).map") != 1:
    print("ERRO: a lista de referências não foi atualizada corretamente.")
    sys.exit(1)

if len(re.findall(r'categoria:\s*"', jsx)) < len(categorias):
    print("ERRO: nem todas as categorias foram adicionadas.")
    sys.exit(1)

jsx_path.write_text(jsx, encoding="utf-8")
css_path.write_text(css + css_extra, encoding="utf-8")
print("Arquivos atualizados.")
PY
then
  echo "Nenhuma alteração foi aplicada com sucesso."
  exit 1
fi

echo
echo "Executando a compilação de produção..."
if npm run build; then
  echo
  echo "SUCESSO: a compilação terminou sem erros."
  echo "Backups originais: $BACKUP_DIR"
  echo "Agora confira a tabela no navegador."
else
  echo
  echo "ERRO: a compilação falhou. Restaurando os arquivos originais..."
  cp -p "$BACKUP_DIR/TabelaPrecosNeon.jsx" "$ARQUIVO"
  cp -p "$BACKUP_DIR/App.css" "$CSS"
  echo "Arquivos restaurados. Backups mantidos em: $BACKUP_DIR"
  exit 1
fi
