import { Fragment, useState } from "react";
import {
  Lightbulb,
  Bike,
  Printer,
  ClipboardList,
  CircleDollarSign,
  CalendarDays,
  Wrench,
  Check,
  Clock3,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";

const CHAVE_PRECIFICACAO = "ediagnostico-precificacao";

const configuracaoPadrao = {
  inicioSemana: "08:00",
  fimSemana: "18:00",
  almocoSemana: 60,
  inicioSabado: "08:00",
  fimSabado: "12:00",
  almocoSabado: 0,
  despesas: {},
  produtividade: 70,
  margem: 30,
};

function carregarConfiguracao() {
  try {
    const salva = localStorage.getItem(CHAVE_PRECIFICACAO);
    if (!salva) return null;

    const dados = JSON.parse(salva);

    return {
      ...configuracaoPadrao,
      ...dados,
      despesas: {
        ...configuracaoPadrao.despesas,
        ...(dados.despesas || {}),
      },
    };
  } catch {
    return null;
  }
}

function calcularHoras(inicio, fim, almoco) {
  if (!inicio || !fim) return 0;

  const minutosInicio =
    Number(inicio.split(":")[0]) * 60 + Number(inicio.split(":")[1]);
  const minutosFim = Number(fim.split(":")[0]) * 60 + Number(fim.split(":")[1]);

  return Math.max(0, minutosFim - minutosInicio - (Number(almoco) || 0)) / 60;
}

function calcularCustoHora(config) {
  const despesas = Object.values(config.despesas || {}).reduce(
    (total, valor) => total + Math.max(0, Number(valor) || 0),
    0,
  );

  const horasSemana = calcularHoras(
    config.inicioSemana,
    config.fimSemana,
    config.almocoSemana,
  );

  const horasSabado = calcularHoras(
    config.inicioSabado,
    config.fimSabado,
    config.almocoSabado,
  );

  const horasMensais = (horasSemana * 5 + horasSabado) * (52 / 12);
  const horasProdutivas = horasMensais * (Number(config.produtividade) / 100);

  return horasProdutivas > 0 ? despesas / horasProdutivas : 0;
}

const servicos = [
  {
    nome: "Inspeção de segurança completa",
    descricao: "Pneus, freios, luzes, buzina, retrovisor e instrumentos",
    minutos: 60,
    categoria: "Segurança e inspeção geral",
  },
  {
    nome: "Ajuste de freios",
    descricao: "Regulagem de folga, cabo e pastilhas",
    minutos: 30,
    categoria: "Freios",
  },
  {
    nome: "Troca de pastilhas de freio",
    descricao: "Substituição e regulagem; peças à parte",
    minutos: 30,
    categoria: "Freios",
  },
  {
    nome: "Inspeção e calibragem de pneus",
    descricao: "Pressão, desgaste e sulcos",
    minutos: 15,
    categoria: "Pneus e rodas",
  },
  {
    nome: "Troca de pneu",
    descricao: "Dianteiro ou traseiro; peça à parte",
    minutos: 30,
    categoria: "Pneus e rodas",
  },
  {
    nome: "Inspeção da bateria",
    descricao: "Carga, tensão e estado geral",
    minutos: 30,
    categoria: "Bateria e sistema elétrico",
  },
  {
    nome: "Inspeção do sistema elétrico",
    descricao: "Controlador, chicote, fusíveis e conexões",
    minutos: 60,
    categoria: "Bateria e sistema elétrico",
  },
  {
    nome: "Diagnóstico de falha elétrica",
    descricao: "Controlador, motor ou circuito",
    minutos: 60,
    categoria: "Bateria e sistema elétrico",
  },
  {
    nome: "Inspeção do motor elétrico",
    descricao: "Fiação, fixação e funcionamento",
    minutos: 30,
    categoria: "Motor, suspensão e transmissão",
  },
  {
    nome: "Inspeção da suspensão",
    descricao: "Amortecedores, curso e vazamentos",
    minutos: 30,
    categoria: "Motor, suspensão e transmissão",
  },
  {
    nome: "Lubrificação e ajuste de cabos",
    descricao: "Peças rotativas e transmissão",
    minutos: 30,
    categoria: "Motor, suspensão e transmissão",
  },
  {
    nome: "Inspeção de iluminação",
    descricao: "Faróis, setas, lanterna e luz de freio",
    minutos: 15,
    categoria: "Iluminação",
  },
];

const revisoes = [
  {
    nome: "Revisão 1",
    prazo: "2º mês ou 300 km",
    mes: 2,
    descricao:
      "Inspeção completa de segurança, bateria, motor, controlador e carregador",
    preco: 350,
  },
  {
    nome: "Revisão 2",
    prazo: "5º mês",
    mes: 5,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 3",
    prazo: "8º mês",
    mes: 8,
    descricao:
      "Revisão completa + verificação aprofundada de bateria e elétrica",
    preco: 450,
  },
  {
    nome: "Revisão 4",
    prazo: "11º mês",
    mes: 11,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 5",
    prazo: "14º mês",
    mes: 14,
    descricao: "Revisão completa + inspeção de freios e pastilhas",
    preco: 480,
  },
  {
    nome: "Revisão 6",
    prazo: "17º mês",
    mes: 17,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 7",
    prazo: "20º mês",
    mes: 20,
    descricao:
      "Revisão completa + verificação aprofundada de bateria e elétrica",
    preco: 450,
  },
  {
    nome: "Revisão 8",
    prazo: "23º mês",
    mes: 23,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 9",
    prazo: "26º mês",
    mes: 26,
    descricao: "Revisão completa + inspeção de freios",
    preco: 480,
  },
  {
    nome: "Revisão 10",
    prazo: "29º mês",
    mes: 29,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 11",
    prazo: "32º mês",
    mes: 32,
    descricao: "Revisão completa + verificação de bateria",
    preco: 450,
  },
  {
    nome: "Revisão 12",
    prazo: "35º mês",
    mes: 35,
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
];

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularDuracaoRevisao(preco, custoHora, margem) {
  if (
    !Number.isFinite(preco) ||
    !Number.isFinite(custoHora) ||
    !Number.isFinite(margem) ||
    custoHora <= 0 ||
    margem < 0 ||
    margem >= 100
  ) {
    return null;
  }

  const horas = (preco * (1 - margem / 100)) / custoHora;

  return Math.round(horas * 60);
}

function formatarDuracao(minutos) {
  if (minutos === null || minutos <= 0) {
    return "Configure a hora técnica";
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  if (minutosRestantes === 0) {
    return `${horas} h`;
  }

  return `${horas} h ${minutosRestantes} min`;
}

function obterServicosReferencia(revisao) {
  const texto = `${revisao.nome} ${revisao.descricao}`.toLowerCase();
  const nomes = new Set([
    "Inspeção de segurança completa",
    "Inspeção e calibragem de pneus",
    "Inspeção de iluminação",
  ]);

  if (texto.includes("bateria")) {
    nomes.add("Inspeção da bateria");
  }

  if (
    texto.includes("elétr") ||
    texto.includes("controlador") ||
    texto.includes("carregador")
  ) {
    nomes.add("Inspeção do sistema elétrico");
  }

  if (texto.includes("motor")) {
    nomes.add("Inspeção do motor elétrico");
  }

  if (texto.includes("freio") || texto.includes("pastilha")) {
    nomes.add("Ajuste de freios");
    nomes.add("Troca de pastilhas de freio");
  }

  return servicos.filter((servico) => nomes.has(servico.nome));
}

function TabelaPrecosNeon() {
  const [filtroAno, setFiltroAno] = useState("todos");
  const [ordem, setOrdem] = useState("mes");

  const configuracao = carregarConfiguracao();
  const custoHora = configuracao ? calcularCustoHora(configuracao) : 0;
  const margem = Number(configuracao?.margem);
  const margemValida = Number.isFinite(margem) && margem >= 0 && margem < 100;

  const precificacaoDisponivel =
    Boolean(configuracao) && custoHora > 0 && margemValida;

  function calcularPreco(minutos) {
    if (!precificacaoDisponivel) return null;

    const custoMaoDeObra = custoHora * (minutos / 60);
    return custoMaoDeObra / (1 - margem / 100);
  }

  function exibirPreco(minutos) {
    const preco = calcularPreco(minutos);
    return preco === null ? "Configure a hora técnica" : moeda(preco);
  }

  const revisoesFiltradas = revisoes
    .filter((revisao) => {
      if (filtroAno === "todos") return true;

      const ano = Math.ceil(revisao.mes / 12);
      return ano === Number(filtroAno);
    })
    .sort((a, b) => (ordem === "mes" ? a.mes - b.mes : b.mes - a.mes));

  const valorMedio =
    revisoes.reduce((total, revisao) => total + revisao.preco, 0) /
    revisoes.length;

  const duracaoMediaMinutos = precificacaoDisponivel
    ? Math.round(
        revisoes.reduce(
          (total, revisao) =>
            total +
            (calcularDuracaoRevisao(revisao.preco, custoHora, margem) ?? 0),
          0,
        ) / revisoes.length,
      )
    : null;

  const duracaoMediaTexto = formatarDuracao(duracaoMediaMinutos);

  return (
    <section className="plano-revisoes-neon">
      <header className="plano-topo-neon">
        <div className="plano-titulo-neon">
          <Bike size={54} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2>Plano de revisões</h2>
            <p>Diagnóstico e manutenção de veículos elétricos</p>
          </div>
        </div>

        <button
          className="botao-imprimir-plano"
          type="button"
          onClick={() => window.print()}
        >
          <Printer size={20} aria-hidden="true" />
          Imprimir plano
        </button>
      </header>

      <div className="indicadores-plano-neon">
        <div className="indicador-plano">
          <span className="indicador-icone azul">
            <ClipboardList size={30} aria-hidden="true" />
          </span>
          <div>
            <span>Total de revisões</span>
            <strong>{revisoes.length}</strong>
          </div>
        </div>

        <div className="indicador-plano">
          <span className="indicador-icone verde">
            <CircleDollarSign size={30} aria-hidden="true" />
          </span>
          <div>
            <span>Valor médio</span>
            <strong className="valor-verde">{moeda(valorMedio)}</strong>
          </div>
        </div>

        <div className="indicador-plano">
          <span className="indicador-icone roxo">
            <CalendarDays size={30} aria-hidden="true" />
          </span>
          <div>
            <span>Intervalo padrão</span>
            <strong>3 meses</strong>
          </div>
        </div>

        <div className="indicador-plano">
          <span className="indicador-icone azul">
            <Wrench size={30} aria-hidden="true" />
          </span>

          <div>
            <span>Duração média estimada</span>
            <strong>{duracaoMediaTexto}</strong>
            <small>Por revisão</small>
          </div>
        </div>
      </div>

      <div className="controles-plano-neon">
        <div className="filtros-ano-neon" aria-label="Filtrar revisões por ano">
          <button
            type="button"
            className={filtroAno === "todos" ? "ativo" : ""}
            onClick={() => setFiltroAno("todos")}
          >
            Todas
          </button>

          <button
            type="button"
            className={filtroAno === "1" ? "ativo" : ""}
            onClick={() => setFiltroAno("1")}
          >
            Ano 1 (1–4)
          </button>

          <button
            type="button"
            className={filtroAno === "2" ? "ativo" : ""}
            onClick={() => setFiltroAno("2")}
          >
            Ano 2 (5–8)
          </button>

          <button
            type="button"
            className={filtroAno === "3" ? "ativo" : ""}
            onClick={() => setFiltroAno("3")}
          >
            Ano 3 (9–12)
          </button>
        </div>

        <label className="ordenar-plano-neon">
          <span>Ordenar:</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="mes">por mês</option>
            <option value="recente">Mais recente</option>
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
      </div>

      <div className="lista-plano-neon">
        {revisoesFiltradas.map((revisao) => (
          <details className="linha-plano-neon" key={revisao.nome}>
            <summary>
              <span className="numero-revisao-neon">
                {revisao.nome.replace("Revisão ", "")}
              </span>

              <strong className="nome-revisao-neon">{revisao.nome}</strong>

              <span className="prazo-revisao-neon">
                <CalendarDays size={17} aria-hidden="true" />
                {revisao.prazo}
              </span>

              <span className="descricao-curta-neon">{revisao.descricao}</span>

              <strong className="preco-revisao-neon">
                {moeda(revisao.preco)}
              </strong>

              <ChevronDown
                className="seta-revisao-neon"
                size={21}
                aria-hidden="true"
              />
            </summary>

            <div className="detalhes-revisao-neon">
              <section>
                <h3>
                  <ClipboardList size={20} aria-hidden="true" />
                  Descrição da revisão
                </h3>
                <p>{revisao.descricao}</p>
                <p>
                  O escopo definitivo deverá ser confirmado na avaliação do
                  veículo e no orçamento aprovado pelo cliente.
                </p>
              </section>

              <section>
                <h3>
                  <Settings size={20} aria-hidden="true" />
                  Serviços individuais de referência
                </h3>
                <ul>
                  {obterServicosReferencia(revisao).map((servico) => (
                    <li key={servico.nome}>
                      <Check size={17} aria-hidden="true" />
                      {servico.nome}
                    </li>
                  ))}
                </ul>
                <p className="nota-detalhe-neon">
                  Lista de referência. Os serviços efetivamente necessários
                  dependem da avaliação técnica.
                </p>
              </section>

              <section>
                <h3>
                  <Clock3 size={20} aria-hidden="true" />
                  Tempo e orçamento
                </h3>
                <p>
                  Prazo previsto: <strong>{revisao.prazo}</strong>
                </p>
                <p>
                  Mão de obra desta revisão:{" "}
                  <strong className="valor-verde">
                    {moeda(revisao.preco)}
                  </strong>
                </p>
                <p>Peças e componentes não incluídos.</p>
                <h3>
                  <FileText size={20} aria-hidden="true" />
                  Observações
                </h3>
                <p>
                  Confirme o valor final em orçamento antes da aprovação do
                  serviço.
                </p>
              </section>
            </div>
          </details>
        ))}
      </div>

      <section className="servicos-individuais-neon">
        <h3>Serviços individuais</h3>
        <p className="subtitulo-servicos-neon">
          Valores de mão de obra calculados pela configuração da oficina.
        </p>

        <div className="tabela-precos-rolagem">
          <table>
            <thead>
              <tr>
                <th scope="col">Serviço</th>
                <th scope="col">Descrição</th>
                <th scope="col">Tempo estimado</th>
                <th scope="col">Mão de obra</th>
              </tr>
            </thead>

            <tbody>
              {servicos.map((servico, index) => (
                <Fragment key={servico.nome}>
                  {(index === 0 ||
                    servicos[index - 1].categoria !== servico.categoria) && (
                    <tr className="linha-categoria-servicos">
                      <th colSpan={4} scope="colgroup">
                        {servico.categoria}
                      </th>
                    </tr>
                  )}
                  <tr>
                    <th scope="row">{servico.nome}</th>
                    <td>{servico.descricao}</td>
                    <td>{servico.minutos} min</td>
                    <td>{exibirPreco(servico.minutos)}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="servicos-individuais-cartoes">
          {servicos.map((servico, index) => (
            <Fragment key={`cartao-${servico.nome}`}>
              {(index === 0 ||
                servicos[index - 1].categoria !== servico.categoria) && (
                <h4 className="categoria-cartoes-neon">{servico.categoria}</h4>
              )}

              <article className="servico-cartao-neon">
                <div className="servico-cartao-conteudo">
                  <h5>{servico.nome}</h5>
                  <p>{servico.descricao}</p>
                </div>

                <div className="servico-cartao-detalhes">
                  <div className="servico-cartao-tempo">
                    <span>Tempo estimado</span>
                    <strong>{servico.minutos} min</strong>
                  </div>

                  <div className="servico-cartao-preco">
                    <span>Mão de obra</span>
                    <strong>{exibirPreco(servico.minutos)}</strong>
                  </div>
                </div>
              </article>
            </Fragment>
          ))}
        </div>
        <aside
          className="nota-precos-neon"
          aria-label="Importante sobre os valores"
        >
          <div className="servicos-individuais-cartoes">
            {servicos.map((servico, index) => (
              <Fragment key={`cartao-${servico.nome}`}>
                {(index === 0 ||
                  servicos[index - 1].categoria !== servico.categoria) && (
                  <h4 className="categoria-cartoes-neon">
                    {servico.categoria}
                  </h4>
                )}

                <article className="servico-cartao-neon">
                  <div className="servico-cartao-conteudo">
                    <h5>{servico.nome}</h5>
                    <p>{servico.descricao}</p>
                  </div>

                  <div className="servico-cartao-detalhes">
                    <div className="servico-cartao-tempo">
                      <span>Tempo estimado</span>
                      <strong>{servico.minutos} min</strong>
                    </div>

                    <div className="servico-cartao-preco">
                      <span>Mão de obra</span>
                      <strong>{exibirPreco(servico.minutos)}</strong>
                    </div>
                  </div>
                </article>
              </Fragment>
            ))}
          </div>
          <strong>
            <Lightbulb size={20} aria-hidden="true" />
            ATENÇÃO: SOMENTE MÃO DE OBRA
          </strong>
          <p>
            Peças e componentes não estão incluídos e serão cobrados à parte. Os
            tempos apresentados são estimativas iniciais. Confirme o valor final
            em orçamento antes da aprovação do serviço.
          </p>
        </aside>
      </section>
    </section>
  );
}

export default TabelaPrecosNeon;
