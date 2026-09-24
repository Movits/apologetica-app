import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordDailyAnswer } from '../src/utils/quizHistory.js';

// Histórico do quiz diário: { 'AAAA-MM-DD': { id, correct } }. A chave passou
// de UTC (toISOString) para hora local (todayKey), e quem respondeu ontem à
// noite no Brasil pode ter a resposta de ontem gravada sob a data de hoje.
// recordDailyAnswer grava a de hoje e, nesse caso, devolve a antiga para ontem.

const args = { today: '2026-09-24', yesterday: '2026-09-23', id: 'q-hoje', correct: true };

test('grava a resposta de hoje num histórico vazio ou nulo, sem mutar a entrada', () => {
  const vazio = {};
  const out = recordDailyAnswer(vazio, args);
  assert.deepEqual(out, { '2026-09-24': { id: 'q-hoje', correct: true } });
  assert.deepEqual(vazio, {}, 'a entrada não muda');
  assert.deepEqual(recordDailyAnswer(null, args), out);
  assert.deepEqual(recordDailyAnswer(undefined, { ...args, correct: false }), {
    '2026-09-24': { id: 'q-hoje', correct: false },
  });
});

test('move para ontem a resposta de outra pergunta gravada sob a chave de hoje (migração UTC)', () => {
  const hist = { '2026-09-24': { id: 'q-ontem', correct: true } };
  const out = recordDailyAnswer(hist, args);
  assert.deepEqual(out, {
    '2026-09-23': { id: 'q-ontem', correct: true },
    '2026-09-24': { id: 'q-hoje', correct: true },
  });
  assert.deepEqual(hist, { '2026-09-24': { id: 'q-ontem', correct: true } }, 'a entrada não muda');
});

test('não move quando ontem já tem resposta: só sobrescreve a de hoje', () => {
  const hist = {
    '2026-09-23': { id: 'q-anteontem', correct: false },
    '2026-09-24': { id: 'q-ontem', correct: true },
  };
  assert.deepEqual(recordDailyAnswer(hist, args), {
    '2026-09-23': { id: 'q-anteontem', correct: false },
    '2026-09-24': { id: 'q-hoje', correct: true },
  });
});

test('não move quando a entrada de hoje é da mesma pergunta (responder de novo)', () => {
  const hist = { '2026-09-24': { id: 'q-hoje', correct: false } };
  assert.deepEqual(recordDailyAnswer(hist, args), { '2026-09-24': { id: 'q-hoje', correct: true } });
});

test('preserva os outros dias do histórico', () => {
  const hist = { '2026-09-01': { id: 'q-1', correct: true }, '2026-09-24': { id: 'q-ontem', correct: false } };
  assert.deepEqual(recordDailyAnswer(hist, args), {
    '2026-09-01': { id: 'q-1', correct: true },
    '2026-09-23': { id: 'q-ontem', correct: false },
    '2026-09-24': { id: 'q-hoje', correct: true },
  });
});
