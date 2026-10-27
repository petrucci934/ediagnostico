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

  const minutosInicio = Number(inicio.split(":")[0]) * 60
    + Number(inicio.split(":")[1]);
  const minutosFim = Number(fim.split(":")[0]) * 60
    + Number(fim.split(":")[1]);

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
  const horasProdutivas =
    horasMensais * (Number(config.produtividade) / 100);

  return horasProdutivas > 0 ? despesas / horasProdutivas : 0;
}

const servicos = [
  {
    nome: "Inspeção de segurança completa",
    descricao: "Pneus, freios, luzes, buzina, retrovisor e instrumentos",
    minutos: 90,
  },
  {
    nome: "Ajuste de freios",
    descricao: "Regulagem de folga, cabo e pastilhas",
    minutos: 45,
  },
  {
    nome: "Troca de pastilhas de freio",
    descricao: "Substituição e regulagem; peças à parte",
    minutos: 45,
  },
  {
    nome: "Inspeção e calibragem de pneus",
    descricao: "Pressão, desgaste e sulcos",
    minutos: 30,
  },
  {
    nome: "Troca de pneu",
    descricao: "Dianteiro ou traseiro; peça à parte",
    minutos: 45,
  },
  {
    nome: "Inspeção da bateria",
    descricao: "Carga, tensão e estado geral",
    minutos: 45,
  },
  {
    nome: "Inspeção do sistema elétrico",
    descricao: "Controlador, chicote, fusíveis e conexões",
    minutos: 90,
  },
  {
    nome: "Diagnóstico de falha elétrica",
    descricao: "Controlador, motor ou circuito",
    minutos: 90,
  },
  {
    nome: "Inspeção do motor elétrico",
    descricao: "Fiação, fixação e funcionamento",
    minutos: 60,
  },
  {
    nome: "Inspeção da suspensão",
    descricao: "Amortecedores, curso e vazamentos",
    minutos: 45,
  },
  {
    nome: "Lubrificação e ajuste de cabos",
    descricao: "Peças rotativas e transmissão",
    minutos: 45,
  },
  {
    nome: "Inspeção de iluminação",
    descricao: "Faróis, setas, lanterna e luz de freio",
    minutos: 30,
  },
];

const revisoes = [
  { nome: "Revisão simples / trimestral", minutos: 180 },
  {
    nome: "Revisão completa com verificação aprofundada da bateria e elétrica",
    minutos: 300,
  },
  {
    nome: "Revisão com inspeção de freios e pastilhas",
    minutos: 240,
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
      <summary>
        Tabela de serviços e preços — motos elétricas
      </summary>

      <div className="referencia-precos-conteudo">
        <p>
          Os valores são calculados automaticamente com base na hora técnica,
          na duração estimada do serviço e na margem de lucro configurada
          pela oficina. O orçamento final pode variar conforme o veículo
          e a complexidade do reparo.
        </p>

        {precificacaoDisponivel ? (
          <p>
            <strong>Custo da hora técnica:</strong> {moeda(custoHora)}
            {" · "}
            <strong>Margem configurada:</strong> {margem}%
          </p>
        ) : (
          <p>
            <strong>
              Configure e salve as despesas, a produtividade e a margem
              na tela de Precificação para calcular os valores.
            </strong>
          </p>
        )}

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

        <h3>Planos de revisão</h3>

        <ul className="lista-revisoes-neon">
          {revisoes.map((revisao) => (
            <li key={revisao.nome}>
              <span>
                {revisao.nome} ({revisao.minutos / 60} h)
              </span>
              <strong>{exibirPreco(revisao.minutos)}</strong>
            </li>
          ))}
        </ul>

        <aside
          className="nota-precos-neon"
          aria-label="Importante sobre os valores"
        >
          <strong>
            <Lightbulb size={20} aria-hidden="true" /> ATENÇÃO: SOMENTE MÃO DE OBRA
          </strong>
          <p>
            Peças e componentes não estão incluídos e serão cobrados à parte.
            Os tempos apresentados são estimativas iniciais. Confirme o valor
            final em orçamento antes da aprovação do serviço.
          </p>
        </aside>
      </div>
    </details>
  );
}

export default TabelaPrecosNeon;
