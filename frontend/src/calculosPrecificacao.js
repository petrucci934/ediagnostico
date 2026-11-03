export function calcularHoras(inicio, fim, almoco) {
  if (!inicio || !fim) return 0;

  const minutosInicio =
    Number(inicio.split(":")[0]) * 60 + Number(inicio.split(":")[1]);
  const minutosFim = Number(fim.split(":")[0]) * 60 + Number(fim.split(":")[1]);

  return Math.max(0, minutosFim - minutosInicio - (Number(almoco) || 0)) / 60;
}

export function calcularCustoHora(config) {
  const despesas = Object.values(config.despesas || {}).reduce(
    (total, valor) => total + Math.max(0, Number(valor) || 0),
    0,
  );

  const horasSemana = calcularHoras(
    config.inicioSemana,
    config.fimSemana,
    config.almocoSemana,
  );

  const horasSabado = calcularHoras(
    config.inicioSabado,
    config.fimSabado,
    config.almocoSabado,
  );

  const horasMensais = (horasSemana * 5 + horasSabado) * (52 / 12);
  const horasProdutivas = horasMensais * (Number(config.produtividade) / 100);

  return horasProdutivas > 0 ? despesas / horasProdutivas : 0;
}
