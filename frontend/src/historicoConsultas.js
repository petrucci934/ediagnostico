import { normalizarFabricanteCatalogo } from "./catalogoDiagnosticos.js";

export function validarHistorico(valor) {
  return Array.isArray(valor)
    ? valor.filter(
        (item) =>
          item &&
          typeof item.codigo === "string" &&
          typeof item.fabricante === "string",
      )
    : [];
}

export function atualizarHistorico(historico, consulta, data = new Date()) {
  const item = {
    codigo: consulta.codigo,
    fabricante: consulta.fabricante || "Todos os fabricantes",
    modelo: consulta.modelo || "",
    fabricanteId: String(consulta.fabricanteId || ""),
    modeloId: String(consulta.modeloId || ""),
    referenciaId: consulta.referenciaId || "",
    origem: consulta.referenciaId ? "catalogo" : "api",
    data: data.toLocaleString("pt-BR"),
  };
  const chave = (entrada) =>
    JSON.stringify([
      entrada.codigo.toUpperCase(),
      normalizarFabricanteCatalogo(entrada.fabricante),
      entrada.modelo || "",
      entrada.referenciaId || "",
    ]);
  return [
    item,
    ...validarHistorico(historico).filter(
      (anterior) => chave(anterior) !== chave(item),
    ),
  ].slice(0, 2);
}

export function restaurarFiltrosHistorico(item, fabricantes, modelos) {
  const fabricante = fabricantes.find((f) =>
    item.fabricanteId
      ? String(f.id) === String(item.fabricanteId)
      : normalizarFabricanteCatalogo(f.name) ===
        normalizarFabricanteCatalogo(item.fabricante),
  );
  const modelo =
    fabricante &&
    modelos.find(
      (m) =>
        String(m.manufacturer_id) === String(fabricante.id) &&
        (item.modeloId
          ? String(m.id) === String(item.modeloId)
          : m.model_name === item.modelo),
    );
  return {
    fabricanteId: fabricante ? String(fabricante.id) : "",
    modeloId: modelo ? String(modelo.id) : "",
  };
}
