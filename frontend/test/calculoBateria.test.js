import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularBateria, valoresIniciais } from '../src/calculoBateria.js';
test('energia e tensão do conjunto em série', () => {
 const r = calcularBateria({ ...valoresIniciais, serie: 10, capacidade: 12.8 });
 assert.equal(r.tensao, 36); assert.equal(r.energia, 460.8); assert.equal(r.cargaLitio, 42);
});
test('peso e subida aumentam consumo', () => {
 const base = calcularBateria(valoresIniciais);
 assert.ok(calcularBateria({ ...valoresIniciais, massaBateria: 28 }).autonomia < base.autonomia);
 assert.ok(calcularBateria({ ...valoresIniciais, subida: 5 }).consumo > base.consumo);
});
test('chumbo considera Peukert e blocos de 12 V', () => {
 const d = { ...valoresIniciais, quimica: 'chumbo', serie: 4, massaBateria: 28, utilizavel: 50 };
 const r = calcularBateria(d);
 assert.equal(r.tensao, 48); assert.ok(r.fatorPeukert < 1);
 assert.ok(r.autonomia < calcularBateria({ ...d, peukert: 1 }).autonomia);
 assert.equal(calcularBateria({ ...d, capacidade: 1000 }).fatorPeukert, 1);
});
test('saúde reduz autonomia proporcionalmente', () => {
 assert.equal(calcularBateria({ ...valoresIniciais, saude: 50 }).autonomia, calcularBateria(valoresIniciais).autonomia / 2);
});
test('rejeita entradas vazias, inválidas e fora dos limites', () => {
 for (const d of [{ serie: 2.5 }, { capacidade: '' }, { velocidade: 0 }, { condutor: -5 }, { eficiencia: 101 }, { quimica: 'outra' }, { area: Infinity }]) assert.equal(calcularBateria({ ...valoresIniciais, ...d }), null);
});
