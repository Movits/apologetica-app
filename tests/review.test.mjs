import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REVIEW_INTERVALS,
  REVIEW_SESSION_SIZE,
  FIRST_BOX_RIGHT,
  addDaysKey,
  lessonKey,
  hookKey,
  quizKey,
  parseKey,
  newCard,
  answerCard,
  isDue,
  dueKeys,
  reviewSummary,
  shuffledOrder,
  daysBetween,
} from '../src/utils/review.js';

// Revisão espaçada (caixas de Leitner): errou, a pergunta volta amanhã;
// acertou no teste, volta em uma semana; cada acerto na revisão empurra a
// próxima vez para mais longe; errar na revisão devolve para amanhã.

const T = '2026-10-13';

test('addDaysKey soma dias numa chave AAAA-MM-DD, virando mês, ano e bissexto', () => {
  assert.equal(addDaysKey(T, 1), '2026-10-14');
  assert.equal(addDaysKey(T, 0), T);
  assert.equal(addDaysKey('2026-10-31', 1), '2026-11-01');
  assert.equal(addDaysKey('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysKey('2028-02-28', 1), '2028-02-29');
  assert.equal(addDaysKey('2027-02-28', 1), '2027-03-01');
  assert.equal(addDaysKey('2026-03-01', -1), '2026-02-28');
  assert.equal(addDaysKey(T, 35), '2026-11-17');
});

test('chaves das perguntas: teste, previsão e pergunta do dia, ida e volta', () => {
  assert.equal(lessonKey(5, 2), 'a:5:2');
  assert.equal(hookKey(5), 'a:5:h');
  assert.equal(quizKey('dq-001'), 'q:dq-001');
  assert.deepEqual(parseKey('a:5:2'), { kind: 'check', articleId: 5, index: 2 });
  assert.deepEqual(parseKey('a:12:h'), { kind: 'hook', articleId: 12 });
  assert.deepEqual(parseKey('q:dq-001'), { kind: 'quiz', quizId: 'dq-001' });
  for (const bad of ['', 'x', 'a:5', 'a:x:1', 'a:5:-1', 'a:5:1.5', 'q:', null, undefined, 3]) {
    assert.equal(parseKey(bad), null, String(bad));
  }
});

test('cartão novo: errou volta amanhã, acertou volta em uma semana', () => {
  assert.equal(REVIEW_INTERVALS[FIRST_BOX_RIGHT], 7);
  assert.deepEqual(newCard(false, T), { box: 0, due: '2026-10-14', reps: 0, lapses: 0, maxBox: 0 });
  assert.deepEqual(newCard(true, T), { box: FIRST_BOX_RIGHT, due: '2026-10-20', reps: 0, lapses: 0, maxBox: FIRST_BOX_RIGHT });
});

test('acertos sucessivos seguem os intervalos e a pergunta fica dominada no fim', () => {
  let card = newCard(false, T);
  let day = card.due;
  const gaps = [];
  for (let i = 0; i < REVIEW_INTERVALS.length - 1; i++) {
    const next = answerCard(card, true, day);
    gaps.push(next.box);
    assert.equal(next.due, addDaysKey(day, REVIEW_INTERVALS[next.box]));
    card = next;
    day = card.due;
  }
  assert.deepEqual(gaps, [1, 2, 3, 4]);
  const done = answerCard(card, true, day);
  assert.equal(done.mastered, true);
  assert.equal(done.due, null);
  assert.equal(done.reps, REVIEW_INTERVALS.length);
  assert.equal(isDue(done, '2099-01-01'), false, 'dominada não volta mais');
});

test('errar na revisão devolve para amanhã e conta o lapso, sem mutar a entrada', () => {
  const card = { box: 3, due: T, reps: 4, lapses: 0, maxBox: 3 };
  const out = answerCard(card, false, T);
  assert.deepEqual(out, { box: 0, due: '2026-10-14', reps: 5, lapses: 1, maxBox: 3 });
  assert.deepEqual(card, { box: 3, due: T, reps: 4, lapses: 0, maxBox: 3 }, 'entrada intacta');
});

test('isDue: vence no dia marcado ou depois, nunca antes', () => {
  const card = newCard(false, T);
  assert.equal(isDue(card, T), false);
  assert.equal(isDue(card, '2026-10-14'), true);
  assert.equal(isDue(card, '2026-12-01'), true);
  assert.equal(isDue(null, T), false);
  assert.equal(isDue({ box: 0 }, T), false, 'sem data não vence');
});

test('dueKeys: só as vencidas, mais atrasadas primeiro, depois a caixa mais baixa, com limite', () => {
  const cards = {
    'a:1:0': { box: 2, due: '2026-10-10', reps: 1, lapses: 0 },
    'a:1:1': { box: 0, due: '2026-10-12', reps: 0, lapses: 0 },
    'a:2:h': { box: 1, due: '2026-10-10', reps: 1, lapses: 0 },
    'q:dq-001': { box: 0, due: '2026-10-20', reps: 0, lapses: 0 },
    'a:3:2': { box: 4, due: null, reps: 5, lapses: 0, mastered: true },
  };
  assert.deepEqual(dueKeys(cards, T), ['a:2:h', 'a:1:0', 'a:1:1']);
  assert.deepEqual(dueKeys(cards, T, 2), ['a:2:h', 'a:1:0']);
  assert.deepEqual(dueKeys({}, T), []);
  assert.deepEqual(dueKeys(null, T), []);
  assert.ok(REVIEW_SESSION_SIZE >= 3 && REVIEW_SESSION_SIZE <= 10);
});

test('reviewSummary: vencidas, em aprendizado, dominadas e a próxima data', () => {
  const cards = {
    a: { box: 0, due: '2026-10-12', reps: 0, lapses: 0 },
    b: { box: 1, due: '2026-10-16', reps: 1, lapses: 0 },
    c: { box: 2, due: '2026-10-15', reps: 1, lapses: 0 },
    d: { box: 4, due: null, reps: 5, lapses: 0, mastered: true },
  };
  assert.deepEqual(reviewSummary(cards, T), { due: 1, learning: 3, mastered: 1, total: 4, nextDue: '2026-10-15' });
  assert.deepEqual(reviewSummary({}, T), { due: 0, learning: 0, mastered: 0, total: 0, nextDue: null });
});

test('shuffledOrder: permutação determinística pela semente e sem posição favorita', () => {
  const a = shuffledOrder(4, 'a:7:1');
  assert.deepEqual([...a].sort(), [0, 1, 2, 3]);
  assert.deepEqual(shuffledOrder(4, 'a:7:1'), a, 'mesma semente, mesma ordem');
  assert.deepEqual(shuffledOrder(0, 'x'), []);
  assert.deepEqual(shuffledOrder(1, 'x'), [0]);
  // Onde a opção 1 (a mais comum como certa nos dados) vai parar, em 3000 sementes.
  for (const n of [3, 4]) {
    const where = new Array(n).fill(0);
    for (let i = 0; i < 3000; i++) where[shuffledOrder(n, `seed-${i}`).indexOf(1)]++;
    const expected = 3000 / n;
    for (const c of where) assert.ok(Math.abs(c - expected) < expected * 0.15, `n=${n}: ${where}`);
  }
});

test('daysBetween: diferença em dias entre duas chaves', () => {
  assert.equal(daysBetween(T, '2026-10-14'), 1);
  assert.equal(daysBetween(T, T), 0);
  assert.equal(daysBetween(T, '2026-11-17'), 35);
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
  assert.equal(daysBetween(T, '2026-10-12'), -1);
  assert.equal(daysBetween('x', T), null);
});

test('maxBox guarda a etapa mais alta já alcançada (o XP da revisão só paga etapa nova)', () => {
  let c = newCard(false, T);
  c = answerCard(c, true, c.due);
  assert.equal(c.maxBox, 1);
  c = answerCard(c, false, c.due);
  assert.equal(c.box, 0);
  assert.equal(c.maxBox, 1);
  c = answerCard(c, true, c.due);
  assert.equal(c.maxBox, 1);
  c = answerCard(c, true, c.due);
  assert.equal(c.maxBox, 2);
  // Cartões antigos sem maxBox contam a caixa atual.
  assert.equal(answerCard({ box: 2, due: T, reps: 1, lapses: 0 }, true, T).maxBox, 3);
});
