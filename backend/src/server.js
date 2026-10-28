require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não configurada no arquivo .env");
}

// Autentica o token enviado pelo cliente

async function autenticarToken(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Autenticação necessária.",
    });
  }

  const token = cabecalho.slice(7);
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (erro) {
    return res.status(401).json({
      erro: "Token inválido ou expirado.",
    });
  }

  try {
    const resultado = await db.query(
      `SELECT perfil, ativo, deve_trocar_credenciais
       FROM usuarios
       WHERE id = $1`,
      [payload.sub],
    );

    if (!resultado.rowCount || !resultado.rows[0].ativo) {
      return res.status(401).json({
        erro: "Usuário inexistente ou inativo.",
      });
    }

    const usuario = resultado.rows[0];

    req.usuario = {
      ...payload,
      perfil: usuario.perfil,
    };

    const rotaTrocaCredenciais =
      req.method === "PUT" &&
      req.path === "/api/auth/credenciais";

    if (
      usuario.deve_trocar_credenciais &&
      !rotaTrocaCredenciais
    ) {
      return res.status(403).json({
        erro: "Troque suas credenciais antes de continuar.",
        deve_trocar_credenciais: true,
      });
    }

    return next();
  } catch (erro) {
    console.error(
      "Erro ao validar usuário autenticado:",
      erro.message,
    );

    return res.status(500).json({
      erro: "Não foi possível validar a conta do usuário.",
    });
  }
}

// Restringe revisões a revisores e administradores
function exigirRevisor(req, res, next) {
  if (!["revisor", "admin"].includes(req.usuario.perfil)) {
    return res.status(403).json({
      erro: "Você não tem permissão para revisar testes técnicos.",
    });
  }

  next();
}

function exigirEditor(req, res, next) {
  if (!["mecanico", "admin"].includes(req.usuario.perfil)) {
    return res.status(403).json({
      erro: "Você não tem permissão para editar testes técnicos.",
    });
  }

  next();
}

function exigirAdmin(req, res, next) {
  if (req.usuario.perfil !== "admin") {
    return res.status(403).json({ erro: "Acesso restrito ao administrador." });
  }
  next();
}

// Conexão com o PostgreSQL
const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.post("/api/auth/login", async (req, res) => {
  const login = typeof req.body?.login === "string"
    ? req.body.login.trim().toLowerCase()
    : typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const { senha } = req.body || {};

  if (!login || typeof senha !== "string" || !senha) {
    return res.status(400).json({
      erro: "Informe o usuário ou e-mail e a senha.",
    });
  }

  try {
    const resultado = await db.query(
      `SELECT id, nome, email, usuario, senha_hash, perfil,
              deve_trocar_credenciais
       FROM usuarios
       WHERE (LOWER(email) = $1 OR LOWER(usuario) = $1) AND ativo = TRUE
       ORDER BY id
       LIMIT 1`,
      [login],
    );

    const usuario = resultado.rows[0];

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET,
      {
        subject: String(usuario.id),
        expiresIn: "8h",
      },
    );

    return res.json({
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        usuario: usuario.usuario,
        perfil: usuario.perfil,
        deve_trocar_credenciais: usuario.deve_trocar_credenciais,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível realizar o login.",
    });
  }
});

app.put("/api/auth/credenciais", autenticarToken, async (req, res) => {
  const usuarioNovo = typeof req.body?.usuario === "string" ? req.body.usuario.trim() : "";
  const senhaNova = typeof req.body?.senha === "string" ? req.body.senha : "";
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(usuarioNovo) || senhaNova.length < 12) {
    return res.status(400).json({
      erro: "Escolha um usuário de 3 a 80 caracteres (letras, números, ponto, hífen ou sublinhado) e uma senha com pelo menos 12 caracteres.",
    });
  }
  if (usuarioNovo.toLowerCase() === "admin" || senhaNova.toLowerCase() === "admin") {
    return res.status(400).json({ erro: "Escolha um usuário e uma senha diferentes das credenciais temporárias." });
  }
  try {
    const senhaHash = await bcrypt.hash(senhaNova, 12);
    const resultado = await db.query(
      `UPDATE usuarios SET usuario = $1, senha_hash = $2,
                           deve_trocar_credenciais = FALSE
       WHERE id = $3 AND perfil = 'admin' AND deve_trocar_credenciais = TRUE
       RETURNING id, nome, email, usuario, perfil, deve_trocar_credenciais`,
      [usuarioNovo, senhaHash, req.usuario.sub],
    );
    if (!resultado.rowCount) {
      return res.status(409).json({ erro: "A troca inicial de credenciais não está pendente para esta conta." });
    }
    res.json({ usuario: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === "23505") return res.status(409).json({ erro: "Esse usuário já está em uso." });
    console.error("Erro ao trocar credenciais iniciais:", erro.message);
    res.status(500).json({ erro: "Não foi possível atualizar as credenciais." });
  }
});

