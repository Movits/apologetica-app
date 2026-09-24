import { test } from 'node:test';
import assert from 'node:assert/strict';
import { references } from '../src/data/references.js';
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
