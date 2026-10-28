
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

CSS="frontend/src/App.css"
MARCADOR="/* CABECALHO COMPACTO: TODOS OS ITENS NA MESMA LINHA */"

if [[ ! -f "$CSS" ]]; then
  echo "Erro: arquivo $CSS não encontrado."
  exit 1
fi

if grep -Fq "$MARCADOR" "$CSS"; then
  echo "As regras deste script já existem no CSS."
  echo "Nenhuma alteração duplicada foi feita."
  exit 0
fi

BACKUP="${CSS}.backup-$(date +%Y%m%d-%H%M%S)"
cp -p "$CSS" "$BACKUP"

cat >> "$CSS" <<'CSS'

/* CABECALHO COMPACTO: TODOS OS ITENS NA MESMA LINHA */

@media (max-width: 760px) {
  .cabecalho {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    align-items: center;
    column-gap: 6px;
    row-gap: 10px;
  }

  .cabecalho .marca {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    width: auto;
  }

  .cabecalho .marca-icone {
    flex: 0 0 32px;
    width: 32px;
    min-width: 32px;
    height: 32px;
  }

  .cabecalho .marca > span:last-child {
    min-width: 0;
  }

  .cabecalho .marca strong {
    display: block;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
    letter-spacing: -0.3px;
  }

  .cabecalho .marca small {
    display: none;
  }

  .cabecalho .cabecalho-inicio {
    grid-column: 2;
    grid-row: 1;
    min-height: 38px;
    padding: 0 8px;
    gap: 5px;
    font-size: 12px;
  }

  .cabecalho .perfil-cabecalho {
    grid-column: 3;
    grid-row: 1;
    justify-self: center;
    min-height: 38px;
    padding: 0 3px;
    gap: 4px;
    font-size: 12px;
  }

  .cabecalho .botao-menu {
    grid-column: 4;
    grid-row: 1;
    width: 38px;
    min-width: 38px;
    height: 38px;
    display: inline-flex;
  }

  .cabecalho .navegacao {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 380px) {
  .cabecalho {
    column-gap: 4px;
  }

  .cabecalho .marca strong {
    font-size: 11px;
    letter-spacing: -0.4px;
  }

  .cabecalho .cabecalho-inicio {
    padding: 0 6px;
    font-size: 11px;
  }

  .cabecalho .perfil-cabecalho {
    gap: 2px;
    font-size: 11px;
  }

  .cabecalho .botao-menu {
    width: 34px;
    min-width: 34px;
  }
}
CSS

echo "Backup criado: $BACKUP"
echo "Regras do cabeçalho compacto adicionadas."
echo "Verificando o build do frontend..."

cd frontend
npm run build

echo
echo "Build concluído. Atualize o navegador e teste o cabeçalho."
