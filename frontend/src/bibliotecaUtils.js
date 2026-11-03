export function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function filtrarArtigos(
  artigos,
  {
    busca = "",
    categoria = "",
    nivel = "",
    fabricante = "",
    ordem = "trilha",
  } = {},
) {
  const termos = normalizarTexto(busca).trim().split(/\s+/).filter(Boolean);
  return artigos
    .filter((artigo) => {
      if (categoria && artigo.categoria !== categoria) return false;
      if (nivel && artigo.nivel !== nivel) return false;
      if (fabricante && artigo.fabricante !== fabricante) return false;
      const texto = normalizarTexto(
        [
          artigo.titulo,
          artigo.resumo,
          artigo.categoria,
          artigo.tema,
          ...artigo.secoes.flatMap((secao) => [
            secao.titulo,
            ...secao.blocos.flatMap((bloco) => bloco.itens ?? [bloco.texto]),
          ]),
        ].join(" "),
      );
      return termos.every((termo) => texto.includes(termo));
    })
    .sort((a, b) => {
      if (ordem === "trilha") {
        return (
          a.categoria.localeCompare(b.categoria, "pt-BR") ||
          (a.ordem ?? Number.MAX_SAFE_INTEGER) -
            (b.ordem ?? Number.MAX_SAFE_INTEGER) ||
          a.titulo.localeCompare(b.titulo, "pt-BR")
        );
      }
      if (ordem === "titulo") return a.titulo.localeCompare(b.titulo, "pt-BR");
      return (
        b.atualizadoEm.localeCompare(a.atualizadoEm) ||
        a.titulo.localeCompare(b.titulo, "pt-BR")
      );
    });
}
