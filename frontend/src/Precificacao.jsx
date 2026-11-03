import { calcularCustoHora, calcularHoras } from "./calculosPrecificacao";
import { useEffect, useRef, useState } from "react";

const CHAVE_PRECIFICACAO = "ediagnostico-precificacao";

const configuracaoInicial = {
  inicioSemana: "08:00",
  fimSemana: "18:00",
  almocoSemana: 60,
  inicioSabado: "08:00",
  fimSabado: "12:00",
  almocoSabado: 0,

  despesas: {
    aluguel: "0",
    proLaboreFuncionarios: "0",
    transporte: "0",
    insumosOficina: "0",
    insumosClientes: "0",
    energia: "8",
    agua: "0",
    internet: "0",
    contabilidade: "0",
    ferramentas: "0",
    outros: "0",
  },

  produtividade: 70,
  horasServico: "120",
  pecas: "50",
  margem: 30,
};

function carregarConfiguracao() {
  try {
    const salva = localStorage.getItem(CHAVE_PRECIFICACAO);

    if (!salva) {
      return configuracaoInicial;
    }

    const dados = JSON.parse(salva);

    return {
      ...configuracaoInicial,
      ...dados,
      horasServico: Math.max(15, Number(dados.horasServico) || 15),
      despesas: Object.fromEntries(
        Object.entries(configuracaoInicial.despesas).map(
          ([chave, valorInicial]) => {
            const valorSalvo = dados.despesas?.[chave];

            return [
              chave,
              valorSalvo === undefined ||
              valorSalvo === null ||
              valorSalvo === ""
                ? valorInicial
                : String(valorSalvo),
            ];
          },
        ),
      ),
    };
  } catch {
    return configuracaoInicial;
  }
}
function Precificacao({ token }) {
  const nomeServicoRef = useRef(null);
  const [buscaServico, setBuscaServico] = useState("");
  const [sucessoServico, setSucessoServico] = useState("");
  const [erroServico, setErroServico] = useState("");
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [configuracao, setConfiguracao] = useState(carregarConfiguracao);
  const [servicosOficina, setServicosOficina] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("ediagnostico-servicos-oficina")) || [
          {
            id: "exemplo-manete",
            nome: "Troca de manete acelerador",
            categoria: "Bicicleta elétrica",
            maoDeObra: 120,
            materiais: 300,
          },
        ]
      );
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (!token) return;
    let ativo = true;
    async function carregarCatalogo() {
      try {
        const resposta = await fetch("/api/catalogo-oficina", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados = await resposta.json();
        if (!resposta.ok)
          throw new Error(
            dados.erro || "Não foi possível carregar os serviços.",
          );
        if (ativo) {
          const cadastrados = (dados.itens || [])
            .filter((item) => item.tipo === "servico")
            .map((item) => ({
              id: `catalogo-${item.id}`,
              catalogoId: item.id,
              nome: item.nome,
              categoria: item.categoria,
              maoDeObra: Number(
                item.mao_de_obra ?? (item.materiais == null ? item.preco : 0),
              ),
              materiais: Number(item.materiais ?? 0),
            }));
          // Mantém os serviços antigos do navegador até uma migração explícita.
          setServicosOficina((atuais) => [
            ...cadastrados,
            ...atuais.filter((item) => !item.catalogoId),
          ]);
        }
      } catch (erro) {
        if (ativo) setErroServico(erro.message);
      }
    }
    carregarCatalogo();
    return () => {
      ativo = false;
    };
  }, [token]);
  const [novoServico, setNovoServico] = useState({
    nome: "",
    categoria: "Bicicleta elétrica",
  });

  const {
    inicioSemana,
    fimSemana,
    almocoSemana,
    inicioSabado,
    fimSabado,
    almocoSabado,
    despesas,
    produtividade,
    horasServico,
    pecas,
    margem,
  } = configuracao;

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_PRECIFICACAO, JSON.stringify(configuracao));
    } catch (erro) {
      console.error("Não foi possível salvar a precificação:", erro);
    }
  }, [configuracao]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "ediagnostico-servicos-oficina",
        JSON.stringify(servicosOficina),
      );
    } catch (erro) {
      console.error("Não foi possível salvar a lista de serviços:", erro);
    }
  }, [servicosOficina]);

  function atualizarCampo(chave, valor) {
    setConfiguracao((atual) => ({ ...atual, [chave]: valor }));
  }

  function atualizarDespesa(chave, valor) {
    setConfiguracao((atual) => ({
      ...atual,
      despesas: { ...atual.despesas, [chave]: valor },
    }));
  }

  const horasSemana = calcularHoras(inicioSemana, fimSemana, almocoSemana);
  const horasSabado = calcularHoras(inicioSabado, fimSabado, almocoSabado);
  const custos = Object.values(despesas).reduce(
    (total, valor) => total + Math.max(0, Number(valor) || 0),
    0,
  );
  const horasMensais = (horasSemana * 5 + horasSabado) * (52 / 12);
  const horasProdutivas = horasMensais * (Number(produtividade) / 100);
  const custoHora = calcularCustoHora({
    inicioSemana,
    fimSemana,
    almocoSemana,
    inicioSabado,
    fimSabado,
    almocoSabado,
    despesas,
    produtividade,
  });

  const custoMO = custoHora * Number(horasServico / 60);
  const custoServico = custoMO + Number(pecas);
  const calculoValido =
    Number(horasServico) >= 15 &&
    Number(pecas) >= 0 &&
    Number(margem) >= 0 &&
    Number(margem) < 100 &&
    horasProdutivas > 0;

  const precoServico =
    margem >= 0 && margem < 100 ? custoServico / (1 - Number(margem) / 100) : 0;

  const moeda = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  async function adicionarServico(evento) {
    evento.preventDefault();
    if (salvandoServico) return;
    const nome = novoServico.nome.trim();
    if (!nome || !calculoValido) return;
    setSucessoServico("");
    setErroServico("");
    setSalvandoServico(true);
    try {
      const maoDeObra =
        Math.round((custoMO / (1 - Number(margem) / 100)) * 100) / 100;
      const materiais = Math.round((precoServico - maoDeObra) * 100) / 100;
      const resposta = await fetch("/api/catalogo-oficina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          tipo: "servico",
          categoria: novoServico.categoria,
          preco: Math.round((maoDeObra + materiais) * 100) / 100,
          maoDeObra,
          materiais,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível salvar o serviço.");
      setServicosOficina((atuais) => [
        {
          ...novoServico,
          id: crypto.randomUUID(),
          catalogoId: dados.item.id,
          nome,
          maoDeObra,
          materiais,
        },
        ...atuais,
      ]);
      setNovoServico((atual) => ({ ...atual, nome: "" }));
      setSucessoServico("Serviço salvo no catálogo e disponível no orçamento.");
    } catch (erro) {
      setErroServico(erro.message);
    } finally {
      setSalvandoServico(false);
    }
  }

  async function removerServico(servico) {
    setErroServico("");
    try {
      if (servico.catalogoId) {
        const resposta = await fetch(
          `/api/catalogo-oficina/${servico.catalogoId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!resposta.ok && resposta.status !== 404) {
          const dados = await resposta.json();
          throw new Error(dados.erro || "Não foi possível remover o serviço.");
        }
      }
      setServicosOficina((atuais) =>
        atuais.filter((item) => item.id !== servico.id),
      );
    } catch (erro) {
      setErroServico(erro.message);
    }
  }

  const normalizar = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const servicosDoVeiculo = servicosOficina.filter(
    (servico) =>
      normalizar(servico.categoria || "") === normalizar(novoServico.categoria),
  );
  const tiposVeiculo = [
    ...new Set([
      "Bicicleta elétrica",
      "Patinete elétrico",
      "Scooter elétrica",
      "Autopropelido",
      "Ciclomotor elétrico",
      ...servicosOficina.map((servico) => servico.categoria).filter(Boolean),
    ]),
  ];
  function sugerirServico(servico) {
    setNovoServico((atual) => ({ ...atual, nome: servico.nome }));
    setSucessoServico("");
    nomeServicoRef.current?.focus();
    nomeServicoRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  const servicosVisiveis = servicosDoVeiculo.filter((servico) =>
    normalizar(`${servico.nome} ${servico.categoria || ""}`).includes(
      normalizar(buscaServico),
    ),
  );

  return (
    <section className="principal tela-precificacao">
      <span className="etiqueta">ÁREA DO MECÂNICO</span>

      <h1>Precificação de serviços</h1>
      <p className="introducao">
        Conheça seus custos. Defina seu preço com segurança.
      </p>

      <div className="precificacao">
        <details className="configuracao-oficina">
          <summary>
            <span>Configurações da oficina</span>
            <span className="precificacao-hora">
              Custo da hora: <strong>{moeda(custoHora)}</strong> · Ajustar
            </span>
          </summary>
          <h2>1. Jornada de trabalho</h2>

          <div className="grupo-precificacao">
            <h3>Segunda a sexta-feira</h3>

            <label>Horário de entrada</label>
            <input
              type="time"
              value={inicioSemana}
              onChange={(e) => atualizarCampo("inicioSemana", e.target.value)}
            />

            <label>Horário de saída</label>
            <input
              type="time"
              value={fimSemana}
              onChange={(e) => atualizarCampo("fimSemana", e.target.value)}
            />

            <label>Almoço (minutos por dia)</label>
            <input
              type="number"
              min="0"
              value={almocoSemana}
              onChange={(e) => atualizarCampo("almocoSemana", e.target.value)}
            />
          </div>

          <div className="grupo-precificacao">
            <h3>Sábado</h3>

            <label>Horário de entrada</label>
            <input
              type="time"
              value={inicioSabado}
              onChange={(e) => atualizarCampo("inicioSabado", e.target.value)}
            />

            <label>Horário de saída</label>
            <input
              type="time"
              value={fimSabado}
              onChange={(e) => atualizarCampo("fimSabado", e.target.value)}
            />

            <label>Almoço (minutos)</label>
            <input
              type="number"
              min="0"
              value={almocoSabado}
              onChange={(e) => atualizarCampo("almocoSabado", e.target.value)}
            />
          </div>

          <p>
            Horas de trabalho por semana:{" "}
            <strong>{(horasSemana * 5 + horasSabado).toFixed(2)} h</strong>
          </p>
          <h2>2. Custos e produtividade</h2>
          <h3>Despesas mensais da oficina</h3>
          {[
            ["aluguel", "Aluguel (R$)"],
            [
              "proLaboreFuncionarios",
              "Seu salário (pró-labore) + funcionários (R$)",
            ],
            ["transporte", "Transporte (R$)"],
            [
              "insumosOficina",
              "Insumos da oficina — graxa, lixas, sprays etc. (R$)",
            ],
            [
              "insumosClientes",
              "Insumos para clientes — café, brindes etc. (R$)",
            ],
            ["energia", "Energia elétrica (R$)"],
            ["agua", "Água (R$)"],
            ["internet", "Internet e telefone (R$)"],
            ["contabilidade", "Contabilidade (R$)"],
            ["ferramentas", "Ferramentas e equipamentos (R$)"],
            ["outros", "Outros custos (R$)"],
          ].map(([chave, titulo]) => (
            <div className="campo-despesa" key={chave}>
              <label htmlFor={chave}>{titulo}</label>
              <input
                id={chave}
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={despesas[chave]}
                onChange={(e) => atualizarDespesa(chave, e.target.value)}
              />
            </div>
          ))}

          <p className="total-despesas">
            Total de despesas mensais: <strong>{moeda(custos)}</strong>
          </p>
          <label>Tempo produtivo da jornada (%)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={produtividade}
            onChange={(e) => atualizarCampo("produtividade", e.target.value)}
          />
          <div className="resultado-precificacao">
            <p>Horas mensais disponíveis</p>
            <strong>{horasMensais.toFixed(1)} h</strong>

            <p>Horas produtivas estimadas</p>
            <strong>{horasProdutivas.toFixed(1)} h</strong>

            <p>Custo da hora técnica</p>
            <strong>{moeda(custoHora)}</strong>
          </div>
        </details>

        <form className="precificacao-calculo" onSubmit={adicionarServico}>
          <section className="precificacao-campos">
            <h2>Calcular serviço</h2>
            <label htmlFor="preco-nome">Nome do serviço</label>
            <input
              id="preco-nome"
              ref={nomeServicoRef}
              list="sugestoes-servicos-veiculo"
              required
              value={novoServico.nome}
              onChange={(e) =>
                setNovoServico({ ...novoServico, nome: e.target.value })
              }
              placeholder="Ex.: Troca de bateria"
            />
            <datalist id="sugestoes-servicos-veiculo">
              {[
                ...new Set(servicosDoVeiculo.map((servico) => servico.nome)),
              ].map((nome) => (
                <option key={nome} value={nome} />
              ))}
            </datalist>
            <label htmlFor="preco-veiculo">Tipo de veículo</label>
            <select
              id="preco-veiculo"
              value={novoServico.categoria}
              onChange={(e) =>
                setNovoServico({ ...novoServico, categoria: e.target.value })
              }
            >
              {tiposVeiculo.map((tipo) => (
                <option key={tipo}>{tipo}</option>
              ))}
            </select>
            <label htmlFor="duracaoServico">Duração estimada (minutos)</label>
            <input
              id="duracaoServico"
              type="number"
              required
              min="15"
              step="1"
              value={horasServico}
              onChange={(e) => atualizarCampo("horasServico", e.target.value)}
              onBlur={() => {
                if (Number(horasServico) < 15)
                  atualizarCampo("horasServico", 15);
              }}
            />
            <div
              className="precificacao-atalhos"
              aria-label="Durações frequentes"
            >
              {[15, 30, 60, 120].map((minutos) => (
                <button
                  key={minutos}
                  type="button"
                  aria-pressed={Number(horasServico) === minutos}
                  onClick={() => atualizarCampo("horasServico", minutos)}
                >
                  {minutos < 60 ? `${minutos} min` : `${minutos / 60} h`}
                </button>
              ))}
            </div>
            <label htmlFor="preco-pecas">
              Custo das peças e materiais (R$)
            </label>
            <input
              id="preco-pecas"
              type="number"
              required
              min="0"
              step="0.01"
              value={pecas}
              onChange={(e) => atualizarCampo("pecas", e.target.value)}
            />
            <label htmlFor="preco-margem">Margem desejada (%)</label>
            <input
              id="preco-margem"
              type="number"
              required
              min="0"
              max="99"
              step="0.1"
              value={margem}
              onChange={(e) => atualizarCampo("margem", e.target.value)}
            />
          </section>
          <aside
            className="resultado-precificacao destaque-preco precificacao-resumo"
            aria-live="polite"
          >
            <h2>Resumo do cálculo</h2>
            <p>Mão de obra — custo</p>
            <strong>{moeda(custoMO)}</strong>
            <p>Peças e materiais — custo</p>
            <strong>{moeda(Number(pecas) || 0)}</strong>
            <p>Custo estimado do serviço</p>
            <strong>{moeda(custoServico)}</strong>
            <p>Preço sugerido ao cliente</p>
            <strong>{calculoValido ? moeda(precoServico) : "—"}</strong>
            <p>Diferença sobre o custo</p>
            <strong>
              {calculoValido ? moeda(precoServico - custoServico) : "—"}
            </strong>
            <button
              className="botao-adicionar-servico"
              type="submit"
              disabled={salvandoServico || !calculoValido}
            >
              {salvandoServico ? "Salvando..." : "Salvar no catálogo"}
            </button>
            {!calculoValido && (
              <p role="alert">
                Confira a jornada, produtividade, duração mínima de 15 minutos,
                custos e margem.
              </p>
            )}
            {erroServico && <p role="alert">{erroServico}</p>}
            {sucessoServico && <p role="status">{sucessoServico}</p>}
            <p className="aviso-precificacao">
              Confira impostos, taxas, garantia e demais despesas antes de
              definir o preço final. A margem é aplicada à mão de obra e aos
              materiais.
            </p>
          </aside>
        </form>
        <section
          className="catalogo-servicos-oficina"
          aria-labelledby="titulo-catalogo-servicos"
        >
          <span className="etiqueta">CATÁLOGO DA OFICINA</span>
          <h2 id="titulo-catalogo-servicos">Serviços cadastrados</h2>
          <p role="status">
            {servicosDoVeiculo.length} serviços para {novoServico.categoria}.
            Clique em um serviço para usar o nome no cálculo.
          </p>
          <label htmlFor="busca-servico-preco">Buscar serviço</label>
          <input
            id="busca-servico-preco"
            type="search"
            value={buscaServico}
            onChange={(e) => setBuscaServico(e.target.value)}
            placeholder="Nome ou tipo de veículo"
          />
          <div className="lista-servicos-oficina">
            {servicosVisiveis.length ? (
              servicosVisiveis.map((servico) => (
                <article className="item-servico-oficina" key={servico.id}>
                  <button
                    type="button"
                    className="sugerir-servico-precificacao"
                    aria-label={`Usar serviço: ${servico.nome}`}
                    onClick={() => sugerirServico(servico)}
                  >
                    <span>
                      <strong>{servico.nome}</strong>
                      <span>{servico.categoria}</span>
                    </span>
                    <span className="item-servico-valores">
                      <small>MO {moeda(Number(servico.maoDeObra) || 0)}</small>
                      <small>MA {moeda(Number(servico.materiais) || 0)}</small>
                      <strong>
                        {moeda(
                          (Number(servico.maoDeObra) || 0) +
                            (Number(servico.materiais) || 0),
                        )}
                      </strong>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="remover-servico-oficina"
                    aria-label={`Remover ${servico.nome}`}
                    onClick={() => removerServico(servico)}
                  >
                    ×
                  </button>
                </article>
              ))
            ) : (
              <p className="lista-servicos-vazia">
                {buscaServico
                  ? "Nenhum serviço encontrado."
                  : "Nenhum serviço cadastrado para este tipo de veículo."}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Precificacao;
