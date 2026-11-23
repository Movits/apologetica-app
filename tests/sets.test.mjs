import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepIfSame, sameSet } from '../src/utils/sets.js';

test('sameSet compara conteúdo, não referência', () => {
  assert.equal(sameSet(new Set([1, 2]), new Set([2, 1])), true);
  assert.equal(sameSet(new Set([1, 2]), new Set([1, 3])), false);
  assert.equal(sameSet(new Set([1]), new Set([1, 2])), false);
  assert.equal(sameSet(new Set(), new Set()), true);
  assert.equal(sameSet(null, new Set()), false);
});

test('keepIfSame mantém o Set anterior quando nada mudou', () => {
  const prev = new Set([1, 2]);
  assert.equal(keepIfSame(new Set([2, 1]))(prev), prev);
  const next = new Set([1, 2, 3]);
  assert.equal(keepIfSame(next)(prev), next);
});
