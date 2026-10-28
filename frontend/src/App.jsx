import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  UserRound,
  Wrench,
  ShieldCheck,
  ClipboardList,
  CircleDollarSign,
  Search,
  History,
  MessageCircle,
} from "lucide-react";
import Precificacao from "./Precificacao";
import Orcamento from "./Orcamento";
import CadastrosOficina from "./CadastrosOficina";
import Administrador from "./Administrador";
import PrimeiroAcessoAdmin from "./PrimeiroAcessoAdmin";
import CampoSenha from "./CampoSenha";
import TabelaPrecosNeon from "./TabelaPrecosNeon";
import videosBiblioteca from "./data/videos-biblioteca.json";
import "./App.css";

function Carrossel({ className, children, label }) {
  const galeriaRef = useRef(null);
  const quantidade = Children.count(children);
  const [indiceAtivo, setIndiceAtivo] = useState(quantidade > 2 ? 1 : 0);
  const [pausado, setPausado] = useState(false);
  const indiceAtual = quantidade ? indiceAtivo % quantidade : 0;

  useEffect(() => {
    const galeria = galeriaRef.current;
    const card = galeria?.children[indiceAtual];
    if (!galeria || !card) return;

    const limitesGaleria = galeria.getBoundingClientRect();
    const limitesCard = card.getBoundingClientRect();
    const deslocamentoHorizontal =
      limitesCard.left +
      limitesCard.width / 2 -
      (limitesGaleria.left + galeria.clientWidth / 2);

    galeria.scrollTo({
      left: galeria.scrollLeft + deslocamentoHorizontal,
      behavior: "smooth",
    });
  }, [indiceAtual]);

  useEffect(() => {
    if (pausado || quantidade < 2) return undefined;

    const timer = window.setInterval(() => {
      setIndiceAtivo((indice) =>
        quantidade > 2
          ? indice >= quantidade - 2
            ? 1
            : indice + 1
          : (indice + 1) % quantidade,
      );
    }, 4000);

    return () => window.clearInterval(timer);
  }, [pausado, quantidade]);

  const cards = Children.map(children, (card, indice) =>
    cloneElement(card, {
      className: [
        card.props.className,
        indice === indiceAtual ? "card-autoplay-ativo" : "",
        Math.abs(indice - indiceAtual) <= 1 ? "card-carrossel-visivel" : "",
      ]
        .filter(Boolean)
        .join(" "),
      "aria-current": indice === indiceAtual ? "true" : "false",
    }),
  );

  function retomarFoco(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPausado(false);
    }
  }

  return (
    <div
      className="carrossel03-wrapper"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={retomarFoco}
    >
      <div className={className} ref={galeriaRef}>
        {cards}
      </div>

      <button
        type="button"
        className="carrossel03-seta carrossel03-anterior"
        aria-label={`${label}: item anterior`}
        onClick={() =>
          setIndiceAtivo((indice) =>
            quantidade > 2
              ? indice <= 1
                ? quantidade - 2
                : indice - 1
              : (indice - 1 + quantidade) % quantidade,
          )
        }
      >
        ‹
      </button>
      <button
        type="button"
        className="carrossel03-seta carrossel03-proximo"
        aria-label={`${label}: próximo item`}
        onClick={() =>
          setIndiceAtivo((indice) =>
            quantidade > 2
              ? indice >= quantidade - 2
                ? 1
                : indice + 1
              : (indice + 1) % quantidade,
          )
        }
      >
        ›
      </button>

      <div className="autoplay-indicadores" aria-label={label}>
        {Children.map(children, (_, indice) => (
          <button
            type="button"
            className={`autoplay-indicador ${indice === indiceAtual ? "ativo" : ""}`}
            aria-label={`${label}: mostrar item ${indice + 1}`}
            aria-current={indice === indiceAtual ? "true" : "false"}
            onClick={() => setIndiceAtivo(indice)}
          />
        ))}
      </div>
    </div>
  );
}

function CartaoVideo({ video, onAssistir }) {
  return (
    <article className="cartao-video-biblioteca">
      <button
        type="button"
        className={`video-poster ${video.disponivel === false ? "indisponivel" : ""}`}
        disabled={video.disponivel === false}
        aria-label={
          video.disponivel === false
            ? `Vídeo indisponível: ${video.modelo}`
            : `Assistir vídeo: ${video.modelo}`
        }
        onClick={() => onAssistir(video)}
      >
        <span className="video-poster-icone" aria-hidden="true">
          {video.disponivel === false ? "×" : "▶"}
        </span>
        <span className="video-poster-legenda">
          {video.disponivel === false
            ? "Vídeo indisponível"
            : "Desbloqueio de Veículos Elétricos"}
        </span>
      </button>
      <div className="cartao-video-conteudo">
        <span className="video-categoria">
          {video.geral ? "Instruções gerais" : "Por modelo"}
        </span>
        <h3>{video.modelo}</h3>
        <p>
          {video.modelo.includes("Aula")
            ? "Etapa de procedimento técnico."
            : video.geral
              ? "Orientações gerais de manutenção e desbloqueio."
              : "Procedimento de desbloqueio e orientações técnicas."}
        </p>
        <small>Data da revisão técnica: 2026</small>
      </div>
    </article>
  );
}

