import { textosCatalogo } from "./textosCatalogo.js";
import {
  classificacaoGravidade,
  referenciaGravidade,
} from "./classificacaoGravidade.js";
// Catálogo de avaliação da branch: não escreve no PostgreSQL.
// Descrições próprias. Uma referência de modelo não valida outros veículos.
const fontes = {
  Xiaomi: {
    titulo: "Xiaomi · FAQ Electric Scooter 5 Plus · códigos de erro",
    url: "https://www.mi.com/ng/support/faq/details/KA-570964/",
    modelo: "Electric Scooter 5 Plus",
  },
  Ninebot: {
    titulo: "Segway · Manual E2 Pro · falhas comuns · pág. 06",
    url: "https://store.segway.com/media/code-baby/product-file-uploads/3091/E2_Pro_Product_Manual.pdf#page=8",
    modelo: "E2 Pro",
  },
  Bafang: {
    titulo: "Bafang · FAQ oficial · códigos do sistema",
    url: "https://www.bafang-e.com/en/oem-area/service/faqs/",
    modelo: "Família e display a confirmar",
  },
};

// Campos: fabricante, código, falha, componente, causas documentadas, conferência inicial.
const entradas = [
  [
    "Xiaomi",
    "10",
    "Painel sem comunicação com a controladora",
    "Comunicação",
    "Conexão deficiente, umidade ou circuito danificado.",
    "Inspecionar o cabo de comunicação.",
  ],
  [
    "Xiaomi",
    "14",
    "Posição do acelerador fora do esperado",
    "Acelerador",
    "Comando preso, acionado na partida ou fiação danificada.",
    "Conferir o retorno do acelerador.",
  ],
  [
    "Xiaomi",
    "15",
    "Leitura irregular da manete de freio",
    "Freio",
    "Manete acionada na partida ou ligação do sensor danificada.",
    "Conferir o retorno da manete.",
  ],
  [
    "Xiaomi",
    "18",
    "Sinal Hall do motor com falha",
    "Motor",
    "Sensor, conexão ou circuito de leitura.",
    "Verificar as conexões conforme o manual.",
  ],
  [
    "Xiaomi",
    "21",
    "Comunicação da bateria interrompida",
    "Bateria / BMS",
    "Bateria incompatível, firmware ou circuito de comunicação.",
    "Confirmar a bateria instalada.",
  ],
  [
    "Xiaomi",
    "24",
    "Sobretensão identificada na bateria",
    "Bateria / BMS",
    "Bateria envelhecida ou incompatível.",
    "Conferir a especificação da bateria.",
  ],
  [
    "Ninebot",
    "10",
    "Falha no enlace de comunicação do painel",
    "Comunicação",
    "Painel ou cabeamento relacionado.",
    "Conferir painel e cabeamento conforme o manual.",
  ],
  [
    "Ninebot",
    "14",
    "Falha no sinal Hall do acelerador",
    "Acelerador",
    "Comando, painel ou cabeamento relacionado.",
    "Conferir o conjunto indicado no manual.",
  ],
  [
    "Ninebot",
    "18",
    "Leitura Hall do motor anormal",
    "Motor",
    "O manual pede avaliação da controladora.",
    "Encaminhar para verificação da controladora.",
  ],
  [
    "Ninebot",
    "19",
    "Definição do código depende do modelo",
    "Em revisão",
    "Sem definição oficial confirmada nesta revisão.",
    "Identificar modelo e consultar o suporte oficial.",
  ],
  [
    "Bafang",
    "04",
    "Acelerador fora da posição inicial",
    "Acelerador",
    "Retorno incorreto do comando.",
    "Confirmar o retorno do acelerador.",
  ],
  [
    "Bafang",
    "08",
    "Falha relacionada ao sensor Hall",
    "Motor",
    "Causa específica depende do sistema.",
    "Consultar o procedimento do conjunto instalado.",
  ],
  [
    "Bafang",
    "21",
    "Falha relacionada ao sensor de velocidade",
    "Sensor de velocidade",
    "Causa específica depende do sistema.",
    "Identificar sensor e consultar o manual.",
  ],
  [
    "Bafang",
    "30",
    "Comunicação do sistema indisponível",
    "Comunicação",
    "Causa específica depende do sistema.",
    "Identificar o sistema de comunicação instalado.",
  ],
];

