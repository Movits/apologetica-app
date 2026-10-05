import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IDENTITY_IDS,
  IDENTITIES,
  DEFAULT_IDENTITY,
  identityFor,
  contrastRatio,
} from '../src/theme/identities.js';

// Identidades visuais (src/theme/identities.js): a Clássica é a de sempre e
// as outras são propostas que o dono avalia no próprio app (Ajustes >
// Aparência). Qualquer uma precisa funcionar em todas as telas sem ajuste,
// então todas têm as mesmas chaves e passam no mesmo contraste.

test('a Clássica é o padrão e identityFor cai nela com id desconhecido', () => {
  assert.equal(DEFAULT_IDENTITY, 'classica');
  assert.deepEqual(IDENTITY_IDS, ['classica', 'ancora', 'basilica', 'lumen']);
  assert.equal(identityFor('nao-existe').id, 'classica');
  assert.equal(identityFor(undefined).id, 'classica');
  assert.equal(identityFor('lumen').id, 'lumen');
});

test('a Clássica preserva exatamente as cores atuais', () => {
  const { light, dark } = IDENTITIES.classica;
  assert.equal(light.primary, '#1a3a5c');
  assert.equal(light.accent, '#c9a84c');
  assert.equal(light.bg, '#f5f0e8');
  assert.equal(dark.bg, '#0d1722');
  assert.equal(dark.tint, '#d4b86a');
});

test('todas as paletas têm as mesmas chaves da Clássica', () => {
  const keys = Object.keys(IDENTITIES.classica.light).sort();
  for (const id of IDENTITY_IDS) {
    for (const mode of ['light', 'dark']) {
      assert.deepEqual(Object.keys(IDENTITIES[id][mode]).sort(), keys, `${id}.${mode}`);
      assert.equal(IDENTITIES[id][mode].mode, mode, `${id}.${mode}.mode`);
    }
  }
});

test('cada identidade tem nome nos dois idiomas, fonte de títulos e marca', () => {
  for (const id of IDENTITY_IDS) {
    const it = IDENTITIES[id];
    assert.equal(it.id, id);
    assert.ok(it.name && it.nameEn, `${id}: nome`);
    assert.ok(it.concept && it.conceptEn, `${id}: conceito`);
    assert.match(it.display, /^[A-Za-z]+-[A-Za-z]+$/, `${id}: fonte`);
    assert.ok(['cross', 'anchor', 'chirho', 'bubble'].includes(it.mark), `${id}: marca`);
    assert.ok(it.displayScale > 0.7 && it.displayScale <= 1.1, `${id}: escala`);
  }
});

test('contrastRatio segue a fórmula da WCAG', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff') * 10) / 10, 21);
  assert.equal(contrastRatio('#777777', '#777777'), 1);
  // Valor conhecido: #767676 sobre branco dá 4,54.
  assert.ok(Math.abs(contrastRatio('#767676', '#ffffff') - 4.54) < 0.01);
});

// Pares de texto e fundo usados nas telas, com o mínimo AA de texto normal.
const PAIRS = [
  ['text', 'bg'], ['text', 'card'],
  ['textSubtle', 'bg'], ['textSubtle', 'card'],
  ['accentText', 'bg'], ['accentText', 'card'],
  ['tint', 'bg'], ['tint', 'card'],
  ['onTint', 'tint'],
  ['onPrimary', 'primary'],
  ['badgeText', 'badgeBg'],
  ['primaryText', 'card'],
];

test('todos os pares de texto passam no contraste AA (4,5:1)', () => {
  const fails = [];
  for (const id of IDENTITY_IDS) {
    for (const mode of ['light', 'dark']) {
      const c = IDENTITIES[id][mode];
      for (const [fg, bg] of PAIRS) {
        const r = contrastRatio(c[fg], c[bg]);
        if (r < 4.5) fails.push(`${id}.${mode}: ${fg} sobre ${bg} = ${r.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(fails, []);
});