function VisualizadorVideo({ video, onFechar }) {
  const dialogRef = useRef(null);
  const [usarOrigem, setUsarOrigem] = useState(false);
  const [erroVideo, setErroVideo] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="visualizador-video"
      aria-labelledby="visualizador-video-titulo"
      onCancel={(evento) => {
        evento.preventDefault();
        onFechar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <button
        type="button"
        className="visualizador-codigo-fechar"
        aria-label="Fechar vídeo"
        onClick={onFechar}
      >
        ×
      </button>
      <span className="video-categoria">
        {video.geral ? "Instruções gerais" : "Por modelo"}
      </span>
      <h2 id="visualizador-video-titulo">{video.modelo}</h2>
      {erroVideo ? (
        <div className="video-indisponivel" role="alert">
          <strong>Não foi possível reproduzir este vídeo.</strong>
          <span>Tente novamente mais tarde.</span>
        </div>
      ) : (
        <video
          key={usarOrigem ? video.origem : video.local}
          className="visualizador-video-player"
          controls
          playsInline
          preload="metadata"
          src={usarOrigem ? video.origem : video.local}
          onError={() => {
            if (!usarOrigem) setUsarOrigem(true);
            else setErroVideo(true);
          }}
        />
      )}
      <p>
        Esc fecha este painel. A reprodução abre somente quando você escolher.
      </p>
    </dialog>
  );
}

function BibliotecaVideos() {
  const trilhoVideosRef = useRef(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [marcaSelecionada, setMarcaSelecionada] = useState("todas");
  const [videoSelecionado, setVideoSelecionado] = useState(null);
  const [paginaCarrossel, setPaginaCarrossel] = useState(0);
  const [totalPaginasCarrossel, setTotalPaginasCarrossel] = useState(1);
  const videos = videosBiblioteca.map((video) => ({
    ...video,
    geral: video.modelo.includes("(Geral)"),
    marca: (() => {
      if (video.modelo.includes("(Geral)")) return "Geral";
      if (/moto ?chefe/i.test(video.modelo)) return "Moto Chefe";
      if (/^foston/i.test(video.modelo)) return "Foston";
      if (/^jet /i.test(video.modelo)) return "Jet";
      if (/^kimbo/i.test(video.modelo)) return "Kimbo";
      if (/^nxt/i.test(video.modelo)) return "NXT";
      if (/^sudu/i.test(video.modelo)) return "Sudu";
      return "Outros modelos";
    })(),
    local: `/videos/${video.arquivo}`,
    origem: `https://pub-c4a1e03d410a4b8a86df09223cab2563.r2.dev/${video.arquivo}`,
  }));
  const marcas = [...new Set(videos.map((video) => video.marca))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const termo = busca
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
  const filtrados = videos.filter((video) => {
    const correspondeBusca = video.modelo
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .includes(termo);
    const correspondeFiltro =
      filtro === "todos" || (filtro === "gerais" ? video.geral : !video.geral);
    const correspondeMarca =
      marcaSelecionada === "todas" || video.marca === marcaSelecionada;
    return correspondeBusca && correspondeFiltro && correspondeMarca;
  });
  const disponiveis = filtrados.filter(
    (video) => video.disponivel !== false,
  ).length;

  useEffect(() => {
    const trilho = trilhoVideosRef.current;
    if (!trilho) return;
    trilho.scrollTo({ left: 0, behavior: "smooth" });
    setPaginaCarrossel(0);
    const passo = trilho.clientWidth * 0.85;
    const maximo = Math.max(0, trilho.scrollWidth - trilho.clientWidth);
    setTotalPaginasCarrossel(Math.max(1, Math.ceil(maximo / passo) + 1));
  }, [busca, filtro, marcaSelecionada]);

  function atualizarPaginaCarrossel() {
    const trilho = trilhoVideosRef.current;
    if (!trilho) return;
    const passo = trilho.clientWidth * 0.85;
    const maximo = Math.max(0, trilho.scrollWidth - trilho.clientWidth);
    const paginas = Math.max(1, Math.ceil(maximo / passo) + 1);
    setTotalPaginasCarrossel(paginas);
    setPaginaCarrossel(
      Math.min(paginas - 1, Math.round(trilho.scrollLeft / passo)),
    );
  }

  function moverCarrossel(direcao) {
    const trilho = trilhoVideosRef.current;
    if (!trilho) return;
    trilho.scrollBy({
      left: trilho.clientWidth * 0.85 * direcao,
      behavior: "smooth",
    });
  }

  return (
    <section className="biblioteca-videos" aria-labelledby="titulo-videos">
      <div className="galeria-cabecalho">
        <span className="etiqueta">VÍDEOS DE REFERÊNCIA</span>
        <h2 id="titulo-videos">Biblioteca por modelo</h2>
        <p>Busque um modelo ou navegue pelos procedimentos disponíveis.</p>
      </div>
      <div className="biblioteca-videos-filtros">
        <label>
          <span>Buscar por modelo</span>
          <input
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Ex.: Foston, Jet, Motochefe..."
          />
        </label>
        <label>
          <span>Marca</span>
          <select
            value={marcaSelecionada}
            onChange={(evento) => setMarcaSelecionada(evento.target.value)}
          >
            <option value="todas">Todas as marcas</option>
            {marcas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tipo de material</span>
          <select
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
          >
            <option value="todos">Todos os vídeos</option>
            <option value="modelos">Por modelo</option>
            <option value="gerais">Instruções gerais</option>
          </select>
        </label>
        <p className="biblioteca-videos-contagem">
          {disponiveis}{" "}
          {disponiveis === 1 ? "vídeo disponível" : "vídeos disponíveis"}
          {filtrados.length > disponiveis &&
            ` · ${filtrados.length - disponiveis} indisponível`}
        </p>
      </div>
      {filtrados.length ? (
        <div className="biblioteca-videos-carrossel">
          <div className="biblioteca-videos-controles">
            <button
              type="button"
              aria-label="Vídeos anteriores"
              onClick={() => moverCarrossel(-1)}
              disabled={paginaCarrossel === 0}
            >
              ‹
            </button>
            <span aria-live="polite">
              {paginaCarrossel + 1} / {totalPaginasCarrossel}
            </span>
            <button
              type="button"
              aria-label="Próximos vídeos"
              onClick={() => moverCarrossel(1)}
              disabled={paginaCarrossel >= totalPaginasCarrossel - 1}
            >
              ›
            </button>
          </div>
          <div
            className="biblioteca-videos-trilho"
            ref={trilhoVideosRef}
            onScroll={atualizarPaginaCarrossel}
            aria-label="Carrossel de vídeos"
            tabIndex={0}
          >
            {filtrados.map((video) => (
              <CartaoVideo
                key={video.arquivo}
                video={video}
                onAssistir={setVideoSelecionado}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="biblioteca-videos-vazia">
          Nenhum vídeo encontrado. Tente outro modelo.
        </p>
      )}
      <p className="biblioteca-videos-aviso">
        Confirme o modelo, as orientações do fabricante e a legislação local
        antes de executar qualquer procedimento.
      </p>
      {videoSelecionado && (
        <VisualizadorVideo
          video={videoSelecionado}
          onFechar={() => setVideoSelecionado(null)}
        />
      )}
    </section>
  );
}

function VisualizadorCodigo({ item, onFechar }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="visualizador-codigo"
      aria-labelledby="visualizador-codigo-titulo"
      onCancel={(evento) => {
        evento.preventDefault();
        onFechar();
      }}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <button
        type="button"
        className="visualizador-codigo-fechar"
        aria-label="Fechar slide ampliado"
        onClick={onFechar}
      >
        ×
      </button>
      <h2 id="visualizador-codigo-titulo">Código {item.codigo}</h2>
      <img src={item.imagem} alt={`Slide completo do código ${item.codigo}`} />
      <p>Pressione Esc ou clique fora do slide para fechar.</p>
    </dialog>
  );
}

const IMAGENS_PADRAO_CODIGO = {
  P001: "/images/P001.png",
  P002: "/images/P002.png",
  P003: "/images/P003.png",
  P004: "/images/P004.png",
  P005: "/images/P005.png",
  P006: "/images/P006.png",
  P007: "/images/P007.png",
  P008: "/images/P008.png",
};

function criarCardsResultado(resultado) {
  const imagens = Array.isArray(resultado.imagens) ? resultado.imagens : [];

  if (imagens.length > 0) {
    return imagens.map((imagem, indice) => ({
      ...imagem,
      chave: imagem.id || `${imagem.image_path}-${indice}`,
      codigo: resultado.codigo,
      imagem: IMAGENS_PADRAO_CODIGO[resultado.codigo] || imagem.image_path,
      descricao: /^recorte individual\b/i.test(imagem.caption?.trim() || "")
        ? ""
        : imagem.caption || imagem.source_title || "",
    }));
  }

  const linhas = Array.isArray(resultado.resultados)
    ? resultado.resultados
    : [];
  const linhasUnicas = [
    ...new Map(
      linhas.map((linha) => [
        `${linha.code || resultado.codigo}-${linha.description || ""}`,
        linha,
      ]),
    ).values(),
  ];

  if (linhasUnicas.length === 0) {
    return [
      {
        chave: resultado.codigo,
        codigo: resultado.codigo,
        descricao: "Não há imagem cadastrada para este código.",
      },
    ];
  }

  return linhasUnicas.map((linha, indice) => {
    const codigo = linha.code || resultado.codigo;
    return {
      ...linha,
      chave: `${codigo}-${indice}`,
      codigo,
      imagem: IMAGENS_PADRAO_CODIGO[codigo] || linha.image_path,
      descricao:
        linha.description || "Não há imagem cadastrada para este código.",
    };
  });
}

function CardImagemResultado({ item }) {
  const [imagemFalhou, setImagemFalhou] = useState(false);

  return (
    <article
      className={`card-imagem-gerado ${!item.imagem || imagemFalhou ? "card-diagnostico-sem-imagem" : ""}`}
    >
      {item.imagem && !imagemFalhou ? (
        <img
          src={item.imagem}
          alt={item.descricao || `Card do código ${item.codigo}`}
          onError={() => setImagemFalhou(true)}
        />
      ) : (
        <div className="card-diagnostico-descricao">
          <span>CÓDIGO DE ERRO</span>
          <h3>{item.codigo}</h3>
          <p>
            {item.descricao || "Não há imagem cadastrada para este código."}
          </p>
          {item.manufacturer && <small>Fabricante: {item.manufacturer}</small>}
          {item.component_type && (
            <small>Componente: {item.component_type}</small>
          )}
        </div>
      )}
      {item.imagem && item.descricao && !imagemFalhou && (
        <p className="legenda-card-diagnostico">{item.descricao}</p>
      )}
    </article>
  );
}

const GUIAS_PDF = [
  {
    titulo: "Tabela de códigos de erro",
    arquivo: "Bonus+1+-+Manual+reparo.pdf",
    capa: "tabela-codigos-erros.jpg",
  },
  {
    titulo: "Precificação de serviços elétricos",
    arquivo: "Bonus+2+-+Manual+reparo.pdf",
    capa: "precificacao-servicos-eletricos.jpg",
  },
  {
    titulo: "Compra de peças de reposição",
    arquivo: "Bonus+3+-+Manual+reparo.pdf",
    capa: "compra-pecas-reposicao.jpg",
  },
  {
    titulo: "Sequência do reparo",
    arquivo: "Bonus+4+-+Manual+reparo.pdf",
    capa: "sequencia-reparo.jpg",
  },
  {
    titulo: "Dicionário visual de componentes",
    arquivo: "Dicionario+Viasual+de+Componentes.pdf",
    capa: "dicionario-componentes.jpg",
  },
  {
    titulo: "Gabarito do multímetro",
    arquivo: "Gabarito+do+Multimetro.pdf",
    capa: "gabarito-multimetro.jpg",
  },
  {
    titulo: "Desmontagem por modelo",
    arquivo: "Guia+de+Desmontagem+por+Modelo.pdf",
    capa: "desmontagem-por-modelo.jpg",
  },
  {
    titulo: "Manual completo de reparos",
    arquivo: "Manual+Completo.pdf",
    capa: "manual-completo-reparos.jpg",
  },
];

function BotaoWhatsApp() {
  const [contatos, setContatos] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function carregarContatos() {
      try {
        const resposta = await fetch("/api/whatsapp-contatos");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os contatos.");
        }

        const dados = await resposta.json();

        if (!cancelado) {
          setContatos(Array.isArray(dados.contatos) ? dados.contatos : []);
        }
      } catch (erro) {
        console.error("Erro ao carregar contatos do WhatsApp:", erro);
      } finally {
        if (!cancelado) setCarregado(true);
      }
    }

    carregarContatos();

    return () => {
      cancelado = true;
    };
  }, []);

  function abrirConversa(contato) {
    const telefone = String(contato.telefone || "").replace(/\D/g, "");

    if (!telefone) return;

    const mensagem = encodeURIComponent(
      "Olá! Gostaria de informações sobre o E-Diagnóstico.",
    );

    window.open(
      `https://wa.me/${telefone}?text=${mensagem}`,
      "_blank",
      "noopener,noreferrer",
    );

    setAberto(false);
  }

  if (!carregado || contatos.length === 0) return null;

  return (
    <div className="whatsapp-flutuante">
      {aberto && (
        <section className="whatsapp-painel" aria-label="Contatos de WhatsApp">
          <div className="whatsapp-painel-cabecalho">
            <strong>Fale conosco</strong>
            <button
              type="button"
              aria-label="Fechar contatos"
              onClick={() => setAberto(false)}
            >
              ×
            </button>
          </div>

          <p>Escolha um contato para iniciar a conversa:</p>

          <ul>
            {contatos.map((contato) => (
              <li key={contato.id ?? contato.telefone}>
                <button
                  type="button"
                  className="whatsapp-contato"
                  onClick={() => abrirConversa(contato)}
                >
                  <span className="whatsapp-contato-icone">◉</span>
                  <span>{contato.nome}</span>
                  <span aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button
        type="button"
        className="whatsapp-botao"
        aria-label={
          aberto ? "Fechar contatos do WhatsApp" : "Fale conosco pelo WhatsApp"
        }
        aria-expanded={aberto}
        onClick={() => setAberto((valor) => !valor)}
      >
        {aberto ? (
          <span className="whatsapp-fechar">×</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M16 2.7a13.1 13.1 0 0 0-11.2 20L3 29.3l6.8-1.8A13.1 13.1 0 1 0 16 2.7Zm0 23.8a10.7 10.7 0 0 1-5.4-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4A10.7 10.7 0 1 1 16 26.5Zm5.9-8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.3.2-.6.1a8.8 8.8 0 0 1-2.6-1.6 9.8 9.8 0 0 1-1.8-2.2c-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5 2.4 3.8 5.9 5.2c.8.3 1.4.5 2 .6.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.1-1.5s.3-1.3.2-1.5-.3-.2-.6-.4Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

function App() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [fabricanteSelecionado, setFabricanteSelecionado] = useState("");
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState("");
  // Mantém os procedimentos carregados para a exibição técnica futura.
  // eslint-disable-next-line no-unused-vars
  const [procedimentos, setProcedimentos] = useState([]);
  const [telaAtual, setTelaAtual] = useState(() => {
    try {
      const perfilSalvo = JSON.parse(
        localStorage.getItem("ediagnostico-usuario"),
      )?.perfil;
      if (perfilSalvo === "admin") return "administracao";
      if (perfilSalvo === "mecanico") return "testes";
    } catch {
      // Mantém o diagnóstico como tela inicial se não houver perfil salvo válido.
    }
    return "diagnostico";
  });
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [atendimentos, setAtendimentos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [carregandoAtendimentos, setCarregandoAtendimentos] = useState(false);
  const [erroAtendimentos, setErroAtendimentos] = useState("");
  const [abaTeste, setAbaTeste] = useState("biblioteca");
  const [abaCadastroInicial, setAbaCadastroInicial] = useState("clientes");
  const [mostrarCadastroInline, setMostrarCadastroInline] = useState(false);
  const [abaCliente, setAbaCliente] = useState("falhas");
  const [codigoAmpliado, setCodigoAmpliado] = useState(null);

  const [testesTecnicos, setTestesTecnicos] = useState([]);
  const [carregandoTestes, setCarregandoTestes] = useState(false);
  const [erroTestes, setErroTestes] = useState("");
  const [mensagemTestes, setMensagemTestes] = useState("");
  const [formTeste, setFormTeste] = useState({
    vehicle_model_id: "",
    fault_code_id: "",
    test_conditions: "",
    procedure_performed: "",
    observed_result: "",
    outcome: "inconclusivo",
    evidence_notes: "",
    evidence_url: "",
  });
  const [codigosTeste, setCodigosTeste] = useState([]);

  const [perfil, setPerfil] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("ediagnostico-usuario"))?.perfil || ""
      );
    } catch {
      return "";
    }
  });
  const [token, setToken] = useState(
    () => localStorage.getItem("ediagnostico-token") || "",
  );
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ediagnostico-usuario")) || null;
    } catch {
      return null;
    }
  });
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [perfilEscolhido, setPerfilEscolhido] = useState("");
  const [carregandoLogin, setCarregandoLogin] = useState(false);
  const [historico, setHistorico] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ediagnostico-historico")) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("ediagnostico-historico", JSON.stringify(historico));
  }, [historico]);

  useEffect(() => {
    async function carregarFabricantes() {
      try {
        const resposta = await fetch("/api/fabricantes");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os fabricantes.");
        }

        const dados = await resposta.json();
        setFabricantes(dados.fabricantes || []);
      } catch (error) {
        console.error("Erro ao carregar fabricantes:", error);
      }
    }

    carregarFabricantes();
  }, []);

  useEffect(() => {
    async function carregarModelos() {
      try {
        const resposta = await fetch("/api/modelos");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os modelos.");
        }

        const dados = await resposta.json();
        setModelos(dados.modelos || []);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
      }
    }

    carregarModelos();
  }, []);
  async function fazerLogin(event) {
    event.preventDefault();
    setErroLogin("");
    setCarregandoLogin(true);

    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          login: emailLogin,
          senha: senhaLogin,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível realizar o login.");
      }

      localStorage.setItem("ediagnostico-token", dados.token);
      localStorage.setItem(
        "ediagnostico-usuario",
        JSON.stringify(dados.usuario),
      );

      setToken(dados.token);
      setUsuarioLogado(dados.usuario);
      setPerfil(dados.usuario.perfil);
      setSenhaLogin("");
      setTelaAtual(
        dados.usuario.perfil === "mecanico"
          ? "testes"
          : dados.usuario.perfil === "admin"
            ? "administracao"
            : "diagnostico",
      );
    } catch (erro) {
      setErroLogin(erro.message);
    } finally {
      setCarregandoLogin(false);
    }
  }

  const carregarTestes = useCallback(async () => {
    setCarregandoTestes(true);
    setErroTestes("");

    try {
      const resposta = await fetch("/api/testes-tecnicos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível carregar os testes.");
      }

      setTestesTecnicos(dados.testes || []);
    } catch (erro) {
      setErroTestes(erro.message);
    } finally {
      setCarregandoTestes(false);
    }
  }, [token]);

  useEffect(() => {
    if (
      (perfil === "mecanico" && telaAtual === "testes") ||
      (perfil === "revisor" && telaAtual === "revisao")
    ) {
      // A carga é assíncrona e atualiza estado quando a resposta chegar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      carregarTestes();
    }
  }, [perfil, telaAtual, carregarTestes]);

  async function carregarCodigosTeste(modeloId) {
    setCodigosTeste([]);
    setFormTeste((anterior) => ({
      ...anterior,
      vehicle_model_id: modeloId,
      fault_code_id: "",
    }));

    if (!modeloId) return;

    try {
      const resposta = await fetch(`/api/modelos/${modeloId}/codigos`);
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível carregar os códigos.");
      }

      setCodigosTeste(dados.codigos || []);
    } catch (erro) {
      setErroTestes(erro.message);
    }
  }

  async function salvarTeste(event) {
    event.preventDefault();
    setErroTestes("");
    setMensagemTestes("");

    try {
      const resposta = await fetch("/api/testes-tecnicos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formTeste,
          vehicle_model_id: Number(formTeste.vehicle_model_id),
          fault_code_id: Number(formTeste.fault_code_id),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível salvar o teste.");
      }

      setMensagemTestes("Teste registrado e enviado para revisão técnica.");

      setFormTeste({
        vehicle_model_id: "",
        fault_code_id: "",
        test_conditions: "",
        procedure_performed: "",
        observed_result: "",
        outcome: "inconclusivo",
        evidence_notes: "",
        evidence_url: "",
      });

      setCodigosTeste([]);
      await carregarTestes();
    } catch (erro) {
      setErroTestes(erro.message);
    }
  }

  async function consultarCodigo(event, codigoInformado, filtros = {}) {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    const codigoDigitado = (codigoInformado ?? codigo).trim().toUpperCase();

    const codigoPesquisa = codigoDigitado.replace(
      /^([A-Z]+)0*(\d+)$/,
      (_, letras, numeros) => letras + numeros.padStart(3, "0"),
    );
    if (!codigoPesquisa) {
      setErro("Digite um código de erro para consultar.");
      setResultado(null);
      return;
    }

    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const fabricanteId = filtros.fabricanteId ?? fabricanteSelecionado;

      const modeloId = filtros.modeloId ?? modeloSelecionado;

      const fabricante = fabricantes.find(
        (item) => String(item.id) === String(fabricanteId),
      );

      const modelo = modelos.find(
        (item) => String(item.id) === String(modeloId),
      );
      const urlConsulta = fabricante
        ? `/api/fabricantes/${encodeURIComponent(fabricante.name)}/codigos/${encodeURIComponent(codigoPesquisa)}${
            modeloId ? `?modeloId=${encodeURIComponent(modeloId)}` : ""
          }`
        : `/api/detalhes/${encodeURIComponent(codigoPesquisa)}`;
      const resposta = await fetch(urlConsulta);

      const dados = await resposta.json();
      console.log("Resposta da API:", dados);
      if (resposta.status === 404) {
        setSugestoes(dados.sugestoes || []);
        setErro(dados.mensagem || "Código não encontrado.");
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível consultar o código. Tente novamente.",
        );
      }

      setSugestoes([]);
      setResultado(dados);

      const itemHistorico = {
        codigo: codigoPesquisa,
        fabricante: fabricante?.name || "Todos os fabricantes",
        modelo: modelo?.model_name || "",
        data: new Date().toLocaleString("pt-BR"),
      };

      setHistorico((historicoAnterior) => {
        const historicoAtualizado = [
          itemHistorico,
          ...historicoAnterior.filter(
            (item) =>
              !(
                item.codigo === itemHistorico.codigo &&
                item.fabricante === itemHistorico.fabricante &&
                item.modelo === itemHistorico.modelo
              ),
          ),
        ];

        return historicoAtualizado.slice(0, 2);
      });

      const respostaProcedimentos = await fetch(
        `/api/procedimentos/${encodeURIComponent(codigoPesquisa)}`,
      );

      if (respostaProcedimentos.ok) {
        const dadosProcedimentos = await respostaProcedimentos.json();
        setProcedimentos(dadosProcedimentos.procedimentos || []);
      } else {
        setProcedimentos([]);
      }
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível conectar à API. Verifique se o backend está ativo.",
      );
      setSugestoes([]);
      setResultado(null);
    } finally {
      setCarregando(false);
    }
  }

  const ehMecanico =
    perfil === "mecanico" || usuarioLogado?.perfil === "mecanico";
  const ehCliente = perfil === "cliente" || perfilEscolhido === "cliente";

  return (
    <main className="pagina">
      <header className="cabecalho">
        <a className="marca" href="/" aria-label="E-Diagnóstico, início">
          <span className="marca-icone">E</span>
          <span>
            <strong>E-Diagnóstico</strong>
            <small>Diagnóstico de veículos elétricos</small>
          </span>
        </a>

        <button
          type="button"
          className="botao-menu"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? (
            <span aria-hidden="true">×</span>
          ) : (
            <span aria-hidden="true">☰</span>
          )}
        </button>

        <nav
          id="menu-principal"
          className={`navegacao ${menuAberto ? "menu-aberto" : ""}`}
        >
          {perfil !== "admin" && usuarioLogado?.perfil !== "admin" && (
            <button
              type="button"
              className={telaAtual === "diagnostico" ? "nav-ativo" : ""}
              onClick={() => {
                setTelaAtual("diagnostico");
                setMenuAberto(false);
              }}
            >
              Diagnóstico
            </button>
          )}

          {ehMecanico && (
            <button
              type="button"
              className={telaAtual === "precificacao" ? "nav-ativo" : ""}
              onClick={() => {
                setTelaAtual("precificacao");
                setMenuAberto(false);
              }}
            >
              Precificação de Serviços
            </button>
          )}

          {(perfil === "mecanico" || usuarioLogado?.perfil === "mecanico") && (
            <>
              <button
                type="button"
                className={telaAtual === "atendimentos" ? "nav-ativo" : ""}
                onClick={() => {
                  setTelaAtual("atendimentos");
                  setMenuAberto(false);
                }}
              >
                Atendimentos
              </button>

              <button
                type="button"
                className={telaAtual === "cadastros" ? "nav-ativo" : ""}
                onClick={() => {
                  setTelaAtual("cadastros");
                  setMenuAberto(false);
                }}
              >
                Clientes e catálogo
              </button>

              <button
                type="button"
                className={telaAtual === "testes" ? "nav-ativo" : ""}
                onClick={() => {
                  setTelaAtual("testes");
                  setMenuAberto(false);
                }}
              >
                Biblioteca Técnica
              </button>
            </>
          )}
          {(perfil === "admin" || usuarioLogado?.perfil === "admin") &&
            !usuarioLogado?.deve_trocar_credenciais && (
              <button
                type="button"
                className={telaAtual === "administracao" ? "nav-ativo" : ""}
                onClick={() => {
                  setTelaAtual("administracao");
                  setMenuAberto(false);
                }}
              >
                Administrador
              </button>
            )}
          {(perfil || perfilEscolhido === "cliente") && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("ediagnostico-token");
                localStorage.removeItem("ediagnostico-usuario");

                setToken("");
                setUsuarioLogado(null);
                setPerfil("");
                setPerfilEscolhido("");
                setEmailLogin("");
                setSenhaLogin("");
                setErroLogin("");
                setTelaAtual("diagnostico");
                setResultado(null);
                setErro("");
                setSugestoes([]);
                setProcedimentos([]);
                setAtendimentos([]);
                setErroAtendimentos("");
                setTestesTecnicos([]);
                setMenuAberto(false);
              }}
            >
              Trocar perfil
            </button>
          )}
        </nav>
      </header>

      {!usuarioLogado &&
        (!perfilEscolhido || perfilEscolhido !== "cliente") && (
          <section className="principal">
            {!perfilEscolhido && (
              <>
                <span className="etiqueta">BEM-VINDO AO E-DIAGNÓSTICO</span>

                <h1>
                  Como deseja acessar?
                  <br />
                  <span>Escolha seu perfil.</span>
                </h1>

                <p className="introducao">
                  Selecione uma opção para continuar.
                </p>
              </>
            )}
            {!perfilEscolhido ? (
              <div className="selecao-perfis">
                <button
                  type="button"
                  className="cartao-perfil"
                  onClick={() => {
                    setPerfilEscolhido("cliente");
                    setPerfil("");
                    setTelaAtual("diagnostico");
                  }}
                >
                  <UserRound className="icone-perfil cliente" size={25} />
                  <strong>Cliente</strong>
                  <span>Consultar falhas, causas e preços estimados.</span>
                  <small className="etiqueta-acesso publico">Sem login</small>
                </button>
                <button
                  type="button"
                  className="cartao-perfil"
                  onClick={() => setPerfilEscolhido("mecanico")}
                >
                  <Wrench className="icone-perfil mecanico" size={25} />
                  <strong>Mecânico</strong>
                  <span>Registrar testes e procedimentos técnicos.</span>
                  <small className="etiqueta-acesso">Com login</small>
                </button>

                <button
                  type="button"
                  className="cartao-perfil"
                  onClick={() => setPerfilEscolhido("revisor")}
                >
                  <ShieldCheck className="icone-perfil revisor" size={25} />
                  <strong>Revisor técnico</strong>
                  <span>Analisar e aprovar testes técnicos.</span>
                  <small className="etiqueta-acesso">Com login</small>
                </button>

                <button
                  type="button"
                  className="cartao-perfil"
                  onClick={() => setPerfilEscolhido("admin")}
                >
                  <ClipboardList
                    className="icone-perfil administrador"
                    size={25}
                  />
                  <strong>Administrador</strong>
                  <span>Gerenciar usuários e configurações.</span>
                  <small className="etiqueta-acesso">Com login</small>
                </button>
              </div>
            ) : perfilEscolhido !== "cliente" ? (
              <form className="formulario" onSubmit={fazerLogin}>
                <p>
                  Perfil selecionado: <strong>{perfilEscolhido}</strong>
                </p>

                <label htmlFor="emailLogin">Usuário ou e-mail</label>
                <input
                  id="emailLogin"
                  type="text"
                  autoComplete="username"
                  value={emailLogin}
                  onChange={(event) => setEmailLogin(event.target.value)}
                  placeholder="Usuário ou e-mail"
                  required
                />

                <label htmlFor="senhaLogin">Senha</label>
                <CampoSenha
                  id="senhaLogin"
                  autoComplete="current-password"
                  value={senhaLogin}
                  onChange={(event) => setSenhaLogin(event.target.value)}
                  placeholder="Digite sua senha"
                  required
                />

                {erroLogin && <p role="alert">{erroLogin}</p>}

                <button type="submit" disabled={carregandoLogin}>
                  {carregandoLogin ? "Entrando..." : "Entrar"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPerfilEscolhido("");
                    setErroLogin("");
                    setSenhaLogin("");
                  }}
                >
                  Voltar
                </button>
              </form>
            ) : null}
          </section>
        )}

      {((perfil && perfil !== "admin" && usuarioLogado?.perfil !== "admin") ||
        perfilEscolhido === "cliente") &&
        telaAtual === "diagnostico" && (
          <section className="principal">
            <span className="etiqueta">CENTRAL DE DIAGNÓSTICO</span>
            <p className="perfil-atual">
              Perfil:{" "}
              {{
                cliente: "Cliente",
                mecanico: "Mecânico",
                revisor: "Supervisor",
                supervisor: "Supervisor",
                admin: "Administrador",
              }[perfilEscolhido || usuarioLogado?.perfil || perfil] ||
                "Não identificado"}
            </p>

            <h1>
              Encontre a falha.
              <br />
              <span>Entenda a solução.</span>
            </h1>

            <p className="introducao">
              Consulte códigos de erro de bicicletas, motos e scooters elétricas
              em um só lugar.
            </p>
            {ehCliente && (
              <div
                className="abas-cliente"
                role="tablist"
                aria-label="Área do cliente"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={abaCliente === "falhas"}
                  className={`aba-cliente ${abaCliente === "falhas" ? "ativa" : ""}`}
                  onClick={() => setAbaCliente("falhas")}
                >
                  <Search size={22} aria-hidden="true" />
                  <strong>Consultar falhas</strong>
                  <span>Diagnóstico por código</span>
                </button>
              </div>
            )}

            {ehCliente && abaCliente === "tabela" && (
              <>
                <div
                  className="painel-tabela-precos"
                  role="tabpanel"
                  aria-label="Tabela de serviços e preços"
                >
                  <TabelaPrecosNeon />
                </div>

                <section className="beneficios-moto">
                  <header className="beneficios-cabecalho">
                    <span className="etiqueta">MANUTENÇÃO PREVENTIVA</span>
                    <h2>Por que revisar sua moto elétrica?</h2>
                    <p>
                      A manutenção periódica protege você, sua moto e sua
                      garantia.
                    </p>
                  </header>

                  <div className="beneficios-grid">
                    <article className="beneficio-card">
                      <span className="beneficio-icone" aria-hidden="true">
                        🛡️
                      </span>
                      <h3>Protege sua garantia</h3>
                      <p>
                        A manutenção periódica conforme as orientações do
                        fabricante ajuda a preservar a garantia do veículo.
                      </p>
                    </article>

                    <article className="beneficio-card">
                      <span className="beneficio-icone" aria-hidden="true">
                        🔋
                      </span>
                      <h3>Prolonga a vida da bateria</h3>
                      <p>
                        Verificações regulares ajudam a identificar problemas
                        que podem comprometer a bateria.
                      </p>
                    </article>

                    <article className="beneficio-card">
                      <span className="beneficio-icone" aria-hidden="true">
                        🚦
                      </span>
                      <h3>Garante sua segurança</h3>
                      <p>
                        Mantenha freios, pneus, luzes e suspensão em boas
                        condições para uma pilotagem mais segura.
                      </p>
                    </article>

                    <article className="beneficio-card">
                      <span className="beneficio-icone" aria-hidden="true">
                        💰
                      </span>
                      <h3>Evita gastos maiores</h3>
                      <p>
                        Pequenos ajustes preventivos podem evitar falhas e
                        reparos mais caros no futuro.
                      </p>
                    </article>
                  </div>
                </section>
              </>
            )}

            {(perfil === "mecanico" || usuarioLogado?.perfil === "mecanico") &&
              abaTeste === "biblioteca" && (
                <section className="galeria-mecanico">
                  <div className="moldura-carrossel">
                    <div className="galeria-cabecalho">
                      <span className="etiqueta">BIBLIOTECA TÉCNICA</span>
                      <h2>Códigos de diagnóstico</h2>
                      <p>
                        Consulte os cards de referência para identificar códigos
                        de falha.
                      </p>
                    </div>

                    <Carrossel
                      className="galeria-codigos"
                      label="Códigos de diagnóstico"
                    >
                      {[
                        { codigo: "P001", imagem: "/images/P001.png" },
                        { codigo: "P002", imagem: "/images/P002.png" },
                        { codigo: "P003", imagem: "/images/P003.png" },
                        { codigo: "P004", imagem: "/images/P004.png" },
                        { codigo: "P005", imagem: "/images/P005.png" },
                        { codigo: "P006", imagem: "/images/P006.png" },
                        { codigo: "P007", imagem: "/images/P007.png" },
                        { codigo: "P008", imagem: "/images/P008.png" },
                      ].map((item) => (
                        <button
                          type="button"
                          className="galeria-codigo-card"
                          key={item.codigo}
                          aria-label={`Ampliar slide do código ${item.codigo}`}
                          onClick={() => setCodigoAmpliado(item)}
                        >
                          <img
                            src={item.imagem}
                            alt={`Card de diagnóstico ${item.codigo}`}
                          />
                          <h3>{item.codigo}</h3>
                        </button>
                      ))}
                    </Carrossel>
                  </div>

                  <div className="moldura-carrossel">
                    <div className="galeria-cabecalho galeria-guias-cabecalho">
                      <span className="etiqueta">MATERIAL DE APOIO</span>
                      <h2>Guias para o mecânico</h2>
                      <p>
                        Materiais de consulta para apoiar os serviços da
                        oficina.
                      </p>
                    </div>

                    <Carrossel
                      className="galeria-guias"
                      label="Guias para o mecânico"
                    >
                      <a
                        className="galeria-guia-card"
                        href="/images/mecanico/Guia%20de%20Precifica%C3%A7%C3%A3o%20de%20Servi%C3%A7os%20El%C3%A9tricos.png"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src="/images/mecanico/Guia%20de%20Precifica%C3%A7%C3%A3o%20de%20Servi%C3%A7os%20El%C3%A9tricos.png"
                          alt="Guia de Precificação de Serviços Elétricos"
                        />
                        <h3>Guia de precificação</h3>
                        <span>Ver material</span>
                      </a>

                      <a
                        className="galeria-guia-card"
                        href="/images/mecanico/Guia%20para%20me%C3%A2nicos.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="capa-guia-mecanicos"
                          src="/images/mecanico/Guia%20para%20Mec%C3%A2nicos%20de%20Scooters%20El%C3%A9tricas.png"
                          alt="Guia para Mecânicos de Scooters Elétricas"
                        />
                        <h3>Guia para mecânicos</h3>
                        <span>Abrir catálogo</span>
                      </a>

                      <a
                        className="galeria-guia-card"
                        href="/images/mecanico/codigo-erros.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="capa-codigos-erros"
                          src="/images/mecanico/capa-codigos-erros.png"
                          alt="Capa do catálogo Códigos e erros"
                        />
                        <h3>Códigos e erros</h3>
                        <span>Abrir catálogo</span>
                      </a>

                      <a
                        className="galeria-guia-card"
                        href="/images/mecanico/How%20to%20Use%20This%20Guide.png"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src="/images/mecanico/How%20to%20Use%20This%20Guide.png"
                          alt="Orientações de uso do guia"
                        />
                        <h3>Como usar o guia</h3>
                        <span>Ver material</span>
                      </a>

                      {GUIAS_PDF.map(({ titulo, arquivo, capa }) => (
                        <a
                          className="galeria-guia-card"
                          href={`/images/pdf/${arquivo}`}
                          key={arquivo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={`/images/pdf/capas/${capa}`}
                            alt={`Capa: ${titulo}`}
                          />
                          <h3>{titulo}</h3>
                          <span>Abrir PDF</span>
                        </a>
                      ))}
                    </Carrossel>
                  </div>
                  <BibliotecaVideos />
                </section>
              )}

            {!ehMecanico && (!ehCliente || abaCliente === "falhas") && (
              <form className="formulario" onSubmit={consultarCodigo}>
                <label htmlFor="fabricante">Fabricante do veículo</label>

                <select
                  id="fabricante"
                  value={fabricanteSelecionado}
                  onChange={(event) => {
                    setFabricanteSelecionado(event.target.value);
                    setModeloSelecionado("");
                  }}
                >
                  <option value="">Selecione um fabricante</option>

                  {fabricantes.map((fabricante) => (
                    <option key={fabricante.id} value={fabricante.id}>
                      {fabricante.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="modelo">Modelo do veículo</label>

                <select
                  id="modelo"
                  value={modeloSelecionado}
                  onChange={(event) => setModeloSelecionado(event.target.value)}
                  disabled={!fabricanteSelecionado}
                >
                  <option value="">Selecione um modelo</option>

                  {modelos
                    .filter(
                      (modelo) =>
                        String(modelo.manufacturer_id) ===
                        String(fabricanteSelecionado),
                    )
                    .map((modelo) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.model_name}
                      </option>
                    ))}
                </select>

                <label htmlFor="codigo">Qual é o código de erro?</label>

                <div className="campo-pesquisa">
                  <input
                    id="codigo"
                    type="text"
                    value={codigo}
                    onChange={(event) => setCodigo(event.target.value)}
                    placeholder="Ex.: E010"
                    autoComplete="off"
                    aria-describedby="ajuda-codigo"
                  />

                  <button type="submit" disabled={carregando}>
                    {carregando ? "Consultando..." : "Consultar código"}
                  </button>
                </div>

                <small id="ajuda-codigo">
                  Digite o código exibido no painel ou no sistema de
                  diagnóstico.
                </small>
              </form>
            )}

            {(!ehCliente || abaCliente === "falhas") && erro && (
              <div className="mensagem erro" role="alert">
                {erro}
              </div>
            )}
            {(!ehCliente || abaCliente === "falhas") &&
              sugestoes.length > 0 && (
                <div className="sugestoes-codigos">
                  <p>Você quis dizer um destes códigos?</p>

                  <div className="lista-sugestoes">
                    {sugestoes.map((sugestao) => (
                      <button
                        key={sugestao}
                        type="button"
                        onClick={() => {
                          setCodigo(sugestao);
                          setErro("");
                          setSugestoes([]);
                          consultarCodigo(null, sugestao);
                        }}
                      >
                        {sugestao}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            {(!ehCliente ||
              abaCliente === "falhas" ||
              abaCliente === "consultas") &&
              resultado && (
                <section className="resultado" aria-live="polite">
                  <div className="resultado-topo">
                    <span className="etiqueta">RESULTADO DA CONSULTA</span>
                    <h2>Código {resultado.codigo}</h2>

                    <p>
                      {(() => {
                        const quantidadeFontes = (
                          resultado.resultados || []
                        ).filter(
                          (item) => item.source_title || item.source_url,
                        ).length;

                        if (quantidadeFontes === 1) {
                          return "1 fonte técnica relacionada";
                        }

                        if (quantidadeFontes > 1) {
                          return `${quantidadeFontes} fontes técnicas relacionadas`;
                        }

                        return "Nenhuma fonte técnica relacionada";
                      })()}
                    </p>
                  </div>

                  {criarCardsResultado(resultado).map((item) => (
                    <CardImagemResultado item={item} key={item.chave} />
                  ))}
                </section>
              )}
	    
            {(!ehCliente || abaCliente === "falhas") &&
              historico.length > 0 && (
                <section className="historico-consultas">
                  <h2>Consultas recentes</h2>

                  <div className="lista-historico">
                    {historico.map((item, indice) => (
                      <article
                        className="item-historico"
                        key={`${item.codigo}-${item.fabricante}-${item.modelo}-${indice}`}
                      >
                        <div>
                          <strong>{item.codigo}</strong>
                          <p>{item.fabricante}</p>
                          {item.modelo && <p>{item.modelo}</p>}
                          <small>{item.data}</small>
                        </div>

                        <button
                          type="button"
                          disabled={carregando}
                          onClick={() => {
                            const fabricante = fabricantes.find(
                              (fabricante) =>
                                fabricante.name === item.fabricante,
                            );

                            const modelo = item.modelo
                              ? modelos.find(
                                  (modelo) =>
                                    modelo.model_name === item.modelo &&
                                    String(modelo.manufacturer_id) ===
                                      String(fabricante?.id),
                                )
                              : undefined;

                            const fabricanteId = fabricante
                              ? String(fabricante.id)
                              : "";
                            const modeloId = modelo ? String(modelo.id) : "";

                            setFabricanteSelecionado(fabricanteId);
                            setModeloSelecionado(modeloId);
                            setCodigo(item.codigo);

                            consultarCodigo(null, item.codigo, {
                              fabricanteId,
                              modeloId,
                            });
                          }}
                        >
                          Consultar novamente
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}

            <div className="categorias">
              <span>Bicicletas elétricas</span>
              <span>Motos elétricas</span>
              <span>Scooters elétricas</span>
            </div>
          </section>
        )}
      {perfil === "mecanico" && telaAtual === "atendimentos" && (
        <section className="principal">
          <span className="etiqueta">ÁREA DO MECÂNICO</span>
          <h1>Atendimentos</h1>
          <p>Cadastre e acompanhe os serviços da oficina.</p>

          <form
            onSubmit={async (evento) => {
              evento.preventDefault();
              setErroAtendimentos("");

              const formulario = evento.currentTarget;
              const dados = new FormData(formulario);

              const atendimento = {
                codigo_erro: dados.get("codigo_erro"),
                fabricante: dados.get("fabricante"),
                modelo: dados.get("modelo"),
                problema_relatado: dados.get("problema_relatado"),
              };

              try {
                const resposta = await fetch("/api/atendimentos", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(atendimento),
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                  throw new Error(
                    resultado.erro || "Não foi possível cadastrar.",
                  );
                }

                setAtendimentos((anteriores) => [
                  resultado.atendimento,
                  ...anteriores,
                ]);

                formulario.reset();
              } catch (erro) {
                setErroAtendimentos(erro.message);
              }
            }}
          >
            <label htmlFor="codigo_erro">Código do erro</label>
            <input
              id="codigo_erro"
              name="codigo_erro"
              placeholder="Ex.: E010"
              required
            />

            <label htmlFor="fabricante">Fabricante</label>
            <input
              id="fabricante"
              name="fabricante"
              placeholder="Ex.: Shimano"
              required
            />

            <label htmlFor="modelo">Modelo do veículo</label>
            <input
              id="modelo"
              name="modelo"
              placeholder="Informe o modelo"
              required
            />

            <label htmlFor="problema_relatado">
              Problema relatado pelo cliente
            </label>
            <textarea
              id="problema_relatado"
              name="problema_relatado"
              placeholder="Descreva o defeito informado"
              required
            />

            <button type="submit" className="btn-cadastrar-atendimento">
              <span className="icone-cadastro">✓</span>
              Cadastrar atendimento
              <span className="seta-cadastro">→</span>
            </button>
          </form>

          {erroAtendimentos && <p role="alert">{erroAtendimentos}</p>}

          <h2>Atendimentos registrados</h2>

          <div className="filtros-atendimentos">
            <button
              type="button"
              className={filtroStatus === "todos" ? "filtro-ativo" : ""}
              onClick={() => setFiltroStatus("todos")}
            >
              Todos
            </button>

            <button
              type="button"
              className={filtroStatus === "aberto" ? "filtro-ativo" : ""}
              onClick={() => setFiltroStatus("aberto")}
            >
              Abertos
            </button>

            <button
              type="button"
              className={filtroStatus === "em_andamento" ? "filtro-ativo" : ""}
              onClick={() => setFiltroStatus("em_andamento")}
            >
              Em andamento
            </button>

            <button
              type="button"
              className={filtroStatus === "concluido" ? "filtro-ativo" : ""}
              onClick={() => setFiltroStatus("concluido")}
            >
              Concluídos
            </button>
          </div>
          <button
            type="button"
            className="botao-atualizar"
            onClick={async () => {
              setCarregandoAtendimentos(true);
              setErroAtendimentos("");

              try {
                const resposta = await fetch("/api/atendimentos");
                const resultado = await resposta.json();

                if (!resposta.ok) {
                  throw new Error(
                    resultado.erro || "Não foi possível consultar.",
                  );
                }

                setAtendimentos(resultado.atendimentos);
              } catch (erro) {
                setErroAtendimentos(erro.message);
              } finally {
                setCarregandoAtendimentos(false);
              }
            }}
          >
            {carregandoAtendimentos ? "Carregando..." : "Atualizar lista"}
          </button>

          {atendimentos.length === 0 ? (
            <p>Nenhum atendimento carregado. Clique em Atualizar lista.</p>
          ) : (
            <div className="lista-atendimentos">
              {atendimentos
                .filter(
                  (atendimento) =>
                    filtroStatus === "todos" ||
                    atendimento.status === filtroStatus,
                )
                .map((atendimento) => (
                  <article key={atendimento.id} className="card-atendimento">
                    <div className="cabecalho-atendimento">
                      <div>
                        <span className="identificador-atendimento">
                          ATENDIMENTO #{atendimento.id}
                        </span>
                        <h3>Código {atendimento.codigo_erro}</h3>
                      </div>

                      <span
                        className={`indicador-status status-${atendimento.status}`}
                      >
                        <span className="status-ponto"></span>
                        {atendimento.status === "aberto"
                          ? "Aberto"
                          : atendimento.status === "em_andamento"
                            ? "Em andamento"
                            : atendimento.status === "concluido"
                              ? "Concluído"
                              : atendimento.status}
                      </span>
                    </div>

                    <div className="detalhes-atendimento">
                      <div className="icone-veiculo" aria-hidden="true">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="5.5" cy="17.5" r="2.5" />
                          <circle cx="18.5" cy="17.5" r="2.5" />
                          <path d="M5.5 17.5 9 10h4l5.5 7.5" />
                          <path d="M9 10l4 7.5" />
                          <path d="M7 6h3l3 5" />
                          <circle cx="14" cy="4.5" r="1" />
                        </svg>
                      </div>

                      <div className="informacoes-atendimento">
                        <div className="grade-detalhes">
                          <div className="item-detalhe">
                            <span className="rotulo-detalhe">FABRICANTE</span>
                            <span className="valor-detalhe">
                              {atendimento.fabricante}
                            </span>
                          </div>

                          <div className="item-detalhe">
                            <span className="rotulo-detalhe">MODELO</span>
                            <span className="valor-detalhe">
                              {atendimento.modelo}
                            </span>
                          </div>
                        </div>

                        <div className="item-detalhe problema-detalhe">
                          <span className="rotulo-detalhe">
                            PROBLEMA RELATADO
                          </span>
                          <span className="valor-detalhe">
                            {atendimento.problema_relatado}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="campo-status">
                      <label htmlFor={`status-${atendimento.id}`}>
                        Alterar status
                      </label>

                      <select
                        id={`status-${atendimento.id}`}
                        value={atendimento.status}
                        onChange={async (evento) => {
                          const novoStatus = evento.target.value;
                          setErroAtendimentos("");

                          try {
                            const resposta = await fetch(
                              `/api/atendimentos/${atendimento.id}/status`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ status: novoStatus }),
                              },
                            );

                            const resultado = await resposta.json();

                            if (!resposta.ok) {
                              throw new Error(
                                resultado.erro ||
                                  "Não foi possível atualizar o status.",
                              );
                            }

                            setAtendimentos((anteriores) =>
                              anteriores.map((item) =>
                                item.id === resultado.atendimento.id
                                  ? resultado.atendimento
                                  : item,
                              ),
                            );
                          } catch (erro) {
                            setErroAtendimentos(erro.message);
                          }
                        }}
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      )}
      {ehMecanico && telaAtual === "cadastros" && (
        <CadastrosOficina
          key={abaCadastroInicial}
          abaInicial={abaCadastroInicial}
          token={token}
        />
      )}
      {usuarioLogado?.perfil === "admin" &&
        usuarioLogado.deve_trocar_credenciais && (
          <PrimeiroAcessoAdmin
            token={token}
            onFinalizado={(usuarioAtualizado) => {
              localStorage.setItem(
                "ediagnostico-usuario",
                JSON.stringify(usuarioAtualizado),
              );
              setUsuarioLogado(usuarioAtualizado);
              setTelaAtual("administracao");
            }}
          />
        )}
      {(perfil === "admin" || usuarioLogado?.perfil === "admin") &&
        !usuarioLogado?.deve_trocar_credenciais &&
        telaAtual === "administracao" && <Administrador token={token} />}
      {ehMecanico && telaAtual === "precificacao" && <Precificacao />}

      {perfil === "mecanico" && telaAtual === "testes" && (
        <section className="principal">
          <span className="etiqueta">ÁREA DO MECÂNICO</span>
          <h1>Biblioteca Técnica</h1>
          <p>
            Registre testes realizados e contribua para a validação técnica dos
            códigos de falha.
          </p>
          <div className="abas-mecanico">
            <button
              type="button"
              className={`aba-mecanico biblioteca ${abaTeste === "biblioteca" ? "ativa" : ""}`}
              onClick={() => setAbaTeste("biblioteca")}
            >
              <span className="aba-icone">▥</span>
              <span className="aba-titulo">Biblioteca Técnica</span>
              <span className="aba-descricao">Códigos e guias</span>
            </button>

            <button
              type="button"
              className={`aba-mecanico novo-teste ${abaTeste === "novo-teste" ? "ativa" : ""}`}
              onClick={() => setAbaTeste("novo-teste")}
            >
              <span className="aba-icone">♧</span>
              <span className="aba-titulo">Novo Teste</span>
              <span className="aba-descricao">Cadastrar teste</span>
            </button>

            <button
              type="button"
              className="aba-mecanico precificar"
              onClick={() => setTelaAtual("precificacao")}
            >
              <span className="aba-icone" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
                  <path d="M12 6v12" />
                </svg>
              </span>
              <span className="aba-titulo">Precificar</span>
              <span className="aba-descricao">MO + materiais</span>
            </button>

            <button
              type="button"
              className={`aba-mecanico orcamento ${abaTeste === "orcamento" ? "ativa" : ""}`}
              onClick={() => setAbaTeste("orcamento")}
            >
              <span className="aba-icone" aria-hidden="true">
                ▤
              </span>
              <span className="aba-titulo">Orçamento</span>
              <span className="aba-descricao">Montar proposta</span>
            </button>

            <button
              type="button"
              className="aba-mecanico historico-atendimentos"
              onClick={() => setTelaAtual("atendimentos")}
            >
              <span className="aba-icone" aria-hidden="true">
                ▤
              </span>
              <span className="aba-titulo">Histórico de atendimentos</span>
              <span className="aba-descricao">
                Consultar atendimentos registrados
              </span>
            </button>

            <button
              type="button"
              className="aba-mecanico cadastrar-itens"
              onClick={() => {
                setAbaCadastroInicial("itens");
                setMostrarCadastroInline(true);
              }}
            >
              <span className="aba-icone" aria-hidden="true">
                ⚙
              </span>
              <span className="aba-titulo">Cadastrar serviço/peças</span>
              <span className="aba-descricao">Gerenciar serviços e peças</span>
            </button>
          </div>

          {mostrarCadastroInline && (
            <section className="cadastro-inline">
              <button
                type="button"
                className="fechar-cadastro"
                onClick={() => setMostrarCadastroInline(false)}
              >
                <span aria-hidden="true">←</span>
                Voltar ao menu
              </button>

              <CadastrosOficina
                key={abaCadastroInicial}
                abaInicial={abaCadastroInicial}
                token={token}
              />
            </section>
          )}

          <div className="orientacao-seguranca">
            <strong>Importante</strong>
            <p>
              Todo registro será enviado para revisão. O teste não valida
              automaticamente o código de falha.
            </p>
          </div>

          {abaTeste === "biblioteca" && (
            <section className="galeria-mecanico">
              <div className="moldura-carrossel">
                <div className="galeria-cabecalho">
                  <span className="etiqueta">BIBLIOTECA TÉCNICA</span>
                  <h2>Códigos de diagnóstico</h2>
                  <p>
                    Consulte os cards de referência para identificar códigos de
                    falha.
                  </p>
                </div>

                <Carrossel
                  className="galeria-codigos"
                  label="Códigos de diagnóstico"
                >
                  {[
                    { codigo: "P001", imagem: "/images/P001.png" },
                    { codigo: "P002", imagem: "/images/P002.png" },
                    { codigo: "P003", imagem: "/images/P003.png" },
                    { codigo: "P004", imagem: "/images/P004.png" },
                    { codigo: "P005", imagem: "/images/P005.png" },
                    { codigo: "P006", imagem: "/images/P006.png" },
                    { codigo: "P007", imagem: "/images/P007.png" },
                    { codigo: "P008", imagem: "/images/P008.png" },
                  ].map((item) => (
                    <button
                      type="button"
                      className="galeria-codigo-card"
                      key={item.codigo}
                      aria-label={`Ampliar slide do código ${item.codigo}`}
                      onClick={() => setCodigoAmpliado(item)}
                    >
                      <img
                        src={item.imagem}
                        alt={`Card de diagnóstico ${item.codigo}`}
                      />
                      <h3>{item.codigo}</h3>
                    </button>
                  ))}
                </Carrossel>
              </div>

              <div className="moldura-carrossel">
                <div className="galeria-cabecalho galeria-guias-cabecalho">
                  <span className="etiqueta">MATERIAL DE APOIO</span>
                  <h2>Guias para o mecânico</h2>
                  <p>
                    Materiais de consulta para apoiar os serviços da oficina.
                  </p>
                </div>

                <Carrossel
                  className="galeria-guias"
                  label="Guias para o mecânico"
                >
                  <a
                    className="galeria-guia-card"
                    href="/images/mecanico/Guia%20de%20Precifica%C3%A7%C3%A3o%20de%20Servi%C3%A7os%20El%C3%A9tricos.png"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="/images/mecanico/Guia%20de%20Precifica%C3%A7%C3%A3o%20de%20Servi%C3%A7os%20El%C3%A9tricos.png"
                      alt="Guia de Precificação de Serviços Elétricos"
                    />
                    <h3>Guia de precificação</h3>
                    <span>Ver material</span>
                  </a>

                  <a
                    className="galeria-guia-card"
                    href="/images/mecanico/Guia%20para%20me%C3%A2nicos.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="capa-guia-mecanicos"
                      src="/images/mecanico/Guia%20para%20Mec%C3%A2nicos%20de%20Scooters%20El%C3%A9tricas.png"
                      alt="Capa do Guia para Mecânicos de Scooters Elétricas"
                    />
                    <h3>Guia para mecânicos</h3>
                    <span>Abrir guia</span>
                  </a>

                  <a
                    className="galeria-guia-card"
                    href="/images/mecanico/codigo-erros.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className="capa-codigos-erros"
                      src="/images/mecanico/capa-codigos-erros.png"
                      alt="Capa do catálogo Códigos e erros"
                    />
                    <h3>Códigos e erros</h3>
                    <span>Abrir catálogo</span>
                  </a>

                  <a
                    className="galeria-guia-card"
                    href="/images/mecanico/How%20to%20Use%20This%20Guide.png"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="/images/mecanico/How%20to%20Use%20This%20Guide.png"
                      alt="Orientações de uso do guia"
                    />
                    <h3>Como usar o guia</h3>
                    <span>Ver material</span>
                  </a>

                  {GUIAS_PDF.map(({ titulo, arquivo, capa }) => (
                    <a
                      className="galeria-guia-card"
                      href={`/images/pdf/${arquivo}`}
                      key={arquivo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={`/images/pdf/capas/${capa}`}
                        alt={`Capa: ${titulo}`}
                      />
                      <h3>{titulo}</h3>
                      <span>Abrir PDF</span>
                    </a>
                  ))}
                </Carrossel>
              </div>
              <BibliotecaVideos />
            </section>
          )}

          {abaTeste === "novo-teste" && (
            <form className="formulario-teste" onSubmit={salvarTeste}>
              <h2>Novo teste</h2>

              <label htmlFor="modeloTeste">Modelo do veículo</label>
              <select
                id="modeloTeste"
                value={formTeste.vehicle_model_id}
                onChange={(event) => carregarCodigosTeste(event.target.value)}
                required
              >
                <option value="">Selecione o modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.model_name || modelo.nome}
                  </option>
                ))}
              </select>

              <label htmlFor="codigoTeste">Código de falha</label>
              <select
                id="codigoTeste"
                value={formTeste.fault_code_id}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    fault_code_id: event.target.value,
                  }))
                }
                required
                disabled={!codigosTeste.length}
              >
                <option value="">Selecione o código</option>
                {codigosTeste.map((codigo) => (
                  <option key={codigo.id} value={codigo.id}>
                    {codigo.code} — {codigo.description}
                  </option>
                ))}
              </select>

              {codigosTeste
                .filter(
                  (codigo) =>
                    String(codigo.id) === String(formTeste.fault_code_id),
                )
                .map((codigo) => (
                  <div key={codigo.id} className="descricao-codigo">
                    <strong>Descrição do código:</strong>
                    <p>{codigo.description}</p>
                  </div>
                ))}

              <label htmlFor="condicoesTeste">Condições do teste</label>
              <textarea
                id="condicoesTeste"
                value={formTeste.test_conditions}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    test_conditions: event.target.value,
                  }))
                }
                placeholder="Ex.: veículo ligado, bateria carregada..."
              />

              <label htmlFor="procedimentoTeste">Procedimento realizado</label>
              <textarea
                id="procedimentoTeste"
                value={formTeste.procedure_performed}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    procedure_performed: event.target.value,
                  }))
                }
                required
                placeholder="Descreva as etapas executadas"
              />

              <label htmlFor="resultadoTeste">Resultado observado</label>
              <textarea
                id="resultadoTeste"
                value={formTeste.observed_result}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    observed_result: event.target.value,
                  }))
                }
                required
                placeholder="Descreva o que aconteceu durante o teste"
              />

              <label htmlFor="desfechoTeste">Conclusão do teste</label>
              <select
                id="desfechoTeste"
                value={formTeste.outcome}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    outcome: event.target.value,
                  }))
                }
                required
              >
                <option value="confirmado_no_teste">
                  Falha confirmada durante o teste
                </option>
                <option value="nao_reproduzido">Falha não reproduzida</option>
                <option value="inconclusivo">Inconclusivo</option>
              </select>

              <label htmlFor="evidenciasTeste">Observações e evidências</label>
              <textarea
                id="evidenciasTeste"
                value={formTeste.evidence_notes}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    evidence_notes: event.target.value,
                  }))
                }
                placeholder="Descreva medições, fotos ou outras evidências"
              />

              <label htmlFor="urlEvidencia">Link da evidência (opcional)</label>
              <input
                id="urlEvidencia"
                type="url"
                value={formTeste.evidence_url}
                onChange={(event) =>
                  setFormTeste((anterior) => ({
                    ...anterior,
                    evidence_url: event.target.value,
                  }))
                }
                placeholder="https://..."
              />

              {erroTestes && <p role="alert">{erroTestes}</p>}
              {mensagemTestes && <p role="status">{mensagemTestes}</p>}

              <button type="submit" disabled={carregandoTestes}>
                Registrar teste
              </button>
            </form>
          )}

          {abaTeste === "novo-teste" && (
            <section className="historico-testes">
              <h2>Histórico de testes</h2>

              <button
                type="button"
                onClick={carregarTestes}
                disabled={carregandoTestes}
              >
                {carregandoTestes ? "Carregando..." : "Atualizar histórico"}
              </button>

              {erroTestes && <p role="alert">{erroTestes}</p>}

              {testesTecnicos.length === 0 && !carregandoTestes && (
                <p>Nenhum teste registrado ou histórico ainda não carregado.</p>
              )}

              {[...testesTecnicos].slice(0, 2).map((teste) => (
                <article className="card-teste" key={teste.id}>
                  <h3>
                    {teste.fabricante} {teste.modelo}
                  </h3>
                  <p>
                    <strong>Código:</strong> {teste.codigo_erro}
                  </p>
                  <p>
                    <strong>Procedimento:</strong> {teste.procedure_performed}
                  </p>
                  <p>
                    <strong>Resultado:</strong> {teste.observed_result}
                  </p>
                  <p>
                    <strong>Conclusão:</strong> {teste.outcome}
                  </p>
                  <p>
                    <strong>Validação:</strong> {teste.validation_status}
                  </p>
                  {teste.evidence_url && (
                    <p>
                      <a
                        href={teste.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir evidência
                      </a>
                    </p>
                  )}
                </article>
              ))}
            </section>
          )}
        </section>
      )}

      {codigoAmpliado && (
        <VisualizadorCodigo
          item={codigoAmpliado}
          onFechar={() => setCodigoAmpliado(null)}
        />
      )}

      <footer className="rodape">
        <p>
          E-Diagnóstico © {new Date().getFullYear()} — Informação técnica com
          responsabilidade.
        </p>
        <p>
          Os resultados devem ser conferidos conforme o fabricante e o modelo do
          veículo.
        </p>
        <p className="credito-desenvolvedor">
          Desenvolvido por Petrucci Carvalho
        </p>
      </footer>
      <BotaoWhatsApp />
    </main>
  );
}

export default App;
