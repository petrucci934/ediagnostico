const { test } = require('node:test');
const assert = require('node:assert/strict');
const registrarRotasBiblioteca = require('../src/bibliotecaRoutes');
const importarBiblioteca = require('../src/importarBiblioteca');
const artigos = require('../data/artigos-biblioteca.json');

test('consulta da biblioteca usa autenticação e autorização e mantém o contrato dos textos', async () => {
  let rota;
  const autenticarToken = () => {};
  const exigirEditor = () => {};
  const db = { async query(sql) {
    assert.match(sql, /FROM biblioteca_artigos/);
    assert.match(sql, /AS "atualizadoEm"/);
    return { rows: artigos };
  } };
  registrarRotasBiblioteca({ app: { get(...args) { rota = args; } }, db, autenticarToken, exigirEditor });
  assert.equal(rota[0], '/api/biblioteca/artigos');
  assert.equal(rota[1], autenticarToken);
  assert.equal(rota[2], exigirEditor);
  let resposta;
  await rota[3]({}, { json(dados) { resposta = dados; } });
  assert.deepEqual(resposta.artigos, artigos);
});

test('falha de banco retorna erro controlado sem expor detalhes internos', async () => {
  let handler;
  registrarRotasBiblioteca({
    app: { get(_url, _auth, _perfil, executar) { handler = executar; } },
    db: { query() { throw new Error('indisponível'); } },
  });
  const res = { status(code) { this.code = code; return this; }, json(dados) { this.body = dados; } };
  await handler({}, res);
  assert.equal(res.code, 500);
  assert.deepEqual(res.body, { erro: 'Não foi possível carregar a biblioteca técnica.' });
});

test('importação preserva os 84 conteúdos e não sobrescreve textos existentes', async () => {
  const registros = new Map();
  const cliente = { async query(sql, valores) {
    assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
    assert.equal(valores.length, 12);
    if (registros.has(valores[0])) return { rowCount: 0 };
    registros.set(valores[0], valores);
    return { rowCount: 1 };
  } };
  assert.equal(await importarBiblioteca(cliente, artigos), 84);
  const primeiro = registros.get(artigos[0].id);
  assert.deepEqual(JSON.parse(primeiro[10]), artigos[0].secoes);
  assert.deepEqual(JSON.parse(primeiro[11]), artigos[0].fontes);
  primeiro[1] = 'Título editado no banco';
  assert.equal(await importarBiblioteca(cliente, artigos), 0);
  assert.equal(registros.get(artigos[0].id)[1], 'Título editado no banco');
});
