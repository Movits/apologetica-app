import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIGHT, DARK, contrastRatio } from '../src/theme/palette.js';

// Paleta do app (src/theme/palette.js), a da identidade Clássica: as duas
// paletas precisam ter as mesmas chaves (as telas leem qualquer uma delas sem
// ajuste) e passar no contraste AA nos pares de texto e fundo.

const PALETTES = { light: LIGHT, dark: DARK };

test('a paleta preserva exatamente as cores da Clássica', () => {
  assert.equal(LIGHT.primary, '#1a3a5c');
  assert.equal(LIGHT.accent, '#c9a84c');
  assert.equal(LIGHT.bg, '#f5f0e8');
  assert.equal(DARK.bg, '#0d1722');
  assert.equal(DARK.tint, '#d4b86a');
});

test('clara e escura têm as mesmas chaves e o campo mode certo', () => {
  assert.deepEqual(Object.keys(DARK).sort(), Object.keys(LIGHT).sort());
  for (const [mode, c] of Object.entries(PALETTES)) {
    assert.equal(c.mode, mode, `${mode}.mode`);
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
  for (const [mode, c] of Object.entries(PALETTES)) {
    for (const [fg, bg] of PAIRS) {
      const r = contrastRatio(c[fg], c[bg]);
      if (r < 4.5) fails.push(`${mode}: ${fg} sobre ${bg} = ${r.toFixed(2)}`);
    }
  }
  assert.deepEqual(fails, []);
});
