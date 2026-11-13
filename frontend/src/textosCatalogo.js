// Redação própria baseada nas referências oficiais indicadas em cada ficha.
// As conferências visuais de triagem não substituem procedimentos de oficina.
export const textosCatalogo = {
  "xiaomi-14": {
    sintomas:
      "Código 14: leitura do acelerador fora da condição esperada na partida.",
    verificacoes: [
      "Solte o acelerador e confira seu retorno.",
      "Com o veículo desligado, observe obstruções e danos externos. Avaliação interna exige procedimento técnico.",
    ],
    observacao:
      "Registre se o comando retorna livremente e se o aviso reaparece.",
    proximoPasso:
      "Se persistir, solicite avaliação do acelerador e do circuito de leitura; não troque peças pelo código isolado.",
  },
  "xiaomi-15": {
    sintomas:
      "Código 15: sinal ou posição da manete de freio fora do esperado na partida.",
    verificacoes: [
      "Solte a manete e confira seu retorno.",
      "Com o veículo desligado, observe travamento ou dano aparente no cabo. Não altere a regulagem do freio para ocultar o aviso.",
    ],
    observacao:
      "Registre o retorno da manete e a recorrência do alerta. O desaparecimento do código não comprova a segurança da frenagem.",
    proximoPasso:
      "Persistindo, encaminhe para diagnóstico do sensor, conexões e leitura no painel.",
  },
  "xiaomi-18": {
    sintomas:
      "Código 18: o sistema detecta leitura irregular dos sensores Hall do motor.",
    verificacoes: [
      "Com o veículo desligado, observe danos externos no cabo do motor.",
      "A oficina deve diferenciar conexão, sensor e leitura na controladora conforme o manual.",
    ],
    observacao:
      "Não há valores de medição definidos nesta ficha. Registre a condição do cabo e o diagnóstico da oficina.",
    proximoPasso:
      "Solicite avaliação do conjunto motor/controladora antes de substituir componentes.",
  },
  "xiaomi-21": {
    sintomas:
      "Código 21: falha na troca de dados entre bateria e controladora.",
    verificacoes: [
      "Identifique a bateria e o histórico de firmware.",
      "Confirme compatibilidade com assistência técnica; não abra o pack nem instale firmware de terceiros como tentativa de reparo.",
    ],
    observacao:
      "Registre modelo da bateria e alterações anteriores. A ficha não determina qual circuito falhou.",
    proximoPasso:
      "Encaminhe para avaliação de compatibilidade e comunicação da bateria.",
  },
  "xiaomi-24": {
    sintomas:
      "Código 24: no Scooter 5 Plus, o sistema indica sobretensão da bateria.",
    verificacoes: [
      "Confira identificação e compatibilidade da bateria.",
      "A avaliação de tensão deve seguir o manual, com profissional habilitado. Esta ficha não fixa limites elétricos.",
    ],
    observacao:
      "A definição é específica da referência 5 Plus; não generalize os limites para M365 ou outras versões.",
    proximoPasso:
      "Encaminhe a bateria para avaliação. Não tente descarregar, abrir ou adaptar o pack para eliminar o aviso.",
  },
  "ninebot-10": {
    sintomas:
      "No E2 Pro, o código 10 identifica comunicação anormal do painel.",
    verificacoes: [
      "Com o veículo desligado, observe danos visíveis no chicote da haste.",
      "A avaliação técnica deve conferir painel e cabos associados, seguindo o manual do E2 Pro.",
    ],
    observacao:
      "Registre o estado das conexões e a recorrência do aviso. Não use pinagem de outra versão.",
    proximoPasso:
      "Se continuar, solicite diagnóstico do painel e do cabeamento antes de substituir componentes.",
  },
  "ninebot-14": {
    sintomas: "Código 14 no E2 Pro: sinal Hall do acelerador irregular.",
    verificacoes: [
      "Com o veículo desligado, confira o movimento e o retorno do acelerador.",
      "A avaliação de oficina deve abranger acelerador, painel e cabos, sem forçar terminais ou pontes elétricas.",
    ],
    observacao:
      "Retorno mecânico normal não comprova sinal elétrico correto. Não há valores de tensão definidos nesta ficha.",
    proximoPasso:
      "Persistindo o código, peça avaliação do comando e do circuito relacionado no E2 Pro.",
  },
  "ninebot-18": {
    sintomas:
      "Código 18 no E2 Pro: leitura dos sensores Hall do motor anormal.",
    verificacoes: [
      "Registre o código e confirme o modelo E2 Pro.",
      "O manual direciona a avaliação para a controladora; não atribua automaticamente a falha ao motor.",
    ],
    observacao:
      "A leitura anormal não identifica sozinha a peça defeituosa. A confirmação depende de testes técnicos específicos.",
    proximoPasso:
      "Encaminhe para diagnóstico da controladora conforme o manual, antes de abrir o motor ou trocar peças.",
  },
  "ninebot-19": {
    sintomas:
      "Significado e sintomas ainda não confirmados para o modelo. Esta ficha não atribui o código 19 a um componente.",
    verificacoes: [
      "Anote o modelo completo e fotografe a indicação 19.",
      "Consulte o aplicativo e o suporte Segway-Ninebot para obter a definição da versão instalada.",
    ],
    observacao:
      "Não existe critério de aprovação técnica cadastrado para este código. Não confunda 19 com 39 ou outro alerta.",
    proximoPasso:
      "Aguarde confirmação documental do modelo antes de executar um procedimento ou recomendar peça.",
  },
  "bafang-04": {
    sintomas:
      "O display apresenta 04 quando o acelerador não retorna à posição correta.",
    causas:
      "Retorno do acelerador fora do esperado. O roteiro oficial também prevê avaliação da controladora quando o comando não está preso.",
    verificacoes: [
      "Identifique o sistema e o display antes de aplicar o roteiro Bafang 04.",
      "Com o veículo desligado, confira se o acelerador está preso ou retorna livremente.",
      "Se não houver travamento aparente, a oficina deve seguir a diferenciação entre acelerador e controladora indicada no documento.",
    ],
    observacao:
      "O roteiro considera o código inativo após a conferência do sistema. Registre também o retorno do comando; não use apenas o desaparecimento do alerta como laudo.",
    proximoPasso:
      "Se o 04 continuar após a avaliação, contate a assistência Bafang com os resultados. Não substitua automaticamente a controladora.",
    fonte: "Bafang · Procedimento oficial · erro 04",
    url: "https://www.bafang-e.com/uploaded/errcode/202209091001382527.pdf",
  },
  "bafang-08": {
    sintomas:
      "O display apresenta 08 para uma falha relacionada aos sensores Hall do motor.",
    causas:
      "O documento prevê verificar conexões do motor em sistemas FM/RM. Mau contato, corrosão ou dano no chicote podem exigir avaliação.",
    verificacoes: [
      "Confirme a família do motor: a inspeção de conectores descrita no documento é destinada a FM/RM.",
      "Após o isolamento de energia conforme o fabricante, a oficina deve observar folgas, corrosão, pinos danificados e isolamento comprometido.",
      "Não abra o motor nem aplique tensões presumidas; testes e intervenções dependem da configuração instalada.",
    ],
    observacao:
      "O roteiro verifica se o 08 fica inativo após a intervenção e reconexão. Registre o que foi encontrado; a ficha não fornece pinagem universal.",
    proximoPasso:
      "Se o aviso continuar com as conexões conferidas, siga o roteiro específico e acione a assistência antes de recomendar motor novo.",
    fonte: "Bafang · Procedimento oficial · erro 08",
    url: "https://www.bafang-e.com/uploaded/errcode/202209091004265437.pdf",
  },
  "bafang-21": {
    sintomas:
      "O display apresenta 21 e o motor pode ficar indisponível no sistema descrito pelo documento.",
    causas:
      "A investigação oficial inclui ímã, sensor de velocidade, conexões e leitura do sinal. A causa precisa ser confirmada por etapa.",
    verificacoes: [
      "Confirme a família do sistema e registre se o código permanece após a reinicialização prevista no manual.",
      "Confira alinhamento e distância entre sensor e ímã usando a especificação do conjunto instalado; não adote uma medida universal.",
      "A oficina deve conferir o chicote e, quando aplicável, verificar o sinal com BESST antes de avançar para substituições.",
    ],
    observacao:
      "O roteiro verifica a recuperação do sinal e a inatividade do 21. Guarde as observações do sensor e as leituras disponíveis no diagnóstico.",
    proximoPasso:
      "Se não houver recuperação, siga a sequência oficial para sensor e sistema. Não conclua defeito do motor somente pelo código 21.",
    fonte: "Bafang · Procedimento oficial · erro 21",
    url: "https://www.bafang-e.com/uploaded/errcode/202209091016375212.pdf",
  },
  "bafang-30": {
    sintomas:
      "O display apresenta 30 e o motor pode ficar indisponível no sistema descrito pelo documento.",
    causas:
      "Falha na comunicação do sistema. O roteiro verifica conectores, chicote, diagnóstico BESST, display e EB-BUS.",
    verificacoes: [
      "Identifique a família do sistema, o display e os componentes instalados.",
      "Após o isolamento previsto no manual, a oficina deve conferir conectores e chicote quanto a folgas, sujeira e danos.",
      "Se a inspeção não esclarecer a falha, utilize o diagnóstico BESST compatível antes de avaliar substituição de display ou EB-BUS.",
    ],
    observacao:
      "O documento verifica se o código 30 fica inativo após a intervenção. Registre a falha identificada e o resultado da comunicação.",
    proximoPasso:
      "Persistindo o 30, avance pelo roteiro oficial com a assistência Bafang. Não faça pontes ou trocas de firmware sem procedimento aplicável.",
    fonte: "Bafang · Procedimento oficial · erro 30",
    url: "https://www.bafang-e.com/uploaded/errcode/202209091019223948.pdf",
  },
};
