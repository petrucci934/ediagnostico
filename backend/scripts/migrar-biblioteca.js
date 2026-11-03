require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const importarBiblioteca = require('../src/importarBiblioteca');
const artigos = require('../data/artigos-biblioteca.json');

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  const cliente = await db.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query(fs.readFileSync(path.join(__dirname,
      '../migrations/20261103_biblioteca_tecnica.sql'), 'utf8'));
    const inseridos = await importarBiblioteca(cliente, artigos);
    const resultado = await cliente.query(
      'SELECT id FROM biblioteca_artigos WHERE id = ANY($1::text[])',
      [artigos.map((artigo) => artigo.id)],
    );
    if (resultado.rowCount !== artigos.length) throw new Error('Importação incompleta.');
    await cliente.query('COMMIT');
    console.log(`Biblioteca migrada: ${inseridos} inseridos; ${resultado.rowCount} conteúdos conferidos. Registros existentes preservados.`);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}
main().catch((erro) => {
  console.error('Falha ao migrar biblioteca:', erro.message);
  process.exitCode = 1;
}).finally(() => db.end());
