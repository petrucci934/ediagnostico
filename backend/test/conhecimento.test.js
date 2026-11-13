const { test } = require('node:test');
const assert = require('node:assert/strict');
const importar = require('../src/importarConhecimento');
const registrar = require('../src/conhecimentoRoutes');
const { trilhas } = require('../data/trilhas-conhecimento.json');
function res() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } }; }
function rotas(db) {
  const mapa = new Map();
  const autenticarToken = () => {};
  const exigirEditor = () => {};
  registrar({ db, autenticarToken, exigirEditor, app: { get(url, ...h) { mapa.set(url, h); } } });
  for (const h of mapa.values()) { assert.equal(h[0], autenticarToken); assert.equal(h[1], exigirEditor); }
  return mapa;
}
test('3 trilhas, 18 módulos e 108 aulas ordenadas possuem conteúdo próprio navegável', () => {
  assert.deepEqual(trilhas.map((t) => t.id), ['eletrica', 'eletronica', 'mobilidade']);
  const ids = new Set(); const paragrafos = new Set();
  for (const [i,t] of trilhas.entries()) {
    assert.equal(t.ordem, i+1); assert.equal(t.modulos.length, 6);
    for (const [j,m] of t.modulos.entries()) {
      assert.equal(m.ordem,j+1); assert.ok(m.aulas.length);
      for (const [k,a] of m.aulas.entries()) {
        assert.equal(a.ordem,k+1); assert.ok(!ids.has(a.id)); ids.add(a.id);
        assert.ok(a.secoes.length >= 4); assert.equal(new Set(a.secoes.map((s) => s.id)).size,a.secoes.length);
        assert.ok(a.fontes.length); a.fontes.forEach((f) => assert.equal(new URL(f.url).protocol,'https:'));
        assert.ok(a.secoes.flatMap((s) => s.blocos.flatMap((b) => b.itens || [b.texto])).join(' ').split(/\s+/).length >= 120,a.id);
        for (const s of a.secoes) for (const b of s.blocos) if (b.texto?.length > 100) {
          assert.ok(!paragrafos.has(b.texto),a.id); paragrafos.add(b.texto);
        }
        if (t.id !== 'mobilidade') {
          assert.deepEqual(a.secoes.map((s) => s.id),['objetivo','conceito','parametros','exemplo','fixacao']);
          assert.match(a.secoes.at(-1).blocos[0].texto,/Resposta:/);
        }
      }
    }
  }
  assert.equal(ids.size,108);
  assert.deepEqual(trilhas.map((t) => t.modulos.reduce((n,m) => n+m.aulas.length,0)),[12,12,84]);
});
test('importação repetida preserva edições no banco e não altera a biblioteca',async () => {
  const registros = new Map();
  const cliente = { async query(sql, valores) {
    assert.doesNotMatch(sql,/biblioteca_artigos/); assert.match(sql,/ON CONFLICT \(id\) DO NOTHING/);
    if (registros.has(valores[0])) return { rowCount: 0 };
    registros.set(valores[0],[...valores]);
    if (sql.includes('conhecimento_aulas')) { assert.ok(Array.isArray(JSON.parse(valores[8]))); assert.ok(Array.isArray(JSON.parse(valores[9]))); }
    return { rowCount: 1 };
  } };
  assert.deepEqual(await importar(cliente,trilhas),{ trilhas:3,modulos:18,aulas:108 });
  const id=trilhas[0].modulos[0].aulas[0].id; registros.get(id)[2]='Edição da oficina';
  assert.deepEqual(await importar(cliente,trilhas),{ trilhas:0,modulos:0,aulas:0 });
  assert.equal(registros.get(id)[2],'Edição da oficina');
});
test('catálogo protegido consulta apenas resumos e módulos',async () => {
  const r=rotas({ async query(sql) { assert.match(sql,/FROM conhecimento_trilhas/); assert.doesNotMatch(sql,/a\.secoes|a\.fontes/); return { rows:[] }; } });
  const resposta=res(); await r.get('/api/conhecimento/trilhas')[2]({},resposta);
  assert.deepEqual(resposta.body,{ trilhas:[] });
});
test('consulta de aula usa parâmetro e retorna 404 para identificador inexistente',async () => {
  const id="inexistente' OR 1=1 --";
  const r=rotas({ async query(sql,params) { assert.match(sql,/WHERE a.id = \$1/); assert.deepEqual(params,[id]); return { rows:[] }; } });
  const resposta=res(); await r.get('/api/conhecimento/aulas/:id')[2]({ params:{id} },resposta);
  assert.equal(resposta.code,404);
});
test('aula inclui corpo, referências e localização no percurso',async () => {
  const aula={...trilhas[0].modulos[0].aulas[0],trilhaId:'eletrica',moduloId:'eletrica-grandezas'};
  const r=rotas({ async query() { return { rows:[aula] }; } });
  const resposta=res(); await r.get('/api/conhecimento/aulas/:id')[2]({ params:{id:aula.id} },resposta);
  assert.deepEqual(resposta.body.aula,aula);
});
test('falhas das consultas retornam erros controlados',async () => {
  const r=rotas({ query() { throw new Error('detalhe interno'); } });
  for (const h of r.values()) {
    const resposta=res(); await h[2]({params:{id:'aula'}},resposta);
    assert.equal(resposta.code,500); assert.doesNotMatch(resposta.body.erro,/detalhe interno/);
  }
});
