import { useEffect, useState } from "react";
import {
  ListChecks,
  Wrench,
  Database,
  Calculator,
  UserRound,
  FileText,
  Trash2,
  X,
} from "lucide-react";

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularValores(servico) {
  const separados =
    servico.maoDeObra != null || servico.materiais != null;

  if (separados) {
    return {
      maoDeObra: Number(servico.maoDeObra) || 0,
      materiais: Number(servico.materiais) || 0,
    };
  }

  const preco = Number(servico.preco) || 0;

  return servico.tipo === "peca"
    ? { maoDeObra: 0, materiais: preco }
    : { maoDeObra: preco, materiais: 0 };
}

function Orcamento({ onPrecificar, ativo, token }) {
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroVeiculo, setFiltroVeiculo] = useState("Todos");
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!ativo || !token) return;

    let atual = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [resServicos, resClientes] = await Promise.all([
          fetch("/api/catalogo-oficina", { headers }),
          fetch("/api/clientes", { headers }),
        ]);

        const [dadosServicos, dadosClientes] = await Promise.all([
          resServicos.json(),
          resClientes.json(),
        ]);

        if (!resServicos.ok) {
          throw new Error(
            dadosServicos.erro || "Erro ao carregar serviços."
          );
        }

        if (!resClientes.ok) {
          throw new Error(
            dadosClientes.erro || "Erro ao carregar clientes."
          );
        }

        if (atual) {
          setServicos(dadosServicos.itens || []);
          setClientes(dadosClientes.clientes || []);
        }
      } catch (erro) {
        if (atual) setErro(erro.message);
      } finally {
        if (atual) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      atual = false;
    };
  }, [ativo, token]);

  const clienteSelecionado = clientes.find(
    (cliente) => String(cliente.id) === String(clienteId)
  );

  const itensSelecionados = servicos.filter((servico) =>
    selecionados.includes(servico.id)
  );

  const totalMO = itensSelecionados.reduce(
    (soma, servico) =>
      soma + calcularValores(servico).maoDeObra,
    0
  );

  const totalMA = itensSelecionados.reduce(
    (soma, servico) =>
      soma + calcularValores(servico).materiais,
    0
  );

  const total = totalMO + totalMA;

  const tiposVeiculo = [...new Set(
    servicos.map((servico) => servico.categoria).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const servicosFiltrados = servicos.filter((servico) => {
    const correspondeBusca =
      `${servico.nome} ${servico.categoria || ""}`
        .toLowerCase()
        .includes(busca.toLowerCase());

    const correspondeFiltro =
      filtroVeiculo === "Todos" || servico.categoria === filtroVeiculo;

    return correspondeBusca && correspondeFiltro;
  });

  function alternarServico(id) {
    setSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  }

  function selecionarCliente(valor) {
    setClienteId(valor);

    const cliente = clientes.find(
      (item) => String(item.id) === String(valor)
    );

    setVeiculo(cliente?.veiculo || "");
  }

  function enviarWhatsApp() {
    if (!clienteSelecionado?.telefone) {
      alert("O cliente selecionado não possui telefone cadastrado.");
      return;
    }

    if (!itensSelecionados.length) {
      alert("Selecione pelo menos um serviço.");
      return;
    }

    let telefone = String(clienteSelecionado.telefone).replace(/\D/g, "");

    if (telefone.length === 10 || telefone.length === 11) {
      telefone = `55${telefone}`;
    }

    const lista = itensSelecionados
      .map((servico) => {
        const valores = calcularValores(servico);
        return `• ${servico.nome}: ${moeda(
          valores.maoDeObra + valores.materiais
        )}`;
      })
      .join("\n");

    const mensagem = `Olá, *${clienteSelecionado.nome}*! Tudo bem? \u{1F60A}

Conforme solicitado, segue o orçamento dos serviços e peças${veiculo ? ` para sua *${veiculo}*` : ""}:

\u{1F527} *DETALHAMENTO DO ORÇAMENTO*

${lista}

*RESUMO DOS VALORES*

Mão de obra: ${moeda(totalMO)}
Materiais e peças: ${moeda(totalMA)}

\u{1F4B0} *VALOR TOTAL: ${moeda(total)}*

${observacoes ? `\u{1F4DD} *Observações:* ${observacoes}\n\n` : ""}Se estiver de acordo, podemos dar sequência ao serviço.

Agradecemos pela confiança e preferência!

*E-Diagnóstico*
Tecnologia e precisão para cuidar do seu veículo elétrico. \u{26A1}`;

    const parametros = new URLSearchParams({ text: mensagem });
    const urlWhatsApp = `https://wa.me/${telefone}?${parametros.toString()}`;

    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="orcamento-mecanico" aria-labelledby="titulo-orcamento">
      <header className="orcamento-cabecalho">
        <span className="etiqueta">ATENDIMENTO AO CLIENTE</span>
        <h2 id="titulo-orcamento">Selecionar Serviços</h2>
        <p className="orcamento-descricao">
          Selecione os serviços e prepare uma proposta para o cliente.
        </p>
      </header>

      {erro && <p className="orcamento-erro">{erro}</p>}
      {carregando && <p>Carregando catálogo e clientes...</p>}

      <div className="orcamento-layout">
        <div className="orcamento-painel-servicos">
          <div className="orcamento-titulo-painel">
            <div>
              <h3>Serviços cadastrados</h3>
              <p>Marque os serviços que deseja incluir.</p>
            </div>
            <span className="orcamento-contador">
              {servicos.length} serviços
            </span>
          </div>

          <div className="orcamento-filtros">
            <label className="orcamento-busca">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="⌕  Buscar serviço..."
              />
            </label>

            <label className="orcamento-filtro-veiculo">
              <span>Tipo de veículo</span>
              <select
                value={filtroVeiculo}
                onChange={(e) => setFiltroVeiculo(e.target.value)}
              >
                <option value="Todos">Todos</option>
                {tiposVeiculo.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </label>
          </div>

          {servicosFiltrados.length ? (
            <div className="orcamento-lista-servicos">
              {servicosFiltrados.map((servico) => {
                const valores = calcularValores(servico);
                const marcado = selecionados.includes(servico.id);

                return (
                  <label
                    className={`orcamento-servico ${marcado ? "selecionado" : ""}`}
                    key={servico.id}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternarServico(servico.id)}
                    />

                    <span className="orcamento-servico-icone" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3z" />
                      </svg>
                    </span>

                    <span className="orcamento-servico-detalhes">
                      <strong>{servico.nome}</strong>
                      <small>{servico.categoria || "Serviço geral"}</small>
                    </span>

                    <span className="orcamento-servico-valor">
                      <small>MO</small>
                      <strong>{moeda(valores.maoDeObra)}</strong>
                    </span>

                    <span className="orcamento-servico-valor">
                      <small>MA</small>
                      <strong>{moeda(valores.materiais)}</strong>
                    </span>

                    <span className="orcamento-servico-preco">
                      {moeda(valores.maoDeObra + valores.materiais)}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="orcamento-sem-servicos">
              <p>
                {servicos.length
                  ? "Nenhum serviço corresponde à sua busca."
                  : "Nenhum serviço cadastrado."}
              </p>
              {!servicos.length && (
                <button type="button" onClick={onPrecificar}>
                  Ir para Precificar
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="orcamento-resumo">
          <div className="orcamento-titulo-painel">
            <div>
              <h3>Resumo do orçamento</h3>
              <p>Confira os valores e os itens selecionados.</p>
            </div>
          </div>

          <div className="orcamento-indicadores">
            <div>
              <span><ListChecks size={17} /> Serviços</span>
              <strong>{itensSelecionados.length}</strong>
            </div>
            <div>
              <span><Wrench size={17} /> Mão de obra</span>
              <strong>{moeda(totalMO)}</strong>
            </div>
            <div>
              <span><Database size={17} /> Materiais</span>
              <strong>{moeda(totalMA)}</strong>
            </div>
          </div>

          <div className="orcamento-total">
            <span><Calculator size={19} /> Total do orçamento</span>
            <strong>{moeda(total)}</strong>
          </div>

          <div className="orcamento-identificacao">
            <label>
              <UserRound size={17} />cliente
              <select
                value={clienteId}
                onChange={(e) => selecionarCliente(e.target.value)}
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Veículo
              <input
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                placeholder="Marca e modelo"
              />
            </label>

            <label>
              <FileText size={17} /> Observações
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Prazo, condições ou detalhes..."
                rows={3}
              />
            </label>
          </div>

          <div className="orcamento-itens-cabecalho">
            <strong>Serviços selecionados</strong>
            <button
              type="button"
              onClick={() => setSelecionados([])}
              disabled={!selecionados.length}
            >
              <Trash2 size={15} /> Limpar
            </button>
          </div>

          {itensSelecionados.length ? (
            <div className="orcamento-itens-selecionados">
              {itensSelecionados.map((servico) => (
                <div className="orcamento-item-resumo" key={servico.id}>
                  <div>
                    <strong>{servico.nome}</strong>
                    <small>
                      {moeda(
                        calcularValores(servico).maoDeObra +
                        calcularValores(servico).materiais
                      )}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="orcamento-remover-item"
                    onClick={() => alternarServico(servico.id)}
                    aria-label={`Remover ${servico.nome}`}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="orcamento-resumo-vazio">
              Selecione serviços na lista ao lado.
            </div>
          )}

          <div className="orcamento-acoes">
            <button
              type="button"
              className="botao-whatsapp-orcamento"
              onClick={enviarWhatsApp}
              disabled={!itensSelecionados.length}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="22"
                height="22"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M16 2.7a13.1 13.1 0 0 0-11.2 20L3 29.3l6.8-1.8A13.1 13.1 0 1 0 16 2.7Zm0 23.8a10.7 10.7 0 0 1-5.4-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4A10.7 10.7 0 1 1 16 26.5Zm5.9-8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.3.2-.6.1a8.8 8.8 0 0 1-2.6-1.6 9.8 9.8 0 0 1-1.8-2.2c-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6-.7-1.7-1-2.3-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5 2.4 3.8 5.9 5.2c.8.3 1.4.5 2 .6.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.1-1.5s.3-1.3.2-1.5-.3-.2-.6-.4Z"
                />
              </svg>
              Enviar orçamento por WhatsApp
            </button>

            <button
              type="button"
              className="botao-imprimir-orcamento"
              onClick={() => window.print()}
              disabled={!itensSelecionados.length}
            >
              <FileText size={19} /> Gerar PDF do orçamento
            </button>

            <small>
              {itensSelecionados.length} serviço(s) selecionado(s)
            </small>
          </div>

          <p className="orcamento-aviso-envio">
            Confira os dados e os valores antes de enviar ou imprimir a proposta.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default Orcamento;
