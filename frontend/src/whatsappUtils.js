export function criarLinkWhatsApp(telefone, mensagem, userAgent = "") {
  const celular = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const numero = String(telefone).replace(/\D/g, "");
  const texto = encodeURIComponent(mensagem);
  return celular
    ? `https://wa.me/${numero}?text=${texto}`
    : `https://web.whatsapp.com/send?phone=${numero}&text=${texto}`;
}
