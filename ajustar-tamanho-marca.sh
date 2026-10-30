#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.css"

if [[ ! -f "$ARQUIVO" ]]; then
  echo "Erro: arquivo $ARQUIVO não encontrado."
  exit 1
fi

BACKUP="${ARQUIVO}.bak-tamanho-marca-$(date +%Y%m%d-%H%M%S)"
cp "$ARQUIVO" "$BACKUP"

cat >> "$ARQUIVO" <<'CSS'

/* Ajuste da marca E-Diagnóstico conforme referência visual */
.cabecalho .marca {
  gap: 10px;
}

.cabecalho .marca-icone {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  width: 48px;
  min-width: 48px;
  height: 48px;
  background: transparent !important;
  border: none;
  box-shadow: none;
}

.cabecalho .marca-icone img {
  display: block;
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.cabecalho .marca strong {
  display: block;
  font-size: 17px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.cabecalho .marca small {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .cabecalho .marca-icone {
    flex-basis: 40px;
    width: 40px;
    min-width: 40px;
    height: 40px;
  }

  .cabecalho .marca-icone img {
    width: 40px;
    height: 40px;
  }

  .cabecalho .marca strong {
    font-size: 15px;
  }

  .cabecalho .marca small {
    font-size: 9px;
    white-space: normal;
  }
}
CSS

echo "Backup criado: $BACKUP"
echo "Verificando compilação..."

cd frontend
npm run build

echo "Concluído! Atualize o navegador com Ctrl + Shift + R."
