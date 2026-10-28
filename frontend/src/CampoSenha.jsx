import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function CampoSenha({
  id,
  value,
  onChange,
  autoComplete,
  minLength,
  required,
  placeholder,
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <span className="campo-senha">
      <input
        id={id}
        type={visivel ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="botao-ver-senha"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        onClick={() => setVisivel((estado) => !estado)}
      >
        {visivel ? (
          <EyeOff size={19} aria-hidden="true" />
        ) : (
          <Eye size={19} aria-hidden="true" />
        )}
      </button>
    </span>
  );
}

export default CampoSenha;
