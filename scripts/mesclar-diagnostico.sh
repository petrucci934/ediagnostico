#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
branch_atual=$(git branch --show-current)
if [[ "$branch_atual" != "feature/diagnostico-guiado" ]]; then
  echo "Execute na branch feature/diagnostico-guiado. Branch atual: $branch_atual"
  exit 1
fi
if ! git diff --cached --quiet; then
  echo "Há arquivos já preparados para commit. Revise-os antes de executar este script."
  exit 1
fi

# Lista explícita: inclui a interface da Trilha já usada pelo App, sem segredos,
# backups, arquivos do editor ou materiais de hospedagem não relacionados.
git add -- \
  README.md \
  backend/package.json \
  backend/schema.sql \
  backend/src/server.js \
  backend/test/regressoes.test.js \
  backend/migrations/20261108_trilhas_conhecimento.sql \
  backend/scripts/migrar-conhecimento.js \
  frontend/src/App.jsx \
  frontend/src/App.css \
  frontend/src/menuPrincipal.js \
  frontend/test/menuPrincipal.test.js \
  frontend/src/TrilhaConhecimento.jsx \
  frontend/src/TrilhaConhecimento.css \
  frontend/src/CatalogoDiagnosticos.jsx \
  frontend/src/DiagnosticoGuiado.jsx \
  frontend/src/DiagnosticoGuiado.css \
  frontend/src/SeloGravidade.jsx \
  frontend/src/catalogoDiagnosticos.js \
  frontend/src/classificacaoGravidade.js \
  frontend/src/gravidadeDiagnostico.js \
  frontend/src/historicoConsultas.js \
  frontend/src/roteiroDiagnostico.js \
  frontend/src/textosCatalogo.js \
  frontend/test/catalogoDiagnosticos.test.js \
  frontend/test/classificacaoGravidade.test.js \
  frontend/test/gravidadeDiagnostico.test.js \
  frontend/test/historicoConsultas.test.js \
  frontend/test/roteiroDiagnostico.test.js \
  scripts/mesclar-diagnostico.sh

git diff --cached --check
if ! git diff --cached --quiet; then
  git commit -m "Implementa diagnóstico guiado, catálogo, gravidade e histórico de consultas"
fi
git switch master
git merge --ff-only feature/diagnostico-guiado
echo "Merge local concluído na master. Nenhum push ou deploy foi executado."
git log -1 --oneline
git status --short
