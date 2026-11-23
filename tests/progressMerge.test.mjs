import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeJourney,
  journeyBaseXp,
  mergeIdSet,
  mergeLatestAt,
  mergeReadingStreak,
  mergePlan,
  mergeBibleRead,
  mergeQuizHistory,
  mergeQuizStreak,
  mergeFavorites,
  favoritesList,
} from '../src/utils/progressMerge.js';
import { XP } from '../src/utils/journey.js';

test('jornada: lições de aparelhos diferentes somam, e o XP também', () => {
  const celular = { v: 1, xp: XP.articleRead, lessons: { 1: { read: true } }, badges: {}, days: {}, review: {} };
  const pc = { v: 1, xp: XP.articleRead + XP.hook, lessons: { 2: { read: true, hook: 1 } }, badges: { 'primeiro-passo': 50 }, days: {}, review: {} };
  const m = mergeJourney(celular, pc);
  assert.deepEqual(Object.keys(m.lessons).sort(), ['1', '2']);
  assert.equal(m.xp, 2 * XP.articleRead + XP.hook);
  assert.equal(m.badges['primeiro-passo'], 50);
});

test('jornada: a mesma lição nos dois aparelhos não conta em dobro', () => {
  const a = { xp: XP.articleRead, lessons: { 1: { read: true } } };
  const b = { xp: XP.articleRead, lessons: { 1: { read: true } } };
  assert.equal(mergeJourney(a, b).xp, XP.articleRead);
});

test('jornada: o teste com mais tentativas vence, e a primeira nota fica', () => {
  const a = { lessons: { 1: { read: true, check: { best: 2, first: 2, perfect: false, attempts: 1 } } } };
  const b = { lessons: { 1: { read: true, check: { best: 3, first: 2, perfect: false, attempts: 2 }, done: 100 } } };
  const m = mergeJourney(a, b);
  assert.equal(m.lessons[1].check.attempts, 2);
  assert.equal(m.lessons[1].check.best, 3);
  assert.equal(m.lessons[1].done, 100);
  assert.equal(m.xp, XP.articleRead + 2 * XP.checkCorrect);
});

test('jornada: XP de revisão (que o estado não explica) é preservado', () => {
  const base = { lessons: { 1: { read: true } } };
  const comRevisao = { ...base, xp: XP.articleRead + 3 * XP.review };
  assert.equal(journeyBaseXp(base), XP.articleRead);
  assert.equal(mergeJourney(comRevisao, { ...base, xp: XP.articleRead }).xp, XP.articleRead + 3 * XP.review);
});

test('jornada: cartão de revisão mais avançado vence, pergunta do dia fica a primeira', () => {
  const a = { review: { k: { box: 1, reps: 1, due: '2026-11-25' } }, days: { '2026-11-20': true } };
  const b = { review: { k: { box: 2, reps: 2, due: '2026-11-30' } }, days: { '2026-11-20': false, '2026-11-21': true } };
  const m = mergeJourney(a, b);
  assert.equal(m.review.k.reps, 2);
  assert.equal(m.days['2026-11-20'], true);
  assert.equal(m.days['2026-11-21'], true);
});

test('conjuntos de ids e mapas de capítulos viram a união', () => {
  assert.deepEqual(mergeIdSet([1, 2], [2, 3]).sort(), [1, 2, 3]);
  assert.deepEqual(mergeBibleRead({ gn: [1, 2] }, { gn: [2, 5], ex: [1] }), { gn: [1, 2, 5], ex: [1] });
});

test('ponto único (último aberto, marcador) fica com o mais recente', () => {
  assert.equal(mergeLatestAt({ chapter: 1, at: 5 }, { chapter: 9, at: 10 }).chapter, 9);
  assert.equal(mergeLatestAt(null, { chapter: 9, at: 10 }).chapter, 9);
  assert.equal(mergeLatestAt({ chapter: 1, at: 5 }, null).chapter, 1);
});

test('sequência de leitura: vale o dia mais recente', () => {
  assert.deepEqual(mergeReadingStreak({ count: 3, lastDate: '2026-11-9' }, { count: 1, lastDate: '2026-11-10' }), { count: 1, lastDate: '2026-11-10' });
  assert.deepEqual(mergeReadingStreak({ count: 3, lastDate: '2026-11-10' }, { count: 2, lastDate: '2026-11-10' }), { count: 3, lastDate: '2026-11-10' });
});

test('plano de leitura: dias concluídos somam', () => {
  assert.deepEqual(mergePlan({ completed: [1, 2], lastDay: 2 }, { completed: [3], lastDay: 3 }), { completed: [1, 2, 3], lastDay: 3 });
});

test('quiz: histórico une os dias e a sequência fica com a maior', () => {
  const m = mergeQuizHistory({ '2026-11-20': { id: 1, correct: true } }, { '2026-11-20': { id: 1, correct: false }, '2026-11-21': { id: 2, correct: true } });
  assert.equal(m['2026-11-20'].correct, true);
  assert.ok(m['2026-11-21']);
  assert.equal(mergeQuizStreak('3', '5'), '5');
});

test('favoritos: desfavoritar num aparelho não volta pelo outro', () => {
  const celular = { list: [1, 2], log: { 1: { on: true, at: 10 }, 2: { on: true, at: 10 } } };
  const pc = { list: [1], log: { 1: { on: true, at: 10 }, 2: { on: false, at: 20 } } };
  const m = mergeFavorites(celular, pc);
  assert.deepEqual(favoritesList(m), [1]);
  // Lista antiga sem registro: entra como favorito.
  const legado = mergeFavorites({ list: [7], log: {} }, { list: [8], log: {} });
  assert.deepEqual(favoritesList(legado).sort(), [7, 8]);
});
