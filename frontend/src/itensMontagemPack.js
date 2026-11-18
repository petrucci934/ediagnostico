// Cada item pode receber produto (nome do anúncio) e imagem (foto local ou HTTPS).
// Adicione os links reais em cada item, por exemplo:
// links: [{ loja: "Nome da loja", url: "https://...seu-link-de-afiliado..." }]
// Endereços marcados com teste: true não são publicados como links de compra.
// Link opcional para a lista completa de recomendações, com o mesmo formato.
export const listaCompletaPack = null;

export const gruposMontagemPack = [
  {
    id: "celulas-conexoes",
    titulo: "Células e conexões",
    icone: "bateria",
    itens: [
      {
        id: "celulas",
        nome: "Células de bateria",
        descricao:
          "Confira fabricante, procedência, química, formato e corrente admissível. Use células compatíveis entre si e com o projeto.",
        links: [],
      },
      {
        id: "niquel",
        nome: "Fita de níquel",
        descricao:
          "Confira o material e dimensione largura, espessura e conexões pela corrente e pelo processo de união. O desenho não define essas medidas.",
        links: [],
      },
      {
        id: "suportes",
        nome: "Suportes e espaçadores de células",
        descricao:
          "Escolha conforme o formato das células e o arranjo mecânico; devem ajudar a manter posição e separação.",
        links: [],
      },
      {
        id: "cabos-conectores",
        nome: "Cabos, conectores e terminais",
        descricao:
          "Para potência, carga e sinais. Verifique corrente, tensão, bitola, polaridade e compatibilidade dos conectores.",
        links: [],
      },
    ],
  },
  {
    id: "protecao-isolamento",
    titulo: "Proteção e isolamento",
    icone: "protecao",
    itens: [
      {
        id: "bms",
        nome: "BMS, chicote de leitura e sensores",
        descricao:
          "Confira química, quantidade de grupos em série, correntes de carga/descarga, sensores e pinagem. S sozinho não comprova compatibilidade.",
        links: [],
      },
      {
        id: "fusivel",
        nome: "Fusível e porta-fusível",
        descricao:
          "A proteção deve ser definida pelo projeto: tensão em corrente contínua, corrente e capacidade de interrupção adequadas.",
        links: [],
      },
      {
        id: "isolantes",
        nome: "Papel isolante e anéis para os polos",
        descricao:
          "Barreiras e anéis isolantes apropriados ao formato das células e aos pontos de contato previstos no projeto.",
        links: [],
      },
      {
        id: "fitas-termorretratil",
        nome: "Fita isolante técnica e termorretrátil",
        descricao:
          "Confira especificações elétricas, térmicas e mecânicas. O revestimento externo não substitui as barreiras internas de isolamento.",
        links: [],
      },
      {
        id: "caixa",
        nome: "Caixa, fixação e proteção dos cabos",
        descricao:
          "Considere impactos, vibração, umidade, alívio de tração e gestão térmica conforme a aplicação.",
        links: [],
      },
    ],
  },
  {
    id: "montagem",
    titulo: "Ferramentas de montagem",
    icone: "ferramentas",
    itens: [
      {
        id: "soldadora-pontos",
        imagem: "/images/produtos/soldadora-pontos.webp",
        nome: "Soldadora por pontos",
        descricao:
          "Confira compatibilidade com o material e a espessura das conexões, além da fonte de energia, cabos e eletrodos exigidos pelo equipamento.",
        links: [
          {
            loja: "Mercado Livre",
            url: "https://www.mercadolivre.com.br/soldador-por-ponto-portatil-5v-2a-5-niveis/up/MLBU4413680912?pdp_filters=item_id%3AMLB4933829227&sid=bookmarks#polycard_client=bookmark&wid=MLB4933829227&sid=bookmarks",
          },
        ],
        produto: "Soldador por ponto portátil — 5 níveis",
      },
      {
        id: "alicates",
        nome: "Alicates de corte, decapagem e crimpagem",
        descricao:
          "Ferramentas e matrizes adequadas às bitolas e aos terminais utilizados; confira também a isolação necessária.",
        links: [],
      },
      {
        id: "estacao-solda",
        nome: "Estação de solda e consumíveis",
        descricao:
          "Quando previstos para cabos e eletrônica. Não é indicação de soldagem com estanho diretamente nos polos das células.",
        links: [],
      },
      {
        id: "soprador",
        nome: "Soprador térmico",
        descricao:
          "Quando necessário para o acabamento termorretrátil, conforme o processo definido. Evite aquecimento indevido das células e componentes.",
        links: [],
      },
      {
        id: "parafusadeira",
        imagem: "/images/produtos/parafusadeira.webp",
        nome: "Parafusadeira — opcional",
        descricao:
          "Ferramenta opcional para parafusos de caixas e suportes. Confira as pontas e o controle de torque; não substitui as ferramentas específicas do processo.",
        links: [
          {
            loja: "Mercado Livre",
            url: "https://www.mercadolivre.com.br/parafusadeira-sem-fio-cyberlite-qb-10-168v-vermelha/up/MLBU5708279369?pdp_filters=item_id%3AMLB7914418426&sid=bookmarks#polycard_client=bookmark&wid=MLB7914418426&sid=bookmarks",
          },
        ],
        produto: "Parafusadeira sem fio Cyberlite QB-10",
      },
      {
        id: "kit-estanho",
        imagem: "/images/produtos/kit-estanho.webp",
        nome: "Consumíveis para solda de cabos e eletrônica",
        descricao:
          "Consumíveis de soldagem para aplicações compatíveis em cabos e eletrônica. Não inclui estação de solda e não é indicação de soldagem direta nos polos das células.",
        links: [
          {
            loja: "Mercado Livre",
            url: "https://www.mercadolivre.com.br/kit-de-solda-cobix-fio-estanho-60x40-1mm-500g-e-pasta-de-solda-110g/p/MLB74424104?sid=bookmarks#polycard_client=bookmark&wid=MLB4809913433&sid=bookmarks",
          },
        ],
        produto: "Kit Cobix — estanho e pasta de solda",
      },
    ],
  },
  {
    id: "medicao-bancada",
    titulo: "Medição e bancada",
    icone: "medicao",
    itens: [
      {
        id: "multimetro",
        imagem: "/images/produtos/multimetro-gm-bear.webp",
        nome: "Multímetro e pontas de prova",
        descricao:
          "Verifique limites e proteção do instrumento e acessórios para as medições previstas no projeto.",
        links: [
          {
            loja: "Mercado Livre",
            url: "https://www.mercadolivre.com.br/multimetro-digital-gm-bear-pf102wy-profissional-automatico-com-tela-lcd-para-tensao-e-corrente/p/MLB64533128?pdp_filters=item_id%3AMLB7562225514&sid=bookmarks#polycard_client=bookmark&wid=MLB7562225514&sid=bookmarks",
          },
        ],
        produto: "Multímetro digital GM Bear PF102WY",
      },
      {
        id: "analisador",
        nome: "Analisador de células",
        descricao:
          "Equipamento compatível com a química e o formato para avaliar capacidade e resistência interna, segundo um procedimento definido.",
        links: [],
      },
      {
        id: "carregador",
        nome: "Carregador e equipamento de ensaio",
        descricao:
          "Confira química, tensão final de carga e corrente; a tensão nominal da simulação não define a tensão do carregador.",
        links: [],
      },
      {
        id: "bancada-epi",
        nome: "Proteção pessoal e bancada organizada",
        descricao:
          "Proteção ocular, superfície não condutiva e ferramentas apropriadas ao trabalho, além das medidas de segurança definidas para o local.",
        links: [],
      },
      {
        id: "multimetro-azul",
        imagem: "/images/produtos/multimetro-azul.webp",
        nome: "Multímetro — alternativa",
        descricao:
          "Alternativa ao outro multímetro listado; não é necessário comprar ambos. Confira modelo, limites de medição, proteção e acessórios no anúncio e no manual.",
        links: [
          {
            loja: "Mercado Livre",
            url: "https://meli.la/2WBpy9E",
          },
        ],
        produto: "Multímetro digital portátil azul",
      },
    ],
  },
];

export function linkCompraPack(link) {
  if (link?.teste || typeof link?.loja !== "string" || !link.loja.trim())
    return null;
  try {
    const url = new URL(link.url);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !url.hostname.includes(".")
    )
      return null;
    return { loja: link.loja.trim(), url: url.href };
  } catch {
    return null;
  }
}
