import { test } from 'node:test';
import assert from 'node:assert/strict';
import { references, referencesWithEn, withEn, referenceById } from '../src/data/references.js';
import { referencesEn } from '../src/data/references-en.js';
import { SOURCE_IDS } from '../src/data/referenceSources.js';

test('ids das referências são únicos', () => {
  const seen = new Set();
  const duplicated = [];
  for (const r of references) {
    if (seen.has(r.id)) duplicated.push(r.id);
    seen.add(r.id);
  }
  assert.deepEqual(duplicated, []);
});

test('toda referência usa um source da lista fechada', () => {
  const invalid = references
    .filter((r) => !SOURCE_IDS.has(r.source))
    .map((r) => `${r.id}: ${r.source}`);
  assert.deepEqual(invalid, []);
});

// withEn / referencesWithEn (Fase 5): a mescla { ...ref, ...referencesEn[id] }
// que cinco telas refaziam. O catálogo mesclado tem o mesmo tamanho e a mesma
// ordem, e cada item ganha só os campos *En da sua tradução.
test('referencesWithEn tem o mesmo tamanho e os mesmos ids, na mesma ordem', () => {
  assert.equal(referencesWithEn.length, references.length);
  assert.deepEqual(referencesWithEn.map((r) => r.id), references.map((r) => r.id));
});

test('withEn mescla a tradução campo a campo e deixa o PT intacto', () => {
  const base = referenceById('mt-16-18');
  const merged = withEn(base);
  assert.equal(merged.ref, base.ref);
  assert.equal(merged.text, base.text);
  assert.equal(merged.textEn, referencesEn['mt-16-18'].textEn);
  assert.equal(merged.topicEn, referencesEn['mt-16-18'].topicEn);
  // Não altera o objeto original nem o do catálogo.
  assert.equal(base.textEn, undefined);
  assert.deepEqual(referencesWithEn.find((r) => r.id === 'mt-16-18'), merged);
});

test('withEn sem tradução devolve cópia igual, e nulo devolve nulo', () => {
  const semEn = references.find((r) => !referencesEn[r.id]);
  assert.ok(semEn, 'a dívida legada ainda tem referência sem EN');
  assert.deepEqual(withEn(semEn), semEn);
  assert.notEqual(withEn(semEn), semEn);
  assert.equal(withEn(null), null);
  assert.equal(withEn(undefined), null);
});
