ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS usuario VARCHAR(80),
    ADD COLUMN IF NOT EXISTS deve_trocar_credenciais BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_usuario_lower
    ON usuarios (LOWER(usuario)) WHERE usuario IS NOT NULL;