// Gestão administrativa de contas de mecânicos.
app.get("/api/admin/mecanicos", autenticarToken, exigirAdmin, async (_req, res) => {
  try {
    const resultado = await db.query(
      `SELECT id, nome, email, ativo, criado_em
       FROM usuarios WHERE perfil = 'mecanico' ORDER BY nome, id`,
    );
    res.json({ mecanicos: resultado.rows });
  } catch (erro) {
    console.error("Erro ao listar mecânicos:", erro.message);
    res.status(500).json({ erro: "Não foi possível listar os mecânicos." });
  }
});

app.post("/api/admin/mecanicos", autenticarToken, exigirAdmin, async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
  if (!nome || !email || senha.length < 8) {
    return res.status(400).json({ erro: "Informe nome, e-mail e senha com pelo menos 8 caracteres." });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const resultado = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, 'mecanico')
       RETURNING id, nome, email, ativo, criado_em`,
      [nome, email, senhaHash],
    );
    res.status(201).json({ mecanico: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === "23505") return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
    console.error("Erro ao cadastrar mecânico:", erro.message);
    res.status(500).json({ erro: "Não foi possível cadastrar o mecânico." });
  }
});

app.put("/api/admin/mecanicos/:id", autenticarToken, exigirAdmin, async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const ativo = req.body?.ativo;
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
  if (!nome || !email || typeof ativo !== "boolean" || (senha && senha.length < 8)) {
    return res.status(400).json({ erro: "Confira nome, e-mail, situação e senha (mínimo de 8 caracteres)." });
  }
  try {
    const valores = [nome, email, ativo, req.params.id];
    let sql = `UPDATE usuarios SET nome = $1, email = $2, ativo = $3
               WHERE id = $4 AND perfil = 'mecanico'`;
    if (senha) {
      valores.push(await bcrypt.hash(senha, 10));
      sql = `UPDATE usuarios SET nome = $1, email = $2, ativo = $3, senha_hash = $5
             WHERE id = $4 AND perfil = 'mecanico'`;
    }
    const resultado = await db.query(`${sql} RETURNING id, nome, email, ativo, criado_em`, valores);
    if (!resultado.rowCount) return res.status(404).json({ erro: "Mecânico não encontrado." });
    res.json({ mecanico: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === "23505") return res.status(409).json({ erro: "Já existe uma conta com este e-mail." });
    console.error("Erro ao atualizar mecânico:", erro.message);
    res.status(500).json({ erro: "Não foi possível atualizar o mecânico." });
  }
});

// Clientes compartilhados entre mecânicos e administrador.
app.get("/api/clientes", autenticarToken, exigirEditor, async (_req, res) => {
  try {
    const resultado = await db.query(
      "SELECT * FROM clientes ORDER BY nome, id"
    );
    res.json({ clientes: resultado.rows });
  } catch (erro) {
    console.error("Erro ao listar clientes:", erro.message);
    res.status(500).json({ erro: "Não foi possível listar os clientes." });
  }
});

app.post("/api/clientes", autenticarToken, exigirEditor, async (req, res) => {
  const nome =
    typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

  if (!nome) {
    return res.status(400).json({ erro: "Informe o nome do cliente." });
  }

  const texto = (valor) =>
    typeof valor === "string" ? valor.trim() : "";

  try {
    const resultado = await db.query(
      `INSERT INTO clientes (nome, telefone, email, veiculo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        nome,
        texto(req.body.telefone) || null,
        texto(req.body.email).toLowerCase() || null,
        texto(req.body.veiculo) || null,
      ],
    );

    res.status(201).json({ cliente: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao cadastrar cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível cadastrar o cliente." });
  }
});

// Cadastro administrativo de clientes.
app.get("/api/admin/clientes", autenticarToken, exigirAdmin, async (_req, res) => {
  try {
    const resultado = await db.query("SELECT * FROM clientes ORDER BY nome, id");
    res.json({ clientes: resultado.rows });
  } catch (erro) {
    console.error("Erro ao listar clientes:", erro.message);
    res.status(500).json({ erro: "Não foi possível listar os clientes." });
  }
});

