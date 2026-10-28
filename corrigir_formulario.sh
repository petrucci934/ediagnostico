#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.jsx"

if [ ! -f "$ARQUIVO" ]; then
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

inicio = '<form className="formulario" onSubmit={consultarCodigo}>'
pos = conteudo.find(inicio)

if pos == -1:
    print("ERRO: formulário de consulta não encontrado. Nenhuma alteração feita.")
    sys.exit(1)

fim = conteudo.find("</form>", pos)
if fim == -1:
    print("ERRO: fechamento do formulário não encontrado. Nenhuma alteração feita.")
    sys.exit(1)

fim += len("</form>")
formulario = conteudo[pos:fim]

# Não modificar o formulário caso o seletor de modelo já exista.
if re.search(r'<select\s+id="modelo"', formulario):
    print("O seletor de modelo já existe. Nenhuma alteração feita.")
    sys.exit(0)

marcador = '<div className="formulario-campo formulario-campo-codigo">'

if formulario.count(marcador) != 1:
    print("ERRO: não foi possível identificar unicamente o campo de código.")
    print("Nenhuma alteração feita.")
    sys.exit(1)

bloco_modelo = '''<div className="formulario-campo">
      <label htmlFor="modelo">Modelo do veículo</label>

      <div className="campo-com-icone">
        <Bike size={17} aria-hidden="true" />

        <select
          id="modelo"
          value={modeloSelecionado}
          onChange={(event) => setModeloSelecionado(event.target.value)}
          disabled={!fabricanteSelecionado}
        >
          <option value="">Selecione um modelo</option>

          {modelos
            .filter(
              (modelo) =>
                String(modelo.manufacturer_id) ===
                String(fabricanteSelecionado),
            )
            .map((modelo) => (
              <option key={modelo.id} value={modelo.id}>
                {modelo.model_name}
              </option>
            ))}
        </select>
      </div>
    </div>

    '''

formulario = formulario.replace(
    marcador,
    bloco_modelo + marcador,
    1
)

# Retira a lupa do rótulo e deixa o texto uniforme.
formulario, alteracoes_rotulo = re.subn(
    r'<label htmlFor="codigo">\s*'
    r'<Search size=\{16\} aria-hidden="true"\s*/>\s*'
    r'Qual é o código de erro\?\s*</label>',
    '<label htmlFor="codigo">Qual é o código de erro?</label>',
    formulario,
    count=1
)

# Coloca a lupa no botão sem alterar o envio do formulário.
formulario, alteracoes_botao = re.subn(
    r'<button type="submit" disabled=\{carregando\}>\s*'
    r'\{carregando \? "Consultando\.\.\." : "Consultar código"\}\s*'
    r'</button>',
    '''<button type="submit" disabled={carregando}>
          <Search size={16} aria-hidden="true" />
          {carregando ? "Consultando..." : "Consultar código"}
        </button>''',
    formulario,
    count=1
)

if alteracoes_rotulo != 1 or alteracoes_botao != 1:
    print("ERRO: os trechos do rótulo ou botão não correspondem ao esperado.")
    print("Nenhuma alteração foi gravada.")
    sys.exit(1)

# Criar backup antes de salvar.
backup = arquivo.with_name(
    arquivo.name + ".backup-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(conteudo, encoding="utf-8")

novo_conteudo = conteudo[:pos] + formulario + conteudo[fim:]
arquivo.write_text(novo_conteudo, encoding="utf-8")

print("Correção aplicada com sucesso.")
print(f"Backup criado: {backup}")
print("Campo Modelo restaurado; lupa colocada no botão.")
PY

echo
echo "Verificando a compilação do frontend..."
cd frontend
npm run build
