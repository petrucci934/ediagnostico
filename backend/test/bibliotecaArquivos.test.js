const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const registrar = require('../src/bibliotecaArquivosRoutes');

function resposta() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
test('materiais rejeitam caminhos inseguros e não cadastrados', async () => {
  let handler;
  let consultas = 0;
  registrar({ app: { get(_url, executar) { handler = executar; } }, db: { async query() { consultas++; return { rowCount: 0 }; } } });
  for (const caminho of ['/videos/../segredo.mp4', '/videos/..\\segredo.mp4', '/.env', ['video.mp4']]) {
    const res = resposta(); await handler({ query: { caminho } }, res);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(consultas, 0);
  const res = resposta(); await handler({ query: { caminho: '/videos/inexistente.mp4' } }, res);
  assert.equal(res.statusCode, 404);
});
test('material cadastrado é servido do servidor com suporte a Range', async (t) => {
  const raiz = await fs.mkdtemp(path.join(os.tmpdir(), 'biblioteca-teste-'));
  t.after(() => fs.rm(raiz, { recursive: true, force: true }));
  await fs.mkdir(path.join(raiz, 'videos'));
  await fs.writeFile(path.join(raiz, 'videos/aula.mp4'), 'conteudo-teste');
  let handler;
  registrar({ raiz, app: { get(_url, executar) { handler = executar; } }, db: { async query(_sql, params) {
    assert.deepEqual(params, ['/videos/aula.mp4']); return { rowCount: 1 };
  } } });
  const res = resposta();
  res.sendFile = (arquivo, options) => {
    assert.equal(arquivo, path.join(raiz, 'videos/aula.mp4'));
    assert.equal(options.acceptRanges, true);
  };
  await handler({ query: { caminho: '/videos/aula.mp4' } }, res);
  assert.equal(res.statusCode, 200);
});
