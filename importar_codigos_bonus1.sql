BEGIN;

-- Fonte: manual genérico fornecido pelo usuário.
INSERT INTO technical_sources (title, source_url, notes)
SELECT
    'Bônus 1 — Tabela Mestra de Códigos de Erro de Display e Painel',
    NULL,
    'Fonte fornecida pelo usuário. Manual genérico; o próprio documento alerta que os códigos variam entre marcas e modelos. Validar cada código e procedimento com documentação oficial antes de orientar reparos.'
WHERE NOT EXISTS (
    SELECT 1
    FROM technical_sources
    WHERE title = 'Bônus 1 — Tabela Mestra de Códigos de Erro de Display e Painel'
);

-- Códigos transcritos do manual. Nenhuma marca ou modelo atribuído.
WITH dados (codigo, descricao, verificacao) AS (
    VALUES
    ('P001', 'Sobretensão da bateria', 'Verifique se a tensão da bateria está acima do limite permitido. O manual recomenda inspecionar o carregador e o BMS.'),
    ('P002', 'Subtensão da bateria', 'Verifique se a tensão da bateria está abaixo do nível adequado. O manual recomenda inspecionar descarga profunda.'),
    ('P003', 'Falha de célula', 'O manual descreve uma ou mais células fora da faixa e recomenda verificar balanceamento e BMS.'),
    ('P004', 'Temperatura alta da bateria', 'O manual recomenda inspecionar ventilação e sensores quando a bateria estiver acima da temperatura segura.'),
    ('P005', 'Temperatura baixa da bateria', 'O manual recomenda aguardar que a bateria esteja em temperatura adequada antes do uso.'),
    ('P006', 'Falha de comunicação com BMS', 'Verifique conectores, chicote e alimentação do BMS.'),
    ('P007', 'Proteção por corrente', 'O manual recomenda verificar carga, controlador ou carregador quando a corrente exceder o limite.'),
    ('P008', 'Falha de carga', 'Verifique carregador, porta de carga e BMS.'),

    ('P100', 'Falha de Hall do motor', 'Verifique os sensores Hall, a fiação e o conector do motor.'),
    ('P101', 'Falha de fase U, V ou W', 'Verifique os cabos de fase, conectores e resistência interna do motor.'),
    ('P102', 'Curto entre fases', 'O manual recomenda verificar o isolamento dos cabos e do motor.'),
    ('P103', 'Sobretemperatura do controlador', 'Verifique dissipação de calor e carga aplicada.'),
    ('P104', 'Falha de comunicação com motor', 'Inspecione chicote, conectores e sensores de posição do motor.'),
    ('P105', 'Corrente do motor sobrecarregada ou motor travado', 'Verifique a rotação da roda e o estado do controlador.'),
    ('P106', 'Falha de aceleração inicial', 'Verifique o sinal do acelerador e os parâmetros do controlador.'),
    ('P107', 'Falha no inversor ou problema interno do controlador', 'Verifique a alimentação e os sinais do controlador.'),

    ('P200', 'Falha no acelerador', 'Verifique conector, fios e sinal do acelerador.'),
    ('P201', 'Sinal do acelerador fora da faixa', 'O manual recomenda calibrar ou substituir o acelerador e inspecionar a fiação.'),
    ('P202', 'Acelerador travado ou sinal fixo em aceleração', 'Inspecione o acelerador e o chicote.'),
    ('P203', 'Falha no comando de marcha', 'Verifique o seletor, conectores e alimentação.'),
    ('P204', 'Falha no botão mode', 'Verifique o botão, a fiação e a programação.'),
    ('P205', 'Falha no modo de condução', 'Verifique a comunicação entre o painel e o controlador.'),

    ('P300', 'Freio dianteiro acionado', 'Verifique o sensor do freio dianteiro e o ajuste da manete.'),
    ('P301', 'Freio traseiro acionado', 'Verifique o sensor do freio traseiro e o ajuste da manete.'),
    ('P302', 'Cavalete acionado', 'Verifique o sensor do cavalete lateral ou seu ajuste de segurança.'),
    ('P303', 'Kill switch acionado', 'Inspecione a chave de emergência ou a chave de segurança.'),
    ('P304', 'Falha no sensor de freio', 'Verifique o sensor, chicote e conector.'),
    ('P305', 'Sistema de segurança bloqueado ou interlock ativo', 'Inspecione todos os sensores de segurança.'),

    ('P400', 'Falha de comunicação CAN', 'Verifique os fios CAN, terminações e alimentação dos módulos.'),
    ('P401', 'Painel sem comunicação', 'Verifique a alimentação do painel e a conexão com o controlador.'),
    ('P402', 'Display apagado', 'Verifique o fusível, a alimentação e possível defeito no display.'),
    ('P403', 'Display com erro interno', 'O manual recomenda verificar falha interna do painel e substituí-lo se necessário.'),
    ('P404', 'Dados incorretos no painel', 'Verifique parâmetros do sistema e sensores.'),
    ('P405', 'Falha no firmware', 'O manual recomenda atualizar o software ou verificar erro de programação.'),

    ('P500', 'Falha no carregador', 'Verifique carregador, conector e temperatura.'),
    ('P501', 'Falha na iluminação', 'Verifique lâmpadas, fios e controlador de luz.'),
    ('P502', 'Falha na buzina', 'Verifique buzina, relé e alimentação de 12 V.'),
    ('P503', 'Falha no conversor DC-DC', 'Verifique o conversor e a saída de 12 V.'),
    ('P504', 'Falha no sistema de 12 V', 'Verifique bateria auxiliar de 12 V, fusíveis e conexões.'),
    ('P505', 'Alarme antifurto acionado', 'O manual recomenda verificar chave, aplicativo ou módulo de segurança.')
)
INSERT INTO fault_codes (
    code,
    description,
    severity,
    verification_status
)
SELECT
    d.codigo,
    d.descricao,
    'unknown',
    'pending'
