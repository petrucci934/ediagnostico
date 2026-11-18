import { useId, useState } from "react";
import {
  Layers,
  Eye,
  Battery,
  Zap,
  Info,
  GraduationCap,
  Minus,
  Plus,
} from "lucide-react";
import {
  calcularPack,
  conexoesPack,
  limitesPack,
  polaridadePack,
  pontosBmsPack,
} from "./montePack";
import "./MontePack.css";
import MateriaisPack from "./MateriaisPack";

const cores = [
  "#00d9ed",
  "#ff9800",
  "#c530f3",
  "#62df91",
  "#ff70a0",
  "#7999ff",
  "#efd05b",
  "#4ed5b3",
  "#e5a0ed",
  "#a1ca61",
  "#f19070",
  "#74c6f0",
  "#e6e88a",
];
const fmt = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

function FacePack({
  serie,
  paralelo,
  face,
  niquel,
  polos,
  destacar,
  selecionada,
  onSelecionar,
  prefixo,
}) {
  const inferior = face === "inferior";
  const x = (g) => 205 + g * 118;
  const y = (c) => 92 + (inferior ? paralelo - 1 - c : c) * 120;
  const meio = 92 + (paralelo - 1) * 60;
  const altura = Math.max(190 + (paralelo - 1) * 120, 180 + serie * 27);
  const largura = Math.max(serie * 118 + 170, 380);
  const chapas = conexoesPack(serie, paralelo, face);
  const metal = `${prefixo}-metal`;
  const weld = `${prefixo}-solda`;
  const cell = `${prefixo}-celula`;
  function selecionar(chapa) {
    const descricao =
      chapa.tipo === "serie"
        ? `B${chapa.grupo + 1} · G${chapa.grupo + 1}+ → G${chapa.grupo + 2}−`
        : `${paralelo > 1 ? "Paralelo" : "Terminal"} de G${chapa.grupo + 1} · polos ${polaridadePack(chapa.grupo, face)}`;
    onSelecionar({ ...chapa, face, descricao });
  }
  return (
    <section className="mp-face">
      <h3>
        <Eye size={27} aria-hidden="true" /> Vista {face}
      </h3>
      <div
        className="mp-desenho"
        tabIndex={0}
        aria-label={`Vista ${face}; role para explorar packs maiores.`}
      >
        <svg
          width={largura}
          height={altura}
          viewBox={`0 0 ${largura} ${altura}`}
          aria-label={`Pack ${serie}S${paralelo}P, vista ${face}`}
        >
          <defs>
            <linearGradient
              id={metal}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="430"
              y2="340"
            >
              <stop stopColor="#7b8997" />
              <stop offset=".28" stopColor="#f9fcff" />
              <stop offset=".45" stopColor="#b8c2cd" />
              <stop offset=".65" stopColor="#eef3f7" />
              <stop offset="1" stopColor="#86929f" />
            </linearGradient>
            <radialGradient id={weld} cx="35%" cy="25%">
              <stop stopColor="#fff" />
              <stop offset=".4" stopColor="#cdd4db" />
              <stop offset="1" stopColor="#5d6977" />
            </radialGradient>
            <linearGradient id={cell} x2=".8" y2="1">
              <stop stopColor="#f5f8fb" />
              <stop offset=".5" stopColor="#bac7d3" />
              <stop offset="1" stopColor="#edf0f3" />
            </linearGradient>
            {cores.slice(0, serie).map((cor, g) => (
              <radialGradient key={g} id={`${prefixo}-aro-${g}`}>
                <stop offset=".7" stopColor={cor} />
                <stop offset=".87" stopColor="#fff" />
                <stop offset=".92" stopColor={cor} />
                <stop offset="1" stopColor={cor} />
              </radialGradient>
            ))}
          </defs>
          {polos && (
            <g className="mp-polaridades">
              <rect
                x="10"
                y="66"
                width="126"
                height="52"
                rx="9"
                fill="#0a1c32"
                stroke="#7896b9"
              />
              <text x="21" y="87" fill="#f1f5fc" fontSize="14" fontWeight="700">
                Polaridades
              </text>
              <text x="21" y="106" fill="#b8d7eb" fontSize="12">
                (vista {face})
              </text>
              {Array.from({ length: serie }, (_, g) => (
                <g key={g}>
                  <circle cx="25" cy={147 + g * 27} r="7" fill={cores[g]} />
                  <text
                    x="42"
                    y={153 + g * 27}
                    fill="#f4f6fb"
                    fontSize="15"
                    fontWeight="700"
                  >
                    G{g + 1}:{" "}
                    {Array.from({ length: Math.min(paralelo, 3) }, () =>
                      polaridadePack(g, face),
                    ).join(" ")}
                    {paralelo > 3 ? " …" : ""}
                  </text>
                </g>
              ))}
            </g>
          )}
          {Array.from({ length: serie }, (_, g) => (
            <g key={g}>
              <rect
                x={x(g) - 28}
                y="4"
                width="56"
                height="28"
                rx="14"
                stroke={cores[g]}
                strokeWidth="2"
                fill={`${cores[g]}44`}
              />
              <text
                x={x(g)}
                y="24"
                textAnchor="middle"
                fill="#fff"
                fontSize="20"
                fontWeight="700"
              >
                G{g + 1}
              </text>
              {Array.from({ length: paralelo }, (_, c) => (
                <g key={c}>
                  <circle
                    cx={x(g)}
                    cy={y(c)}
                    r="56"
                    fill={`url(#${prefixo}-aro-${g})`}
                  />
                  <circle
                    cx={x(g)}
                    cy={y(c)}
                    r="46"
                    fill={`url(#${cell})`}
                    stroke="#62717e"
                    strokeWidth="2"
                  />
                  <text
                    x={x(g) + 42}
                    y={y(c) + 58}
                    fill={cores[g]}
                    textAnchor="middle"
                    fontSize="9"
                  >
                    {g + 1}.{c + 1}
                  </text>
                </g>
              ))}
            </g>
          ))}
          {niquel &&
            chapas.map((chapa) => {
              const ponte = chapa.tipo === "serie";
              const g = chapa.grupo;
              const ativo = selecionada?.id === chapa.id;
              const nome = ponte
                ? `Série: G${g + 1} positivo → G${g + 2} negativo`
                : `${paralelo > 1 ? "Paralelo" : "Terminal"} de G${g + 1}: ${paralelo} polos ${polaridadePack(g, face)}`;
              return (
                <g
                  key={chapa.id}
                  role="button"
                  tabIndex={0}
                  aria-label={nome}
                  aria-pressed={ativo}
                  className={`mp-chapa ${ativo ? "mp-selecionada" : ""} ${ponte && destacar ? "mp-ponte-destaque" : ""}`}
                  onClick={() => selecionar(chapa)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selecionar(chapa);
                    }
                  }}
                >
                  <title>{nome}</title>
                  <path
                    className="mp-metal-borda"
                    d={
                      ponte
                        ? `M ${x(g)} ${meio} H ${x(g + 1)}`
                        : `M ${x(g)} ${Math.min(y(0), y(paralelo - 1))} V ${Math.max(y(0), y(paralelo - 1))}`
                    }
                    stroke="#657280"
                    strokeWidth="39"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    className="mp-metal"
                    d={
                      ponte
                        ? `M ${x(g)} ${meio} H ${x(g + 1)}`
                        : `M ${x(g)} ${Math.min(y(0), y(paralelo - 1)) - 1} V ${Math.max(y(0), y(paralelo - 1)) + 1}`
                    }
                    stroke={`url(#${metal})`}
                    strokeWidth="33"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect
                    x={ponte ? x(g) + 24 : x(g) - 22}
                    y={ponte ? meio - 22 : Math.min(y(0), y(paralelo - 1)) - 22}
                    width={ponte ? 70 : 44}
                    height={ponte ? 44 : Math.abs(y(0) - y(paralelo - 1)) + 44}
                    fill="transparent"
                  />
                </g>
              );
            })}
          {niquel &&
            Array.from({ length: serie }, (_, g) =>
              Array.from({ length: paralelo }, (_, c) => (
                <g key={`${g}-${c}`} pointerEvents="none">
                  {[-7, 7].map((dx) => (
                    <circle
                      key={dx}
                      cx={x(g) + dx}
                      cy={y(c)}
                      r="5.5"
                      fill={`url(#${weld})`}
                      stroke="#6c7885"
                    />
                  ))}
                </g>
              )),
            )}
          {polos &&
            Array.from({ length: serie }, (_, g) =>
              Array.from({ length: paralelo }, (_, c) => (
                <text
                  key={`${g}-${c}`}
                  x={x(g)}
                  y={y(c) + (c === (inferior ? 0 : paralelo - 1) ? 38 : -25)}
                  textAnchor="middle"
                  fill="#0a1424"
                  fontSize="31"
                  fontWeight="800"
                  pointerEvents="none"
                >
                  {polaridadePack(g, face)}
                </text>
              )),
            )}
          {pontosBmsPack(serie, face).map((ponto) => {
            const px = x(ponto.grupo) + (ponto.ponte ? 59 : 0);
            const py = ponto.ponte ? meio : Math.max(y(0), y(paralelo - 1)) + 4;
            const ty = ponto.ponte ? py - 25 : altura - 32;
            const nome = ponto.numero === 0 ? "B− (B0)" : `B${ponto.numero}`;
            return (
              <g key={nome} className="mp-bms" pointerEvents="none">
                <title>
                  {nome}:{" "}
                  {ponto.numero === 0
                    ? "negativo geral"
                    : `positivo de G${ponto.numero}`}
                </title>
                <path
                  d={`M ${px} ${py} V ${ponto.ponte ? ty + 4 : ty - 12}`}
                  stroke="#c7fc49"
                  strokeDasharray="3 3"
                />
                <circle cx={px} cy={py} r="3" fill="#c7fc49" />
                <text
                  x={px}
                  y={ty}
                  fill="#d6ff7c"
                  stroke="#061528"
                  strokeWidth="4"
                  paintOrder="stroke"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                >
                  {nome}
                </text>
                {!ponto.ponte && (
                  <text
                    x={px}
                    y={altura - 10}
                    fill="#eaf5fb"
                    fontSize="13"
                    textAnchor="middle"
                  >
                    Saída {ponto.numero === 0 ? "−" : "+"}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <small>
        {inferior
          ? "Virado de cima para baixo; G1 permanece à esquerda."
          : "Cada coluna colorida representa um grupo paralelo."}
      </small>
    </section>
  );
}

function Chave({ checked, onChange, children }) {
  return (
    <label className="mp-chave">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span aria-hidden="true" />
      {children}
    </label>
  );
}

export default function MontePack() {
  const id = useId().replace(/:/g, "");
  const [dados, setDados] = useState({
    serie: 3,
    paralelo: 2,
    tensao: "3.7",
    capacidade: "2.5",
  });
  const [formato, setFormato] = useState("18650");
  const [niquel, setNiquel] = useState(true);
  const [polos, setPolos] = useState(true);
  const [destacar, setDestacar] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const resultado = calcularPack(dados);
  const mudar = (nome, valor) => {
    setDados((d) => ({ ...d, [nome]: valor }));
    setSelecionada(null);
  };
  function contador(nome, titulo, max) {
    return (
      <label className="mp-contador">
        {titulo}
        <span>
          <button
            type="button"
            aria-label={`Diminuir ${titulo}`}
            disabled={
              !Number.isFinite(Number(dados[nome])) || Number(dados[nome]) <= 1
            }
            onClick={() =>
              mudar(
                nome,
                Math.max(1, Math.min(max, Math.floor(Number(dados[nome])) - 1)),
              )
            }
          >
            <Minus size={18} />
          </button>
          <input
            aria-label={`${titulo} (${nome === "serie" ? "S" : "P"})`}
            type="number"
            min="1"
            max={max}
            step="1"
            value={dados[nome]}
            onChange={(e) => mudar(nome, e.target.value)}
          />
          <button
            type="button"
            aria-label={`Aumentar ${titulo}`}
            disabled={Number(dados[nome]) >= max}
            onClick={() =>
              mudar(
                nome,
                Math.min(max, Math.max(1, Math.floor(Number(dados[nome])) + 1)),
              )
            }
          >
            <Plus size={18} />
          </button>
        </span>
      </label>
    );
  }
  return (
    <section className="mp-ferramenta" aria-labelledby={`${id}-titulo`}>
      <div className="mp-topo">
        <header className="mp-cabecalho">
          <Layers size={50} aria-hidden="true" />
          <div>
            <h2 id={`${id}-titulo`}>
              Monte seu <span>pack</span>
            </h2>
            <p>Entenda série, paralelo e as conexões de níquel.</p>
          </div>
        </header>
        <div className="mp-campos">
          <label>
            Célula
            <select
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
            >
              <option>18650</option>
              <option>21700</option>
              <option>Genérica</option>
            </select>
          </label>
          <label>
            Tensão
            <input
              aria-label="Tensão nominal por célula (V)"
              title="Tensão nominal por célula (V)"
              type="number"
              min="0.01"
              max="10"
              step="any"
              value={dados.tensao}
              onChange={(e) => mudar("tensao", e.target.value)}
            />
            <small>V por célula</small>
          </label>
          <label>
            Capacidade
            <input
              aria-label="Capacidade por célula (Ah)"
              title="Capacidade por célula (Ah)"
              type="number"
              min="0.01"
              max="100"
              step="any"
              value={dados.capacidade}
              onChange={(e) => mudar("capacidade", e.target.value)}
            />
            <small>Ah por célula</small>
          </label>
          {contador("serie", "Série", limitesPack.serie)}
          {contador("paralelo", "Paralelo", limitesPack.paralelo)}
        </div>
      </div>
      <div className="mp-opcoes">
        <Chave
          checked={niquel}
          onChange={(e) => {
            setNiquel(e.target.checked);
            setSelecionada(null);
          }}
        >
          Mostrar níquel
        </Chave>
        <Chave checked={polos} onChange={(e) => setPolos(e.target.checked)}>
          Mostrar polaridade
        </Chave>
        <Chave
          checked={destacar}
          onChange={(e) => setDestacar(e.target.checked)}
        >
          Destacar série
        </Chave>
      </div>
      {!resultado ? (
        <p role="alert">
          Informe S inteiro de 1 a {limitesPack.serie} e P inteiro de 1 a{" "}
          {limitesPack.paralelo}; tensão de 0,01 a 10 V e capacidade de 0,01 a
          100 Ah.
        </p>
      ) : (
        <>
          <div className="mp-vistas">
            {["superior", "inferior"].map((face) => (
              <FacePack
                key={face}
                serie={Number(dados.serie)}
                paralelo={Number(dados.paralelo)}
                face={face}
                niquel={niquel}
                polos={polos}
                destacar={destacar}
                selecionada={selecionada}
                onSelecionar={setSelecionada}
                prefixo={`${id}-${face}`}
              />
            ))}
          </div>
          <p className="mp-legenda mp-central">
            <Info size={19} aria-hidden="true" /> Cores identificam os grupos;
            as chapas reais são metálicas. Toque numa chapa para entender a
            ligação.
          </p>
          <dl className="mp-resultados" aria-live="polite">
            {[
              [Layers, "Configuração", resultado.configuracao],
              [Battery, "Total de células", `${resultado.celulas} células`],
              [Zap, "Tensão nominal", `${fmt(resultado.tensao)} V`],
              [Battery, "Capacidade", `${fmt(resultado.capacidade)} Ah`],
              [Zap, "Energia nominal", `${fmt(resultado.energia)} Wh`],
            ].map(([Icone, label, valor]) => (
              <div key={label}>
                <Icone size={31} aria-hidden="true" />
                <div>
                  <dt>{label}</dt>
                  <dd>{valor}</dd>
                </div>
              </div>
            ))}
          </dl>
          <h3 className="mp-aprenda">
            <GraduationCap size={32} aria-hidden="true" /> Aprenda olhando
          </h3>
          <div className="mp-licoes">
            <div>
              <Battery size={40} aria-hidden="true" />
              <p>
                <strong>Paralelo:</strong> une células do mesmo grupo e soma a
                capacidade.
              </p>
            </div>
            <div>
              <Layers size={40} aria-hidden="true" />
              <p>
                <strong>Série:</strong> conecta grupos e soma a tensão.
              </p>
            </div>
          </div>
          {selecionada && (
            <div className="mp-explicacao" aria-live="polite">
              <strong>
                {selecionada.descricao} · face {selecionada.face}
              </strong>
              <p>
                {selecionada.tipo === "serie"
                  ? `Esta ponte une o positivo de G${selecionada.grupo + 1} ao negativo de G${selecionada.grupo + 2}. É o ponto B${selecionada.grupo + 1} de leitura da BMS. As tensões dos grupos se somam.`
                  : Number(dados.paralelo) === 1
                    ? "Com P = 1, esta chapa é o terminal de uma célula; não há soma de capacidades."
                    : `Une ${dados.paralelo} polos iguais de G${selecionada.grupo + 1}. A chapa na outra face une os polos opostos desse mesmo grupo. Juntas formam o paralelo, somando Ah e mantendo a tensão de uma célula.`}
              </p>
            </div>
          )}
          <details className="mp-detalhes">
            <summary>Pontos da BMS e cálculos</summary>
            <p>
              B− (B0) = negativo geral. B1 = positivo de G1; B2 = positivo de
              G2; assim por diante até B{dados.serie} = positivo geral. São
              pontos de leitura, não novas pontes de níquel. Confira nomes e
              pinagem no manual da BMS.
            </p>
            <p>
              {pontosBmsPack(Number(dados.serie), "superior")
                .concat(pontosBmsPack(Number(dados.serie), "inferior"))
                .sort((a, b) => a.numero - b.numero)
                .map(
                  (p) =>
                    `${p.numero === 0 ? "B−" : `B${p.numero}`}: ${fmt(p.numero * Number(dados.tensao))} V`,
                )
                .join(" · ")}{" "}
              em relação a B−.
            </p>
            <p>
              V = S × tensão da célula · Ah = P × capacidade da célula · Wh = V
              × Ah. Modelo de células idênticas; o formato {formato} não define
              tensão ou capacidade.
            </p>
            <button
              type="button"
              onClick={() => {
                setDados({
                  serie: 3,
                  paralelo: 2,
                  tensao: "3.7",
                  capacidade: "2.5",
                });
                setSelecionada(null);
              }}
            >
              Restaurar 3S2P
            </button>
          </details>
        </>
      )}
      <MateriaisPack resultado={resultado} />
      <small className="mp-aviso">
        <Info size={16} aria-hidden="true" /> Ilustração educativa. Não
        substitui um projeto de fabricação; isolação, dimensionamento do níquel,
        proteção e BMS não estão representados.
      </small>
    </section>
  );
}
