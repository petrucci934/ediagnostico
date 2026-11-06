from pathlib import Path
import shutil

arquivo = Path("backend/src/server.js")

original = arquivo.read_text(encoding="utf-8")
codigo = original

funcao = r'''
function normalizarUsuario(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function primeiroNomeUsuario(nome) {
  const primeiroNome = String(nome || "").trim().split(/\s+/)[0];
  return normalizarUsuario(primeiroNome);
}
'''

antigo_login = '''  const login =
    typeof req.body?.login === "string"
      ? req.body.login.trim().toLowerCase()
      : typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";'''

novo_login = '''  const loginInformado =
    typeof req.body?.login === "string"
      ? req.body.login.trim()
      : typeof req.body?.email === "string"
        ? req.body.email.trim()
        : "";

  const login = loginInformado.toLowerCase();
  const usuarioNormalizado = normalizarUsuario(loginInformado);'''

alteracoes = [
    (
        "const PORT = process.env.PORT || 3000;",
        "const PORT = process.env.PORT || 3000;\n" + funcao,
    ),
    (antigo_login, novo_login),
    (
        "WHERE (LOWER(email) = $1 OR LOWER(usuario) = $1) AND ativo = TRUE",
        "WHERE (LOWER(email) = $1 OR usuario = $2) AND ativo = TRUE",
    ),
]

if "function normalizarUsuario(valor)" in codigo:
    print("A função de normalização já existe. Nenhuma alteração realizada.")
    raise SystemExit(0)

for antigo, novo in alteracoes:
    if codigo.count(antigo) != 1:
        raise SystemExit(
            f"Trecho não encontrado ou duplicado: {antigo[:65]}"
        )
    codigo = codigo.replace(antigo, novo, 1)

inicio = codigo.index('app.post("/api/auth/login"')
fim = codigo.index("const usuario = resultado.rows[0];", inicio)

trecho = codigo[inicio:fim]

if trecho.count("[login],") != 1:
    raise SystemExit("Parâmetro da consulta de login não encontrado.")

trecho = trecho.replace(
    "[login],",
    "[login, usuarioNormalizado],",
    1,
)

codigo = codigo[:inicio] + trecho + codigo[fim:]

backup = arquivo.with_suffix(".js.bak")
shutil.copy2(arquivo, backup)
arquivo.write_text(codigo, encoding="utf-8")

print("Login atualizado com sucesso.")
print(f"Backup criado: {backup}")
