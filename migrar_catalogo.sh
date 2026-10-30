#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/ediagnostico/backend"

cat > catalogo-antigo.json <<'JSON'
[
  {"id":"ca1b6c8e-434b-4e85-9438-27e3e396e1e6","nome":"Troca de Bateria","tipo":"servico","categoria":"Serviço","preco":450},
  {"id":"6d7557bc-9881-4eab-be20-fd058b791eaf","nome":"Troca de Rolamento Traseiro","tipo":"servico","categoria":"Serviços","preco":90},
  {"id":"26986221-5b19-42b5-8d51-4eea48a184df","nome":"Manete Acelerador","tipo":"peca","categoria":"Peças","preco":130},
  {"id":"5ffc6a5b-df67-4581-9813-d5d461da28eb","nome":"Mosfet e87766","tipo":"peca","categoria":"Eletrônica","preco":270},
  {"id":"98337264-0f14-410e-ac0d-1725262daf82","nome":"Connserto em controladora","tipo":"servico","categoria":"Eletrônica","preco":450}
]
JSON

cat > scripts/importar-catalogo.js <<'JS'
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
JS

chmod +x migrar_catalogo.sh
node scripts/importar-catalogo.js
