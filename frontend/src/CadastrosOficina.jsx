import { useEffect, useState } from "react";

const CHAVES = {
  clientes: "ediagnostico-clientes-oficina",
  itens: "ediagnostico-catalogo-oficina",
};

function lerLista(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
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

function CadastrosOficina({ abaInicial = "clientes", token }) {
  const [aba, setAba] = useState(abaInicial);
  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [erroClientes, setErroClientes] = useState("");
  const [itens, setItens] = useState(() => lerLista(CHAVES.itens));
  const [clienteEditando, setClienteEditando] = useState("");
  const [itemEditando, setItemEditando] = useState("");
  const [formCliente, setFormCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    veiculo: "",
  });
  const [formItem, setFormItem] = useState({
    nome: "",
    tipo: "servico",
    categoria: "",
    preco: "",
  });

  useEffect(() => {
    let ativo = true;

    async function carregarClientes() {
      setCarregandoClientes(true);
      setErroClientes("");

      try {
        console.log("[Clientes] Iniciando carregamento", {
          tokenPresente: Boolean(token),
        });

        const resposta = await fetch("/api/clientes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.erro || "Não foi possível carregar os clientes.",
          );
        }

        if (ativo) {
          setClientes(dados.clientes || []);
        }
      } catch (erro) {
        if (ativo) {
          setErroClientes(erro.message);
        }
      } finally {
        if (ativo) {
          setCarregandoClientes(false);
        }
      }
    }

    carregarClientes();

    return () => {
      ativo = false;
    };
  }, [token]);
  useEffect(
    () => localStorage.setItem(CHAVES.itens, JSON.stringify(itens)),
    [itens],
  );

  async function salvarCliente(evento) {
    evento.preventDefault();

    const registro = {
      ...formCliente,
      nome: formCliente.nome.trim(),
    };

    if (!registro.nome) return;

    try {
      setErroClientes("");

      if (clienteEditando) {
        setErroClientes(
          "A edição de clientes precisa ser conectada à rota de atualização da API.",
        );
        return;
      }

      const resposta = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registro),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível cadastrar o cliente.");
      }

      setClientes((lista) => [dados.cliente, ...lista]);

      setFormCliente({
        nome: "",
        telefone: "",
        email: "",
        veiculo: "",
      });

      setClienteEditando("");
    } catch (erro) {
      setErroClientes(erro.message);
    }
  }

  function salvarItem(evento) {
    evento.preventDefault();
    const registro = {
      ...formItem,
      nome: formItem.nome.trim(),
      preco: Number(formItem.preco) || 0,
    };
    if (!registro.nome) return;
    if (itemEditando) {
      setItens((lista) =>
        lista.map((item) =>
          item.id === itemEditando ? { ...item, ...registro } : item,
        ),
      );
    } else {
      setItens((lista) => [{ id: crypto.randomUUID(), ...registro }, ...lista]);
    }
    setFormItem({ nome: "", tipo: "servico", categoria: "", preco: "" });
    setItemEditando("");
  }

  return (
    <section className="principal cadastros-oficina">
      <span className="etiqueta">ÁREA DO MECÂNICO</span>
      <h1>Cadastros da oficina</h1>
      <p>Organize seus clientes e o catálogo de serviços e peças.</p>

      <div
        className="cadastros-abas"
        role="tablist"
        aria-label="Cadastros da oficina"
      >
        <button
          type="button"
          role="tab"
          aria-selected={aba === "clientes"}
          className={aba === "clientes" ? "ativa" : ""}
          onClick={() => setAba("clientes")}
        >
          Clientes ({clientes.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === "itens"}
          className={aba === "itens" ? "ativa" : ""}
          onClick={() => setAba("itens")}
        >
          Serviços e peças ({itens.length})
        </button>
      </div>

      {aba === "clientes" && (
        <>
          {carregandoClientes && <p>Carregando clientes...</p>}

          {erroClientes && (
            <p role="alert" className="mensagem-erro">
              {erroClientes}
            </p>
          )}
        </>
      )}

      {aba === "clientes" ? (
        <>
          <form className="cadastro-formulario" onSubmit={salvarCliente}>
            <h2>{clienteEditando ? "Editar cliente" : "Cadastrar cliente"}</h2>
            <label>
              Nome
              <input
                required
                value={formCliente.nome}
                onChange={(e) =>
                  setFormCliente({ ...formCliente, nome: e.target.value })
                }
                placeholder="Nome do cliente"
              />
            </label>
            <label>
              Telefone
              <input
                value={formCliente.telefone}
                onChange={(e) =>
                  setFormCliente({ ...formCliente, telefone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={formCliente.email}
                onChange={(e) =>
                  setFormCliente({ ...formCliente, email: e.target.value })
                }
                placeholder="cliente@email.com"
              />
            </label>
            <label>
              Veículo principal
              <input
                value={formCliente.veiculo}
                onChange={(e) =>
                  setFormCliente({ ...formCliente, veiculo: e.target.value })
                }
                placeholder="Ex.: bicicleta elétrica, marca/modelo"
              />
            </label>
            <div className="cadastro-acoes">
              <button type="submit">
                {clienteEditando ? "Salvar alterações" : "Adicionar cliente"}
              </button>
              {clienteEditando && (
                <button
                  type="button"
                  className="secundario"
                  onClick={() => {
                    setClienteEditando("");
                    setFormCliente({
                      nome: "",
                      telefone: "",
                      email: "",
                      veiculo: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          <div className="cadastro-lista">
            <h2>Clientes cadastrados</h2>
            {clientes.length ? (
              clientes.map((cliente) => (
                <article className="cadastro-registro" key={cliente.id}>
                  <div>
                    <h3>{cliente.nome}</h3>
                    <p>
                      {[cliente.telefone, cliente.email, cliente.veiculo]
                        .filter(Boolean)
                        .join(" · ") || "Sem dados adicionais"}
                    </p>
                  </div>
                  <div className="cadastro-acoes">
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => {
                        setClienteEditando(cliente.id);
                        setFormCliente({
                          nome: cliente.nome || "",
                          telefone: cliente.telefone || "",
                          email: cliente.email || "",
                          veiculo: cliente.veiculo || "",
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="perigo"
                      onClick={() =>
                        setClientes((lista) =>
                          lista.filter((item) => item.id !== cliente.id),
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="cadastro-vazio">
                Ainda não há clientes cadastrados.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <form className="cadastro-formulario" onSubmit={salvarItem}>
            <h2>
              {itemEditando
                ? "Editar serviço ou peça"
                : "Cadastrar serviço ou peça"}
            </h2>
            <label>
              Tipo
              <select
                value={formItem.tipo}
                onChange={(e) =>
                  setFormItem({ ...formItem, tipo: e.target.value })
                }
              >
                <option value="servico">Serviço</option>
                <option value="peca">Peça</option>
              </select>
            </label>
            <label>
              Nome
              <input
                required
                value={formItem.nome}
                onChange={(e) =>
                  setFormItem({ ...formItem, nome: e.target.value })
                }
                placeholder={
                  formItem.tipo === "servico"
                    ? "Ex.: Revisão de segurança"
                    : "Ex.: Manete acelerador"
                }
              />
            </label>
            <label>
              Categoria / aplicação
              <input
                value={formItem.categoria}
                onChange={(e) =>
                  setFormItem({ ...formItem, categoria: e.target.value })
                }
                placeholder="Ex.: bicicleta elétrica"
              />
            </label>
            <label>
              Preço de referência (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={formItem.preco}
                onChange={(e) =>
                  setFormItem({ ...formItem, preco: e.target.value })
                }
                placeholder="0,00"
              />
            </label>
            <div className="cadastro-acoes">
              <button type="submit">
                {itemEditando ? "Salvar alterações" : "Adicionar ao catálogo"}
              </button>
              {itemEditando && (
                <button
                  type="button"
                  className="secundario"
                  onClick={() => {
                    setItemEditando("");
                    setFormItem({
                      nome: "",
                      tipo: "servico",
                      categoria: "",
                      preco: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          <div className="cadastro-lista">
            <h2>Catálogo cadastrado</h2>
            {itens.length ? (
              itens.map((item) => (
                <article className="cadastro-registro" key={item.id}>
                  <div>
                    <span className="cadastro-tipo">
                      {item.tipo === "peca" ? "PEÇA" : "SERVIÇO"}
                    </span>
                    <h3>{item.nome}</h3>
                    <p>
                      {item.categoria || "Sem categoria"} · {moeda(item.preco)}
                    </p>
                  </div>
                  <div className="cadastro-acoes">
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => {
                        setItemEditando(item.id);
                        setFormItem({
                          nome: item.nome || "",
                          tipo: item.tipo || "servico",
                          categoria: item.categoria || "",
                          preco: String(item.preco ?? ""),
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="perigo"
                      onClick={() =>
                        setItens((lista) =>
                          lista.filter((registro) => registro.id !== item.id),
                        )
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="cadastro-vazio">
                Adicione os serviços e as peças usados pela oficina.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default CadastrosOficina;
