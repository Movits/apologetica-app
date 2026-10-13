import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LESSONS } from '../src/data/lessons/index.js';

// Integridade das lições da Jornada (src/data/lessons/): toda lição aponta
// para um artigo existente, todo artigo tem lição, e cada campo respeita o
// formato que os componentes de src/components/lesson/ esperam.
//
// Os arquivos de artigos usam require() de imagem (Metro): os ids saem por
// regex em vez de import, como em scripts/generate-brain.mjs.
const FILES = ['existencia-deus', 'igreja-catolica', 'sagrada-escritura', 'moral', 'outras-religioes', 'historia-igreja'];
const ARTICLE_IDS = FILES.flatMap((f) => {
  const src = readFileSync(new URL(`../src/data/articles/${f}.js`, import.meta.url), 'utf8');
  return [...src.matchAll(/^\s{4}id:\s*(\d+),/gm)].map((m) => Number(m[1]));
});

const DASH = /—/;
const isText = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max && !DASH.test(s);

test('cada artigo tem lição e cada lição tem artigo', () => {
  const lessonIds = Object.keys(LESSONS).map(Number);
  const missing = ARTICLE_IDS.filter((id) => !LESSONS[id]);
  const orphan = lessonIds.filter((id) => !ARTICLE_IDS.includes(id));
  assert.deepEqual(missing, [], 'artigos sem lição');
  assert.deepEqual(orphan, [], 'lições sem artigo');
  assert.equal(ARTICLE_IDS.length, 83);
});

test('previsão: pergunta, três opções, correta válida, nota, tudo em PT e EN', () => {
  for (const [id, l] of Object.entries(LESSONS)) {
    const h = l.hook;
    assert.ok(h, `${id}: sem hook`);
    assert.ok(isText(h.question, 160) && isText(h.questionEn, 160), `${id}: hook.question`);
    assert.equal(h.options.length, 3, `${id}: hook.options`);
    assert.equal(h.optionsEn.length, 3, `${id}: hook.optionsEn`);
    h.options.concat(h.optionsEn).forEach((o) => assert.ok(isText(o, 70), `${id}: opção da previsão "${o}"`));
    assert.ok(Number.isInteger(h.correct) && h.correct >= 0 && h.correct < 3, `${id}: hook.correct`);
    assert.ok(isText(h.note, 260) && isText(h.noteEn, 260), `${id}: hook.note`);
  }
});

test('resumo em três pontos e resposta de bolso, PT e EN', () => {
  for (const [id, l] of Object.entries(LESSONS)) {
    assert.equal(l.keyPoints.length, 3, `${id}: keyPoints`);
    assert.equal(l.keyPointsEn.length, 3, `${id}: keyPointsEn`);
    l.keyPoints.concat(l.keyPointsEn).forEach((p) => assert.ok(isText(p, 170), `${id}: ponto "${p}"`));
    assert.ok(isText(l.oneLiner, 190) && isText(l.oneLinerEn, 190), `${id}: oneLiner`);
  }
});

test('teste rápido: três perguntas de quatro opções, correta variada, com o porquê', () => {
  for (const [id, l] of Object.entries(LESSONS)) {
    assert.equal(l.check.length, 3, `${id}: check`);
    const positions = new Set();
    for (const q of l.check) {
      assert.ok(isText(q.question, 200) && isText(q.questionEn, 200), `${id}: pergunta "${q.question}"`);
      assert.equal(q.options.length, 4, `${id}: options`);
      assert.equal(q.optionsEn.length, 4, `${id}: optionsEn`);
      q.options.concat(q.optionsEn).forEach((o) => assert.ok(isText(o, 90), `${id}: opção "${o}"`));
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, `${id}: correct`);
      assert.ok(isText(q.why, 260) && isText(q.whyEn, 260), `${id}: why`);
      positions.add(q.correct);
    }
    assert.ok(positions.size >= 2, `${id}: a resposta certa está sempre na mesma posição`);
  }
});
