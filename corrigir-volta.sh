#!/usr/bin/env bash
set -e

ARQUIVO="frontend/src/App.jsx"

echo "===== LOCALIZANDO NAVEGAÇÃO DOS CADASTROS ====="

grep -n -B 5 -A 8 -E 'CadastrosOficina|abaInicial|setTelaAtual|setAbaTeste' "$ARQUIVO"

echo
echo "===== CONCLUÍDO ====="
echo "Envie o resultado para eu gerar a correção automática."