app.post("/api/admin/clientes", autenticarToken, exigirAdmin, async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  if (!nome) return res.status(400).json({ erro: "Informe o nome do cliente." });
  try {
    const resultado = await db.query(
      `INSERT INTO clientes (nome, telefone, email, veiculo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nome, req.body.telefone?.trim() || null, req.body.email?.trim().toLowerCase() || null, req.body.veiculo?.trim() || null],
    );
    res.status(201).json({ cliente: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao cadastrar cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível cadastrar o cliente." });
  }
});

app.put("/api/admin/clientes/:id", autenticarToken, exigirAdmin, async (req, res) => {
  const nome = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";
  if (!nome) return res.status(400).json({ erro: "Informe o nome do cliente." });
  try {
    const resultado = await db.query(
      `UPDATE clientes SET nome = $1, telefone = $2, email = $3, veiculo = $4
       WHERE id = $5 RETURNING *`,
      [nome, req.body.telefone?.trim() || null, req.body.email?.trim().toLowerCase() || null, req.body.veiculo?.trim() || null, req.params.id],
    );
    if (!resultado.rowCount) return res.status(404).json({ erro: "Cliente não encontrado." });
    res.json({ cliente: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível atualizar o cliente." });
  }
});

app.delete("/api/admin/clientes/:id", autenticarToken, exigirAdmin, async (req, res) => {
  try {
    const resultado = await db.query("DELETE FROM clientes WHERE id = $1", [req.params.id]);
    if (!resultado.rowCount) return res.status(404).json({ erro: "Cliente não encontrado." });
    res.status(204).end();
  } catch (erro) {
    console.error("Erro ao excluir cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível excluir o cliente." });
  }
});


app.put("/api/clientes/:id", autenticarToken, exigirEditor, async (req, res) => {
  const nome =
    typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

  if (!nome) {
    return res.status(400).json({ erro: "Informe o nome do cliente." });
  }

  const texto = (valor) =>
    typeof valor === "string" ? valor.trim() : "";

  try {
    const resultado = await db.query(
      `UPDATE clientes
       SET nome = $1, telefone = $2, email = $3, veiculo = $4
       WHERE id = $5
       RETURNING *`,
      [
        nome,
        texto(req.body.telefone) || null,
        texto(req.body.email).toLowerCase() || null,
        texto(req.body.veiculo) || null,
        req.params.id,
      ],
    );

    if (!resultado.rowCount) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.json({ cliente: resultado.rows[0] });
  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível atualizar o cliente." });
  }
});

app.delete("/api/clientes/:id", autenticarToken, exigirEditor, async (req, res) => {
  try {
    const resultado = await db.query(
      "DELETE FROM clientes WHERE id = $1",
      [req.params.id],
    );

    if (!resultado.rowCount) {
      return res.status(404).json({ erro: "Cliente não encontrado." });
    }

    res.status(204).end();
  } catch (erro) {
    console.error("Erro ao excluir cliente:", erro.message);
    res.status(500).json({ erro: "Não foi possível excluir o cliente." });
  }
});


/* Gestão dos contatos de WhatsApp */

// Listar contatos no painel administrativo.
app.get(
  "/api/admin/whatsapp-contatos",
  autenticarToken,
  exigirAdmin,
  async (_req, res) => {
    try {
      const resultado = await db.query(
        `SELECT id, nome, telefone, ativo, criado_em
         FROM whatsapp_contatos
         ORDER BY nome, id`
      );

      return res.json({ contatos: resultado.rows });
    } catch (erro) {
      console.error("Erro ao listar contatos de WhatsApp:", erro.message);
      return res.status(500).json({
        erro: "Não foi possível listar os contatos de WhatsApp.",
      });
    }
  }
);

// Cadastrar um contato.
app.post(
  "/api/admin/whatsapp-contatos",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    const nome =
      typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

    const telefoneInformado =
      typeof req.body?.telefone === "string"
        ? req.body.telefone.trim()
        : "";

    if (!nome || nome.length > 100 || !telefoneInformado) {
      return res.status(400).json({
        erro: "Informe um nome de até 100 caracteres e um telefone.",
      });
    }

    // Aceita telefone com máscara, DDD e código do Brasil opcional.
    let telefone = telefoneInformado.replace(/\D/g, "");

    if (telefone.length === 10 || telefone.length === 11) {
      telefone = `55${telefone}`;
    } else if (
      !telefone.startsWith("55") ||
      ![12, 13].includes(telefone.length)
    ) {
      return res.status(400).json({
        erro: "Informe um telefone brasileiro válido, com DDD.",
      });
    }

    try {
      const resultado = await db.query(
        `INSERT INTO whatsapp_contatos (nome, telefone)
         VALUES ($1, $2)
         RETURNING id, nome, telefone, ativo, criado_em`,
        [nome, telefone]
      );

      return res.status(201).json({
        mensagem: "Contato de WhatsApp cadastrado com sucesso.",
        contato: resultado.rows[0],
      });
    } catch (erro) {
      if (erro.code === "23505") {
        return res.status(409).json({
          erro: "Este telefone já está cadastrado.",
        });
      }

      console.error("Erro ao cadastrar contato de WhatsApp:", erro.message);
      return res.status(500).json({
        erro: "Não foi possível cadastrar o contato de WhatsApp.",
      });
    }
  }
);

// Excluir um contato.
app.delete(
  "/api/admin/whatsapp-contatos/:id",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do contato inválido.",
      });
    }

    try {
      const resultado = await db.query(
        "DELETE FROM whatsapp_contatos WHERE id = $1 RETURNING id",
        [id]
      );

      if (!resultado.rowCount) {
        return res.status(404).json({
          erro: "Contato de WhatsApp não encontrado.",
        });
      }

      return res.status(204).end();
    } catch (erro) {
      console.error("Erro ao excluir contato de WhatsApp:", erro.message);
      return res.status(500).json({
        erro: "Não foi possível excluir o contato de WhatsApp.",
      });
    }
  }
);

// Listar somente os contatos ativos para o botão público.
app.get("/api/whatsapp-contatos", async (_req, res) => {
  try {
    const resultado = await db.query(
      `SELECT nome, telefone
       FROM whatsapp_contatos
       WHERE ativo = TRUE
       ORDER BY nome, id`
    );

    return res.json({ contatos: resultado.rows });
  } catch (erro) {
    console.error("Erro ao consultar contatos públicos:", erro.message);
    return res.status(500).json({
      erro: "Não foi possível consultar os contatos de WhatsApp.",
    });
  }
});


// Teste da API
app.get("/", (req, res) => {
  res.json({
    aplicativo: "E-Diagnóstico",
    status: "API funcionando",
  });
});

// Teste da conexão com o banco
app.get("/api/status", async (req, res) => {
  try {
    const resultado = await db.query(
      "SELECT NOW() AS horario, current_database() AS banco",
    );

    res.json({
      status: "conectado",
      banco: resultado.rows[0].banco,
      horario: resultado.rows[0].horario,
    });
  } catch (erro) {
    console.error("Erro ao consultar o banco:", erro.message);

    res.status(500).json({
      status: "erro",
      mensagem: "Não foi possível consultar o banco de dados.",
    });
  }
});

app.get("/api/detalhes/:codigo", async (req, res) => {
  let codigo = req.params.codigo.trim().toUpperCase();

  if (/^E\d{1,2}$/.test(codigo)) {
    codigo = "E" + codigo.substring(1).padStart(3, "0");
  }

  try {
    const resultado = await db.query(
      `SELECT
                fc.code,
                fc.description,
                fc.severity,
                fc.verification_status,
                c.component_type,
                c.model_name AS component_model,
                m.name AS manufacturer,
                ts.title AS source_title,
                ts.source_url,
                fcs.page_reference,
                fcs.evidence_notes
             FROM fault_codes fc
             LEFT JOIN components c
                ON c.id = fc.component_id
             LEFT JOIN manufacturers m
                ON m.id = c.manufacturer_id
             LEFT JOIN fault_code_sources fcs
                ON fcs.fault_code_id = fc.id
             LEFT JOIN technical_sources ts
                ON ts.id = fcs.source_id
             WHERE UPPER(fc.code)  LIKE $1
             ORDER BY ts.id`,
      [codigo],
    );

    if (resultado.rows.length === 0) {
      const prefixo = codigo.match(/^[A-Z]+/)?.[0] || "";
      let sugestoes = [];

      if (prefixo) {
        const consultaSugestoes = await db.query(
          `SELECT DISTINCT fc.code
     FROM fault_codes fc
     WHERE UPPER(fc.code) LIKE $1
     ORDER BY fc.code
     LIMIT 5`,
          [`${prefixo}%`],
        );
        sugestoes = consultaSugestoes.rows.map((linha) => linha.code);
      }

      return res.status(404).json({
        mensagem: "Código não encontrado na base de dados. ",
        codigo,
        sugestoes,
      });
    }
const imagens = await db.query(
  `
    SELECT
      fi.image_path,
      fi.caption,
      fi.page_reference,
      ts.title AS source_title
    FROM fault_code_images fi
    JOIN fault_codes fc
      ON fc.id = fi.fault_code_id
    LEFT JOIN technical_sources ts
      ON ts.id = fi.source_id
    WHERE UPPER(fc.code) = $1
      AND (
        fi.image_path LIKE '/images/codigos/%'
        OR NOT EXISTS (
          SELECT 1
          FROM fault_code_images fi2
          WHERE fi2.fault_code_id = fc.id
            AND fi2.image_path LIKE '/images/codigos/%'
        )
      )
    ORDER BY fi.id
  `,
  [codigo]
);
res.json({
  codigo,
  quantidade_fontes: resultado.rows.filter(
    (linha) => linha.source_title !== null,
  ).length,
  resultados: resultado.rows,
  imagens: imagens.rows,
});
  } catch (erro) {
    console.error("Erro nos detalhes:", erro.message);
    console.error("Erro ao consultar detalhes:", erro);
    res.status(500).json({
      erro: "Não foi possível consultar os detalhes.",
    });
  }
});
app.get("/api/fabricantes/:fabricante/codigos/:codigo", async (req, res) => {
  const fabricante = req.params.fabricante.trim();
  const codigo = req.params.codigo.trim().toUpperCase();
  const modeloId = req.query.modeloId;

  if (!fabricante || !codigo) {
    return res.status(400).json({
      erro: "Informe o fabricante e o código.",
    });
  }

  if (
    modeloId !== undefined &&
    (!/^\d+$/.test(modeloId) || Number(modeloId) <= 0)
  ) {
    return res.status(400).json({
      erro: "O ID do modelo é inválido.",
    });
  }

  try {
    const parametros = [fabricante, codigo];

    let filtroModelo = "";

    if (modeloId !== undefined) {
      parametros.push(Number(modeloId));
      filtroModelo = `
                AND EXISTS (
                    SELECT 1
                    FROM vehicle_model_fault_codes vmfc
                    JOIN vehicle_models vm
                        ON vm.id = vmfc.vehicle_model_id
                    WHERE vmfc.fault_code_id = fc.id
                      AND vm.id = $3
                      AND vm.manufacturer_id = m.id
                )
            `;
    }

    const resultado = await db.query(
      `SELECT
                fc.id AS fault_code_id,
                fc.code,
                fc.description,
                fc.severity,
                fc.verification_status,
                m.name AS manufacturer,
                c.component_type,
                c.model_name AS component_model,
                vmfc.verification_status AS model_verification_status,
                vm.model_name AS vehicle_model,
                ts.title AS source_title,
                ts.source_url,
                fcs.page_reference,
                fcs.evidence_notes
             FROM fault_codes fc
             JOIN components c
                ON c.id = fc.component_id
             JOIN manufacturers m
                ON m.id = c.manufacturer_id
             LEFT JOIN vehicle_model_fault_codes vmfc
                ON vmfc.fault_code_id = fc.id
             LEFT JOIN vehicle_models vm
                ON vm.id = vmfc.vehicle_model_id
             LEFT JOIN fault_code_sources fcs
                ON fcs.fault_code_id = fc.id
             LEFT JOIN technical_sources ts
                ON ts.id = fcs.source_id
             WHERE UPPER(m.name) = UPPER($1)
               AND UPPER(fc.code) = UPPER($2)
               ${filtroModelo}
             ORDER BY ts.id`,
      parametros,
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          modeloId !== undefined
            ? "Código não encontrado ou sem associação cadastrada para este modelo."
            : "Código não encontrado para este fabricante.",
        codigo,
        sugestoes: [],
      });
    }

    const imagens = await db.query(
      `SELECT
          fi.id,
          fi.image_path,
          fi.caption,
          fi.page_reference,
          ts.title AS source_title
       FROM fault_code_images fi
       JOIN fault_codes fc
         ON fc.id = fi.fault_code_id
       JOIN components c
         ON c.id = fc.component_id
       JOIN manufacturers m
         ON m.id = c.manufacturer_id
       LEFT JOIN technical_sources ts
         ON ts.id = fi.source_id
       WHERE UPPER(m.name) = UPPER($1)
         AND UPPER(fc.code) = UPPER($2)
         AND (
           $3::BIGINT IS NULL OR EXISTS (
             SELECT 1
             FROM vehicle_model_fault_codes vmfc
             JOIN vehicle_models vm
               ON vm.id = vmfc.vehicle_model_id
             WHERE vmfc.fault_code_id = fc.id
               AND vm.id = $3
               AND vm.manufacturer_id = m.id
           )
         )
       ORDER BY fi.id`,
      [fabricante, codigo, modeloId ? Number(modeloId) : null],
    );

    return res.json({
      fabricante: resultado.rows[0].manufacturer,
      modeloId: modeloId ?? null,
      codigo,
      quantidade: resultado.rows.length,
      resultados: resultado.rows,
      imagens: imagens.rows,
    });
  } catch (erro) {
    console.error("Erro na pesquisa por fabricante:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível realizar a pesquisa.",
    });
  }
});

app.get("/api/fabricantes", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT
                m.id,
                m.name,
                m.website,
                COUNT(DISTINCT c.id)::int AS total_componentes,
                COUNT(DISTINCT fc.id)::int AS total_codigos
             FROM manufacturers m
             LEFT JOIN components c
                ON c.manufacturer_id = m.id
             LEFT JOIN fault_codes fc
                ON fc.component_id = c.id
             GROUP BY m.id, m.name, m.website
             ORDER BY m.name`,
    );

    res.json({
      quantidade: resultado.rows.length,
      fabricantes: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao listar fabricantes:", erro.message);

    res.status(500).json({
      erro: "Não foi possível listar os fabricantes.",
    });
  }
});

app.get("/api/modelos", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT
                vm.id,
                vm.model_name,
                vm.model_year,
                vm.nominal_voltage,
                m.id AS manufacturer_id,
                m.name AS fabricante,
                vt.id AS vehicle_type_id,
                vt.name AS tipo_veiculo
             FROM vehicle_models vm
             JOIN manufacturers m
                ON m.id = vm.manufacturer_id
             JOIN vehicle_types vt
                ON vt.id = vm.vehicle_type_id
             ORDER BY m.name, vt.name, vm.model_name`,
    );

    res.json({
      quantidade: resultado.rows.length,
      modelos: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao listar modelos:", erro.message);

    res.status(500).json({
      erro: "Não foi possível listar os modelos.",
    });
  }
});

app.get("/api/fabricantes/:id/componentes", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do fabricante inválido.",
    });
  }

  try {
    const result = await db.query(
      `SELECT
         c.id,
         c.component_type,
         c.model_name,
         COUNT(DISTINCT fc.id)::int AS total_codigos
       FROM components c
       LEFT JOIN fault_codes fc
         ON fc.component_id = c.id
       WHERE c.manufacturer_id = $1
       GROUP BY c.id, c.component_type, c.model_name
       ORDER BY c.component_type, c.model_name NULLS LAST`,
      [id],
    );

    res.json({
      fabricante_id: id,
      quantidade: result.rows.length,
      componentes: result.rows,
    });
  } catch (err) {
    console.error("Erro ao consultar componentes:", err);

    res.status(500).json({
      erro: "Erro ao consultar os componentes.",
    });
  }
});

app.get("/api/modelos/:id/codigos", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do modelo inválido.",
    });
  }

  try {
    const resultado = await db.query(
      `SELECT
         fc.id,
         fc.code,
         fc.description,
         vmfc.verification_status,
         vmfc.applicability_notes
       FROM vehicle_model_fault_codes vmfc
       JOIN fault_codes fc
         ON fc.id = vmfc.fault_code_id
       WHERE vmfc.vehicle_model_id = $1
       ORDER BY fc.code`,
      [id],
    );

    res.json({
      modelo_id: id,
      quantidade: resultado.rows.length,
      codigos: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao listar códigos do modelo:", erro.message);

    res.status(500).json({
      erro: "Não foi possível listar os códigos deste modelo.",
    });
  }
});

app.get("/api/procedimentos/:codigo", async (req, res) => {
  const codigo = req.params.codigo.trim();

  try {
    const result = await db.query(
      `SELECT
                fc.code AS codigo,
                fp.step_number AS etapa,
                fp.instruction AS instrucao,
                fp.safety_warning AS aviso_seguranca,
                ts.title AS fonte_tecnica,
                ts.source_url AS fonte_url
             FROM fault_procedures fp
             JOIN fault_codes fc
                ON fc.id = fp.fault_code_id
             LEFT JOIN technical_sources ts
                ON ts.id = fp.source_id
             WHERE UPPER(fc.code) = UPPER($1)
             ORDER BY fp.step_number`,
      [codigo],
    );

    res.json({
      codigo: codigo.toUpperCase(),
      quantidade: result.rows.length,
      procedimentos: result.rows,
    });
  } catch (err) {
    console.error("Erro ao consultar procedimentos:", err);

    res.status(500).json({
      erro: "Erro ao consultar os procedimentos.",
    });
  }
});

app.get("/api/codigos/:codigo", async (req, res) => {
  const codigo = req.params.codigo.trim();

  if (!codigo || codigo.length > 40) {
    return res.status(400).json({
      erro: "Informe um código válido.",
    });
  }

  try {
    const resultado = await db.query(
      `SELECT
                fc.code,
                fc.description,
                fc.severity,
                fc.verification_status,
                c.component_type,
                c.model_name AS component_model,
                m.name AS manufacturer
             FROM fault_codes fc
             LEFT JOIN components c ON c.id = fc.component_id
             LEFT JOIN manufacturers m ON m.id = c.manufacturer_id
             WHERE UPPER(fc.code) = UPPER($1)
             LIMIT 20`,
      [codigo],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Código não encontrado na base de dados.",
        codigo: codigo,
      });
    }

    res.json({
      quantidade: resultado.rows.length,
      resultados: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro na pesquisa:", erro.message);

    res.status(500).json({
      erro: "Não foi possível pesquisar o código.",
    });
  }
});

app.get("/api/fontes", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT
                ts.id,
                ts.title,
                ts.document_version,
                ts.source_url,
                ts.accessed_at,
                ts.notes,
                m.name AS manufacturer
             FROM technical_sources ts
             LEFT JOIN manufacturers m
                ON m.id = ts.manufacturer_id
             ORDER BY ts.id`,
    );

    res.json({
      quantidade: resultado.rows.length,
      fontes: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao consultar fontes:", erro.message);

    res.status(500).json({
      erro: "Não foi possível consultar as fontes técnicas.",
    });
  }
});
app.get("/api/atendimentos", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT id, codigo_erro, fabricante, modelo,
              problema_relatado, status, criado_em, atualizado_em
       FROM atendimentos
       ORDER BY criado_em DESC`,
    );

    res.json({
      quantidade: resultado.rows.length,
      atendimentos: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao listar atendimentos:", erro.message);

    res.status(500).json({
      erro: "Não foi possível listar os atendimentos.",
    });
  }
});

app.post("/api/atendimentos", async (req, res) => {
  try {
    const { codigo_erro, fabricante, modelo, problema_relatado } = req.body;

    if (
      !codigo_erro?.trim() ||
      !fabricante?.trim() ||
      !modelo?.trim() ||
      !problema_relatado?.trim()
    ) {
      return res.status(400).json({
        erro: "Preencha o código de erro, fabricante, modelo e problema relatado.",
      });
    }

    const resultado = await db.query(
      `INSERT INTO atendimentos
        (codigo_erro, fabricante, modelo, problema_relatado)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        codigo_erro.trim().toUpperCase(),
        fabricante.trim(),
        modelo.trim(),
        problema_relatado.trim(),
      ],
    );

    res.status(201).json({
      mensagem: "Atendimento cadastrado com sucesso.",
      atendimento: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao cadastrar atendimento:", erro.message);

    res.status(500).json({
      erro: "Não foi possível cadastrar o atendimento.",
    });
  }
});
app.patch("/api/atendimentos/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ["aberto", "em_andamento", "concluido"];

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      erro: "ID de atendimento inválido.",
    });
  }

  if (!statusValidos.includes(status)) {
    return res.status(400).json({
      erro: "Status inválido.",
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE atendimentos
       SET status = $1, atualizado_em = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Atendimento não encontrado.",
      });
    }

    res.json({
      mensagem: "Status atualizado com sucesso.",
      atendimento: resultado.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro.message);

    res.status(500).json({
      erro: "Não foi possível atualizar o status.",
    });
  }
});

