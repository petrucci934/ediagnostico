import { useState } from "react";
import {
  catalogoDiagnosticos,
  filtrarCatalogo,
  resultadoCatalogo,
} from "./catalogoDiagnosticos";
import DiagnosticoGuiado from "./DiagnosticoGuiado";
import SeloGravidade from "./SeloGravidade";
import "./DiagnosticoGuiado.css";

export default function CatalogoDiagnosticos({ onConsultar }) {
  const [busca, setBusca] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [componente, setComponente] = useState("");
  const itens = filtrarCatalogo({ busca, fabricante, componente });
  return (
    <section className="dg-catalogo" aria-labelledby="dg-catalogo-titulo">
      <header>
        <span className="etiqueta">REFERÊNCIAS DE DIAGNÓSTICO · EM TESTE</span>
        <h2 id="dg-catalogo-titulo">Encontre o código. Confira o sistema.</h2>
        <p>
          14 fichas de Xiaomi, Ninebot e Bafang. A compatibilidade deve ser
          confirmada por modelo.
        </p>
      </header>
      <div className="dg-filtros">
        <label>
          Buscar código ou assunto
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Ex.: 10, acelerador, comunicação"
            type="search"
          />
        </label>
        <label>
          Fabricante
          <select
            value={fabricante}
            onChange={(event) => setFabricante(event.target.value)}
          >
            <option value="">Todos</option>
            {[
              ...new Set(catalogoDiagnosticos.map((item) => item.fabricante)),
            ].map((nome) => (
              <option key={nome}>{nome}</option>
            ))}
          </select>
        </label>
        <label>
          Componente
          <select
            value={componente}
            onChange={(event) => setComponente(event.target.value)}
          >
            <option value="">Todos</option>
            {[
              ...new Set(catalogoDiagnosticos.map((item) => item.componente)),
            ].map((nome) => (
              <option key={nome}>{nome}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setBusca("");
            setFabricante("");
            setComponente("");
          }}
        >
          Limpar filtros
        </button>
      </div>
      <p role="status">
        {itens.length}{" "}
        {itens.length === 1 ? "ficha encontrada" : "fichas encontradas"}
      </p>
      <div className="dg-grade-catalogo">
        {itens.map((item) => (
          <details
            key={item.id}
            className="dg-item-catalogo"
            onToggle={(event) => {
              if (
                event.target === event.currentTarget &&
                event.currentTarget.open
              )
                onConsultar?.(item);
            }}
          >
            <summary>
              <span className="dg-codigo">{item.codigo}</span>
              <span className="dg-fabricante">{item.fabricante}</span>
              <strong>{item.descricao}</strong>
              <SeloGravidade linhas={resultadoCatalogo(item).resultados} />
              <small>
                {item.modelo} · {item.estado}
              </small>
              <span className="dg-abrir">Abrir ficha</span>
            </summary>
            <DiagnosticoGuiado
              resultado={resultadoCatalogo(item)}
              contexto={{ fabricante: item.fabricante, modelo: item.modelo }}
              procedimentos={[]}
              estado="pronto"
              cabecalhoNoResumo
            />
          </details>
        ))}
      </div>
      {!itens.length && (
        <p>
          Nenhuma ficha corresponde aos filtros. Limpe os filtros para ver o
          catálogo.
        </p>
      )}
    </section>
  );
}
