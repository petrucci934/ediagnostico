import { catalogoDiagnosticos } from "./catalogoDiagnosticos.js";
// Referência de leitura para a branch de avaliação; não altera cadastros.
// Resumo próprio do manual oficial UM-79E0B-000, série E7000, pág. impressa 50.
const e010 = {
  aplicabilidade:
    "Referência da série E7000. Confirme a unidade e o manual do seu veículo; a seleção atual não comprova compatibilidade.",
  sintomas:
    "No sistema E7000, a assistência elétrica fica indisponível enquanto o E010 é exibido.",
  causas:
    "O manual identifica um erro de sistema, mas não determina a peça responsável. Não há uma lista de causas específicas nessa entrada.",
  verificacoes: [
    "Conferir o código completo e identificar o sistema antes de aplicar esta orientação.",
    "Para o E7000, o manual orienta acionar novamente a alimentação pelo botão da bateria. Se não houver melhora, consultar o distribuidor.",
  ],
  observacao:
    "Triagem do E-Diagnóstico: anote se o código permanece após a ação prevista no manual. O desaparecimento do aviso não comprova reparo definitivo.",
  proximoPasso:
    "Se o erro continuar, encaminhe para assistência. Essa entrada não fornece pinagem, tensões ou testes internos de componentes.",
  fonte: "SHIMANO · Manual E7000 · UM-79E0B-000 · pág. 50",
  url: "https://si.shimano.com/en/pdfs/um/79E0B/UM-79E0B-000-ENG.pdf#page=51",
};

export function obterRoteiroDiagnostico(resultado) {
  if (resultado?.referenciaCatalogo) {
    const item = catalogoDiagnosticos.find(
      (ref) =>
        ref.id === resultado.referenciaCatalogo &&
        ref.codigo === resultado.codigo &&
        resultado.resultados?.every(
          (linha) => linha.manufacturer === ref.fabricante,
        ),
    );
    return item?.roteiro || null;
  }
  const fabricantes = [
    ...new Set(
      (resultado?.resultados || []).map((item) =>
        item.manufacturer?.trim().toUpperCase(),
      ),
    ),
  ];
  if (fabricantes.length !== 1 || fabricantes[0] !== "SHIMANO") return null;
  return /^E0*10$/i.test(resultado?.codigo || "") ? e010 : null;
}
