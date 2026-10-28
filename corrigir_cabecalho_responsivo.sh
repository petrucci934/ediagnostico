
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

CSS="frontend/src/App.css"

if [[ ! -f "$CSS" ]]; then
  echo "Erro: $CSS não encontrado."
  exit 1
fi

BACKUP="${CSS}.backup-$(date +%Y%m%d-%H%M%S)"
cp -p "$CSS" "$BACKUP"

cat >> "$CSS" <<'CSS'

/* Ajuste responsivo do cabeçalho E-Diagnóstico */
.cabecalho {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  min-width: 0;
}

.cabecalho .marca {
  flex: 1 1 220px;
  min-width: 0;
}

.cabecalho .marca-icone {
  flex: 0 0 auto;
}

.cabecalho .cabecalho-inicio,
.cabecalho .perfil-cabecalho,
.cabecalho .botao-menu {
  flex: 0 0 auto;
}

.cabecalho .marca strong,
.cabecalho .marca small {
  overflow-wrap: normal;
  word-break: normal;
}

@media (max-width: 760px) {
  .cabecalho {
    width: calc(100% - 30px);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 10px;
    padding: 16px 0;
  }

  .cabecalho .marca {
    grid-column: 1;
    min-width: 0;
  }

  .cabecalho .cabecalho-inicio {
    grid-column: 2;
  }

  .cabecalho .perfil-cabecalho {
    grid-column: 1 / 3;
    grid-row: 2;
    justify-self: end;
  }

  .cabecalho .botao-menu {
    display: inline-flex;
    grid-column: 3;
    grid-row: 1;
    width: 44px;
    height: 44px;
  }

  .cabecalho .navegacao {
    grid-column: 1 / -1;
    grid-row: 3;
    width: 100%;
  }

  .cabecalho .marca-icone {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }

  .cabecalho .marca strong {
    display: block;
    font-size: 15px;
  }

  .cabecalho .marca small {
    display: block;
    font-size: 11px;
    line-height: 1.4;
  }
}

@media (max-width: 420px) {
  .cabecalho {
    gap: 8px;
  }

  .cabecalho .marca {
    gap: 8px;
  }

  .cabecalho .cabecalho-inicio {
    gap: 5px;
    padding: 0 9px;
    font-size: 13px;
  }

  .cabecalho .perfil-cabecalho {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: end;
  }
}
CSS

echo "Backup criado: $BACKUP"
echo "Regras responsivas adicionadas."
echo "Verificando o build..."

cd frontend
npm run build

echo "Concluído. Atualize o navegador e teste em tela pequena."