app.get("/api/testes-tecnicos", autenticarToken, async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        tt.id,
        tt.test_date,
        tt.test_conditions,
        tt.procedure_performed,
        tt.observed_result,
        tt.outcome,
        tt.evidence_notes,
        tt.evidence_url,
        tt.validation_status,
        vm.model_name AS modelo,
        m.name AS fabricante,
        fc.code AS codigo_erro,
        fc.description AS descricao_codigo
      FROM technical_tests tt
      JOIN vehicle_models vm ON vm.id = tt.vehicle_model_id
      JOIN manufacturers m ON m.id = vm.manufacturer_id
      JOIN fault_codes fc ON fc.id = tt.fault_code_id
      ORDER BY tt.test_date DESC
    `);

    res.json({
      quantidade: resultado.rows.length,
      testes: resultado.rows,
    });
  } catch (erro) {
    console.error("Erro ao listar testes técnicos:", erro.message);

    res.status(500).json({
      erro: "Não foi possível listar os testes técnicos.",
    });
  }
});
app.post(
  "/api/testes-tecnicos",
  autenticarToken,
  exigirEditor,
  async (req, res) => {
    const {
      vehicle_model_id,
      fault_code_id,
      test_conditions,
      procedure_performed,
      observed_result,
      outcome,
      evidence_notes,
      evidence_url,
    } = req.body;

    const resultadoPermitido = [
      "confirmado_no_teste",
      "nao_reproduzido",
      "inconclusivo",
    ];

    if (
      !Number.isSafeInteger(Number(vehicle_model_id)) ||
      Number(vehicle_model_id) <= 0 ||
      !Number.isSafeInteger(Number(fault_code_id)) ||
      Number(fault_code_id) <= 0 ||
      typeof procedure_performed !== "string" ||
      !procedure_performed.trim() ||
      typeof observed_result !== "string" ||
      !observed_result.trim()
    ) {
      return res.status(400).json({
        erro: "Informe um modelo, um código, o procedimento e o resultado observado.",
      });
    }

    const resultadoFinal = outcome || "inconclusivo";

    if (!resultadoPermitido.includes(resultadoFinal)) {
      return res.status(400).json({
        erro: "Resultado do teste inválido.",
      });
    }

    if (
      (evidence_url != null && typeof evidence_url !== "string") ||
      (evidence_notes != null && typeof evidence_notes !== "string") ||
      (test_conditions != null && typeof test_conditions !== "string")
    ) {
      return res.status(400).json({
        erro: "Condições e evidências devem ser textos válidos.",
      });
    }

    try {
      const resultado = await db.query(
        `INSERT INTO technical_tests (
        vehicle_model_id,
        fault_code_id,
        test_conditions,
        procedure_performed,
        observed_result,
        outcome,
        evidence_notes,
        evidence_url,
        validation_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
        [
          Number(vehicle_model_id),
          Number(fault_code_id),
          test_conditions?.trim() || null,
          procedure_performed.trim(),
          observed_result.trim(),
          resultadoFinal,
          evidence_notes?.trim() || null,
          evidence_url?.trim() || null,
        ],
      );

      res.status(201).json({
        mensagem: "Teste técnico registrado com sucesso.",
        teste: resultado.rows[0],
      });
    } catch (erro) {
      if (erro.code === "23503") {
        return res.status(400).json({
          erro: "O modelo ou o código de erro informado não existe.",
        });
      }

      console.error("Erro ao registrar teste técnico:", erro);

      res.status(500).json({
        erro: "Não foi possível registrar o teste técnico.",
      });
    }
  },
);

