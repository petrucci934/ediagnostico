
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ARQUIVO="frontend/src/App.jsx"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: $ARQUIVO não encontrado."
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
from datetime import datetime
import shutil
import sys

arquivo = Path("frontend/src/App.jsx")
codigo = arquivo.read_text(encoding="utf-8")

antigo = '''<div className="perfil-cabecalho">
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

novo = '''<div className="perfil-cabecalho">
          <UserRound size={18} aria-hidden="true" />
          <span>
            {{
              mecanico: "Mecânico",
              cliente: "Cliente",
              admin: "Administrador",
              revisor: "Supervisor",
              supervisor: "Supervisor",
            }[
              usuarioLogado?.perfil ||
              perfil ||
              perfilEscolhido
            ] || "Usuário"}
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>'''

if codigo.count(antigo) != 1:
    print("Não foi possível identificar exatamente o trecho esperado.")
    print("Nenhuma alteração foi realizada.")
    sys.exit(1)

backup = arquivo.with_name(
    f"App.jsx.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)
shutil.copy2(arquivo, backup)
arquivo.write_text(codigo.replace(antigo, novo, 1), encoding="utf-8")

print(f"Alteração realizada em {arquivo}")
print(f"Backup criado: {backup}")
PY

echo "Validando o frontend..."
cd frontend
npm run build
