import { useState } from "react";
import CampoSenha from "./CampoSenha";

export default function RedefinirSenha() {
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get("token") || "",
  );
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const tokenValido = /^[a-f0-9]{64}$/.test(token);

  async function salvar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErro("");
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.erro || "Não foi possível redefinir a senha.");
      setMensagem(dados.mensagem);
      setSenha("");
      setConfirmacao("");
      window.history.replaceState(null, "", "/redefinir-senha");
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="principal">
      <h1>Redefinir senha</h1>
      {!tokenValido && (
        <p role="alert">
          Link inválido. Solicite um novo link ao administrador.
        </p>
      )}
      {erro && <p role="alert">{erro}</p>}
      {mensagem ? (
        <p role="status">{mensagem}</p>
      ) : (
        tokenValido && (
          <form onSubmit={salvar}>
            <label htmlFor="nova-senha">
              Nova senha (mínimo 12 caracteres)
            </label>
            <CampoSenha
              id="nova-senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={12}
              autoComplete="new-password"
              required
            />
            <label htmlFor="confirmar-senha">Confirme a nova senha</label>
            <CampoSenha
              id="confirmar-senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              minLength={12}
              autoComplete="new-password"
              required
            />
            <button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )
      )}
      <a href="/">Voltar ao início</a>
    </main>
  );
}
