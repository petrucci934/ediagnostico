
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ARQUIVO="frontend/src/App.jsx"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: arquivo $ARQUIVO não encontrado."
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
from datetime import datetime
import shutil
import sys

arquivo = Path("frontend/src/App.jsx")
codigo = arquivo.read_text(encoding="utf-8")

antigo = '''{ehMecanico && (
          <div className="perfil-cabecalho">
            <UserRound size={18} aria-hidden="true" />
            <span>Mecânico</span>
            <ChevronDown size={15} aria-hidden="true" />
          </div>
        )}'''

novo = '''<div className="perfil-cabecalho">
          <UserRound size={18} aria-hidden="true" />
          <span>
            {ehMecanico
              ? "Mecânico"
              : ehCliente
                ? "Cliente"
                : perfil === "admin" || usuarioLogado?.perfil === "admin"
                  ? "Administrador"
                  : "Usuário"}
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>'''

quantidade = codigo.count(antigo)

if quantidade == 0:
    print("Nenhuma alteração realizada.")
    print("O trecho esperado não foi encontrado.")
    print("Verifique se o cabeçalho já foi alterado.")
    sys.exit(1)

if quantidade != 1:
    print(f"Erro: trecho encontrado {quantidade} vezes; esperado apenas uma.")
    sys.exit(1)

backup = arquivo.with_name(
    f"App.jsx.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)

shutil.copy2(arquivo, backup)
arquivo.write_text(codigo.replace(antigo, novo, 1), encoding="utf-8")

print(f"Cabeçalho atualizado: {arquivo}")
print(f"Backup criado: {backup}")
PY

echo
echo "Verificando o build do frontend..."
cd frontend
npm run build

echo
echo "Concluído. Confira o cabeçalho no navegador."