FROM dados d
WHERE NOT EXISTS (
    SELECT 1
    FROM fault_codes fc
    WHERE UPPER(TRIM(fc.code)) = d.codigo
);

-- Vincula cada código à fonte documental.
INSERT INTO fault_code_sources (fault_code_id, source_id)
SELECT fc.id, ts.id
FROM fault_codes fc
CROSS JOIN technical_sources ts
WHERE UPPER(TRIM(fc.code)) IN (
    'P001','P002','P003','P004','P005','P006','P007','P008',
    'P100','P101','P102','P103','P104','P105','P106','P107',
    'P200','P201','P202','P203','P204','P205',
    'P300','P301','P302','P303','P304','P305',
    'P400','P401','P402','P403','P404','P405',
    'P500','P501','P502','P503','P504','P505'
)
AND ts.title = 'Bônus 1 — Tabela Mestra de Códigos de Erro de Display e Painel'
AND NOT EXISTS (
    SELECT 1
    FROM fault_code_sources fcs
    WHERE fcs.fault_code_id = fc.id
      AND fcs.source_id = ts.id
);

-- Registra a verificação do manual como referência, não como reparo validado.
WITH verificacoes (codigo, instrucao) AS (
    VALUES
    ('P001', 'Manual genérico: verifique a tensão da bateria e consulte a orientação sobre carregador e BMS. Confirmar limites na documentação oficial do modelo.'),
    ('P002', 'Manual genérico: verifique a tensão da bateria e possível descarga profunda. Confirmar limites na documentação oficial do modelo.'),
    ('P003', 'Manual genérico: verificar balanceamento e BMS conforme documentação oficial aplicável.'),
    ('P004', 'Manual genérico: verificar temperatura, ventilação e sensores conforme documentação oficial aplicável.'),
    ('P005', 'Manual genérico: verificar a faixa de temperatura permitida na documentação oficial.'),
    ('P006', 'Manual genérico: verificar conectores, chicote e alimentação do BMS conforme documentação oficial.'),
    ('P007', 'Manual genérico: verificar os limites de corrente e os componentes indicados pelo fabricante.'),
    ('P008', 'Manual genérico: verificar carregador, porta de carga e BMS conforme documentação oficial.'),
    ('P100', 'Manual genérico: verificar sensores Hall, fiação e conector do motor conforme documentação oficial.'),
    ('P101', 'Manual genérico: verificar cabos e conectores de fase segundo o procedimento do fabricante.'),
    ('P102', 'Manual genérico: verificar isolamento somente com método e equipamento adequados ao sistema.'),
    ('P103', 'Manual genérico: verificar dissipação de calor e carga aplicada segundo as especificações do fabricante.'),
    ('P104', 'Manual genérico: verificar chicote, conectores e sensores de posição conforme documentação oficial.'),
    ('P105', 'Manual genérico: verificar rotação da roda e controlador, respeitando os procedimentos de segurança.'),
    ('P106', 'Manual genérico: verificar sinal do acelerador e parâmetros do controlador conforme documentação oficial.'),
    ('P107', 'Manual genérico: verificar alimentação e sinais do controlador conforme documentação oficial.'),
    ('P200', 'Manual genérico: verificar conector, fios e sinal do acelerador conforme documentação oficial.'),
    ('P201', 'Manual genérico: verificar faixa de sinal e calibração conforme procedimento do fabricante.'),
    ('P202', 'Manual genérico: verificar acelerador e chicote; não operar se houver aceleração inesperada.'),
    ('P203', 'Manual genérico: verificar seletor, conectores e alimentação conforme documentação oficial.'),
    ('P204', 'Manual genérico: verificar botão, fiação e programação conforme documentação oficial.'),
    ('P205', 'Manual genérico: verificar comunicação entre painel e controlador conforme documentação oficial.'),
    ('P300', 'Manual genérico: verificar sensor do freio dianteiro e ajuste da manete conforme documentação oficial.'),
    ('P301', 'Manual genérico: verificar sensor do freio traseiro e ajuste da manete conforme documentação oficial.'),
    ('P302', 'Manual genérico: verificar sensor e ajuste do cavalete segundo o fabricante.'),
    ('P303', 'Manual genérico: verificar chave de emergência ou de segurança conforme documentação oficial.'),
    ('P304', 'Manual genérico: verificar sensor de freio, chicote e conector conforme documentação oficial.'),
    ('P305', 'Manual genérico: verificar sensores de segurança conforme documentação oficial; não contornar intertravamentos.'),
    ('P400', 'Manual genérico: verificar comunicação CAN conforme procedimento e especificações do fabricante.'),
    ('P401', 'Manual genérico: verificar alimentação do painel e conexão com o controlador conforme documentação oficial.'),
    ('P402', 'Manual genérico: verificar fusível e alimentação conforme documentação oficial; não substituir peças sem teste.'),
    ('P403', 'Manual genérico: consultar diagnóstico oficial do painel antes de considerar substituição.'),
    ('P404', 'Manual genérico: verificar parâmetros e sensores conforme documentação oficial do modelo.'),
    ('P405', 'Manual genérico: consultar procedimento oficial de firmware; não atualizar software incompatível.'),
    ('P500', 'Manual genérico: verificar carregador, conector e temperatura conforme documentação oficial.'),
    ('P501', 'Manual genérico: verificar lâmpadas, fiação e controlador de luz conforme documentação oficial.'),
    ('P502', 'Manual genérico: verificar buzina, relé e alimentação conforme documentação oficial.'),
    ('P503', 'Manual genérico: verificar conversor DC-DC e saída conforme especificações do fabricante.'),
    ('P504', 'Manual genérico: verificar bateria auxiliar, fusíveis e conexões conforme documentação oficial.'),
    ('P505', 'Manual genérico: verificar chave, aplicativo ou módulo antifurto conforme documentação oficial.')
)
INSERT INTO fault_procedures (
    fault_code_id,
    step_number,
    instruction,
    safety_warning,
    source_id
)
SELECT
    fc.id,
    1,
    v.instrucao,
    'REFERÊNCIA NÃO VALIDADA PARA MARCA OU MODELO. Não executar reparos apenas com base neste código genérico. Desligue o sistema antes de intervir e consulte documentação oficial. Sistemas de bateria podem apresentar risco elétrico e térmico.',
    ts.id
FROM verificacoes v
JOIN fault_codes fc
  ON UPPER(TRIM(fc.code)) = v.codigo
JOIN technical_sources ts
  ON ts.title = 'Bônus 1 — Tabela Mestra de Códigos de Erro de Display e Painel'
WHERE NOT EXISTS (
    SELECT 1
    FROM fault_procedures fp
    WHERE fp.fault_code_id = fc.id
      AND fp.step_number = 1
);

COMMIT;

-- Resumo para conferência.
SELECT
    COUNT(*) AS total_codigos,
    COUNT(*) FILTER (WHERE verification_status = 'pending') AS pendentes
FROM fault_codes
WHERE UPPER(TRIM(code)) IN (
    'P001','P002','P003','P004','P005','P006','P007','P008',
    'P100','P101','P102','P103','P104','P105','P106','P107',
    'P200','P201','P202','P203','P204','P205',
    'P300','P301','P302','P303','P304','P305',
    'P400','P401','P402','P403','P404','P405',
    'P500','P501','P502','P503','P504','P505'
);
