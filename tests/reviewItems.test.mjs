import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dueItems, reviewItem } from '../src/utils/reviewItems.js';
import { hookKey, lessonKey, quizKey } from '../src/utils/review.js';
import { LESSONS } from '../src/data/lessons/index.js';
import { QUIZ, DAILY_QUESTIONS } from '../src/data/quiz.js';

// Toda pergunta que pode virar cartão de revisão precisa resolver para uma
// pergunta inteira: texto, opções nos dois idiomas, índice certo válido e o
// porquê. Se uma lição perder uma pergunta, os cartões antigos param aqui.
const valid = (it, key) => {
  assert.ok(it, `${key} não resolveu`);
  assert.ok(it.question && it.questionEn, `${key}: pergunta PT/EN`);
  assert.ok(Array.isArray(it.options) && it.options.length >= 2, `${key}: opções`);
  assert.equal(it.optionsEn.length, it.options.length, `${key}: opções EN`);
  assert.ok(Number.isInteger(it.correct) && it.correct >= 0 && it.correct < it.options.length, `${key}: correct`);
  assert.ok(it.why && it.whyEn, `${key}: porquê PT/EN`);
};

test('todas as perguntas das lições e todas as previsões resolvem', () => {
  let n = 0;
  for (const [id, lesson] of Object.entries(LESSONS)) {
    const aid = Number(id);
    const h = reviewItem(hookKey(aid));
    valid(h, hookKey(aid));
    assert.equal(h.kind, 'hook');
    assert.equal(h.articleId, aid);
    assert.ok(!/^antes de ler/i.test(h.question), 'previsão sem o prefixo "Antes de ler"');
    assert.ok(!/^before you read/i.test(h.questionEn));
    assert.equal(h.question.charAt(0), h.question.charAt(0).toUpperCase());
    lesson.check.forEach((_, i) => { valid(reviewItem(lessonKey(aid, i)), lessonKey(aid, i)); n++; });
  }
  assert.ok(n >= 3 * Object.keys(LESSONS).length);
});

test('todas as perguntas do quiz (prática e do dia) resolvem pelo id', () => {
  for (const q of [...QUIZ, ...DAILY_QUESTIONS]) {
    const it = reviewItem(quizKey(q.id));
    valid(it, q.id);
    assert.equal(it.kind, 'quiz');
  }
});

test('chave desconhecida ou conteúdo removido devolve null', () => {
  assert.equal(reviewItem('a:999999:0'), null);
  assert.equal(reviewItem(lessonKey(Number(Object.keys(LESSONS)[0]), 99)), null);
  assert.equal(reviewItem('q:nao-existe'), null);
  assert.equal(reviewItem('lixo'), null);
});

test('dueItems: só as vencidas que ainda existem, com limite', () => {
  const cards = {
    'a:999999:0': { box: 0, due: '2026-10-01', reps: 0, lapses: 0 },
    [lessonKey(Number(Object.keys(LESSONS)[0]), 0)]: { box: 0, due: '2026-10-02', reps: 0, lapses: 0 },
    [hookKey(Number(Object.keys(LESSONS)[1]))]: { box: 0, due: '2026-10-03', reps: 0, lapses: 0 },
    [quizKey(DAILY_QUESTIONS[0].id)]: { box: 0, due: '2026-10-30', reps: 0, lapses: 0 },
  };
  const items = dueItems(cards, '2026-10-13');
  assert.deepEqual(items.map((i) => i.kind), ['check', 'hook'], 'a que sumiu fica de fora; a de 30/10 ainda não venceu');
  assert.equal(dueItems(cards, '2026-10-13', 1).length, 1);
});
