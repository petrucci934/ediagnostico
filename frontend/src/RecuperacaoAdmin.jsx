import { useState } from "react";

export default function RecuperacaoAdmin() {
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  async function solicitar() {
    if (enviando) return;
    setEnviando(true);
    setErro("");
    setMensagem("");
    try {
      const resposta = await fetch("/api/auth/admin/recuperacao-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(
          dados.erro || "Não foi possível solicitar a recuperação.",
        );
      setMensagem(dados.mensagem);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  }
  return (
    <div className="recuperacao-admin">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        Esqueci minha senha
      </button>
      {aberto && (
        <div>
          <label htmlFor="email-recuperacao-admin">
            E-mail cadastrado do administrador
          </label>
          <input
            id="email-recuperacao-admin"
            type="text"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                solicitar();
              }
            }}
          />
          <button
            type="button"
            disabled={enviando || !email.trim()}
            onClick={solicitar}
          >
            {enviando ? "Solicitando..." : "Enviar link de recuperação"}
          </button>
          {mensagem && <p role="status">{mensagem}</p>}
          {erro && <p role="alert">{erro}</p>}
        </div>
      )}
    </div>
  );
}
