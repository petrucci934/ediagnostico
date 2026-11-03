import { test } from "node:test";
import assert from "node:assert/strict";
import { criarLinkWhatsApp } from "../src/whatsappUtils.js";

const mensagem = "Olá, Petrucci! 😊\n🔧 *Serviços e peças*\n💰 *Total: R$ 580,00*";

test("computador abre diretamente o WhatsApp Web preservando a mensagem", () => {
  const url = new URL(criarLinkWhatsApp("+55 (11) 99999-9999", mensagem, "Mozilla/5.0 (X11; Linux x86_64)"));
  assert.equal(url.origin, "https://web.whatsapp.com");
  assert.equal(url.pathname, "/send");
  assert.equal(url.searchParams.get("phone"), "5511999999999");
  assert.equal(url.searchParams.get("text"), mensagem);
});

test("celular mantém link móvel e preserva emojis, negrito e quebras de linha", () => {
  for (const dispositivo of ["Android Mobile", "iPhone", "iPad"]) {
    const url = new URL(criarLinkWhatsApp("5511999999999", mensagem, dispositivo));
    assert.equal(url.origin, "https://wa.me");
    assert.equal(url.searchParams.get("text"), mensagem);
  }
});
