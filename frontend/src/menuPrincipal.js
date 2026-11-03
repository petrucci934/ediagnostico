const diagnostico = {
  id: "diagnostico",
  texto: "Diagnóstico",
  tela: "diagnostico",
  abaCliente: "falhas",
};
const tabelaServicos = {
  id: "tabela-servicos",
  texto: "Tabela de serviços",
  tela: "diagnostico",
  abaCliente: "tabela",
};
const itensMecanico = [
  {
    id: "biblioteca",
    texto: "Biblioteca Técnica",
    tela: "testes",
    abaTeste: "biblioteca",
  },
  {
    id: "novo-teste",
    texto: "Novo teste",
    tela: "testes",
    abaTeste: "novo-teste",
  },
  {
    id: "historico-testes",
    texto: "Histórico de testes",
    tela: "testes",
    abaTeste: "historico-testes",
  },
  {
    id: "precificacao",
    texto: "Precificação de Serviços",
    tela: "precificacao",
  },
  {
    id: "orcamento",
    texto: "Orçamento",
    tela: "testes",
    abaTeste: "orcamento",
  },
  { id: "atendimentos", texto: "Atendimentos", tela: "atendimentos" },
  {
    id: "cadastros",
    texto: "Cadastros da oficina",
    tela: "cadastros",
  },
];

export function obterMenuPrincipal({
  perfil = "",
  usuarioLogado = null,
  perfilEscolhido = "",
} = {}) {
  const perfilAtual = usuarioLogado?.perfil || perfil;
  if (perfilAtual === "admin") {
    return usuarioLogado?.deve_trocar_credenciais
      ? []
      : [
          {
            id: "administracao",
            texto: "Administrador",
            tela: "administracao",
          },
        ];
  }
  if (perfilAtual === "mecanico")
    return [diagnostico, ...itensMecanico].sort((a, b) =>
      a.texto.localeCompare(b.texto, "pt-BR"),
    );
  if (
    perfilAtual === "cliente" ||
    (!perfilAtual && perfilEscolhido === "cliente")
  )
    return [diagnostico, tabelaServicos];
  return [diagnostico];
}

export function itemMenuAtivo(item, estado) {
  if (estado.telaAtual !== item.tela) return false;
  if (item.abaTeste) return estado.abaTeste === item.abaTeste;
  if (item.abaCliente) return estado.abaCliente === item.abaCliente;
  if (item.abaCadastroInicial)
    return estado.abaCadastroInicial === item.abaCadastroInicial;
  return true;
}
