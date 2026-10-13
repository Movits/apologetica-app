import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ, DAILY_QUESTIONS, TRUE_FALSE } from '../src/data/quiz.js';
import { MAX_SHARE, correctTooLong, longestShare, shortestShare } from './optionBalance.mjs';

// Banco do quiz: a pergunta do dia vira cartão de revisão pelo id, e a prática
// sorteia do banco. Ids repetidos fariam a revisão mostrar a pergunta errada.
test('ids únicos nos três bancos', () => {
  const ids = [...QUIZ, ...DAILY_QUESTIONS, ...TRUE_FALSE].map((q) => q.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dup, []);
});

test('múltipla escolha: quatro opções nos dois idiomas, índice certo válido, porquê nos dois idiomas', () => {
  for (const q of [...QUIZ, ...DAILY_QUESTIONS]) {
    assert.ok(q.question && q.questionEn, q.id);
    assert.equal(q.options.length, 4, `${q.id}: opções`);
    assert.equal(q.optionsEn.length, 4, `${q.id}: opções EN`);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, `${q.id}: correct`);
    assert.ok(q.why && q.whyEn, `${q.id}: porquê`);
    assert.equal(new Set(q.options).size, 4, `${q.id}: opções repetidas`);
  }
});

test('verdadeiro ou falso: afirmação, resposta booleana e explicação nos dois idiomas', () => {
  for (const q of TRUE_FALSE) {
    assert.ok(q.statement && q.statementEn, q.id);
    assert.equal(typeof q.answer, 'boolean', q.id);
    assert.ok(q.explanation && q.explanationEn, q.id);
  }
});

test('sem travessão em nenhum texto do quiz (convenção do projeto)', () => {
  const bad = [];
  for (const q of [...QUIZ, ...DAILY_QUESTIONS, ...TRUE_FALSE]) {
    for (const [k, v] of Object.entries(q)) {
      const vals = Array.isArray(v) ? v : [v];
      if (vals.some((x) => typeof x === 'string' && x.includes('—'))) bad.push(`${q.id}.${k}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('a resposta certa não se entrega pelo tamanho (prática e pergunta do dia, PT e EN)', () => {
  for (const [bank, items] of [['prática', QUIZ], ['pergunta do dia', DAILY_QUESTIONS]]) {
    for (const [lang, pick] of [['PT', (q) => q.options], ['EN', (q) => q.optionsEn]]) {
      const long = items.filter((q) => correctTooLong(pick(q), q.correct)).map((q) => q.id);
      assert.deepEqual(long, [], `${bank} ${lang}: a certa é muito mais longa que todas as erradas`);
      assert.ok(longestShare(items, pick) <= MAX_SHARE, `${bank} ${lang}: a certa é a mais longa em ${Math.round(100 * longestShare(items, pick))}% das perguntas`);
      assert.ok(shortestShare(items, pick) <= MAX_SHARE, `${bank} ${lang}: a certa é a mais curta em ${Math.round(100 * shortestShare(items, pick))}% das perguntas`);
    }
  }
});
