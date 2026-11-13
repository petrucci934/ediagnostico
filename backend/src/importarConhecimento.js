async function importarConhecimento(cliente, trilhas) {
  const inseridos = { trilhas: 0, modulos: 0, aulas: 0 };
  for (const trilha of trilhas) {
    const t = await cliente.query(`
      INSERT INTO conhecimento_trilhas (id, titulo, ordem, etapa, descricao, requisito)
      VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING
    `, [trilha.id, trilha.titulo, trilha.ordem, trilha.etapa, trilha.descricao, trilha.requisito]);
    inseridos.trilhas += t.rowCount;
    for (const modulo of trilha.modulos) {
      const m = await cliente.query(`
        INSERT INTO conhecimento_modulos (id, trilha_id, titulo, ordem, descricao)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING
      `, [modulo.id, trilha.id, modulo.titulo, modulo.ordem, modulo.descricao]);
      inseridos.modulos += m.rowCount;
      for (const aula of modulo.aulas) {
        const a = await cliente.query(`
          INSERT INTO conhecimento_aulas
            (id, modulo_id, titulo, ordem, resumo, nivel, status, atualizado_em, secoes, fontes)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb)
          ON CONFLICT (id) DO NOTHING
        `, [aula.id, modulo.id, aula.titulo, aula.ordem, aula.resumo, aula.nivel,
          aula.status, aula.atualizadoEm, JSON.stringify(aula.secoes), JSON.stringify(aula.fontes)]);
        inseridos.aulas += a.rowCount;
      }
    }
  }
  return inseridos;
}
module.exports = importarConhecimento;
