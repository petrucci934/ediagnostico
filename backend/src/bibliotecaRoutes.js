function registrarRotasBiblioteca({ app, db, autenticarToken, exigirEditor }) {
  app.get('/api/biblioteca/artigos', autenticarToken, exigirEditor, async (_req, res) => {
    try {
      const resultado = await db.query(`
        SELECT id, titulo, resumo, categoria, nivel, fabricante,
               to_char(atualizado_em, 'YYYY-MM-DD') AS "atualizadoEm",
               status, ordem, tema, secoes, fontes
        FROM biblioteca_artigos ORDER BY categoria, ordem, id
      `);
      res.json({ artigos: resultado.rows });
    } catch (erro) {
      console.error('Erro ao consultar biblioteca:', erro.message);
      res.status(500).json({ erro: 'Não foi possível carregar a biblioteca técnica.' });
    }
  });
}

module.exports = registrarRotasBiblioteca;
