import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import BibliotecaCabecalho from "./BibliotecaCabecalho";
import artigos from "./data/artigos-biblioteca.json";
import { filtrarArtigos } from "./bibliotecaUtils";

export default function BibliotecaTextos() {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({
    busca: "",
    categoria: "",
    nivel: "",
    fabricante: "",
    ordem: "trilha",
  });
  const [artigoId, setArtigoId] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const tituloRef = useRef(null);
  const resultadosRef = useRef(null);
  const filtrados = filtrarArtigos(artigos, filtros);
  const artigo = filtrados.find((item) => item.id === artigoId);
  const posicao = filtrados.findIndex((item) => item.id === artigoId);
  const contagens = artigos.reduce(
    (total, item) => ({
      ...total,
      [item.categoria]: (total[item.categoria] || 0) + 1,
    }),
    {},
  );

  function atualizarFiltro(chave, valor) {
    setFiltros((atuais) => ({ ...atuais, [chave]: valor }));
    setArtigoId(null);
    setMostrarResultados(true);
  }
  function limparFiltros() {
    setBusca("");
    setFiltros({
      busca: "",
      categoria: "",
      nivel: "",
      fabricante: "",
      ordem: "trilha",
    });
    setArtigoId(null);
    setMostrarResultados(false);
  }
  function abrirArtigo(id) {
    setArtigoId(id);
    requestAnimationFrame(() => {
      tituloRef.current?.focus({ preventScroll: true });
      tituloRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
  }
  function voltar() {
    setArtigoId(null);
    requestAnimationFrame(() =>
      resultadosRef.current?.focus({ preventScroll: true }),
    );
  }
  return (
    <>
      <BibliotecaCabecalho
        busca={busca}
        onBuscaChange={setBusca}
        filtros={filtros}
        onPesquisar={(evento) => {
          evento.preventDefault();
          atualizarFiltro("busca", busca.trim());
        }}
        onFiltroChange={atualizarFiltro}
        contagens={contagens}
      />
      <section className="bt-textos" aria-label="Textos da biblioteca">
        {!mostrarResultados ? (
          <div className="bt-estado-vazio">
            <BookOpen size={34} aria-hidden="true" />
            <h2>O que você deseja consultar?</h2>
            <p>
              Escolha uma categoria acima ou pesquise um assunto para encontrar
              os conteúdos técnicos.
            </p>
          </div>
        ) : !artigo ? (
          <>
            <div className="bt-resultados-cabecalho">
              <div>
                <span className="bt-textos-etiqueta">
                  LEITURAS DA BIBLIOTECA
                </span>
                <h2 id="bt-resultados-titulo" ref={resultadosRef} tabIndex={-1}>
                  {filtros.categoria || "Textos técnicos"}
                </h2>
                <p role="status">
                  {filtrados.length}{" "}
                  {filtrados.length === 1
                    ? "texto disponível"
                    : "textos disponíveis"}
                  {filtros.busca ? ` para “${filtros.busca}”` : ""}
                </p>
              </div>
              <button
                className="bt-acao-secundaria"
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            </div>
            {filtrados.length ? (
              <div className="bt-lista-textos">
                {filtrados.map((item) => (
                  <article key={item.id} className="bt-texto-card">
                    <div className="bt-texto-metadados">
                      <span>
                        {item.ordem
                          ? `${String(item.ordem).padStart(2, "0")} · `
                          : ""}
                        {item.categoria}
                      </span>
                      <span>{item.nivel}</span>
                    </div>
                    <h3>{item.titulo}</h3>
                    <p>{item.resumo}</p>
                    <small>{item.status}</small>
                    <button
                      type="button"
                      onClick={() => abrirArtigo(item.id)}
                      aria-label={`Ler: ${item.titulo}`}
                    >
                      Ler conteúdo <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bt-estado-vazio">
                <BookOpen size={34} aria-hidden="true" />
                <h3>
                  {filtros.categoria && !contagens[filtros.categoria]
                    ? "Conteúdos em preparação"
                    : "Nenhum texto encontrado"}
                </h3>
                <p>
                  {filtros.categoria && !contagens[filtros.categoria]
                    ? `Os textos de ${filtros.categoria} ainda estão sendo preparados. As leituras de Baterias já estão disponíveis.`
                    : "Experimente outro termo ou limpe os filtros para consultar as leituras disponíveis."}
                </p>
                <button
                  className="bt-acao-secundaria"
                  type="button"
                  onClick={limparFiltros}
                >
                  Ver todos os textos
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="bt-voltar" type="button" onClick={voltar}>
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar aos resultados
            </button>
            <div className="bt-leitura-localizacao">
              Biblioteca Técnica <ChevronRight size={14} aria-hidden="true" />
              {artigo.categoria}
            </div>
            <div className="bt-leitura-layout">
              <article className="bt-artigo" aria-labelledby="bt-artigo-titulo">
                <header>
                  <div className="bt-texto-metadados">
                    <span>{artigo.nivel}</span>
                    <span>
                      {artigo.fabricante === "Geral"
                        ? "Conteúdo geral"
                        : artigo.fabricante}
                    </span>
                  </div>
                  <h2 id="bt-artigo-titulo" ref={tituloRef} tabIndex={-1}>
                    {artigo.titulo}
                  </h2>
                  <p className="bt-artigo-resumo">{artigo.resumo}</p>
                  <p className="bt-status-editorial">{artigo.status}</p>
                </header>
                {artigo.secoes.map((secao) => (
                  <section key={secao.id} id={`${artigo.id}-${secao.id}`}>
                    <h3>{secao.titulo}</h3>
                    {secao.blocos.map((bloco, indice) =>
                      bloco.tipo === "lista" ? (
                        <ul key={indice}>
                          {bloco.itens.map((texto) => (
                            <li key={texto}>{texto}</li>
                          ))}
                        </ul>
                      ) : bloco.tipo === "aviso" ? (
                        <aside className="bt-artigo-aviso" key={indice}>
                          <ShieldAlert size={21} aria-hidden="true" />
                          <p>{bloco.texto}</p>
                        </aside>
                      ) : (
                        <p key={indice}>{bloco.texto}</p>
                      ),
                    )}
                  </section>
                ))}
                <section id={`${artigo.id}-referencias`} className="bt-fontes">
                  <h3>Referências técnicas</h3>
                  <p>
                    As referências fundamentam os cuidados gerais. Consulte
                    sempre o manual específico do conjunto; estes textos não
                    representam aprovação pelos fabricantes.
                  </p>
                  <ul>
                    {artigo.fontes.map((fonte) => (
                      <li key={fonte.url}>
                        <a href={fonte.url} target="_blank" rel="noreferrer">
                          {fonte.titulo}
                          <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
                <nav
                  className="bt-navegacao-leituras"
                  aria-label="Navegação entre leituras"
                >
                  <button
                    type="button"
                    disabled={posicao === 0}
                    onClick={() => abrirArtigo(filtrados[posicao - 1].id)}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Anterior
                  </button>
                  <span>
                    {posicao + 1} de {filtrados.length}
                  </span>
                  <button
                    type="button"
                    disabled={posicao === filtrados.length - 1}
                    onClick={() => abrirArtigo(filtrados[posicao + 1].id)}
                  >
                    Próximo
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </nav>
              </article>
              <nav className="bt-indice" aria-label="Neste documento">
                <strong>Neste documento</strong>
                {artigo.secoes.map((secao) => (
                  <a key={secao.id} href={`#${artigo.id}-${secao.id}`}>
                    {secao.titulo}
                  </a>
                ))}
                <a href={`#${artigo.id}-referencias`}>Referências técnicas</a>
              </nav>
            </div>
          </>
        )}
      </section>
    </>
  );
}
