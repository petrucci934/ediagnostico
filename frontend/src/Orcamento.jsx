import { useState } from "react";

function carregarServicos() {
  try {
    return (
      JSON.parse(localStorage.getItem("ediagnostico-servicos-oficina")) || []
    );
  } catch {
    return [];
  }
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Orcamento({ onPrecificar }) {
  const [servicos] = useState(carregarServicos);
  const [cliente, setCliente] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [selecionados, setSelecionados] = useState([]);
  const itensSelecionados = servicos.filter((servico) =>
    selecionados.includes(servico.id),
  );
  const total = itensSelecionados.reduce(
    (soma, servico) =>
      soma +
      (Number(servico.maoDeObra) || 0) +
      (Number(servico.materiais) || 0),
    0,
  );

  function alternarServico(id) {
    setSelecionados((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id],
    );
  }

  return (
    <section className="orcamento-mecanico" aria-labelledby="titulo-orcamento">
      <span className="etiqueta">ATENDIMENTO AO CLIENTE</span>
      <h2 id="titulo-orcamento">Montar orçamento</h2>
      <p className="orcamento-descricao">
        Selecione os serviços cadastrados para gerar uma proposta clara para o
        cliente.
      </p>

      <div className="orcamento-identificacao">
        <label>
          Cliente
          <input
            value={cliente}
            onChange={(evento) => setCliente(evento.target.value)}
            placeholder="Nome do cliente (opcional)"
          />
        </label>
        <label>
          Veículo
          <input
            value={veiculo}
            onChange={(evento) => setVeiculo(evento.target.value)}
            placeholder="Ex.: bicicleta elétrica, marca e modelo"
          />
        </label>
      </div>

      <h3>Serviços</h3>
      {servicos.length ? (
        <div className="orcamento-lista-servicos">
          {servicos.map((servico) => {
            const subtotal =
              (Number(servico.maoDeObra) || 0) +
              (Number(servico.materiais) || 0);

            return (
              <label className="orcamento-servico" key={servico.id}>
                <input
                  type="checkbox"
                  checked={selecionados.includes(servico.id)}
                  onChange={() => alternarServico(servico.id)}
                />
                <span className="orcamento-servico-detalhes">
                  <strong>{servico.nome}</strong>
                  <small>{servico.categoria}</small>
                </span>
                <span className="orcamento-servico-preco">
                  {moeda(subtotal)}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="orcamento-sem-servicos">
          <p>
            Cadastre serviços com valores de mão de obra e materiais antes de
            montar o orçamento.
          </p>
          <button type="button" onClick={onPrecificar}>
            Ir para Precificar
          </button>
        </div>
      )}

      <div className="orcamento-total">
        <span>Total do orçamento</span>
        <strong>{moeda(total)}</strong>
      </div>

      <div className="orcamento-acoes">
        <button
          type="button"
          className="botao-imprimir-orcamento"
          onClick={() => window.print()}
          disabled={!itensSelecionados.length}
        >
          Imprimir orçamento
        </button>
        <small>
          {cliente && `Cliente: ${cliente}`}
          {cliente && veiculo && " · "}
          {veiculo}
        </small>
      </div>
    </section>
  );
}

export default Orcamento;
