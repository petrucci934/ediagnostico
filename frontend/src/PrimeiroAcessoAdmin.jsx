import { useState } from "react";
import CampoSenha from "./CampoSenha";

function PrimeiroAcessoAdmin({ token, onFinalizado }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setSalvando(true);
    try {
      const resposta = await fetch("/api/auth/credenciais", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usuario, senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(
          dados.erro || "Não foi possível atualizar as credenciais.",
        );
      onFinalizado(dados.usuario);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="principal primeiro-acesso-admin">
      <span className="etiqueta">PRIMEIRO ACESSO</span>
      <h1>Proteja sua conta</h1>
      <p>
        Defina um usuário e uma senha pessoais para continuar para a área do
        administrador.
      </p>
      <form className="formulario" onSubmit={salvar}>
        <label htmlFor="novo-usuario-admin">Novo usuário</label>
        <input
          id="novo-usuario-admin"
          autoComplete="username"
          minLength={3}
          maxLength={80}
          pattern="[A-Za-z0-9._-]+"
          required
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Ex.: petrucci"
        />
        <small>
          Use de 3 a 80 letras, números, ponto, hífen ou sublinhado.
        </small>
        <label htmlFor="nova-senha-admin">Nova senha</label>
        <CampoSenha
          id="nova-senha-admin"
          autoComplete="new-password"
          minLength={12}
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo de 12 caracteres"
        />
        <label htmlFor="confirmar-senha-admin">Confirme a nova senha</label>
        <CampoSenha
          id="confirmar-senha-admin"
          autoComplete="new-password"
          minLength={12}
          required
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder="Digite a senha novamente"
        />
        {erro && (
          <p role="alert" className="admin-erro">
            {erro}
          </p>
        )}
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar e continuar"}
        </button>
      </form>
    </section>
  );
}

export default PrimeiroAcessoAdmin;
