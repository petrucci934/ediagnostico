import { useState } from "react";
import { BatteryCharging, Calculator } from "lucide-react";
import {
  calcularBateria,
  perfisBateria,
  valoresIniciais,
} from "./calculoBateria";
import "./CalculadoraBateria.css";

const campos = [
  ["serie", "Quantidade em série", 1, 100, 1],
  ["capacidade", "Capacidade total do conjunto (Ah)", 0.1, 1000, 0.1],
  ["massaBateria", "Peso da bateria completa (kg)", 0.1, 1000, 0.1],
  ["condutor", "Peso do condutor (kg)", 1, 500, 1],
  ["veiculo", "Peso do veículo SEM bateria (kg)", 1, 1000, 1],
  ["carga", "Bagagem / passageiro adicional (kg)", 0, 1000, 1],
  ["velocidade", "Velocidade constante (km/h)", 1, 150, 1],
  ["subida", "Subida contínua (%) — 0 para plano", 0, 30, 0.1],
];
const avancados = [
  ["utilizavel", "Parcela da carga a utilizar (%)", 1, 100, 1],
  ["saude", "Capacidade remanescente / saúde (%)", 1, 100, 1],
  ["eficiencia", "Eficiência motor + transmissão (%)", 10, 100, 1],
  ["rolamento", "Coeficiente de rolamento", 0.001, 0.1, 0.001],
  ["area", "Área aerodinâmica efetiva CdA (m²)", 0.1, 2, 0.01],
  ["auxiliares", "Luzes e outros consumos (W)", 0, 2000, 1],
];
const formatar = (valor, casas = 1) =>
  valor.toLocaleString("pt-BR", { maximumFractionDigits: casas });
