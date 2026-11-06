CREATE TABLE IF NOT EXISTS biblioteca_arquivos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    artigo_id TEXT
        REFERENCES biblioteca_artigos(id)
        ON DELETE SET NULL,

    titulo TEXT NOT NULL,

    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('video', 'pdf', 'imagem')),

    caminho TEXT NOT NULL UNIQUE,

    mime_type VARCHAR(100) NOT NULL,

    tamanho_bytes BIGINT NOT NULL DEFAULT 0
        CHECK (tamanho_bytes >= 0),

    categoria TEXT,

    descricao TEXT,

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biblioteca_arquivos_artigo
    ON biblioteca_arquivos(artigo_id);

CREATE INDEX IF NOT EXISTS idx_biblioteca_arquivos_tipo
    ON biblioteca_arquivos(tipo);
