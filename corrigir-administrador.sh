#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/Administrador.jsx"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "ERRO: arquivo não encontrado: $ARQUIVO"
  exit 1
fi

python3 - "$ARQUIVO" <<'PY'
from pathlib import Path
from datetime import datetime
import re
import sys

arquivo = Path(sys.argv[1])
conteudo = arquivo.read_text(encoding="utf-8")

inicio = '                  <div className="cadastro-acoes">'
fim = '                  </div>\n                </article>'

# Localiza o bloco da lista de mecânicos.
marcador = 'mecanicos.map((mecanico) => ('
pos_mapa = conteudo.find(marcador)

if pos_mapa < 0:
    sys.exit("ERRO: lista de mecânicos não encontrada. Nenhuma alteração feita.")

pos_inicio = conteudo.find(inicio, pos_mapa)
pos_fim = conteudo.find(fim, pos_inicio)

if pos_inicio < 0 or pos_fim < 0:
    sys.exit("ERRO: bloco de ações não reconhecido. Nenhuma alteração feita.")

pos_fim += len('                  </div>')

bloco_atual = conteudo[pos_inicio:pos_fim]

# Só corrige se encontrar a duplicação conhecida.
if 'Enviar link para redefinir senha' not in bloco_atual:
    sys.exit("ERRO: botão de recuperação não encontrado no bloco. Nenhuma alteração feita.")

if bloco_atual.count("Editar") < 2 or bloco_atual.count('className="cadastro-acoes"') < 2:
    sys.exit("ERRO: a duplicação esperada não foi identificada. Nenhuma alteração feita.")

novo_bloco = '''                  <div className="cadastro-acoes">
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => enviarLinkRecuperacao(mecanico)}
                    >
                      Enviar link para redefinir senha
                    </button>

                    <button
                      type="button"
                      className="secundario"
                      onClick={() => {
                        setMecanicoEditando(mecanico);
                        setFormMecanico({
                          nome: mecanico.nome,
                          email: mecanico.email,
                          senha: "",
                          ativo: mecanico.ativo,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={mecanico.ativo ? "perigo" : "secundario"}
                      onClick={() => alternarAtivo(mecanico)}
                    >
                      {mecanico.ativo ? "Desativar" : "Reativar"}
                    </button>
                  </div>'''

backup = arquivo.with_name(
    arquivo.name + ".backup-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(conteudo, encoding="utf-8")

arquivo.write_text(
    conteudo[:pos_inicio] + novo_bloco + conteudo[pos_fim:],
    encoding="utf-8",
)

print(f"Backup criado: {backup}")
print("Bloco de ações corrigido.")
PY

echo
echo "Verificando a compilação do frontend..."
cd frontend
npm run build
