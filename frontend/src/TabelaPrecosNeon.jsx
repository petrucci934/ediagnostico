import { Lightbulb } from "lucide-react";

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
  },
  {
    nome: "Ajuste de freios",
    descricao: "Regulagem de folga, cabo e pastilhas",
    minutos: 30,
  },
  {
    nome: "Troca de pastilhas de freio",
    descricao: "Substituição e regulagem; peças à parte",
    minutos: 30,
  },
  {
    nome: "Inspeção e calibragem de pneus",
    descricao: "Pressão, desgaste e sulcos",
    minutos: 15,
  },
  {
    nome: "Troca de pneu",
    descricao: "Dianteiro ou traseiro; peça à parte",
    minutos: 30,
  },
  {
    nome: "Inspeção da bateria",
    descricao: "Carga, tensão e estado geral",
    minutos: 30,
  },
  {
    nome: "Inspeção do sistema elétrico",
    descricao: "Controlador, chicote, fusíveis e conexões",
    minutos: 60,
  },
  {
    nome: "Diagnóstico de falha elétrica",
    descricao: "Controlador, motor ou circuito",
    minutos: 60,
  },
  {
    nome: "Inspeção do motor elétrico",
    descricao: "Fiação, fixação e funcionamento",
    minutos: 30,
  },
  {
    nome: "Inspeção da suspensão",
    descricao: "Amortecedores, curso e vazamentos",
    minutos: 30,
  },
  {
    nome: "Lubrificação e ajuste de cabos",
    descricao: "Peças rotativas e transmissão",
    minutos: 30,
  },
  {
    nome: "Inspeção de iluminação",
    descricao: "Faróis, setas, lanterna e luz de freio",
    minutos: 15,
  },
];

const revisoes = [
  {
    nome: "Revisão 1",
    prazo: "2º mês ou 300 km",
    descricao:
      "Inspeção completa de segurança, bateria, motor, controlador e carregador",
    preco: 350,
  },
  {
    nome: "Revisão 2",
    prazo: "5º mês",
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 3",
    prazo: "8º mês",
    descricao:
      "Revisão completa + verificação aprofundada de bateria e elétrica",
    preco: 450,
  },
  {
    nome: "Revisão 4",
    prazo: "11º mês",
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 5",
    prazo: "14º mês",
    descricao: "Revisão completa + inspeção de freios e pastilhas",
    preco: 480,
  },
  {
    nome: "Revisão 6",
    prazo: "17º mês",
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 7",
    prazo: "20º mês",
    descricao:
      "Revisão completa + verificação aprofundada de bateria e elétrica",
    preco: 450,
  },
  {
    nome: "Revisão 8",
    prazo: "23º mês",
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 9",
    prazo: "26º mês",
    descricao: "Revisão completa + inspeção de freios",
    preco: 480,
  },
  {
    nome: "Revisão 10",
    prazo: "29º mês",
    descricao: "Revisão completa trimestral",
    preco: 350,
  },
  {
    nome: "Revisão 11",
    prazo: "32º mês",
    descricao: "Revisão completa + verificação de bateria",
    preco: 450,
  },
  {
    nome: "Revisão 12",
    prazo: "35º mês",
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

function TabelaPrecosNeon() {
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

  return (
    <details className="referencia-precos-neon" open>
      <summary className="cabecalho-precos-neon">
        <h2>Revisão de Moto Elétrica com Preços Transparentes</h2>

        <div className="destaques-precos-neon">
          <span>
            ✅ Hora técnica:{" "}
            {precificacaoDisponivel ? moeda(custoHora) : "Não configurada"}
          </span>

          <span>✅ Revisões a partir de R$ 350,00</span>

          <span>✅ Oficina especializada</span>
        </div>
      </summary>

      <div className="referencia-precos-conteudo">
        <p>
          Os valores são calculados automaticamente com base na hora técnica, na
          duração estimada do serviço.O orçamento final pode variar conforme o
          veículo e a complexidade do reparo.
        </p>

        <h3>Planos de revisão</h3>

        <ul className="lista-revisoes-neon">
          {revisoes.map((revisao) => (
            <li key={revisao.nome}>
              <span>
                <strong>{revisao.nome}</strong>
                <br />
                {revisao.prazo}
                <br />
                <small>{revisao.descricao}</small>
              </span>

              <strong>{moeda(revisao.preco)}</strong>
            </li>
          ))}
        </ul>

        <h3>Serviços individuais</h3>

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
              {servicos.map((servico) => (
                <tr key={servico.nome}>
                  <th scope="row">{servico.nome}</th>
                  <td>{servico.descricao}</td>
                  <td>{servico.minutos} min</td>
                  <td>{exibirPreco(servico.minutos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside
          className="nota-precos-neon"
          aria-label="Importante sobre os valores"
        >
          <strong>
            <Lightbulb size={20} aria-hidden="true" /> ATENÇÃO: SOMENTE MÃO DE
            OBRA
          </strong>
          <p>
            Peças e componentes não estão incluídos e serão cobrados à parte. Os
            tempos apresentados são estimativas iniciais. Confirme o valor final
            em orçamento antes da aprovação do serviço.
          </p>
        </aside>
      </div>
    </details>
  );
}

export default TabelaPrecosNeon;
