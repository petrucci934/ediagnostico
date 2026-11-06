const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function preparar(existe = true, smtp = true) {
  const consultas = [], emails = [], rotas = new Map();
  const db = { async query(sql, valores) {
    consultas.push({ sql, valores });
    if (sql.includes('SELECT id, nome, email')) return { rowCount: existe ? 1 : 0, rows: existe ? [{ id: 1, nome: 'Admin', email: 'admin@example.com' }] : [] };
    return { rowCount: 1, rows: [] };
  } };
  const modulo = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/passwordResetRoutes.js'), 'utf8'), {
    module: modulo, require(nome) { return nome === 'crypto' ? crypto : { createTransport() { return { async sendMail(email) { emails.push(email); } }; } }; },
    process: { env: smtp ? { FRONTEND_URL: 'https://app.example.com', SMTP_HOST: 'smtp.example.com', SMTP_PORT: '465', SMTP_USER: 'envio@example.com', SMTP_PASS: 'simulada' } : {} },
    console: { error() {} },
  });
  modulo.exports({ app: { post(url, ...handlers) { rotas.set(url, handlers.at(-1)); } }, db });
  return { consultas, emails, handler: rotas.get('/api/auth/admin/recuperacao-senha') };
}
function resposta() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }

test('recuperação pública consulta somente administradores ativos e usa link de uso único', async () => {
  const api = preparar(); const res = resposta();
  await api.handler({ body: { email: ' ADMIN@EXAMPLE.COM ' }, ip: '127.0.0.1' }, res);
  assert.equal(res.code, 200);
  assert.match(api.consultas[0].sql, /perfil = 'admin' AND ativo = TRUE/);
  assert.equal(api.consultas[0].valores[0], 'admin@example.com');
  assert.equal(api.emails.length, 1);
  const token = api.emails[0].text.match(/token=([a-f0-9]{64})/)[1];
  const insert = api.consultas.find(c => c.sql.includes('INSERT INTO password_reset_tokens'));
  assert.equal(insert.valores[1], crypto.createHash('sha256').update(token).digest('hex'));
  assert.ok(!JSON.stringify(res.body).includes(token));
  const repetido = resposta();
  await api.handler({ body: { email: 'admin@example.com' }, ip: '127.0.0.1' }, repetido);
  assert.equal(repetido.code, 429);
});

test('e-mail não cadastrado recebe a mesma resposta sem enviar mensagem', async () => {
  const api = preparar(false); const res = resposta();
  await api.handler({ body: { email: 'outro@example.com' }, ip: '127.0.0.1' }, res);
  assert.equal(res.code, 200); assert.equal(api.emails.length, 0);
  assert.match(res.body.mensagem, /Se o e-mail corresponder/);
});

test('recuperação informa configuração ausente e rejeita e-mail inválido', async () => {
  const api = preparar(true, false);
  const invalido = resposta();
  await api.handler({ body: { email: 'admin' }, ip: '127.0.0.1' }, invalido);
  assert.equal(invalido.code, 400);
  const res = resposta();
  await api.handler({ body: { email: 'admin@example.com' }, ip: '127.0.0.1' }, res);
  assert.equal(res.code, 503); assert.equal(api.consultas.length, 0);
});