export default function CalculadoraBateria() {
  const [dados, setDados] = useState(valoresIniciais);
  const resultado = calcularBateria(dados);
  function campo([nome, titulo, min, max, step]) {
    return (
      <label key={nome} htmlFor={`cb-${nome}`}>
        {titulo}
        <input
          id={`cb-${nome}`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={dados[nome]}
          onChange={(e) => setDados({ ...dados, [nome]: e.target.value })}
        />
      </label>
    );
  }
  return (
    <section className="cb-ferramenta" aria-labelledby="cb-titulo">
      <header className="cb-cabecalho">
        <Calculator size={25} aria-hidden="true" />
        <span>
          <small>FERRAMENTA DE APRENDIZADO</small>
          <h2 id="cb-titulo">
            Calculadora de autonomia e voltagem da bateria de veículos elétricos
          </h2>
        </span>
      </header>
      <div className="cb-conteudo">
        <p>
          Simule bikes, motos e scooters pelo peso real do conjunto. Os valores
          iniciais são hipóteses didáticas editáveis, não especificações do seu
          veículo.
        </p>
        <div className="cb-layout">
          <div className="cb-parametros">
            <h3>Parâmetros da bateria e do veículo</h3>
            <div className="cb-campos">
              <label htmlFor="cb-quimica">
                Tipo de bateria
                <select
                  id="cb-quimica"
                  value={dados.quimica}
                  onChange={(e) => {
                    const quimica = e.target.value;
                    const p = perfisBateria[quimica];
                    setDados({
                      ...dados,
                      quimica,
                      serie: p.serie,
                      massaBateria: p.massa,
                      utilizavel: p.uso,
                    });
                  }}
                >
                  {Object.entries(perfisBateria).map(([id, p]) => (
                    <option key={id} value={id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </label>
              {campos.map(campo)}
            </div>
            <p className="cb-nota">
              Série: {perfisBateria[dados.quimica].unidade}. Em série, some as
              tensões; a capacidade em Ah não é somada. Informe os Ah totais
              considerando eventuais ramos em paralelo.
            </p>
            <details className="cb-ajustes">
              <summary>Ajustar hipóteses do cálculo</summary>
              <div className="cb-campos">
                {avancados.map(campo)}
                {dados.quimica === "chumbo" && (
                  <>
                    {campo(["peukert", "Expoente de Peukert", 1, 1.5, 0.01])}
                    {campo([
                      "horasNominais",
                      "Regime de capacidade (h): C20 = 20",
                      1,
                      100,
                      1,
                    ])}
                  </>
                )}
              </div>
            </details>
            <button
              type="button"
              className="tc-voltar"
              onClick={() => setDados({ ...valoresIniciais })}
            >
              Restaurar exemplo inicial
            </button>
          </div>
          <section
            className="cb-resultados"
            aria-label="Resultados da simulação"
            aria-live="polite"
          >
            {!resultado ? (
              <p role="alert">
                Preencha todos os campos dentro dos limites indicados. A
                quantidade em série deve ser inteira.
              </p>
            ) : (
              <>
                <BatteryCharging aria-hidden="true" />
                <small>AUTONOMIA ESTIMADA</small>
                <strong className="cb-autonomia">
                  {formatar(resultado.autonomia)} km
                </strong>
                <p>Velocidade constante, sem pedalada, vento ou paradas.</p>
                <dl>
                  {[
                    [
                      "Tensão nominal calculada",
                      `${formatar(resultado.tensao)} V`,
                    ],
                    ["Energia nominal", `${formatar(resultado.energia, 0)} Wh`],
                    [
                      "Energia disponível estimada",
                      `${formatar(resultado.disponivel, 0)} Wh`,
                    ],
                    [
                      "Massa total em movimento",
                      `${formatar(resultado.massa)} kg`,
                    ],
                    [
                      "Consumo estimado",
                      `${formatar(resultado.consumo)} Wh/km`,
                    ],
                    [
                      "Corrente média estimada",
                      `${formatar(resultado.corrente)} A`,
                    ],
                    ["Tempo em movimento", `${formatar(resultado.horas)} h`],
                  ].map(([titulo, valor]) => (
                    <div key={titulo}>
                      <dt>{titulo}</dt>
                      <dd>{valor}</dd>
                    </div>
                  ))}
                </dl>
                {dados.quimica === "chumbo" && (
                  <p>
                    Capacidade após ajuste de descarga:{" "}
                    {formatar(resultado.fatorPeukert * 100, 0)}% da nominal,
                    antes da reserva de carga e saúde.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
        <section className="cb-explicacao">
          <h2>Entenda a voltagem e o peso</h2>
          <p>
            Mais massa aumenta a energia necessária para vencer o rolamento e as
            subidas. O cálculo usa o peso informado, sem presumir que toda
            bateria de chumbo ou lítio tenha o mesmo peso.
          </p>
          <p>
            {dados.quimica === "chumbo"
              ? "Chumbo-ácido: cada bloco informado representa 12 V nominais (seis células). AGM, gel e inundada têm perfis de carga diferentes. Use a ficha técnica para tensão de carga, descarga e capacidade no regime correto. O ajuste de Peukert estima a perda de capacidade em correntes altas; 1,25 e C20 são exemplos editáveis."
              : dados.quimica === "litio"
                ? `Lítio íon: exemplo de células com 3,6 V nominais e 4,2 V de fim de carga. ${resultado ? `Para esta configuração: ${formatar(resultado.cargaLitio)} V de referência no fim da carga.` : ""} Isso não define a tensão de corte do BMS nem permite escolher um carregador sem conferir a bateria.`
                : "LiFePO₄: usamos 3,2 V nominais por célula. Tensão de carga e corte dependem do fabricante e do BMS; confirme os limites na documentação do conjunto."}
          </p>
          <p>
            A tensão isolada não comprova saúde nem capacidade. Temperatura,
            pneus, acelerações, vento, relevo variável e limites da controladora
            podem alterar bastante a autonomia. Não há regeneração neste modelo.
          </p>
          <details>
            <summary>Como calculamos e referências técnicas</summary>
            <p>
              Energia nominal = V × Ah. Energia disponível = energia nominal ×
              parcela utilizável × saúde × fator de descarga. Consumo = potência
              elétrica / velocidade. Potência considera rolamento, subida,
              resistência do ar (densidade 1,225 kg/m³), eficiência e
              auxiliares. Para chumbo, fator = mínimo entre 1 e (corrente
              nominal / corrente estimada) elevado a (Peukert − 1).
            </p>
            <ul>
              <li>
                <a
                  href="https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Victron — capacidade e expoente de Peukert
                </a>
              </li>
              <li>
                <a
                  href="https://www.trojanbattery.com/resources/battery-maintenance"
                  target="_blank"
                  rel="noreferrer"
                >
                  Trojan — manutenção e referências de chumbo-ácido
                </a>
              </li>
              <li>
                <a
                  href="https://www.molicel.com/wp-content/uploads/INR18650P26A_1.4_Product-Data-Sheet-of-INR-18650-P26A-80087.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Molicel — exemplo de célula de lítio íon
                </a>
              </li>
            </ul>
          </details>
        </section>
      </div>
    </section>
  );
}
