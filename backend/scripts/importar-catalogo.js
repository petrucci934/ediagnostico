const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function importar() {
  const itens = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../catalogo-antigo.json"), "utf8")
  );

  const conexao = await db.connect();

  try {
    await conexao.query("BEGIN");

    await conexao.query(`
      ALTER TABLE catalogo_oficina
      ADD COLUMN IF NOT EXISTS id_origem UUID
    `);

    await conexao.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS catalogo_oficina_id_origem_uidx
      ON catalogo_oficina (id_origem)
    `);

    let importados = 0;
    let ignorados = 0;

    for (const item of itens) {
      const resultado = await conexao.query(
        `INSERT INTO catalogo_oficina
          (id_origem, nome, tipo, categoria, preco)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_origem) DO NOTHING`,
        [item.id, item.nome, item.tipo, item.categoria || null, item.preco]
      );

      if (resultado.rowCount) importados++;
      else ignorados++;
    }

    await conexao.query("COMMIT");

    console.log("Importação concluída!");
    console.log("Novos itens:", importados);
    console.log("Já existentes:", ignorados);

    const total = await db.query(
      "SELECT COUNT(*)::int AS total FROM catalogo_oficina"
    );
    console.log("Total no catálogo:", total.rows[0].total);
  } catch (erro) {
    await conexao.query("ROLLBACK");
    throw erro;
  } finally {
    conexao.release();
  }
}

importar()
  .catch(erro => {
    console.error("Erro:", erro.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
