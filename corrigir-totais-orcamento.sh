#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/Orcamento.jsx"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: não encontrei $ARQUIVO"
  echo "Execute este script na pasta ~/ediagnostico."
  exit 1
fi

python3 - "$ARQUIVO" <<'PY'
from pathlib import Path
import re
import sys

arquivo = Path(sys.argv[1])
conteudo = arquivo.read_text()

padrao = re.compile(
    r"  const totalMO = itensSelecionados\.reduce\(.*?"
    r"  const total = totalMO \+ totalMA;",
    re.DOTALL,
)

novo_bloco = """  const totalMO = itensSelecionados.reduce(
    (soma, servico) => soma + calcularValores(servico).maoDeObra,
    0,
  );

  const totalMA = itensSelecionados.reduce(
    (soma, servico) => soma + calcularValores(servico).materiais,
    0,
  );

  const total = totalMO + totalMA;"""

correspondencias = list(padrao.finditer(conteudo))

if len(correspondencias) != 1:
    print(
        "Erro: não encontrei exatamente um bloco de totais esperado. "
        "Nenhuma alteração foi feita."
    )
    sys.exit(1)

if "function calcularValores(servico)" not in conteudo:
    print(
        "Erro: a função calcularValores(servico) não foi encontrada. "
        "Nenhuma alteração foi feita."
    )
    sys.exit(1)

backup = arquivo.with_suffix(".jsx.bak-totais")
backup.write_text(conteudo)

conteudo = padrao.sub(novo_bloco, conteudo, count=1)
arquivo.write_text(conteudo)

print(f"Backup criado: {backup}")
print("Cálculos de MO e MA atualizados.")
PY

echo
echo "Verificando compilação do frontend..."
cd frontend
npm run build

echo
echo "Concluído. Confira o orçamento no navegador."
