#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.css"
MARCADOR="/* CORRECAO PAINEL SUSPENSO DO MENU */"
BACKUP="${ARQUIVO}.bak-$(date +%Y%m%d-%H%M%S)"

if grep -qF "$MARCADOR" "$ARQUIVO"; then
  echo "A correção já foi adicionada anteriormente."
  exit 0
fi

cp "$ARQUIVO" "$BACKUP"
echo "Backup criado: $BACKUP"

cat >> "$ARQUIVO" <<'CSS'

/* CORRECAO PAINEL SUSPENSO DO MENU */

.cabecalho {
  position: relative;
  z-index: 100;
}

.cabecalho .navegacao {
  display: none;
}

.cabecalho .navegacao.menu-aberto {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: min(320px, calc(100vw - 30px));
  min-width: 0;
  padding: 12px;
  background: #101b2b;
  border: 1px solid #34445a;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgb(0 0 0 / 35%);
}

.cabecalho .navegacao.menu-aberto button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  text-align: left;
  white-space: normal;
}

.cabecalho .botao-menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-width: 44px;
  height: 44px;
  padding: 0;
  color: #b7f36b;
  background: #111c2c;
  border: 1px solid #34445a;
  border-radius: 10px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.cabecalho .botao-menu:hover {
  background: #1b2b3d;
  color: #b7f36b;
}

@media (max-width: 760px) {
  .cabecalho .navegacao.menu-aberto {
    top: calc(100% + 6px);
    right: 0;
    grid-column: auto;
    grid-row: auto;
  }
}
CSS

npm run build --prefix frontend

echo
echo "Correção aplicada. Atualize o navegador com Ctrl + Shift + R."
