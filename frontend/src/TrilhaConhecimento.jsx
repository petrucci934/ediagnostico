import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Cpu,
  Route,
  Zap,
} from "lucide-react";
import "./TrilhaConhecimento.css";

const apresentacao = {
  eletrica: { Icone: Zap, cor: "amarela" },
  eletronica: { Icone: Cpu, cor: "roxa" },
  mobilidade: { Icone: Route, cor: "verde" },
};

function useConhecimento(url, token) {
  const [estado, setEstado] = useState({
    carregando: true,
    dados: null,
    erro: "",
  });
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const resposta = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const dados = await resposta.json();
        if (!resposta.ok)
          throw new Error(
            dados.erro || "Não foi possível carregar o conteúdo.",
          );
        if (
          url.endsWith("/trilhas")
            ? !Array.isArray(dados.trilhas)
            : !Array.isArray(dados.aula?.secoes)
        )
          throw new Error("O conteúdo recebido está incompleto.");
        if (!controller.signal.aborted)
          setEstado({ carregando: false, dados, erro: "" });
      } catch (erro) {
        if (!controller.signal.aborted)
          setEstado({ carregando: false, dados: null, erro: erro.message });
      }
    }
    carregar();
    return () => controller.abort();
  }, [url, token, tentativa]);
  return {
    ...estado,
    tentarNovamente() {
      setEstado({ carregando: true, dados: null, erro: "" });
      setTentativa((valor) => valor + 1);
    },
  };
}

function EstadoConteudo({ carregando, erro, tentarNovamente }) {
  return carregando ? (
    <p role="status">Carregando conteúdo...</p>
  ) : (
    <div className="tc-estado">
      <p role="alert">{erro}</p>
      <button className="tc-voltar" type="button" onClick={tentarNovamente}>
        Tentar novamente
      </button>
    </div>
  );
}

