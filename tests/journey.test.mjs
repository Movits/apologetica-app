import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  XP,
  LEVELS,
  BADGES,
  CATEGORY_SLUGS,
  createState,
  normalizeState,
  levelFor,
  applyEvent,
  lessonOf,
  isLessonComplete,
  categoryProgress,
  journeyStats,
  liveStreak,
} from '../src/utils/journey.js';

// Contexto mínimo que a tela passa: artigos por categoria e o que vem de fora
// do estado (streak de leitura, trilhos do plano, streak do quiz diário).
const CTX = {
  articlesByCategory: {
    'Existência de Deus': [1, 9, 10],
    'Moral': [6, 8],
  },
  streak: 0,
  quizStreak: 0,
  planCompleted: {},
};

const read = (s, id) => applyEvent(s, { type: 'read', articleId: id }, CTX);
const check = (s, id, score) => applyEvent(s, { type: 'check', articleId: id, score, total: 3 }, CTX);
const hook = (s, id, choice, correct) => applyEvent(s, { type: 'hook', articleId: id, choice, correct }, CTX);

test('estado novo: zero XP, nível Catecúmeno, sem conquistas', () => {
  const s = createState();
  assert.equal(s.xp, 0);
  assert.deepEqual(s.lessons, {});
  assert.deepEqual(s.badges, {});
  const lv = levelFor(0);
  assert.equal(lv.level.id, 'catecumeno');
  assert.equal(lv.index, 0);
  assert.equal(lv.progress, 0);
  assert.equal(lv.next.id, LEVELS[1].id);
});

test('normalizeState tolera lixo e versões antigas', () => {
  assert.deepEqual(normalizeState(null), createState());
  assert.deepEqual(normalizeState('x'), createState());
  const s = normalizeState({ xp: '40', lessons: null, badges: { a: 1 } });
  assert.equal(s.xp, 40);
  assert.deepEqual(s.lessons, {});
  assert.deepEqual(s.badges, { a: 1 });
  assert.equal(normalizeState({ xp: -5 }).xp, 0);
});

test('níveis: limiares crescentes, progresso dentro do nível e último sem próximo', () => {
  for (let i = 1; i < LEVELS.length; i++) assert.ok(LEVELS[i].min > LEVELS[i - 1].min);
  const mid = levelFor(LEVELS[1].min + (LEVELS[2].min - LEVELS[1].min) / 2);
  assert.equal(mid.level.id, LEVELS[1].id);
  assert.ok(Math.abs(mid.progress - 0.5) < 1e-9);
  assert.equal(mid.toNext, (LEVELS[2].min - LEVELS[1].min) / 2);
  const top = levelFor(999999);
  assert.equal(top.level.id, LEVELS[LEVELS.length - 1].id);
  assert.equal(top.next, null);
  assert.equal(top.progress, 1);
  assert.equal(top.toNext, 0);
  assert.equal(levelFor(-10).index, 0);
  assert.equal(levelFor(NaN).index, 0);
});

test('ler um artigo dá XP uma vez só e não muta o estado anterior', () => {
  const s0 = createState();
  const r1 = read(s0, 1);
  assert.equal(r1.gained, XP.articleRead);
  assert.equal(r1.state.xp, XP.articleRead);
  assert.equal(lessonOf(r1.state, 1).read, true);
  assert.equal(s0.xp, 0, 'entrada intacta');
  const r2 = read(r1.state, 1);
  assert.equal(r2.gained, 0);
  assert.equal(r2.state.xp, XP.articleRead);
});

test('previsão (hook): XP uma vez, guarda a escolha, acerto não vale mais', () => {
  const a = hook(createState(), 1, 2, false);
  assert.equal(a.gained, XP.hook);
  assert.equal(lessonOf(a.state, 1).hook, 2);
  const b = hook(a.state, 1, 1, true);
  assert.equal(b.gained, 0);
  assert.equal(lessonOf(b.state, 1).hook, 2, 'a primeira escolha fica');
});

test('teste: XP por acerto novo, bônus de perfeito uma vez, melhor pontuação guardada', () => {
  const a = check(createState(), 1, 2);
  assert.equal(a.gained, 2 * XP.checkCorrect);
  assert.equal(lessonOf(a.state, 1).check.best, 2);
  assert.equal(lessonOf(a.state, 1).check.perfect, false);
  // Refazer com nota pior: nada muda.
  const b = check(a.state, 1, 1);
  assert.equal(b.gained, 0);
  assert.equal(lessonOf(b.state, 1).check.best, 2);
  // Refazer e gabaritar: só o acerto novo mais o bônus.
  const c = check(b.state, 1, 3);
  assert.equal(c.gained, XP.checkCorrect + XP.checkPerfect);
  assert.equal(lessonOf(c.state, 1).check.perfect, true);
  assert.equal(lessonOf(c.state, 1).check.attempts, 3);
  // Gabaritar de novo: zero.
  const d = check(c.state, 1, 3);
  assert.equal(d.gained, 0);
  assert.equal(d.state.xp, 3 * XP.checkCorrect + XP.checkPerfect);
  // Pontuação fora do intervalo é limitada.
  const e = check(createState(), 2, 9);
  assert.equal(lessonOf(e.state, 2).check.best, 3);
});

