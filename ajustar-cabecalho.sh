#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.jsx"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: arquivo $ARQUIVO não encontrado."
  exit 1
fi

if ! grep -q 'className="marca"' "$ARQUIVO"; then
  echo "Erro: bloco da marca não encontrado. Nenhuma alteração realizada."
  exit 1
fi

# Cria backup antes da alteração.
BACKUP="${ARQUIVO}.bak-cabecalho-$(date +%Y%m%d-%H%M%S)"
cp "$ARQUIVO" "$BACKUP"

python3 - "$ARQUIVO" <<'PY'
from pathlib import Path
import re
import sys

arquivo = Path(sys.argv[1])
conteudo = arquivo.read_text(encoding="utf-8")

padrao = re.compile(
    r'(<a className="marca" href="/" aria-label="E-Diagnóstico, início">\s*'
    r'<span className="marca-icone">\s*'
    r'<img src="/icone-bicicleta\.png" alt="" />\s*'
    r'</span>\s*<span>\s*)'
    r'<strong>.*?</strong>\s*'
    r'<small>.*?</small>'
    r'(\s*</span>\s*</a>)',
    re.DOTALL,
)

substituto = (
    r'\g<1><strong>E-DIAGNÓSTICO</strong>\n'
    r'              <small>BICICLETAS · MOTOS · SCOOTERS ELÉTRICAS</small>'
    r'\g<2>'
)

novo_conteudo, quantidade = padrao.subn(substituto, conteudo, count=1)

if quantidade != 1:
    print("Erro: bloco esperado não encontrado exatamente como previsto.")
    print("O arquivo original foi preservado; nenhum conteúdo foi alterado.")
    sys.exit(1)

arquivo.write_text(novo_conteudo, encoding="utf-8")
print("Cabeçalho atualizado com sucesso.")
PY

echo
echo "Backup criado: $BACKUP"
echo
echo "Verificando se o ícone existe..."
if [[ -f "frontend/public/icone-bicicleta.png" ]]; then
  echo "Ícone encontrado."
else
  echo "ATENÇÃO: frontend/public/icone-bicicleta.png não encontrado."
  echo "Será necessário colocar a imagem da bicicleta nessa pasta."
fi

echo
echo "Executando build do frontend..."
cd frontend
npm run build

echo
echo "Concluído. Confira o cabeçalho no navegador."