function AulaConhecimento({ id, trilha, token, onAbrir, onVoltar }) {
  const recurso = useConhecimento(
    `/api/conhecimento/aulas/${encodeURIComponent(id)}`,
    token,
  );
  const tituloRef = useRef(null);
  const aula = recurso.dados?.aula;
  useEffect(() => {
    if (aula) {
      tituloRef.current?.focus({ preventScroll: true });
      tituloRef.current?.scrollIntoView({ block: "start" });
    }
  }, [aula]);
  const aulas = trilha.modulos.flatMap((modulo) => modulo.aulas);
  const posicao = aulas.findIndex((item) => item.id === id);
  const modulo = trilha.modulos.find((item) =>
    item.aulas.some((a) => a.id === id),
  );
  return (
    <>
      <button type="button" className="tc-voltar" onClick={onVoltar}>
        <ArrowLeft size={18} aria-hidden="true" /> Voltar à trilha
      </button>
      {!aula ? (
        <EstadoConteudo {...recurso} />
      ) : (
        <>
          <p className="tc-localizacao">
            {trilha.titulo} / {modulo?.titulo}
          </p>
          <div className="tc-leitura-layout">
            <article className="tc-aula">
              <header className="tc-cabecalho">
                <span className="tc-etiqueta">
                  AULA {posicao + 1} DE {aulas.length} · {aula.nivel}
                </span>
                <h1 ref={tituloRef} tabIndex={-1}>
                  {aula.titulo}
                </h1>
                <p>{aula.resumo}</p>
                <small>
                  {aula.status} · Atualização:{" "}
                  {aula.atualizadoEm.split("-").reverse().join("/")}
                </small>
              </header>
              {aula.secoes.map((secao, indice) => (
                <section
                  key={secao.id}
                  id={`tc-${id}-${secao.id}`}
                  className="tc-secao"
                >
                  <h2>
                    <span>{String(indice + 1).padStart(2, "0")}</span>{" "}
                    {secao.titulo}
                  </h2>
                  {secao.blocos.map((bloco, i) =>
                    bloco.tipo === "lista" ? (
                      <ul key={i}>
                        {bloco.itens.map((texto) => (
                          <li key={texto}>{texto}</li>
                        ))}
                      </ul>
                    ) : bloco.tipo === "aviso" ? (
                      <aside className="tc-aviso" key={i}>
                        {bloco.texto}
                      </aside>
                    ) : (
                      <p key={i}>{bloco.texto}</p>
                    ),
                  )}
                </section>
              ))}
              <section className="tc-secao" id={`tc-${id}-fontes`}>
                <h2>Referências e leitura complementar</h2>
                <ul>
                  {aula.fontes.map((fonte) => (
                    <li key={fonte.url}>
                      <a href={fonte.url} target="_blank" rel="noreferrer">
                        {fonte.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <nav className="tc-nav-aulas" aria-label="Navegar entre aulas">
                <button
                  className="tc-voltar"
                  type="button"
                  disabled={posicao <= 0}
                  onClick={() => onAbrir(aulas[posicao - 1].id)}
                >
                  <ArrowLeft size={17} aria-hidden="true" /> Anterior
                </button>
                <span>
                  {posicao + 1} de {aulas.length}
                </span>
                <button
                  className="tc-voltar"
                  type="button"
                  disabled={posicao < 0 || posicao >= aulas.length - 1}
                  onClick={() => onAbrir(aulas[posicao + 1].id)}
                >
                  Próxima <ArrowRight size={17} aria-hidden="true" />
                </button>
              </nav>
            </article>
            <nav className="tc-indice" aria-label="Nesta aula">
              <strong>Nesta aula</strong>
              {aula.secoes.map((secao) => (
                <a key={secao.id} href={`#tc-${id}-${secao.id}`}>
                  {secao.titulo}
                </a>
              ))}
              <a href={`#tc-${id}-fontes`}>Referências</a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export function CardTrilhaConhecimento({ onAbrir }) {
  return (
    <section className="tc-entrada" aria-label="Área de aprendizado">
      <button type="button" className="tc-card-entrada" onClick={onAbrir}>
        <span className="tc-icone-entrada">
          <BookOpen size={30} aria-hidden="true" />
        </span>
        <span className="tc-entrada-texto">
          <small>APRENDA PASSO A PASSO</small>
          <strong>Trilha do Conhecimento</strong>
          <span>
            Elétrica, eletrônica e mobilidade elétrica. Um caminho para entender
            antes de diagnosticar.
          </span>
        </span>
        <ArrowRight className="tc-seta" size={24} aria-hidden="true" />
      </button>
    </section>
  );
}

export default function TrilhaConhecimento({ token, onVoltar }) {
  const recurso = useConhecimento("/api/conhecimento/trilhas", token);
  const [abertas, setAbertas] = useState([]);
  const [aulaId, setAulaId] = useState(null);
  const trilhas = recurso.dados?.trilhas || [];
  const trilhaAtual = trilhas.find((trilha) =>
    trilha.modulos.some((modulo) =>
      modulo.aulas.some((aula) => aula.id === aulaId),
    ),
  );
  return (
    <section
      className="tc-pagina"
      aria-labelledby={aulaId ? undefined : "tc-titulo"}
      aria-label={aulaId ? "Leitura da aula" : undefined}
    >
      {aulaId && trilhaAtual ? (
        <AulaConhecimento
          key={aulaId}
          id={aulaId}
          trilha={trilhaAtual}
          token={token}
          onAbrir={setAulaId}
          onVoltar={() => {
            setAulaId(null);
            requestAnimationFrame(() =>
              document.getElementById(`tc-abrir-${trilhaAtual.id}`)?.focus(),
            );
          }}
        />
      ) : (
        <>
          <button type="button" className="tc-voltar" onClick={onVoltar}>
            <ArrowLeft size={18} aria-hidden="true" /> Voltar
          </button>
          <header className="tc-cabecalho">
            <span className="tc-etiqueta">UM CAMINHO PARA APRENDER</span>
            <h1 id="tc-titulo">Trilha do Conhecimento</h1>
            <p>
              Dos fundamentos à prática na oficina. Escolha uma trilha, explore
              os módulos e abra uma aula para começar.
            </p>
          </header>
          <div className="tc-orientacao">
            <BookOpen size={22} aria-hidden="true" />
            <p>
              <strong>Por onde começar?</strong> Se você está construindo sua
              base, siga a ordem: Elétrica → Eletrônica → Mobilidade elétrica.
              Já tem experiência? Explore a trilha do seu interesse.
            </p>
          </div>
          {recurso.carregando || recurso.erro ? (
            <EstadoConteudo {...recurso} />
          ) : !trilhas.length ? (
            <p className="tc-estado" role="status">
              As trilhas ainda não possuem conteúdos cadastrados.
            </p>
          ) : (
            <div className="tc-grid">
              {trilhas.map((trilha) => {
                const { id, titulo, etapa, descricao, requisito, modulos } =
                  trilha;
                const { Icone, cor } = apresentacao[id] || {
                  Icone: BookOpen,
                  cor: "verde",
                };
                const aberta = abertas.includes(id);
                const total = modulos.reduce(
                  (soma, modulo) => soma + modulo.aulas.length,
                  0,
                );
                return (
                  <article key={id} className={`tc-trilha tc-${cor}`}>
                    <span className="tc-trilha-icone">
                      <Icone size={30} aria-hidden="true" />
                    </span>
                    <small className="tc-etapa">
                      {String(trilha.ordem).padStart(2, "0")} · {etapa}
                    </small>
                    <h2>{titulo}</h2>
                    <p>{descricao}</p>
                    <span className="tc-contagem">
                      {modulos.length} módulos · {total} aulas
                    </span>
                    <button
                      id={`tc-abrir-${id}`}
                      type="button"
                      className="tc-ver-assuntos"
                      aria-expanded={aberta}
                      aria-controls={`tc-assuntos-${id}`}
                      onClick={() =>
                        setAbertas((atuais) =>
                          aberta
                            ? atuais.filter((item) => item !== id)
                            : [...atuais, id],
                        )
                      }
                    >
                      {aberta ? "Recolher módulos" : "Explorar módulos"}
                      <ChevronDown size={18} aria-hidden="true" />
                    </button>
                    <div
                      id={`tc-assuntos-${id}`}
                      hidden={!aberta}
                      className="tc-assuntos"
                    >
                      <p className="tc-requisito">{requisito}</p>
                      {modulos.map((modulo) => (
                        <details key={modulo.id} className="tc-modulo">
                          <summary>
                            {String(modulo.ordem).padStart(2, "0")} ·{" "}
                            {modulo.titulo}
                            <small>{modulo.aulas.length} aulas</small>
                          </summary>
                          <p>{modulo.descricao}</p>
                          <ol>
                            {modulo.aulas.map((aula) => (
                              <li key={aula.id}>
                                <button
                                  type="button"
                                  className="tc-abrir-aula"
                                  onClick={() => setAulaId(aula.id)}
                                >
                                  {aula.titulo}
                                  <small>{aula.nivel}</small>
                                </button>
                              </li>
                            ))}
                          </ol>
                        </details>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
