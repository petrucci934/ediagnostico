function registrarRotasConhecimento({ app, db, autenticarToken, exigirEditor }) {
  app.get('/api/conhecimento/trilhas', autenticarToken, exigirEditor, async (_req, res) => {
    try {
      const resultado = await db.query(`
        SELECT t.id, t.titulo, t.ordem, t.etapa, t.descricao, t.requisito,
          COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'id', m.id, 'titulo', m.titulo, 'ordem', m.ordem, 'descricao', m.descricao,
            'aulas', COALESCE((SELECT jsonb_agg(jsonb_build_object(
              'id', a.id, 'titulo', a.titulo, 'ordem', a.ordem,
              'resumo', a.resumo, 'nivel', a.nivel, 'status', a.status
            ) ORDER BY a.ordem, a.id) FROM conhecimento_aulas a WHERE a.modulo_id = m.id), '[]'::jsonb)
          ) ORDER BY m.ordem, m.id) FROM conhecimento_modulos m WHERE m.trilha_id = t.id), '[]'::jsonb) AS modulos
        FROM conhecimento_trilhas t ORDER BY t.ordem, t.id
      `);
      res.json({ trilhas: resultado.rows });
    } catch (erro) {
      console.error('Erro ao consultar trilhas:', erro.message);
      res.status(500).json({ erro: 'Não foi possível carregar as trilhas do conhecimento.' });
    }
  });
  app.get('/api/conhecimento/aulas/:id', autenticarToken, exigirEditor, async (req, res) => {
    try {
      const resultado = await db.query(`
        SELECT a.id, a.modulo_id AS "moduloId", m.trilha_id AS "trilhaId",
          a.titulo, a.ordem, a.resumo, a.nivel, a.status,
          to_char(a.atualizado_em, 'YYYY-MM-DD') AS "atualizadoEm", a.secoes, a.fontes
        FROM conhecimento_aulas a JOIN conhecimento_modulos m ON m.id = a.modulo_id
        WHERE a.id = $1
      `, [req.params.id]);
      if (!resultado.rows.length) return res.status(404).json({ erro: 'Aula não encontrada.' });
      res.json({ aula: resultado.rows[0] });
    } catch (erro) {
      console.error('Erro ao consultar aula:', erro.message);
      res.status(500).json({ erro: 'Não foi possível carregar esta aula.' });
    }
  });
}
module.exports = registrarRotasConhecimento;
