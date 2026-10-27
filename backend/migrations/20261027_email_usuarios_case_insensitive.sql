-- Impede contas com o mesmo e-mail variando apenas maiúsculas/minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower
    ON usuarios (LOWER(email));
