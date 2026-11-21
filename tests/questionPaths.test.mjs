import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUESTION_PATHS, questionPathById } from '../src/data/questionPaths.js';
import { progressOf, toggleStep } from '../src/utils/questionPaths.js';

// Roteiros de perguntas (Ferramentas > Perguntas que expõem): integridade dos
// dados e o progresso das marcações.

const FILES = ['existencia-deus', 'igreja-catolica', 'sagrada-escritura', 'moral', 'outras-religioes', 'historia-igreja'];
const ARTICLE_IDS = new Set(FILES.flatMap((f) => {
  const src = readFileSync(new URL(`../src/data/articles/${f}.js`, import.meta.url), 'utf8');
  return [...src.matchAll(/^\s{4}id:\s*(\d+),/gm)].map((m) => Number(m[1]));
}));

const isText = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max && !/—/.test(s);

test('roteiros: ids únicos, campos PT e EN, artigo existente', () => {
  assert.ok(QUESTION_PATHS.length >= 5);
  const ids = new Set();
  for (const p of QUESTION_PATHS) {
    assert.ok(/^qp-[a-z-]+$/.test(p.id), `${p.id}: id`);
    assert.ok(!ids.has(p.id), `${p.id}: duplicado`);
    ids.add(p.id);
    assert.ok(isText(p.icon, 40), `${p.id}: icon`);
    for (const f of ['title', 'belief']) assert.ok(isText(p[f], 80) && isText(p[`${f}En`], 80), `${p.id}: ${f}`);
    for (const f of ['intro', 'conclusion']) assert.ok(isText(p[f], 600) && isText(p[`${f}En`], 600), `${p.id}: ${f}`);
    if (p.articleId != null) assert.ok(ARTICLE_IDS.has(p.articleId), `${p.id}: artigo ${p.articleId} não existe`);
  }
});

test('passos: de 5 a 12, pergunta e objetivo nos dois idiomas, follow opcional mas pareado', () => {
  for (const p of QUESTION_PATHS) {
    assert.ok(p.steps.length >= 5 && p.steps.length <= 12, `${p.id}: ${p.steps.length} passos`);
    p.steps.forEach((s, i) => {
      const where = `${p.id} passo ${i + 1}`;
      assert.ok(isText(s.q, 260) && isText(s.qEn, 260), `${where}: q`);
      assert.ok(isText(s.aim, 400) && isText(s.aimEn, 400), `${where}: aim`);
      assert.equal(s.follow == null, s.followEn == null, `${where}: follow sem par`);
      if (s.follow != null) assert.ok(isText(s.follow, 400) && isText(s.followEn, 400), `${where}: follow`);
    });
  }
});

test('questionPathById acha e devolve null para id desconhecido', () => {
  assert.equal(questionPathById(QUESTION_PATHS[0].id), QUESTION_PATHS[0]);
  assert.equal(questionPathById('qp-nao-existe'), null);
});

test('toggleStep marca e desmarca sem mutar o conjunto anterior', () => {
  const a = new Set();
  const b = toggleStep(a, 2);
  assert.equal(a.size, 0);
  assert.deepEqual([...b], [2]);
  const c = toggleStep(b, 2);
  assert.equal(c.size, 0);
  assert.deepEqual([...b], [2]);
});

test('progressOf conta só índices válidos do roteiro', () => {
  const path = { steps: [{}, {}, {}, {}] };
  assert.deepEqual(progressOf(path, new Set()), { done: 0, total: 4, ratio: 0 });
  assert.deepEqual(progressOf(path, new Set([0, 3])), { done: 2, total: 4, ratio: 0.5 });
  assert.deepEqual(progressOf(path, new Set([0, 9, -1])), { done: 1, total: 4, ratio: 0.25 });
  assert.deepEqual(progressOf({ steps: [] }, new Set([0])), { done: 0, total: 0, ratio: 0 });
});
