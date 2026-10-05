import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liturgyTitle } from '../src/utils/liturgyTitle.js';

// Nome do dia litúrgico (Fase 5). A API da CNBB só fala português; em inglês
// o título vira o dia da semana mais a semana (e o tempo, quando a USCCB
// respondeu). Junta o que LiturgyCard e LiturgyScreen faziam separados.

const cnbb = { liturgia: 'Quinta-feira da 25ª semana do Tempo Comum' };
const quinta = new Date(2026, 8, 24);

test('em português devolve o nome da CNBB como veio', () => {
  assert.equal(liturgyTitle(cnbb, false), cnbb.liturgia);
  assert.equal(liturgyTitle(cnbb, false, 'Ordinary Time', quinta), cnbb.liturgia);
  assert.equal(liturgyTitle(null, false), undefined);
});

test('em inglês, sem tempo (o card): dia da semana e a semana quando existe', () => {
  assert.equal(liturgyTitle(cnbb, true, undefined, quinta), 'Thursday, week 25');
  assert.equal(liturgyTitle({ liturgia: 'Sagrada Família' }, true, undefined, quinta), 'Thursday');
  assert.equal(liturgyTitle(null, true, undefined, quinta), 'Thursday');
});

test('em inglês, com o tempo da USCCB (a tela): "Week N of <tempo>"', () => {
  assert.equal(liturgyTitle(cnbb, true, 'Ordinary Time', quinta), 'Thursday, Week 25 of Ordinary Time');
  assert.equal(liturgyTitle({ liturgia: 'Sagrada Família' }, true, 'Christmas', quinta), 'Thursday, Christmas');
});

test('aceita as grafias de semana da CNBB (25ª, 25a, 25°, 25 semana)', () => {
  for (const s of ['25ª semana', '25a semana', '25° semana', '25 semana', '25ªsemana', '25ª Semana']) {
    assert.equal(liturgyTitle({ liturgia: `Quinta-feira da ${s} do Tempo Comum` }, true, undefined, quinta), 'Thursday, week 25', s);
  }
});
