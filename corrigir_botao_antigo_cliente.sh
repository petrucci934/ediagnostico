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

inicio = '          {(perfil || perfilEscolhido === "cliente") && ('
fim = '          )}\n        </nav>'

pos_inicio = texto.find(inicio)

if pos_inicio == -1:
    print("ERRO: condição do botão antigo não encontrada.")
    sys.exit(1)

pos_fim = texto.find(fim, pos_inicio)

if pos_fim == -1:
    print("ERRO: final do bloco não encontrado.")
    sys.exit(1)

bloco = texto[pos_inicio:pos_fim]

if "Trocar perfil" not in bloco or "setPerfilEscolhido" not in bloco:
    print("ERRO: o bloco encontrado não corresponde ao botão esperado.")
    sys.exit(1)

texto = texto[:pos_inicio] + texto[pos_fim + len('          )}\n'):]
arquivo.write_text(texto)

print("Botão antigo removido; novo seletor preservado.")
PY

npm run build --prefix frontend

echo "Correção concluída."
