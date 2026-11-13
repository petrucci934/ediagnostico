import {
  CircleHelp,
  AlertTriangle,
  ShieldAlert,
  Info,
  Gauge,
} from "lucide-react";
import { obterGravidade } from "./gravidadeDiagnostico.js";

export default function SeloGravidade({ linhas }) {
  const nivel = obterGravidade(linhas);
  const referencia = linhas?.some(
    (item) => item.severity_origin === "external_reference",
  );
  const Icone = ["unknown", "mixed"].includes(nivel.chave)
    ? CircleHelp
    : nivel.chave === "critical"
      ? ShieldAlert
      : ["high", "warning"].includes(nivel.chave)
        ? AlertTriangle
        : nivel.chave === "medium"
          ? Gauge
          : Info;
  return (
    <span
      className={`dg-gravidade dg-gravidade--${nivel.classe}`}
      title={`${referencia ? "Classificação de referência; validação por modelo pendente. " : ""}${nivel.descricao}`}
    >
      <Icone size={16} strokeWidth={1.8} aria-hidden="true" />
      <span>
        <span className="dg-gravidade-prefixo">GRAVIDADE</span>
        <strong>{nivel.rotulo}</strong>
      </span>
    </span>
  );
}
