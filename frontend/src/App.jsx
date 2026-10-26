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
} from "lucide-react";
import Precificacao from "./Precificacao";
import "./App.css";

function Carrossel({ className, children, label }) {
  const galeriaRef = useRef(null);
  const quantidade = Children.count(children);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const indiceAtual = quantidade ? indiceAtivo % quantidade : 0;

  useEffect(() => {
    const galeria = galeriaRef.current;
    const card = galeria?.children[indiceAtual];
    if (!galeria || !card) return;

    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [indiceAtual]);

  useEffect(() => {
    if (pausado || quantidade < 2) return undefined;

    const timer = window.setInterval(() => {
      setIndiceAtivo((indice) => (indice + 1) % quantidade);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [pausado, quantidade]);

  const cards = Children.map(children, (card, indice) =>
    cloneElement(card, {
      className: [
        card.props.className,
        indice === indiceAtual ? "card-autoplay-ativo" : "",
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
          setIndiceAtivo((indice) => (indice % quantidade - 1 + quantidade) % quantidade)
        }
      >
        ‹
      </button>
      <button
        type="button"
        className="carrossel03-seta carrossel03-proximo"
        aria-label={`${label}: próximo item`}
          onClick={() => setIndiceAtivo((indice) => (indice % quantidade + 1) % quantidade)}
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
  const [telaAtual, setTelaAtual] = useState("diagnostico");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [atendimentos, setAtendimentos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [carregandoAtendimentos, setCarregandoAtendimentos] = useState(false);
  const [erroAtendimentos, setErroAtendimentos] = useState("");
  const [abaTeste, setAbaTeste] = useState("biblioteca");
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
          email: emailLogin,
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
        dados.usuario.perfil === "mecanico" ? "testes" : "diagnostico",
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
                className={telaAtual === "testes" ? "nav-ativo" : ""}
                onClick={() => {
                  setTelaAtual("testes");
                  setMenuAberto(false);
                }}
              >
                Testes Técnicos
              </button>
            </>
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

                <label htmlFor="emailLogin">E-mail</label>
                <input
                  id="emailLogin"
                  type="email"
                  autoComplete="username"
                  value={emailLogin}
                  onChange={(event) => setEmailLogin(event.target.value)}
                  placeholder="seu@email.com"
                  required
                />

                <label htmlFor="senhaLogin">Senha</label>
                <input
                  id="senhaLogin"
                  type="password"
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

      {(perfil || perfilEscolhido === "cliente") &&
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
            {(perfil === "mecanico" || usuarioLogado?.perfil === "mecanico") &&
              abaTeste === "biblioteca" && (
                <section className="galeria-mecanico">
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
                  </Carrossel>
                </section>
              )}

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
                Digite o código exibido no painel ou no sistema de diagnóstico.
              </small>
            </form>
            {historico.length > 0 && (
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
                            (fabricante) => fabricante.name === item.fabricante,
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
            {erro && (
              <div className="mensagem erro" role="alert">
                {erro}
              </div>
            )}
            {sugestoes.length > 0 && (
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
            {resultado && (
              <section className="resultado" aria-live="polite">
                <div className="resultado-topo">
                  <span className="etiqueta">RESULTADO DA CONSULTA</span>
                  <h2>Código {resultado.codigo}</h2>

                  <p>
                    {(() => {
                      const quantidadeFontes = resultado.resultados.filter(
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

                {resultado.resultados.map((item, indice) => {
                  return (
                    <div
                      className="card-imagem-gerado"
                      key={`${item.code}-${indice}`}
                    >
                      <img
                        src={
                          {
                            P001: "/images/P001.png",
                            P002: "/images/P002.png",
                            P003: "/images/P003.png",
                            P004: "/images/P004.png",
                            P005: "/images/P005.png",
                            P006: "/images/P006.png",
                            P007: "/images/P007.png",
                            P008: "/images/P008.png",
                          }[item.code] || `/images/codigos/${item.code}.png`
                        }
                        alt={`Diagnóstico ${item.code} — ${item.description}`}
                      />
                    </div>
                  );
                })}
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

            <button type="submit">Cadastrar atendimento</button>
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
      {telaAtual === "precificacao" && <Precificacao />}

      {perfil === "mecanico" && telaAtual === "testes" && (
        <section className="principal">
          <span className="etiqueta">ÁREA DO MECÂNICO</span>
          <h1>Testes Técnicos</h1>
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
          </div>
          <div className="orientacao-seguranca">
            <strong>Importante</strong>
            <p>
              Todo registro será enviado para revisão. O teste não valida
              automaticamente o código de falha.
            </p>
          </div>

          {abaTeste === "biblioteca" && (
            <section className="galeria-mecanico">
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

              <div className="galeria-cabecalho galeria-guias-cabecalho">
                <span className="etiqueta">MATERIAL DE APOIO</span>
                <h2>Guias para o mecânico</h2>
                <p>Materiais de consulta para apoiar os serviços da oficina.</p>
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
              </Carrossel>
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
    </main>
  );
}

export default App;
