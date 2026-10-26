import { useEffect, useState } from "react";

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
  horasServico: "2",
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
function Precificacao() {
  const [configuracao, setConfiguracao] = useState(carregarConfiguracao);

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

  function atualizarCampo(chave, valor) {
    setConfiguracao((atual) => ({ ...atual, [chave]: valor }));
  }

  function atualizarDespesa(chave, valor) {
    setConfiguracao((atual) => ({
      ...atual,
      despesas: { ...atual.despesas, [chave]: valor },
    }));
  }

  function calcularHoras(inicio, fim, almoco) {
    const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
    const [horaFim, minutoFim] = fim.split(":").map(Number);

    const minutos =
      horaFim * 60 +
      minutoFim -
      (horaInicio * 60 + minutoInicio) -
      Number(almoco);

    return Math.max(0, minutos / 60);
  }

  const horasSemana = calcularHoras(inicioSemana, fimSemana, almocoSemana);
  const horasSabado = calcularHoras(inicioSabado, fimSabado, almocoSabado);
  const custos = Object.values(despesas).reduce(
    (total, valor) => total + Math.max(0, Number(valor) || 0),
    0,
  );
  const horasMensais = (horasSemana * 5 + horasSabado) * (52 / 12);
  const horasProdutivas = horasMensais * (Number(produtividade) / 100);
  const custoHora = horasProdutivas > 0 ? Number(custos) / horasProdutivas : 0;

  const custoServico = custoHora * Number(horasServico) + Number(pecas);

  const precoServico =
    margem >= 0 && margem < 100 ? custoServico / (1 - Number(margem) / 100) : 0;

  const moeda = (valor) =>
    valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <section className="principal">
      <span className="etiqueta">GESTÃO DA OFICINA</span>

      <h1>
        Precifique seu serviço.
        <br />
        <span>Conheça seus custos.</span>
      </h1>

      <p className="introducao">
        Configure sua jornada de trabalho e calcule o custo da hora técnica e o
        preço sugerido de cada serviço.
      </p>

      <div className="precificacao">
        <details className="configuracao-oficina">
          <summary>Configurações da oficina</summary>
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
        </details>
        <div className="resultado-precificacao">
          <p>Horas mensais disponíveis</p>
          <strong>{horasMensais.toFixed(1)} h</strong>

          <p>Horas produtivas estimadas</p>
          <strong>{horasProdutivas.toFixed(1)} h</strong>

          <p>Custo da hora técnica</p>
          <strong>{moeda(custoHora)}</strong>
        </div>

        <h2>3. Calcular preço do serviço</h2>

        <label>Duração do serviço (horas)</label>
        <input
          type="number"
          min="0"
          step="0.25"
          value={horasServico}
          onChange={(e) => atualizarCampo("horasServico", e.target.value)}
        />

        <label>Custo das peças (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={pecas}
          onChange={(e) => atualizarCampo("pecas", e.target.value)}
        />

        <label>Margem de lucro desejada (%)</label>
        <input
          type="number"
          min="0"
          max="99"
          value={margem}
          onChange={(e) => atualizarCampo("margem", e.target.value)}
        />

        <div className="resultado-precificacao destaque-preco">
          <p>Custo estimado do serviço</p>
          <strong>{moeda(custoServico)}</strong>

          <p>Preço sugerido ao cliente</p>
          <strong>{moeda(precoServico)}</strong>
        </div>

        <p className="aviso-precificacao">
          Estimativa inicial. Confira impostos, taxas, garantia e demais
          despesas antes de definir o preço final.
        </p>
      </div>
    </section>
  );
}

export default Precificacao;
