#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.jsx"
BACKUP="${ARQUIVO}.bak-$(date +%Y%m%d-%H%M%S)"

cp "$ARQUIVO" "$BACKUP"
echo "Backup criado: $BACKUP"

python3 - "$ARQUIVO" <<'PY'
from pathlib import Path
import sys

arquivo = Path(sys.argv[1])
texto = arquivo.read_text()

antigo = '''                { valor: "mecanico", texto: "Mecânico" },
                { valor: "revisor", texto: "Supervisor" },
                { valor: "admin", texto: "Administrador" },
                { valor: "cliente", texto: "Cliente" },'''

novo = '''                { valor: "admin", texto: "Administrador" },
                { valor: "cliente", texto: "Cliente" },
                { valor: "mecanico", texto: "Mecânico" },
                { valor: "revisor", texto: "Supervisor" },'''

if antigo not in texto:
    print("Não encontrei o array com a formatação esperada.")
    print("Nenhuma alteração foi feita pelo script.")
    sys.exit(1)

arquivo.write_text(texto.replace(antigo, novo, 1))
print("Perfis reorganizados em ordem alfabética.")
PY

npm run build --prefix frontend