app.put(
  "/api/testes-tecnicos/:id",
  autenticarToken,
  exigirEditor,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      vehicle_model_id,
      fault_code_id,
      test_conditions,
      procedure_performed,
      observed_result,
      outcome,
      evidence_notes,
      evidence_url,
    } = req.body || {};

    const resultadoPermitido = [
      "confirmado_no_teste",
      "nao_reproduzido",
      "inconclusivo",
    ];

    if (
      !Number.isSafeInteger(Number(vehicle_model_id)) ||
      Number(vehicle_model_id) <= 0 ||
      !Number.isSafeInteger(Number(fault_code_id)) ||
      Number(fault_code_id) <= 0 ||
      typeof test_conditions !== "string" ||
      !test_conditions.trim() ||
      typeof procedure_performed !== "string" ||
      !procedure_performed.trim() ||
      typeof observed_result !== "string" ||
      !observed_result.trim() ||
      typeof evidence_notes !== "string" ||
      !evidence_notes.trim() ||
      typeof outcome !== "string" ||
      !resultadoPermitido.includes(outcome) ||
      (evidence_url != null && typeof evidence_url !== "string")
    ) {
      return res.status(400).json({
        erro: "Preencha corretamente as condições, o procedimento, o resultado e as evidências do teste.",
      });
    }

    try {
      const resultado = await db.query(
        `UPDATE technical_tests
       SET vehicle_model_id = $1,
           fault_code_id = $2,
           test_conditions = $3,
           procedure_performed = $4,
           observed_result = $5,
           outcome = $6,
           evidence_notes = $7,
           evidence_url = $8
       WHERE id = $9
         AND validation_status = 'pending'
       RETURNING *`,
        [
          Number(vehicle_model_id),
          Number(fault_code_id),
          test_conditions.trim(),
          procedure_performed.trim(),
          observed_result.trim(),
          outcome,
          evidence_notes.trim(),
          evidence_url?.trim() || null,
          id,
        ],
      );

      if (resultado.rowCount === 0) {
        const consulta = await db.query(
          "SELECT id, validation_status FROM technical_tests WHERE id = $1",
          [id],
        );

        if (consulta.rowCount === 0) {
          return res.status(404).json({
            erro: "Teste técnico não encontrado.",
          });
        }

        return res.status(409).json({
          erro: "Somente testes pendentes podem ser editados.",
          validation_status: consulta.rows[0].validation_status,
        });
      }

      return res.json({
        mensagem: "Teste técnico atualizado com sucesso.",
        teste: resultado.rows[0],
      });
    } catch (erro) {
      if (erro.code === "23503") {
        return res.status(400).json({
          erro: "O modelo ou o código de erro informado não existe.",
        });
      }

      console.error("Erro ao atualizar teste técnico:", erro.message);

      return res.status(500).json({
        erro: "Não foi possível atualizar o teste técnico.",
      });
    }
  },
);

