import { useCallback, useEffect, useState } from "react";
import CampoSenha from "./CampoSenha";

const clienteVazio = { nome: "", telefone: "", email: "", veiculo: "" };
const mecanicoVazio = { nome: "", email: "", senha: "", ativo: true };
const contatoWhatsAppVazio = { nome: "", telefone: "" };

function Administrador({ token }) {
  const [aba, setAba] = useState("mecanicos");
  const [mecanicos, setMecanicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contatosWhatsApp, setContatosWhatsApp] = useState([]);
  const [formWhatsApp, setFormWhatsApp] = useState(contatoWhatsAppVazio);
  const [formMecanico, setFormMecanico] = useState(mecanicoVazio);
  const [formCliente, setFormCliente] = useState(clienteVazio);
  const [mecanicoEditando, setMecanicoEditando] = useState(null);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const requisicao = useCallback(
    async (url, options = {}) => {
      const resposta = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      });
      if (resposta.status === 204) return null;
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível concluir a operação.");
      return dados;
    },
    [token],
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [dadosMecanicos, dadosClientes, dadosWhatsApp] = await Promise.all([
        requisicao("/api/admin/mecanicos"),
        requisicao("/api/admin/clientes"),
        requisicao("/api/admin/whatsapp-contatos"),
      ]);

      setMecanicos(dadosMecanicos.mecanicos || []);
      setClientes(dadosClientes.clientes || []);
      setContatosWhatsApp(dadosWhatsApp.contatos || []);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }, [requisicao]);

  useEffect(() => {
    // Busca os registros iniciais ao abrir a área administrativa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function salvarMecanico(evento) {
    evento.preventDefault();
    setErro("");
    try {
      const metodo = mecanicoEditando ? "PUT" : "POST";
      const url = mecanicoEditando
        ? `/api/admin/mecanicos/${mecanicoEditando.id}`
        : "/api/admin/mecanicos";
      await requisicao(url, {
        method: metodo,
        body: JSON.stringify(formMecanico),
      });
      setFormMecanico(mecanicoVazio);
      setMecanicoEditando(null);
      await carregar();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function salvarCliente(evento) {
    evento.preventDefault();
    setErro("");
    try {
      const metodo = clienteEditando ? "PUT" : "POST";
      const url = clienteEditando
        ? `/api/admin/clientes/${clienteEditando.id}`
        : "/api/admin/clientes";
      await requisicao(url, {
        method: metodo,
        body: JSON.stringify(formCliente),
      });
      setFormCliente(clienteVazio);
      setClienteEditando(null);
      await carregar();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function salvarContatoWhatsApp(evento) {
    evento.preventDefault();
    setErro("");

    try {
      await requisicao("/api/admin/whatsapp-contatos", {
        method: "POST",
        body: JSON.stringify(formWhatsApp),
      });

      setFormWhatsApp(contatoWhatsAppVazio);
      await carregar();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function alternarAtivo(mecanico) {
    setErro("");
    try {
      await requisicao(`/api/admin/mecanicos/${mecanico.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: mecanico.nome,
          email: mecanico.email,
          ativo: !mecanico.ativo,
          senha: "",
        }),
      });
      await carregar();
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function excluirCliente(cliente) {
    if (!window.confirm(`Excluir o cadastro de ${cliente.nome}?`)) return;
    setErro("");
    try {
      await requisicao(`/api/admin/clientes/${cliente.id}`, {
        method: "DELETE",
      });
      setClientes((lista) => lista.filter((item) => item.id !== cliente.id));
    } catch (falha) {
      setErro(falha.message);
    }
  }
  async function excluirContatoWhatsApp(contato) {
    if (
      !window.confirm(`Deseja excluir o contato de WhatsApp ${contato.nome}?`)
    ) {
      return;
    }

    setErro("");

    try {
      await requisicao(`/api/admin/whatsapp-contatos/${contato.id}`, {
        method: "DELETE",
      });

      setContatosWhatsApp((lista) =>
        lista.filter((item) => item.id !== contato.id),
      );
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <section className="principal cadastros-oficina admin-oficina">
      <span className="etiqueta">ADMINISTRAÇÃO</span>
      <h1>Gerenciar cadastros</h1>
      <p>Administre as contas dos mecânicos e os cadastros de clientes.</p>
      <div
        className="cadastros-abas"
        role="tablist"
        aria-label="Cadastros administrativos"
      >
        <button
          type="button"
          role="tab"
          aria-selected={aba === "mecanicos"}
          className={aba === "mecanicos" ? "ativa" : ""}
          onClick={() => setAba("mecanicos")}
        >
          Mecânicos ({mecanicos.length})
        </button>
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
          aria-selected={aba === "whatsapp"}
          className={aba === "whatsapp" ? "ativa" : ""}
          onClick={() => setAba("whatsapp")}
        >
          WhatsApp ({contatosWhatsApp.length})
        </button>
      </div>
      {erro && (
        <p className="admin-erro" role="alert">
          {erro}
        </p>
      )}
      {carregando && <p role="status">Carregando cadastros…</p>}

      {aba === "mecanicos" ? (
        <>
          <form className="cadastro-formulario" onSubmit={salvarMecanico}>
            <h2>
              {mecanicoEditando ? "Editar mecânico" : "Cadastrar mecânico"}
            </h2>
            <label>
              Nome
              <input
                required
                value={formMecanico.nome}
                onChange={(e) =>
                  setFormMecanico({ ...formMecanico, nome: e.target.value })
                }
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                required
                value={formMecanico.email}
                onChange={(e) =>
                  setFormMecanico({ ...formMecanico, email: e.target.value })
                }
              />
            </label>
            <div className="cadastro-campo-senha">
              <label htmlFor="senha-mecanico">
                {mecanicoEditando ? "Nova senha (opcional)" : "Senha inicial"}
              </label>
              <CampoSenha
                id="senha-mecanico"
                required={!mecanicoEditando}
                minLength={8}
                autoComplete="new-password"
                value={formMecanico.senha}
                onChange={(e) =>
                  setFormMecanico({ ...formMecanico, senha: e.target.value })
                }
                placeholder={
                  mecanicoEditando
                    ? "Deixe vazio para manter a senha"
                    : "Mínimo de 8 caracteres"
                }
              />
            </div>
            {mecanicoEditando && (
              <label className="admin-status">
                <input
                  type="checkbox"
                  checked={formMecanico.ativo}
                  onChange={(e) =>
                    setFormMecanico({
                      ...formMecanico,
                      ativo: e.target.checked,
                    })
                  }
                />{" "}
                Conta ativa
              </label>
            )}
            <div className="cadastro-acoes">
              <button type="submit">
                {mecanicoEditando ? "Salvar alterações" : "Criar conta"}
              </button>
              {mecanicoEditando && (
                <button
                  type="button"
                  className="secundario"
                  onClick={() => {
                    setMecanicoEditando(null);
                    setFormMecanico(mecanicoVazio);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
          <div className="cadastro-lista">
            <h2>Contas de mecânicos</h2>
            {mecanicos.length ? (
              mecanicos.map((mecanico) => (
                <article className="cadastro-registro" key={mecanico.id}>
                  <div>
                    <h3>{mecanico.nome}</h3>
                    <p>
                      {mecanico.email} ·{" "}
                      {mecanico.ativo ? "Ativo" : "Desativado"}
                    </p>
                  </div>
                  <div className="cadastro-acoes">
                    <button
                      type="button"
                      className="secundario"
                      onClick={() => {
                        setMecanicoEditando(mecanico);
                        setFormMecanico({
                          nome: mecanico.nome,
                          email: mecanico.email,
                          senha: "",
                          ativo: mecanico.ativo,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={mecanico.ativo ? "perigo" : "secundario"}
                      onClick={() => alternarAtivo(mecanico)}
                    >
                      {mecanico.ativo ? "Desativar" : "Reativar"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="cadastro-vazio">
                Nenhuma conta de mecânico cadastrada.
              </p>
            )}
          </div>
        </>
      ) : aba === "clientes" ? (
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
              />
            </label>
            <label>
              Veículo principal
              <input
                value={formCliente.veiculo}
                onChange={(e) =>
                  setFormCliente({ ...formCliente, veiculo: e.target.value })
                }
                placeholder="Marca e modelo"
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
                    setClienteEditando(null);
                    setFormCliente(clienteVazio);
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
                        setClienteEditando(cliente);
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
                      onClick={() => excluirCliente(cliente)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="cadastro-vazio">Nenhum cliente cadastrado.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <form
            className="cadastro-formulario"
            onSubmit={salvarContatoWhatsApp}
          >
            <h2>Cadastrar contato de WhatsApp</h2>

            <label>
              Nome
              <input
                required
                maxLength={100}
                value={formWhatsApp.nome}
                onChange={(e) =>
                  setFormWhatsApp({
                    ...formWhatsApp,
                    nome: e.target.value,
                  })
                }
                placeholder="Nome do contato"
              />
            </label>

            <label>
              Telefone com DDD
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={20}
                value={formWhatsApp.telefone}
                onChange={(e) =>
                  setFormWhatsApp({
                    ...formWhatsApp,
                    telefone: e.target.value,
                  })
                }
                placeholder="(11) 99999-9999"
              />
            </label>

            <div className="cadastro-acoes">
              <button type="submit">Adicionar contato</button>
            </div>
          </form>

          <div className="cadastro-lista">
            <h2>Contatos de WhatsApp</h2>

            {contatosWhatsApp.length ? (
              contatosWhatsApp.map((contato) => (
                <article className="cadastro-registro" key={contato.id}>
                  <div>
                    <h3>{contato.nome}</h3>
                    <p>{contato.telefone}</p>
                  </div>

                  <div className="cadastro-acoes">
                    <button
                      type="button"
                      className="perigo"
                      onClick={() => excluirContatoWhatsApp(contato)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="cadastro-vazio">
                Nenhum contato de WhatsApp cadastrado.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Administrador;
