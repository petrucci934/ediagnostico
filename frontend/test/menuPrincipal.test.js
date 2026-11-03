import { test } from "node:test";
import assert from "node:assert/strict";
import { obterMenuPrincipal, itemMenuAtivo } from "../src/menuPrincipal.js";

test("menu do mecânico inclui todas as funções de oficina", () => {
  const menu = obterMenuPrincipal({ perfil: "mecanico" });
  assert.deepEqual(
    menu.map((item) => item.id),
    [
      "diagnostico",
      "biblioteca",
      "novo-teste",
      "historico-testes",
      "precificacao",
      "orcamento",
      "atendimentos",
      "cadastros",
    ],
  );
  for (const id of [
    "biblioteca",
    "novo-teste",
    "historico-testes",
    "orcamento",
  ]) {
    const item = menu.find((item) => item.id === id);
    assert.equal(item.tela, "testes");
    assert.equal(item.abaTeste, id);
  }
});
test("cadastros têm um único acesso ativo nas duas abas", () => {
  const menu = obterMenuPrincipal({ perfil: "mecanico" });
  const cadastros = menu.filter((item) => item.tela === "cadastros");
  assert.equal(cadastros.length, 1);
  assert.equal(cadastros[0].texto, "Cadastros da oficina");
  for (const abaCadastroInicial of ["clientes", "itens"]) {
    assert.equal(itemMenuAtivo(cadastros[0], {
      telaAtual: "cadastros", abaCadastroInicial,
    }), true);
  }
});
test("cada destino identifica apenas um item ativo", () => {
  const menu = obterMenuPrincipal({ perfil: "mecanico" });
  for (const destino of menu) {
    const estado = {
      telaAtual: destino.tela,
      abaTeste: destino.abaTeste ?? "orcamento",
      abaCliente: destino.abaCliente ?? "tabela",
      abaCadastroInicial: destino.abaCadastroInicial ?? "itens",
    };
    assert.deepEqual(
      menu.filter((item) => itemMenuAtivo(item, estado)).map((item) => item.id),
      [destino.id],
    );
  }
});
test("cliente mantém diagnóstico e tabela, sem atalhos da oficina", () => {
  assert.deepEqual(
    obterMenuPrincipal({ perfil: "cliente" }).map((item) => item.id),
    ["diagnostico", "tabela-servicos"],
  );
  assert.deepEqual(
    obterMenuPrincipal({ perfilEscolhido: "cliente" }).map((item) => item.id),
    ["diagnostico", "tabela-servicos"],
  );
});
test("selecionar perfil sem autenticação não expõe funções privadas", () => {
  for (const perfilEscolhido of ["mecanico", "admin", "revisor"])
    assert.deepEqual(
      obterMenuPrincipal({ perfilEscolhido }).map((item) => item.id),
      ["diagnostico"],
    );
});
test("admin mantém a administração e a exigência de primeiro acesso", () => {
  assert.deepEqual(
    obterMenuPrincipal({
      usuarioLogado: { perfil: "admin", deve_trocar_credenciais: false },
    }).map((item) => item.id),
    ["administracao"],
  );
  assert.deepEqual(
    obterMenuPrincipal({
      usuarioLogado: { perfil: "admin", deve_trocar_credenciais: true },
    }),
    [],
  );
  assert.deepEqual(
    obterMenuPrincipal({ usuarioLogado: { perfil: "mecanico" } }).map(
      (item) => item.id,
    ),
    obterMenuPrincipal({ perfil: "mecanico" }).map((item) => item.id),
  );
});