app.post(
  "/api/testes-tecnicos/:id/revisar",
  autenticarToken,
  exigirRevisor,
  async (req, res) => {
    const id = Number(req.params.id);
    const { decision, justification } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do teste técnico inválido.",
      });
    }

    if (!["accepted", "rejected"].includes(decision)) {
      return res.status(400).json({
        erro: "A decisão deve ser accepted ou rejected.",
      });
    }

    if (typeof justification !== "string" || !justification.trim()) {
      return res.status(400).json({
        erro: "Informe uma justificativa para a decisão.",
      });
    }

    const client = await db.connect();
    let transacaoIniciada = false;

    try {
      await client.query("BEGIN");
      transacaoIniciada = true;

      const teste = await client.query(
        `SELECT id, validation_status
         FROM technical_tests
         WHERE id = $1
         FOR UPDATE`,
        [id],
      );

      if (teste.rowCount === 0) {
        await client.query("ROLLBACK");
        transacaoIniciada = false;

        return res.status(404).json({
          erro: "Teste técnico não encontrado.",
        });
      }

      if (teste.rows[0].validation_status !== "pending") {
        await client.query("ROLLBACK");
        transacaoIniciada = false;

        return res.status(409).json({
          erro: "Este teste não está pendente de revisão.",
          status_atual: teste.rows[0].validation_status,
        });
      }

      const atualizacao = await client.query(
        `UPDATE technical_tests
         SET validation_status = $1
         WHERE id = $2
         RETURNING id, validation_status`,
        [decision, id],
      );

      await client.query(
        `INSERT INTO technical_test_reviews (
           technical_test_id,
           reviewer_id,
           decision,
           justification
         )
         VALUES ($1, $2, $3, $4)`,
        [id, req.usuario.sub, decision, justification.trim()],
      );

      await client.query("COMMIT");
      transacaoIniciada = false;

      return res.json({
        mensagem:
          decision === "accepted"
            ? "Teste técnico aprovado com sucesso."
            : "Teste técnico rejeitado.",
        teste: atualizacao.rows[0],
      });
    } catch (erro) {
      if (transacaoIniciada) {
        try {
          await client.query("ROLLBACK");
        } catch (erroRollback) {
          console.error("Erro ao desfazer transação:", erroRollback.message);
        }
      }

      console.error("Erro ao revisar teste técnico:", erro.message);

      return res.status(500).json({
        erro: "Não foi possível concluir a revisão.",
      });
    } finally {
      client.release();
    }
  },
);

app.get(
  "/api/testes-tecnicos/:id/revisoes",
  autenticarToken,
  exigirRevisor,
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        erro: "ID do teste técnico inválido.",
      });
    }

    try {
      const teste = await db.query(
        "SELECT id FROM technical_tests WHERE id = $1",
        [id],
      );

      if (teste.rowCount === 0) {
        return res.status(404).json({
          erro: "Teste técnico não encontrado.",
        });
      }

      const resultado = await db.query(
        `SELECT
           r.id,
           r.technical_test_id,
           r.reviewer_id,
           u.nome AS revisor_nome,
           r.decision,
           r.justification
         FROM technical_test_reviews r
         JOIN usuarios u ON u.id = r.reviewer_id
         WHERE r.technical_test_id = $1
         ORDER BY r.id DESC`,
        [id],
      );

      return res.json({
        teste_id: id,
        quantidade: resultado.rowCount,
        revisoes: resultado.rows,
      });
    } catch (erro) {
      console.error("Erro ao consultar histórico de revisões:", erro.message);

      return res.status(500).json({
        erro: "Não foi possível consultar o histórico de revisões.",
      });
    }
  },
);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`E-Diagnóstico rodando na porta ${PORT}`);
});
