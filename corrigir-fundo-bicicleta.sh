#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.css"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: $ARQUIVO não encontrado."
  exit 1
fi

# Confirma que a regra verde esperada existe.
if ! grep -Fq '.marca-icone {' "$ARQUIVO" ||
   ! grep -Fq 'background: #b7f36b;' "$ARQUIVO"; then
  echo "Não encontrei a regra esperada. Nenhuma alteração realizada."
  exit 1
fi

BACKUP="${ARQUIVO}.bak-fundo-bicicleta-$(date +%Y%m%d-%H%M%S)"
cp "$ARQUIVO" "$BACKUP"

python3 <<'PY'
from pathlib import Path

arquivo = Path("frontend/src/App.css")
css = arquivo.read_text(encoding="utf-8")

antigo = """.marca-icone {
  background: #b7f36b;
  color: #102015;
}"""

novo = """.marca-icone {
  background: transparent !important;
  color: #b7f36b;
  border: none;
  box-shadow: none;
}

.cabecalho .marca-icone img {
  display: block;
  width: 38px;
  height: 38px;
  object-fit: contain;
}"""

if antigo not in css:
    raise SystemExit("Bloco exato não encontrado; arquivo não foi alterado.")

arquivo.write_text(css.replace(antigo, novo, 1), encoding="utf-8")
print("Fundo verde removido da área do ícone.")
PY

echo "Backup: $BACKUP"
cd frontend
npm run build
