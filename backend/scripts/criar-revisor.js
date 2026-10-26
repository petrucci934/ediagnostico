
require("dotenv").config();

const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
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
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    const nome = (await rl.question("Nome do revisor: ")).trim();
    const email = (await rl.question("E-mail do revisor: "))
      .trim()
      .toLowerCase();

    // O terminal não exibirá a senha digitada.
    const senha = await new Promise((resolve, reject) => {
      if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
        return reject(
          new Error("Execute o script diretamente em um terminal interativo.")
        );
      }

      stdout.write("Senha (mínimo 12 caracteres): ");
      let senhaDigitada = "";

      const restaurar = () => {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", receber);
      };

      const receber = (dados) => {
        for (const caractere of dados.toString("utf8")) {
          if (caractere === "\u0003") {
            restaurar();
            stdout.write("\n");
            reject(new Error("Operação cancelada."));
            return;
          }

          if (caractere === "\r" || caractere === "\n") {
            restaurar();
            stdout.write("\n");
            resolve(senhaDigitada);
            return;
          }

          if (caractere === "\u007f" || caractere === "\b") {
            senhaDigitada = senhaDigitada.slice(0, -1);
          } else if (caractere >= " ") {
            senhaDigitada += caractere;
          }
        }
      };

      stdin.setRawMode(true);
      stdin.resume();
      stdin.on("data", receber);
    });

    if (!nome || !email.includes("@") || senha.length < 12) {
      throw new Error(
        "Informe nome, e-mail válido e senha com pelo menos 12 caracteres."
      );
    }

    const senha_hash = await bcrypt.hash(senha, 12);

    const resultado = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, 'revisor')
       RETURNING id, nome, email, perfil`,
      [nome, email, senha_hash]
    );

    console.log("Revisor criado:", resultado.rows[0]);
  } finally {
    rl.close();
    await db.end();
  }
}

main().catch((erro) => {
  if (erro.code === "23505") {
    console.error("Esse e-mail já está cadastrado.");
  } else {
    console.error("Erro:", erro.message);
  }
  process.exitCode = 1;
});
