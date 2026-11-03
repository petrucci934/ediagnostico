import {
  BatteryMedium,
  Bike,
  BookOpen,
  Cpu,
  Info,
  Motorbike,
  Network,
  Search,
} from "lucide-react";

function Patinete() {
  return (
    <svg
      className="bt-patinete"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13" cy="48" r="7" />
      <circle cx="53" cy="48" r="7" />
      <path d="M20 48h21l9-14-8-24h-9M47 39l3-5" />
    </svg>
  );
}

const categorias = [
  { nome: "Baterias", Icone: BatteryMedium, cor: "verde" },
  { nome: "Bicicletas Elétricas", Icone: Bike, cor: "azul" },
  { nome: "Controladoras", Icone: Cpu, cor: "roxo" },
  {
    nome: "Fluxos de Diagnóstico",

    Icone: Network,
    cor: "amarelo",
  },
  {
    nome: "Patinetes Elétricos",

    Icone: Patinete,
    cor: "ciano",
  },
  { nome: "Scooters Elétricas", Icone: Motorbike, cor: "rosa" },
];

export default function BibliotecaCabecalho({
  busca,
  onBuscaChange,
  filtros,
  onPesquisar,
  onFiltroChange,
  contagens,
}) {
  return (
    <>
      <header className="bt-apresentacao">
        <span className="bt-area">ÁREA DO MECÂNICO</span>
        <div className="bt-titulo">
          <BookOpen aria-hidden="true" />
          <h1>Biblioteca Técnica</h1>
          <h2>Mobilidade Elétrica</h2>
        </div>
        <p>
          Conteúdos técnicos, procedimentos, testes e boas práticas para
          diagnóstico, manutenção e reparo
          <br className="bt-quebra-desktop" /> de bicicletas, patinetes,
          scooters e sistemas elétricos.
        </p>
      </header>
      <div className="bt-categorias" aria-label="Categorias da biblioteca">
        {categorias.map(({ nome, Icone, cor }) => (
          <button
            key={nome}
            type="button"
            className={`bt-categoria bt-${cor}`}
            aria-pressed={filtros.categoria === nome}
            onClick={() =>
              onFiltroChange(
                "categoria",
                filtros.categoria === nome ? "" : nome,
              )
            }
          >
            <Icone aria-hidden="true" />
            <strong>{nome}</strong>
            <span>
              {contagens[nome] ? `${contagens[nome]} textos` : "Em preparação"}
            </span>
          </button>
        ))}
      </div>
      <form
        onSubmit={onPesquisar}
        className="bt-pesquisa"
        role="search"
        aria-label="Busca na biblioteca técnica"
      >
        <div className="bt-campo-busca">
          <Search aria-hidden="true" />
          <input
            aria-label="Buscar nos textos da biblioteca"
            placeholder="Buscar nos textos da biblioteca..."
            value={busca}
            onChange={(evento) => onBuscaChange(evento.target.value)}
          />
        </div>
        <button type="submit" className="bt-botao-pesquisar">
          Pesquisar
        </button>
      </form>
      <div className="bt-filtros" aria-label="Filtros da biblioteca">
        <label>
          <span className="bt-filtro-label">Categoria</span>
          <select
            aria-label="Categoria dos textos"
            value={filtros.categoria}
            onChange={(e) => onFiltroChange("categoria", e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((item) => (
              <option key={item.nome}>{item.nome}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="bt-filtro-label">Nível</span>
          <select
            aria-label="Nível dos textos"
            value={filtros.nivel}
            onChange={(e) => onFiltroChange("nivel", e.target.value)}
          >
            <option value="">Todos os níveis</option>
            <option>Introdutório</option>
            <option>Intermediário</option>
          </select>
        </label>
        <label>
          <span className="bt-filtro-label">Fabricante</span>
          <select
            aria-label="Fabricante dos textos"
            value={filtros.fabricante}
            onChange={(e) => onFiltroChange("fabricante", e.target.value)}
          >
            <option value="">Todos os fabricantes</option>
            <option value="Geral">Conteúdo geral</option>
          </select>
        </label>
        <label>
          <span className="bt-filtro-label">Ordenação</span>
          <select
            aria-label="Ordenação dos textos"
            value={filtros.ordem}
            onChange={(e) => onFiltroChange("ordem", e.target.value)}
          >
            <option value="trilha">Ordem de estudo</option>
            <option value="recentes">Mais recentes</option>
            <option value="titulo">Título: A–Z</option>
          </select>
        </label>
      </div>
      <aside className="bt-aviso">
        <Info aria-hidden="true" />
        <div>
          <strong>Importante</strong>
          <p>
            Conteúdos elaborados para uso técnico profissional. Siga sempre as
            normas de segurança e as recomendações dos fabricantes.
          </p>
        </div>
      </aside>
    </>
  );
}
