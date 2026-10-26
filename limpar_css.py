#!/usr/bin/env python3
"""
Limpeza segura de duplicatas exatas no App.css.

- Cria backup antes de qualquer alteração.
- Remove somente blocos CSS que sejam duplicatas EXATAS (mesmo seletor e conteúdo).
- Não remove regras diferentes do mesmo seletor, pois elas podem ser necessárias
  para responsividade ou para sobrescrever estilos anteriores.
- Gera um relatório com seletores repetidos que precisam de revisão manual.

Execute na raiz do projeto:
    python3 limpar_css.py
"""

from pathlib import Path
from datetime import datetime
import re
import shutil
import sys

CSS_PATH = Path("frontend/src/App.css")


def find_blocks(css: str):
    """Localiza regras CSS simples por chaves balanceadas, preservando posições."""
    blocks = []
    i = 0
    n = len(css)

    while i < n:
        open_brace = css.find("{", i)
        if open_brace == -1:
            break

        # Ignora blocos @import e trechos sem seletor significativo.
        selector_start = max(css.rfind("}", i, open_brace), css.rfind(";", i, open_brace)) + 1
        selector = css[selector_start:open_brace].strip()

        # Encontra a chave de fechamento correspondente.
        depth = 1
        j = open_brace + 1
        while j < n and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1

        if depth != 0:
            raise ValueError("CSS com chaves não balanceadas. Nenhuma alteração foi feita.")

        end = j
        body = css[open_brace + 1:end - 1]
        # Ignora seletores vazios e blocos at-rule aninhados (@media, @supports etc.).
        if selector and not selector.startswith("@") and "{" not in body:
            blocks.append({
                "start": selector_start,
                "open": open_brace,
                "end": end,
                "selector": re.sub(r"\s+", " ", selector),
                "body": body.strip(),
                "raw": css[selector_start:end],
            })
        i = end

    return blocks


def main():
    if not CSS_PATH.exists():
        print(f"ERRO: não encontrei {CSS_PATH}")
        print("Execute este script na raiz do projeto, onde existe a pasta frontend/.")
        sys.exit(1)

    original = CSS_PATH.read_text(encoding="utf-8")
    try:
        blocks = find_blocks(original)
    except ValueError as exc:
        print(f"ERRO: {exc}")
        sys.exit(1)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = CSS_PATH.with_name(f"App.css.backup_{timestamp}")
    shutil.copy2(CSS_PATH, backup)
    print(f"Backup criado: {backup}")

    # Só considera duplicatas exatas; mantém a última ocorrência, que é a que
    # prevaleceria no CSS quando as declarações são idênticas.
    seen = {}
    remove_ranges = []
    exact_removed = 0

    for block in blocks:
        key = (block["selector"], re.sub(r"\s+", " ", block["body"]).strip())
        if key in seen:
            remove_ranges.append((block["start"], block["end"]))
            exact_removed += 1
        else:
            seen[key] = block

    cleaned = original
    for start, end in sorted(remove_ranges, reverse=True):
        cleaned = cleaned[:start] + cleaned[end:]

    CSS_PATH.write_text(cleaned, encoding="utf-8")

    # Relatório de seletores repetidos com conteúdos diferentes.
    grouped = {}
    for block in blocks:
        grouped.setdefault(block["selector"], []).append(block)

    report_lines = [
        "RELATÓRIO DE CSS",
        f"Arquivo: {CSS_PATH}",
        f"Duplicatas exatas removidas: {exact_removed}",
        "",
        "Seletores repetidos com conteúdos diferentes (não removidos):",
    ]
    count = 0
    for selector, items in grouped.items():
        distinct_bodies = {re.sub(r"\s+", " ", item["body"]).strip() for item in items}
        if len(items) > 1 and len(distinct_bodies) > 1:
            count += 1
            report_lines.append(f"- {selector} ({len(items)} ocorrências)")
            for item in items:
                line = original.count("\n", 0, item["start"]) + 1
                preview = re.sub(r"\s+", " ", item["body"]).strip()
                if len(preview) > 180:
                    preview = preview[:177] + "..."
                report_lines.append(f"    linha {line}: {{{preview}}}")

    if count == 0:
        report_lines.append("- Nenhum seletor com conteúdo diferente repetido foi encontrado.")

    report = CSS_PATH.with_name("relatorio_limpeza_css.txt")
    report.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    print(f"Duplicatas exatas removidas: {exact_removed}")
    print(f"Relatório salvo em: {report}")
    print("Regras repetidas com conteúdo diferente foram preservadas por segurança.")
    print("\nPróximo passo: execute npm run build --prefix frontend")
    print("Se o visual mudar de forma inesperada, restaure o backup:")
    print(f"cp '{backup}' '{CSS_PATH}'")


if __name__ == "__main__":
    main()
