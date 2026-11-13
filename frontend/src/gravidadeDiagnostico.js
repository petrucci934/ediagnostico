export const niveisGravidade = {
  low: {
    rotulo: "Baixa",
    classe: "baixa",
    descricao:
      "Nível baixo registrado na base. Confirme as orientações específicas do modelo.",
  },
  medium: {
    rotulo: "Média",
    classe: "media",
    descricao:
      "Nível intermediário registrado na base; requer avaliação da falha.",
  },
  high: {
    rotulo: "Alta",
    classe: "alta",
    descricao:
      "Nível alto registrado na base; consulte os cuidados e o procedimento técnico.",
  },
  critical: {
    rotulo: "Crítica",
    classe: "critica",
    descricao:
      "Nível crítico registrado na base; confira a orientação técnica antes de qualquer intervenção.",
  },
  warning: {
    rotulo: "Atenção",
    classe: "atencao",
    descricao:
      "Aviso registrado na base, sem equivalência automática com uma escala de gravidade.",
  },
  unknown: {
    rotulo: "Não classificada",
    classe: "pendente",
    descricao:
      "A gravidade ainda não foi classificada. Isso não significa risco baixo.",
  },
  mixed: {
    rotulo: "Confirmar seleção",
    classe: "pendente",
    descricao:
      "Os registros encontrados têm classificações diferentes. Confirme fabricante, modelo e componente.",
  },
};

export function obterGravidade(linhas = []) {
  const niveis = [
    ...new Set(
      linhas.map((item) => {
        const valor = String(item.severity || "unknown")
          .trim()
          .toLowerCase();
        return Object.hasOwn(niveisGravidade, valor) && valor !== "mixed"
          ? valor
          : "unknown";
      }),
    ),
  ];
  const chave = niveis.length > 1 ? "mixed" : niveis[0] || "unknown";
  return { ...niveisGravidade[chave], chave };
}
