require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function main() {
  try {
    await db.query(`
      ALTER TABLE usuarios
        ADD COLUMN IF NOT EXISTS usuario VARCHAR(80),
        ADD COLUMN IF NOT EXISTS deve_trocar_credenciais BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_usuario_lower
        ON usuarios (LOWER(usuario)) WHERE usuario IS NOT NULL
    `);

    const existente = await db.query(
      `SELECT id FROM usuarios
       WHERE perfil = 'admin' AND LOWER(usuario) = 'admin'
       LIMIT 1`,
    );
    if (existente.rowCount) {
      console.log("A conta inicial Admin já existe. Nenhuma alteração foi feita.");
      return;
    }

    const senhaHash = await bcrypt.hash("admin", 12);
    const criado = await db.query(
      `INSERT INTO usuarios
         (nome, email, usuario, senha_hash, perfil, deve_trocar_credenciais)
       VALUES ('Administrador', 'admin@ediagnostico.local', 'Admin', $1, 'admin', TRUE)
       RETURNING id`,
      [senhaHash],
    );
    console.log(`Conta inicial criada (ID ${criado.rows[0].id}).`);
    console.log("Acesso temporário: usuário Admin / senha admin.");
    console.log("A troca obrigatória de usuário e senha será solicitada no primeiro acesso.");
  } finally {
    await db.end();
  }
}

main().catch((erro) => {
  if (erro.code === "23505") {
    console.error("Não foi possível criar a conta inicial porque o usuário ou e-mail já está cadastrado.");
  } else {
    console.error("Erro ao preparar a conta inicial:", erro.message);
  }
  process.exitCode = 1;
});
