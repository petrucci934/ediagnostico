CREATE TABLE IF NOT EXISTS conhecimento_trilhas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    ordem INTEGER NOT NULL UNIQUE CHECK (ordem > 0),
    etapa TEXT NOT NULL,
    descricao TEXT NOT NULL,
    requisito TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS conhecimento_modulos (
    id TEXT PRIMARY KEY,
    trilha_id TEXT NOT NULL REFERENCES conhecimento_trilhas(id),
    titulo TEXT NOT NULL,
    ordem INTEGER NOT NULL CHECK (ordem > 0),
    descricao TEXT NOT NULL,
    UNIQUE (trilha_id, ordem)
);
CREATE TABLE IF NOT EXISTS conhecimento_aulas (
    id TEXT PRIMARY KEY,
    modulo_id TEXT NOT NULL REFERENCES conhecimento_modulos(id),
    titulo TEXT NOT NULL,
    ordem INTEGER NOT NULL CHECK (ordem > 0),
    resumo TEXT NOT NULL,
    nivel TEXT NOT NULL,
    status TEXT NOT NULL,
    atualizado_em DATE NOT NULL,
    secoes JSONB NOT NULL CHECK (jsonb_typeof(secoes) = 'array'),
    fontes JSONB NOT NULL CHECK (jsonb_typeof(fontes) = 'array'),
    UNIQUE (modulo_id, ordem)
);
