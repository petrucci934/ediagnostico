CREATE TABLE IF NOT EXISTS biblioteca_artigos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    resumo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    nivel TEXT NOT NULL,
    fabricante TEXT NOT NULL,
    atualizado_em DATE NOT NULL,
    status TEXT NOT NULL,
    ordem INTEGER NOT NULL CHECK (ordem > 0),
    tema TEXT NOT NULL,
    secoes JSONB NOT NULL CHECK (jsonb_typeof(secoes) = 'array'),
    fontes JSONB NOT NULL CHECK (jsonb_typeof(fontes) = 'array')
);
CREATE INDEX IF NOT EXISTS biblioteca_artigos_categoria_ordem
    ON biblioteca_artigos (categoria, ordem);
