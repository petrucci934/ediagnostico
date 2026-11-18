import test from "node:test";
import assert from "node:assert/strict";
import { linkCompraPack } from "../src/itensMontagemPack.js";

test("links de teste e destinos inválidos não viram links de compra", () => {
  for (const link of [
    { loja: "Teste", url: "http://petrucciteste", teste: true },
    { loja: "Teste", url: "https://example.com/produto", teste: true },
    { loja: "Loja", url: "javascript:alert(1)" },
    { loja: "Loja", url: "data:text/html,teste" },
    { loja: "Loja", url: "http://example.com/produto" },
    { loja: "Loja", url: "https://usuario:senha@example.com/produto" },
    { loja: "Loja", url: "" },
    { loja: "", url: "https://example.com/produto" },
    null,
  ])
    assert.equal(linkCompraPack(link), null);
});

test("preserva parâmetros e fragmento do link de afiliado", () => {
  const url =
    "https://example.com/produto?tag=parceiro-20&ref=abc%2F123#oferta";
  assert.deepEqual(linkCompraPack({ loja: " Minha loja ", url }), {
    loja: "Minha loja",
    url,
  });
});
