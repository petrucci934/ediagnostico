// Modelo didático de velocidade constante, sem contribuição de pedalada.
export const perfisBateria = {
  litio: {
    nome: "Lítio íon (3,6 V/célula)",
    unidade: "células em série",
    nominal: 3.6,
    serie: 13,
    uso: 80,
    massa: 5,
  },
  lfp: {
    nome: "LiFePO₄ (3,2 V/célula)",
    unidade: "células em série",
    nominal: 3.2,
    serie: 16,
    uso: 80,
    massa: 8,
  },
  chumbo: {
    nome: "Chumbo-ácido (blocos de 12 V)",
    unidade: "blocos de 12 V em série",
    nominal: 12,
    serie: 4,
    uso: 50,
    massa: 28,
  },
};
export const valoresIniciais = {
  quimica: "litio",
  serie: 13,
  capacidade: 20,
  massaBateria: 5,
  condutor: 75,
  veiculo: 25,
  carga: 0,
  velocidade: 25,
  subida: 0,
  rolamento: 0.015,
  area: 0.6,
  eficiencia: 80,
  auxiliares: 10,
  utilizavel: 80,
  saude: 100,
  peukert: 1.25,
  horasNominais: 20,
};
export function calcularBateria(dados) {
  const perfil = perfisBateria[dados.quimica];
  if (!perfil) return null;
  const limites = {
    serie: [1, 100],
    capacidade: [0.1, 1000],
    massaBateria: [0.1, 1000],
    condutor: [1, 500],
    veiculo: [1, 1000],
    carga: [0, 1000],
    velocidade: [1, 150],
    subida: [0, 30],
    rolamento: [0.001, 0.1],
    area: [0.1, 2],
    eficiencia: [10, 100],
    auxiliares: [0, 2000],
    utilizavel: [1, 100],
    saude: [1, 100],
    peukert: [1, 1.5],
    horasNominais: [1, 100],
  };
  const n = {};
  for (const [campo, [min, max]] of Object.entries(limites)) {
    if (dados[campo] === "" || dados[campo] == null) return null;
    n[campo] = Number(dados[campo]);
    if (!Number.isFinite(n[campo]) || n[campo] < min || n[campo] > max)
      return null;
  }
  if (!Number.isInteger(n.serie)) return null;
  const tensao = perfil.nominal * n.serie;
  const massa = n.massaBateria + n.condutor + n.veiculo + n.carga;
  const velocidade = n.velocidade / 3.6;
  const angulo = Math.atan(n.subida / 100);
  const forca =
    massa * 9.81 * (n.rolamento * Math.cos(angulo) + Math.sin(angulo)) +
    0.5 * 1.225 * n.area * velocidade ** 2;
  const potencia = (forca * velocidade) / (n.eficiencia / 100) + n.auxiliares;
  const corrente = potencia / tensao;
  // Não extrapola capacidade acima da nominal em correntes baixas.
  const fatorPeukert =
    dados.quimica === "chumbo"
      ? Math.min(
          1,
          (n.capacidade / n.horasNominais / corrente) ** (n.peukert - 1),
        )
      : 1;
  const energia = tensao * n.capacidade;
  const disponivel =
    ((((energia * n.utilizavel) / 100) * n.saude) / 100) * fatorPeukert;
  const consumo = potencia / n.velocidade;
  return {
    tensao,
    massa,
    energia,
    disponivel,
    consumo,
    corrente,
    potencia,
    fatorPeukert,
    autonomia: disponivel / consumo,
    horas: disponivel / potencia,
    cargaLitio: dados.quimica === "litio" ? n.serie * 4.2 : null,
  };
}
