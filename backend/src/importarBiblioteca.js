async function importarBiblioteca(cliente, artigos) {
  let inseridos = 0;
  for (const artigo of artigos) {
    const resultado = await cliente.query(`
      INSERT INTO biblioteca_artigos
        (id, titulo, resumo, categoria, nivel, fabricante, atualizado_em,
         status, ordem, tema, secoes, fontes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb)
      ON CONFLICT (id) DO NOTHING
    `, [artigo.id, artigo.titulo, artigo.resumo, artigo.categoria, artigo.nivel,
      artigo.fabricante, artigo.atualizadoEm, artigo.status, artigo.ordem,
      artigo.tema, JSON.stringify(artigo.secoes), JSON.stringify(artigo.fontes)]);
    inseridos += resultado.rowCount;
  }
  return inseridos;
}

module.exports = importarBiblioteca;
