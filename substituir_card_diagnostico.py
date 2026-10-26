#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import shutil
import sys

PATH = Path("frontend/src/App.jsx")
NEW_ARTICLE = r'''
<article className="detalhe-falha card-diagnostico" key={`${item.code}-${indice}`}>
  <header className="card-diagnostico-cabecalho">
    <div className="icone-bateria" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="4" y="7" width="16" height="14" rx="2" />
        <path d="M9 7V4h6v3M8 12h4m-2-2v4m4-2h2" />
      </svg>
    </div>
    <div className="card-titulo">
      <div className="codigo-categoria">
        <span className="codigo-destaque">{item.code}</span>
        <span className="categoria-destaque">{item.component_type || "DIAGNÓSTICO ELÉTRICO"}</span>
      </div>
      <h2>{item.description}</h2>
      <p>Código de erro relacionado ao sistema e ao gerenciamento de energia.</p>
    </div>
    <div className={`prioridade-diagnostico prioridade-${item.severity || "unknown"}`}>
      <span className="prioridade-simbolo" aria-hidden="true">⚠</span>
      <div><small>PRIORIDADE</small><strong>{gravidade}</strong></div>
    </div>
  </header>

  <div className="card-diagnostico-corpo">
    <section className="painel-imagem">
      <h3><span aria-hidden="true">▧</span> IMAGEM DO CÓDIGO</h3>
      {imagemExibida ? (
        <figure className="imagem-manual">
          <img src={imagemExibida.image_path}
            alt={imagemExibida.caption || `Imagem do código ${item.code}`} loading="lazy" />
          <figcaption>{imagemExibida.caption || `Recorte individual do código ${item.code}`}</figcaption>
          {imagemExibida.page_reference && <p className="referencia-imagem">{imagemExibida.page_reference}</p>}
        </figure>
      ) : <p className="imagem-indisponivel">Não há imagem cadastrada para este código.</p>}
    </section>

    <div className="painel-informacoes">
      <section className="bloco-diagnostico bloco-significado">
        <h3><span aria-hidden="true">ⓘ</span> SIGNIFICADO</h3>
        <p className="significado-destaque">{item.description}</p>
      </section>
      <section className="bloco-diagnostico bloco-verificacoes">
        <h3><span aria-hidden="true">🔧</span> VERIFICAÇÕES RECOMENDADAS</h3>
        {etapas.length > 0 ? (
          <ol className="lista-verificacoes">
            {etapas.map((procedimento) => (
              <li key={procedimento.etapa}>
                <span className="verificacao-check" aria-hidden="true">✓</span>
                <div>
                  <p>{procedimento.instrucao}</p>
                  {procedimento.aviso_seguranca && <div className="aviso-procedimento">
                    <strong>Atenção à segurança</strong><p>{procedimento.aviso_seguranca}</p>
                  </div>}
                  {procedimento.fonte_url && <a href={procedimento.fonte_url} target="_blank" rel="noreferrer">Consultar fonte</a>}
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="sem-procedimentos">Não há verificações específicas cadastradas. Consulte o manual oficial do fabricante antes de realizar testes ou reparos.</p>}
      </section>
    </div>

    <aside className="painel-status">
      <section className="status-card"><h3><span aria-hidden="true">⚙</span> COMPONENTE</h3><p>{item.component_type || "Não identificado"}</p></section>
      <section className="status-card"><h3><span aria-hidden="true">ϟ</span> TIPO</h3><p>{item.vehicle_model ? "Veículo elétrico" : "Elétrico"}</p></section>
      <section className="status-card"><h3><span aria-hidden="true">▤</span> SISTEMA</h3><p>{item.component_model || "Gerenciamento de energia"}</p></section>
      <section className="status-card">
        <h3><span aria-hidden="true">🛡</span> STATUS DE VALIDAÇÃO</h3>
        <span className={item.verification_status === "verified" ? "status-validado" : "status-pendente"}>
          {item.verification_status === "verified" ? "✓ Validado" : "◷ Pendente de validação"}
        </span>
      </section>
    </aside>
  </div>

  {item.verification_status !== "verified" && <div className="aviso-validacao">
    <strong>⚠ Diagnóstico ainda não validado</strong>
    <p>Confirme o código, o fabricante e o modelo na documentação oficial antes de executar qualquer reparo.</p>
  </div>}

  <footer className="rodape-diagnostico">
    <div className="rodape-item"><span className="rodape-icone" aria-hidden="true">▤</span>
      <div><strong>FONTE</strong><p>{item.source_title || "Fonte não informada"}</p></div>
    </div>
    <div className="rodape-item"><span className="rodape-icone" aria-hidden="true">▧</span>
      <div><strong>PÁGINA</strong><p>{imagemExibida?.page_reference || "Página não informada"}</p></div>
    </div>
    <div className="rodape-item"><span className="rodape-icone" aria-hidden="true">↗</span>
      <div><strong>LINK DA FONTE</strong>
        {item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer">Consultar documentação</a> : <p>Não disponível</p>}
      </div>
    </div>
  </footer>
</article>'''

def main():
    if not PATH.exists():
        sys.exit(f"Arquivo não encontrado: {PATH}. Execute na raiz de ~/ediagnostico.")
    source = PATH.read_text(encoding="utf-8")
    start = -1
    search_from = 0
    while True:
        pos = source.find("<article", search_from)
        if pos < 0:
            break
        end_open = source.find(">", pos)
        if end_open < 0:
            break
        if 'className="detalhe-falha"' in source[pos:end_open]:
            start = pos
            break
        search_from = end_open + 1
    if start < 0:
        sys.exit('Não encontrei <article> com className="detalhe-falha". Nenhuma alteração feita.')
    end = source.find("</article>", start)
    if end < 0:
        sys.exit("Não encontrei o fechamento </article>. Nenhuma alteração feita.")
    end += len("</article>")
    line = source.count("\n", 0, start) + 1
    print(f"Card encontrado na linha {line}.")
    print("Será substituído somente esse article; o map e o restante do componente serão preservados.")
    if input("Digite SUBSTITUIR para continuar: ").strip() != "SUBSTITUIR":
        print("Cancelado. Nenhuma alteração feita.")
        return
    backup = PATH.with_name(f"App.jsx.backup_card_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    shutil.copy2(PATH, backup)
    PATH.write_text(source[:start] + NEW_ARTICLE.strip() + source[end:], encoding="utf-8")
    print(f"Backup criado: {backup}")
    print("Card substituído. Execute: npm run build --prefix frontend")

if __name__ == "__main__":
    main()