export const catalogoDiagnosticos = entradas.map(
  ([fabricante, codigo, descricao, componente, causas, verificacao]) => {
    const erro10Xiaomi = fabricante === "Xiaomi" && codigo === "10";
    const fonte = erro10Xiaomi
      ? {
          titulo: "Xiaomi · Mi Electric Scooter · suporte para alarme 10",
          url: "https://www.mi.com/sg/support/faq/details/KA-07514/",
          modelo: "M365 / M365 Pro — confirmar versão",
        }
      : fontes[fabricante];
    const pendente = fabricante === "Ninebot" && codigo === "19";
    return {
      id: `${fabricante.toLowerCase()}-${codigo}`,
      gravidade:
        classificacaoGravidade[`${fabricante.toLowerCase()}-${codigo}`] ||
        "unknown",
      referenciaGravidade,
      fabricante,
      codigo,
      descricao: erro10Xiaomi
        ? "Falha de comunicação do painel / módulo BLE"
        : descricao,
      componente,
      modelo: pendente ? "Modelo a confirmar" : fonte.modelo,
      estado: pendente ? "Definição pendente" : "Compatibilidade a confirmar",
      roteiro: {
        aplicabilidade: pendente
          ? "O manual E2 Pro consultado não define o código 19. Não aplique a definição de outro código ou modelo."
          : `Referência: ${fonte.modelo}. Confirme o veículo, display e versão antes de aplicar esta ficha.`,
        sintomas: erro10Xiaomi
          ? "Alarme 10 e motor sem resposta ao acelerador. Em algumas apresentações do painel, os quatro indicadores de carga podem permanecer acesos."
          : "Sintomas específicos não documentados nesta ficha. Registre o comportamento observado no veículo.",
        causas: erro10Xiaomi
          ? "A indicação está relacionada à comunicação do painel/BLE. O código não confirma se a origem está no chicote, no conector ou na eletrônica; é necessário diagnóstico."
          : causas,
        verificacoes: erro10Xiaomi
          ? [
              "Triagem E-Diagnóstico: com o veículo desligado, confira danos visíveis no cabo que passa pela haste. Identifique a versão antes de acessar conexões internas.",
              "Na avaliação técnica, inspecione o trajeto acessível do chicote na haste quanto a danos ou prensamento. Antes de manusear conexões internas, siga o isolamento de energia indicado pelo fabricante.",
              "Confira o encaixe e a integridade do conector correto para a versão. Não adote quantidade de pinos ou pinagem de outro modelo e não force terminais.",
            ]
          : [verificacao],
        observacao:
          "Triagem E-Diagnóstico: registre o código completo, modelo, condições de ocorrência e verificações realizadas. Não conclua a troca de peças somente pelo código.",
        proximoPasso: erro10Xiaomi
          ? "A orientação oficial da Xiaomi é procurar o serviço pós-venda. Não conclua troca do painel ou da controladora apenas pelo alarme 10."
          : "Se a falha permanecer, procure assistência e utilize o procedimento oficial específico. Não abra bateria ou componentes energizados.",
        fonte: fonte.titulo,
        url: fonte.url,
        ...textosCatalogo[`${fabricante.toLowerCase()}-${codigo}`],
      },
    };
  },
);

export function normalizarFabricanteCatalogo(valor = "") {
  const nome = valor.trim().toLowerCase();
  return ["segway", "segway-ninebot", "segway ninebot", "ninebot"].includes(
    nome,
  )
    ? "ninebot"
    : nome;
}

export function filtrarCatalogo({
  busca = "",
  fabricante = "",
  componente = "",
} = {}) {
  const normalizar = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const termo = normalizar(busca.trim());
  return catalogoDiagnosticos.filter(
    (item) =>
      (!fabricante ||
        normalizarFabricanteCatalogo(fabricante) ===
          normalizarFabricanteCatalogo(item.fabricante)) &&
      (!componente || item.componente === componente) &&
      (!termo ||
        (/^\d+$/.test(termo)
          ? Number(item.codigo) === Number(termo)
          : normalizar(
              [
                item.descricao,
                item.fabricante,
                item.componente,
                item.roteiro.causas,
                item.roteiro.sintomas,
                item.modelo,
              ].join(" "),
            ).includes(termo))),
  );
}

export function resultadoCatalogo(item) {
  return {
    codigo: item.codigo,
    quantidade_fontes: 1,
    imagens: [],
    referenciaCatalogo: item.id,
    resultados: [
      {
        code: item.codigo,
        description: item.descricao,
        manufacturer: item.fabricante,
        component_type: item.componente,
        verification_status: "pending",
        severity: item.gravidade,
        severity_origin: "external_reference",
        severity_reference_url: item.referenciaGravidade.url,
        source_title: item.roteiro.fonte,
        source_url: item.roteiro.url,
      },
    ],
  };
}
