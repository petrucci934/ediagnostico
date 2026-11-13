import "./DiagnosticoGuiado.css";
import { obterRoteiroDiagnostico } from "./roteiroDiagnostico";
import SeloGravidade from "./SeloGravidade";
import { niveisGravidade } from "./gravidadeDiagnostico.js";

function LinkFonte({ url, children }) {
  if (!/^https?:\/\//i.test(url || "")) return <span>{children}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function DiagnosticoGuiado({
  resultado,
  procedimentos,
  estado,
  contexto,
  cabecalhoNoResumo = false,
}) {
  const roteiro = obterRoteiroDiagnostico(resultado);
  const registrosTeste = procedimentos.filter((item) =>
    /^\s*REGISTRO DE TESTE\s*:/i.test(item.instrucao || ""),
  );
  const orientacoes = procedimentos.filter(
    (item) => !registrosTeste.includes(item),
  );
  const linhas = [
    ...new Map(
      (resultado.resultados || []).map((item) => [
        JSON.stringify([
          item.manufacturer,
          item.component_type,
          item.component_model,
          item.description,
          item.verification_status,
        ]),
        item,
      ]),
    ).values(),
  ];
  const fontes = [
    ...new Map(
      (resultado.resultados || [])
        .filter((item) => item.source_title || item.source_url)
        .map((item) => [
          JSON.stringify([
            item.source_url,
            item.source_title,
            item.page_reference,
          ]),
          item,
        ]),
    ).values(),
  ];
  const principal = linhas[0] || {};
  const avisos = [
    ...new Set(orientacoes.map((item) => item.aviso_seguranca).filter(Boolean)),
  ];
  const fontesCompletas = [
    ...new Map(
      [
        ...fontes,
        ...orientacoes
          .filter((item) => item.fonte_tecnica || item.fonte_url)
          .map((item) => ({
            source_title: item.fonte_tecnica,
            source_url: item.fonte_url,
          })),
        ...(roteiro
          ? [{ source_title: roteiro.fonte, source_url: roteiro.url }]
          : []),
      ].map((item) => [
        JSON.stringify([
          item.source_url,
          item.source_title,
          item.page_reference,
        ]),
        item,
      ]),
    ).values(),
  ];
  return (
    <article className="dg-painel" aria-label="Ficha de diagnóstico">
      {!cabecalhoNoResumo && (
        <header className="dg-cabecalho">
          <div className="dg-identificacao">
            <span className="dg-codigo">{resultado.codigo}</span>
            <span className="dg-fabricante">
              {contexto.fabricante || "Fabricante não definido"}
            </span>
            <SeloGravidade linhas={linhas} />
          </div>
          <h3>{principal.description || "Descrição não cadastrada"}</h3>
          <p className="dg-modelo">
            Modelo: {contexto.modelo || "não selecionado"} ·{" "}
            {principal.component_type || "Componente não informado"}
          </p>
          <small>
            {linhas.length &&
            linhas.every((item) => item.verification_status === "verified")
              ? "Código revisado na base"
              : "Validação técnica não confirmada"}
          </small>
        </header>
      )}
      {cabecalhoNoResumo && (
        <small>Gravidade de referência · validação técnica pendente</small>
      )}
      {!cabecalhoNoResumo &&
        principal.severity_origin === "external_reference" && (
          <small>
            Gravidade de referência · validação por modelo pendente.
          </small>
        )}
      {linhas.length > 1 && (
        <p className="dg-aviso">
          Há mais de uma descrição para este código. Confira os registros em
          “Detalhes e orientações” antes de aplicar qualquer instrução.
        </p>
      )}
      {roteiro && <p className="dg-aviso">{roteiro.aplicabilidade}</p>}
      <dl className="dg-ficha">
        <div>
          <dt>Sintomas</dt>
          <dd>
            {roteiro?.sintomas ||
              "Sintomas específicos ainda não documentados."}
          </dd>
        </div>
        <div>
          <dt>Causas possíveis</dt>
          <dd>
            {roteiro?.causas ||
              "O código não determina sozinho a peça defeituosa. Causas específicas ainda não documentadas."}
          </dd>
        </div>
        <div>
          <dt>Verificação inicial</dt>
          <dd>
            {estado === "carregando" ? (
              <span role="status">Carregando orientações...</span>
            ) : estado === "erro" ? (
              <span role="alert">
                Falha ao buscar orientações. Consulte novamente.
              </span>
            ) : estado === "ambiguo" ? (
              "Selecione um fabricante para consultar os procedimentos."
            ) : (
              roteiro?.verificacoes[0] ||
              "Confirme o modelo e consulte as orientações cadastradas antes de intervir."
            )}
          </dd>
        </div>
        <div>
          <dt>Próximo passo</dt>
          <dd>
            {roteiro?.proximoPasso ||
              "Confira a fonte técnica aplicável ao modelo. Não há uma decisão de reparo cadastrada para este roteiro."}
          </dd>
        </div>
      </dl>
      <details className="dg-detalhes">
        <summary>Detalhes e orientações</summary>
        {linhas.length > 1 &&
          linhas.map((item, i) => (
            <p key={i}>
              <strong>
                {item.manufacturer || "Fabricante não informado"}:
              </strong>{" "}
              {item.description} · {item.component_type}
            </p>
          ))}
        {roteiro && (
          <>
            {roteiro.verificacoes.length > 1 && (
              <>
                <h4>Continuação das verificações</h4>
                <ol className="dg-etapas">
                  {roteiro.verificacoes.slice(1).map((texto) => (
                    <li key={texto}>{texto}</li>
                  ))}
                </ol>
              </>
            )}
            <p>{roteiro.observacao}</p>
          </>
        )}
        {(!resultado.referenciaCatalogo || orientacoes.length > 0) && (
          <>
            <h4>Orientações cadastradas</h4>
            {estado === "pronto" && orientacoes.length ? (
              <ol className="dg-etapas">
                {orientacoes.map((item, i) => (
                  <li key={`${item.etapa}-${i}`}>
                    {item.aviso_seguranca && (
                      <p className="dg-aviso">{item.aviso_seguranca}</p>
                    )}
                    <p>{item.instrucao}</p>
                    <small>
                      Validação do código:{" "}
                      {item.verificacao === "verified"
                        ? "revisado na base"
                        : "não confirmada"}
                      .{" "}
                    </small>
                    {(item.fonte_tecnica || item.fonte_url) && (
                      <LinkFonte url={item.fonte_url}>
                        {item.fonte_tecnica || "Consultar fonte"}
                      </LinkFonte>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p>
                {estado === "pronto"
                  ? "Nenhuma orientação de reparo cadastrada para esta seleção."
                  : "As orientações ainda não estão disponíveis para esta consulta."}
              </p>
            )}
          </>
        )}
      </details>
      <details className="dg-detalhes">
        <summary>Fontes técnicas ({fontesCompletas.length})</summary>
        {fontesCompletas.length ? (
          <ul>
            {fontesCompletas.map((item, i) => (
              <li key={i}>
                <LinkFonte url={item.source_url}>
                  {item.source_title || "Consultar documento"}
                </LinkFonte>
                {item.page_reference && ` · ${item.page_reference}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma fonte cadastrada.</p>
        )}
      </details>
      <details className="dg-detalhes">
        <summary>Cuidados e aplicabilidade</summary>
        <p>
          O código não confirma sozinho qual peça deve ser substituída. Confira
          fabricante, modelo e documentação antes de executar qualquer
          orientação.
        </p>
        {avisos.map((aviso) => (
          <p className="dg-aviso" key={aviso}>
            {aviso}
          </p>
        ))}
      </details>
      <details className="dg-detalhes">
        <summary>Como ler a gravidade</summary>
        <p>
          O selo exibe a classificação cadastrada para a falha. Não substitui o
          diagnóstico nem confirma que o veículo está seguro para uso.
        </p>
        <ul className="dg-legenda-gravidade">
          {Object.entries(niveisGravidade)
            .filter(([chave]) => chave !== "mixed")
            .map(([chave, nivel]) => (
              <li key={chave}>
                <SeloGravidade linhas={[{ severity: chave }]} />
                <span>{nivel.descricao}</span>
              </li>
            ))}
        </ul>
      </details>
      {estado === "pronto" && registrosTeste.length > 0 && (
        <details className="dg-detalhes">
          <summary>Registros de teste ({registrosTeste.length})</summary>
          <p>Estes registros não são instruções de reparo.</p>
          {registrosTeste.map((item, i) => (
            <p key={i}>{item.instrucao}</p>
          ))}
        </details>
      )}
    </article>
  );
}
