
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

antigo = '''        <div className="perfil-cabecalho">
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

novo = '''        <div className="seletor-perfil-cabecalho">
          <button
            type="button"
            className="perfil-cabecalho"
            aria-label="Trocar perfil"
            aria-expanded={menuPerfilAberto}
            aria-controls="menu-troca-perfil"
            onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
          >
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
          </button>

          {menuPerfilAberto && (
            <div
              id="menu-troca-perfil"
              className="menu-troca-perfil"
            >
              {[
                { valor: "mecanico", texto: "Mecânico" },
                { valor: "revisor", texto: "Supervisor" },
                { valor: "admin", texto: "Administrador" },
                { valor: "cliente", texto: "Cliente" },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("ediagnostico-token");
                    localStorage.removeItem("ediagnostico-usuario");

                    setToken("");
                    setUsuarioLogado(null);
                    setPerfil("");
                    setPerfilEscolhido(opcao.valor);
                    setEmailLogin("");
                    setSenhaLogin("");
                    setErroLogin("");
                    setTelaAtual("diagnostico");
                    setResultado(null);
                    setErro("");
                    setSugestoes([]);
                    setProcedimentos([]);
                    setAtendimentos([]);
                    setErroAtendimentos("");
                    setTestesTecnicos([]);
                    setMenuAberto(false);
                    setMenuPerfilAberto(false);
                  }}
                >
                  {opcao.texto}
                </button>
              ))}
            </div>
          )}
        </div>'''

if codigo.count(antigo) != 1:
    print("Erro: não encontrei exatamente uma ocorrência do indicador de perfil.")
    print("Nenhuma alteração foi realizada.")
    sys.exit(1)

# Confirma que o estado necessário já existe ou pode ser adicionado com segurança.
if "const [menuPerfilAberto, setMenuPerfilAberto]" not in codigo:
    ancora = '  const [menuAberto, setMenuAberto] = useState(false);'
    if codigo.count(ancora) != 1:
        print("Erro: não consegui localizar o estado do menu principal.")
        print("Nenhuma alteração foi realizada.")
        sys.exit(1)
    codigo = codigo.replace(
        ancora,
        ancora + '\n  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);',
        1
    )

backup = arquivo.with_name(
    f"App.jsx.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)
shutil.copy2(arquivo, backup)
arquivo.write_text(codigo.replace(antigo, novo, 1), encoding="utf-8")

print(f"Arquivo atualizado: {arquivo}")
print(f"Backup criado: {backup}")
PY

echo
echo "Adicionando estilos do menu de perfil..."

cat >> frontend/src/App.css <<'CSS'

/* Menu suspenso para troca de perfil */
.seletor-perfil-cabecalho {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.seletor-perfil-cabecalho .perfil-cabecalho {
  cursor: pointer;
  background: #111c2c;
  color: #eaf0f6;
  border: 1px solid #34445a;
}

.menu-troca-perfil {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  padding: 6px;
  border: 1px solid #34445a;
  border-radius: 10px;
  background: #111c2c;
  box-shadow: 0 10px 28px rgb(0 0 0 / 35%);
}

.menu-troca-perfil button {
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #eaf0f6;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.menu-troca-perfil button:hover,
.menu-troca-perfil button:focus-visible {
  background: #26384d;
  outline: none;
}

@media (max-width: 380px) {
  .menu-troca-perfil {
    right: 0;
    min-width: 165px;
  }
}
CSS

echo
echo "Validando o frontend..."
cd frontend
npm run build

echo
echo "Script concluído. Teste a troca de perfil no navegador."
