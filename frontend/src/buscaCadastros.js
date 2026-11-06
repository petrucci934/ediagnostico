function normalizarNome(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

export function filtrarPorInicioNome(registros, busca) {
  const inicio = normalizarNome(busca);
  return registros.filter((registro) =>
    normalizarNome(registro.nome).startsWith(inicio),
  );
}
