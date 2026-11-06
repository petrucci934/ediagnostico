require('dotenv').config({ quiet: true });
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const db = new Pool({host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD});
const raiz = path.resolve(__dirname, '../../frontend/public');
async function arquivos(pasta) {
  const lista = [];
  for (const item of await fs.readdir(pasta, { withFileTypes: true })) {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) lista.push(...await arquivos(caminho));
    else if (item.isFile() && /\.(mp4|pdf)$/i.test(item.name)) lista.push(caminho);
  }
  return lista;
}
async function main() {
  const cliente = await db.connect();
  try {
    await cliente.query('BEGIN');
    const tabela = await cliente.query("SELECT to_regclass('public.biblioteca_arquivos') AS nome");
    if (!tabela.rows[0].nome) {
      await cliente.query(await fs.readFile(path.join(__dirname, '../migrations/20261103_biblioteca_arquivos.sql'), 'utf8'));
    }
    let total = 0;
    for (const pasta of ['videos', 'images']) {
      for (const arquivo of await arquivos(path.join(raiz, pasta))) {
        const video = /\.mp4$/i.test(arquivo);
        await cliente.query(`INSERT INTO biblioteca_arquivos (titulo,tipo,caminho,mime_type,tamanho_bytes,categoria)
          VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (caminho) DO NOTHING`,
          [path.basename(arquivo), video ? 'video' : 'pdf', '/' + path.relative(raiz, arquivo).split(path.sep).join('/'),
            video ? 'video/mp4' : 'application/pdf', (await fs.stat(arquivo)).size, video ? 'Videoaulas' : 'Manuais']);
        total++;
      }
    }
    await cliente.query('COMMIT');
    console.log(`${total} materiais conferidos no cadastro. Arquivos e registros existentes preservados.`);
  } catch (erro) { await cliente.query('ROLLBACK'); throw erro; }
  finally { cliente.release(); }
}
main().catch(erro => { console.error(erro.message); process.exitCode = 1; }).finally(() => db.end());