test('lição completa = lida e com teste feito, e dá a conquista do primeiro passo', () => {
  const a = read(createState(), 1);
  assert.equal(isLessonComplete(lessonOf(a.state, 1)), false);
  assert.deepEqual(a.unlocked, []);
  const b = check(a.state, 1, 1);
  assert.equal(isLessonComplete(lessonOf(b.state, 1)), true);
  assert.deepEqual(b.unlocked, ['primeiro-passo']);
  assert.ok(b.state.badges['primeiro-passo'] > 0);
  assert.ok(lessonOf(b.state, 1).done > 0, 'marca o momento da conclusão');
  // Concluir outra não repete a conquista.
  const c = check(read(b.state, 9).state, 9, 3);
  assert.deepEqual(c.unlocked, []);
});

test('conquista de categoria quando todos os artigos dela estão completos', () => {
  let s = createState();
  for (const id of [1, 9]) s = check(read(s, id).state, id, 3).state;
  assert.equal(s.badges['categoria-existencia-deus'], undefined);
  const last = check(read(s, 10).state, 10, 2);
  assert.ok(last.unlocked.includes('categoria-existencia-deus'));
  const prog = categoryProgress(last.state, CTX.articlesByCategory['Existência de Deus']);
  assert.deepEqual(prog, { read: 3, completed: 3, perfect: 2, total: 3 });
});

test('conquistas de sequência vêm do contexto, não do estado', () => {
  const s = createState();
  const r = applyEvent(s, { type: 'read', articleId: 1 }, { ...CTX, streak: 7 });
  assert.ok(r.unlocked.includes('sequencia-3'));
  assert.ok(r.unlocked.includes('sequencia-7'));
  assert.ok(!r.unlocked.includes('sequencia-30'));
  const r2 = applyEvent(r.state, { type: 'sync' }, { ...CTX, streak: 30, quizStreak: 7, planCompleted: { fundamentos: true } });
  assert.deepEqual(r2.unlocked.sort(), ['quiz-7', 'sequencia-30', 'trilho-fundamentos']);
  assert.equal(r2.gained, 0);
});

test('quiz diário: XP só uma vez por dia e só se acertou', () => {
  const a = applyEvent(createState(), { type: 'dailyQuiz', dateKey: '2026-10-07', correct: true }, CTX);
  assert.equal(a.gained, XP.dailyQuiz);
  const b = applyEvent(a.state, { type: 'dailyQuiz', dateKey: '2026-10-07', correct: true }, CTX);
  assert.equal(b.gained, 0);
  const c = applyEvent(b.state, { type: 'dailyQuiz', dateKey: '2026-10-08', correct: false }, CTX);
  assert.equal(c.gained, 0);
  const d = applyEvent(c.state, { type: 'dailyQuiz', dateKey: '2026-10-08', correct: true }, CTX);
  assert.equal(d.gained, XP.dailyQuiz);
});

test('estatísticas e marcos de volume (10 perfeitos, 30 e todos os artigos)', () => {
  const ctx = { ...CTX, articlesByCategory: { A: Array.from({ length: 32 }, (_, i) => i + 100) } };
  let s = createState();
  let unlocked = [];
  for (let i = 0; i < 32; i++) {
    const id = 100 + i;
    s = applyEvent(s, { type: 'read', articleId: id }, ctx).state;
    const r = applyEvent(s, { type: 'check', articleId: id, score: 3, total: 3 }, ctx);
    s = r.state;
    unlocked = unlocked.concat(r.unlocked);
  }
  assert.ok(unlocked.includes('dez-perfeitos'));
  assert.ok(unlocked.includes('trinta-artigos'));
  assert.ok(unlocked.includes('todos-os-artigos'), 'todos os 32 do contexto');
  const st = journeyStats(s, ctx);
  assert.equal(st.completed, 32);
  assert.equal(st.perfect, 32);
  assert.equal(st.total, 32);
  assert.equal(st.badges, Object.keys(s.badges).length);
});

test('catálogo de conquistas: ids únicos, bilíngues, uma por categoria', () => {
  const ids = BADGES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of BADGES) {
    assert.ok(b.name && b.nameEn && b.desc && b.descEn && b.icon, b.id);
  }
  for (const [cat, slug] of Object.entries(CATEGORY_SLUGS)) {
    const badge = BADGES.find((b) => b.id === `categoria-${slug}`);
    assert.ok(badge, `falta conquista da categoria ${cat}`);
    assert.equal(badge.category, cat);
  }
});

test('evento desconhecido não muda nada', () => {
  const s = createState();
  const r = applyEvent(s, { type: 'nada' }, CTX);
  assert.equal(r.gained, 0);
  assert.deepEqual(r.state, s);
});

test('teste sem `total` usa as três perguntas (não vira perfeito com um acerto)', () => {
  const r = applyEvent(createState(), { type: 'check', articleId: 1, score: 1 }, CTX);
  assert.equal(r.gained, XP.checkCorrect);
  assert.equal(lessonOf(r.state, 1).check.perfect, false);
  const p = applyEvent(createState(), { type: 'check', articleId: 1, score: 3 }, CTX);
  assert.equal(lessonOf(p.state, 1).check.perfect, true);
});

test('liveStreak: a contagem só vale se o último dia foi hoje ou ontem', () => {
  assert.equal(liveStreak({ count: 7, lastDate: '2026-10-7' }, '2026-10-7', '2026-10-6'), 7);
  assert.equal(liveStreak({ count: 7, lastDate: '2026-10-6' }, '2026-10-7', '2026-10-6'), 7);
  assert.equal(liveStreak({ count: 7, lastDate: '2026-9-20' }, '2026-10-7', '2026-10-6'), 0);
  assert.equal(liveStreak(null, '2026-10-7', '2026-10-6'), 0);
  assert.equal(liveStreak({ count: 0, lastDate: '2026-10-7' }, '2026-10-7', '2026-10-6'), 0);
});
