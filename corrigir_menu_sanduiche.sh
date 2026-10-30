#!/usr/bin/env bash
set -euo pipefail

ARQUIVO="frontend/src/App.css"
MARCADOR="/* MENU SANDUICHE E-DIAGNOSTICO */"
BACKUP="${ARQUIVO}.bak-$(date +%Y%m%d-%H%M%S)"

if grep -qF "$MARCADOR" "$ARQUIVO"; then
  echo "O ajuste do menu sanduíche já existe. Nenhuma alteração feita."
  exit 0
fi

cp "$ARQUIVO" "$BACKUP"
echo "Backup criado: $BACKUP"

cat >> "$ARQUIVO" <<'CSS'

/* MENU SANDUICHE E-DIAGNOSTICO */

/* Desktop: navegação recolhida até clicar no botão */
.cabecalho .navegacao {
  display: none;
}

.cabecalho .navegacao.menu-aberto {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/* O botão sanduíche permanece acessível */
.cabecalho .botao-menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Menu aberto em telas pequenas */
@media (max-width: 760px) {
  .cabecalho .navegacao {
    display: none;
  }

  .cabecalho .navegacao.menu-aberto {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 8px;
    padding-top: 10px;
  }

  .cabecalho .navegacao.menu-aberto button {
    width: 100%;
    text-align: left;
  }
}
CSS

npm run build --prefix frontend

echo
echo "Ajuste aplicado. Teste o botão sanduíche no navegador."
