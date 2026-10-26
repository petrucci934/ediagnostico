const readline = require("readline");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const { stdin, stdout } = process;
const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function lerSenhaOculta() {
  return new Promise((resolve) => {
    stdout.write("Nova senha do revisor (mínimo 12 caracteres): ");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let senha = "";

    function aoDigitar(tecla) {
      if (tecla === "\u0003") {
        stdout.write("\nCancelado.\n");
        stdin.setRawMode(false);
        stdin.pause();
        process.exit(1);
      }

      if (tecla === "\r" || tecla === "\n") {
        stdout.write("\n");
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", aoDigitar);
        resolve(senha);
      } else if (tecla === "\u007f" || tecla === "\b") {
        senha = senha.slice(0, -1);
      } else if (tecla >= " ") {
        senha += tecla;
      }
    }

    stdin.on("data", aoDigitar);
  });
}

async function main() {
  try {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      throw new Error("Execute diretamente no terminal do Ubuntu.");
    }

    const senha = await lerSenhaOculta();

    if (senha.length < 12) {
      console.log("Senha muito curta. Nenhuma alteração feita.");
      return;
    }

    const hash = await bcrypt.hash(senha, 12);

    const resultado = await db.query(
      `UPDATE usuarios
       SET senha_hash = $1
       WHERE id = 1 AND perfil = 'revisor'
       RETURNING id, email, perfil`,
      [hash]
    );

    if (resultado.rowCount === 0) {
      console.log("Revisor não encontrado. Nenhuma alteração feita.");
    } else {
      console.log("Senha redefinida com sucesso para:", resultado.rows[0].email);
    }
  } catch (erro) {
    console.error("Erro:", erro.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
