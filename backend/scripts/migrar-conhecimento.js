require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const importarConhecimento = require('../src/importarConhecimento');
const { trilhas } = require('../data/trilhas-conhecimento.json');
const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 10000,
});
async function main() {
  const cliente = await db.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query(fs.readFileSync(path.join(__dirname, '../migrations/20261108_trilhas_conhecimento.sql'), 'utf8'));
    const inseridos = await importarConhecimento(cliente, trilhas);
    const ids = trilhas.flatMap((t) => t.modulos.flatMap((m) => m.aulas.map((a) => a.id)));
    const conferidos = await cliente.query('SELECT id FROM conhecimento_aulas WHERE id = ANY($1::text[])', [ids]);
    if (conferidos.rowCount !== ids.length) throw new Error('Importação incompleta das aulas.');
    await cliente.query('COMMIT');
    console.log(`Conhecimento: ${inseridos.trilhas} trilhas, ${inseridos.modulos} módulos e ${inseridos.aulas} aulas inseridas; ${conferidos.rowCount} aulas conferidas. Registros existentes preservados.`);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally { cliente.release(); }
}
main().catch((erro) => {
  console.error('Falha ao cadastrar conhecimento:', erro.message);
  process.exitCode = 1;
}).finally(() => db.end());
