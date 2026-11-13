// DATABASE_URL é opcional: o desenvolvimento local continua usando DB_*.
function configuracaoBanco(env) {
  const conexao = env.DATABASE_URL
    ? { connectionString: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: Number(env.DB_PORT || 5432),
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
      };
  // Valida o certificado do banco; não desativa a verificação TLS.
  if (env.DB_SSL === "true" && !env.DATABASE_URL) {
    conexao.ssl = { rejectUnauthorized: true };
  }
  return { ...conexao, connectionTimeoutMillis: 10000, max: 5 };
}

function origensAdicionais(env) {
  return (env.CORS_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

module.exports = { configuracaoBanco, origensAdicionais };
