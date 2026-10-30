const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports = function registrarRotasRecuperacao({
  app,
  db,
  autenticarToken,
  exigirAdmin,
  bcrypt,
}) {
  // Solicitação restrita ao administrador autenticado.
  app.post(
    "/api/admin/usuarios/:id/recuperacao-senha",
    autenticarToken,
    exigirAdmin,
    async (req, res) => {
      const id = req.params.id;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({ erro: "ID de usuário inválido." });
      }

      if (
        !process.env.FRONTEND_URL ||
        !process.env.SMTP_HOST ||
        !process.env.SMTP_PORT ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
      ) {
        return res.status(500).json({
          erro: "As configurações de envio de e-mail estão incompletas.",
        });
      }

      let tokenHash;

      try {
        const consulta = await db.query(
          `SELECT id, nome, email
           FROM usuarios
           WHERE id = $1`,
          [id],
        );

        if (!consulta.rowCount) {
          return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const usuario = consulta.rows[0];
        const token = crypto.randomBytes(32).toString("hex");
        tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

        await db.query(
          `DELETE FROM password_reset_tokens
           WHERE usuario_id = $1 AND utilizado_em IS NULL`,
          [usuario.id],
        );

        await db.query(
          `INSERT INTO password_reset_tokens
             (usuario_id, token_hash, expira_em)
           VALUES ($1, $2, $3)`,
          [usuario.id, tokenHash, expiraEm],
        );

        const baseUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
        const link = `${baseUrl}/redefinir-senha?token=${token}`;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: usuario.email,
          subject: "Redefinição de senha — E-Diagnóstico",
          text:
            `Olá, ${usuario.nome}.\n\n` +
            "Foi solicitada uma redefinição de senha para sua conta no E-Diagnóstico.\n\n" +
            `Acesse este link em até 30 minutos:\n${link}\n\n` +
            "Se você não esperava esta mensagem, entre em contato com o administrador.",
        });

        return res.json({
          mensagem: `Link de redefinição enviado para ${usuario.email}.`,
        });
      } catch (erro) {
        if (tokenHash) {
          await db
            .query(
              `DELETE FROM password_reset_tokens
               WHERE token_hash = $1 AND utilizado_em IS NULL`,
              [tokenHash],
            )
            .catch(() => {});
        }

        console.error("Erro ao enviar link de redefinição:", erro.message);
        return res.status(500).json({
          erro: "Não foi possível enviar o link de redefinição.",
        });
      }
    },
  );

  // Valida o token e define uma nova senha.
  app.post("/api/auth/redefinir-senha", async (req, res) => {
    const token = typeof req.body?.token === "string" ? req.body.token : "";
    const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ erro: "Link inválido ou expirado." });
    }

    if (senha.length < 12) {
      return res.status(400).json({
        erro: "A nova senha deve ter pelo menos 12 caracteres.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const conexao = await db.connect();

    try {
      await conexao.query("BEGIN");

      const consulta = await conexao.query(
        `SELECT t.id AS token_id, t.usuario_id
         FROM password_reset_tokens t
         JOIN usuarios u ON u.id = t.usuario_id
         WHERE t.token_hash = $1
           AND t.utilizado_em IS NULL
           AND t.expira_em > CURRENT_TIMESTAMP
           AND u.ativo = TRUE
         FOR UPDATE OF t`,
        [tokenHash],
      );

      if (!consulta.rowCount) {
        await conexao.query("ROLLBACK");
        return res.status(400).json({ erro: "Link inválido ou expirado." });
      }

      const { token_id, usuario_id } = consulta.rows[0];
      const senhaHash = await bcrypt.hash(senha, 12);

      await conexao.query(
        `UPDATE usuarios SET senha_hash = $1 WHERE id = $2`,
        [senhaHash, usuario_id],
      );

      await conexao.query(
        `UPDATE password_reset_tokens
         SET utilizado_em = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [token_id],
      );

      await conexao.query(
        `UPDATE password_reset_tokens
         SET utilizado_em = CURRENT_TIMESTAMP
         WHERE usuario_id = $1
           AND id <> $2
           AND utilizado_em IS NULL`,
        [usuario_id, token_id],
      );

      await conexao.query("COMMIT");

      return res.json({
        mensagem: "Senha redefinida com sucesso. Você já pode entrar com a nova senha.",
      });
    } catch (erro) {
      await conexao.query("ROLLBACK").catch(() => {});
      console.error("Erro ao redefinir senha:", erro.message);
      return res.status(500).json({
        erro: "Não foi possível redefinir a senha.",
      });
    } finally {
      conexao.release();
    }
  });
};
