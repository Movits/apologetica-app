import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  space,
  radius,
  type,
  textStyle,
  icon,
  thumb,
  motion,
  shadow,
  FONT_FAMILY,
  FONT_FAMILY_BY_PLATFORM,
} from '../src/theme/tokens.js';

// Os números vêm de docs/design/pesquisa-apple.md §12 e do plano da Fase 5
// (Onda 1). O módulo precisa ser puro (sem react-native) para rodar aqui.

test('space segue a grade de 4 pt', () => {
  assert.deepEqual(space, { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 });
});

test('radius tem cinco valores', () => {
  assert.deepEqual(radius, { xs: 4, sm: 8, md: 12, lg: 18, full: 9999 });
});

test('type traz os papéis de texto com tamanho, entrelinha, peso e família', () => {
  assert.deepEqual(type.body, { size: 17, lineHeight: 22, weight: '400', family: 'sans' });
  assert.deepEqual(type.largeTitle, { size: 34, lineHeight: 41, weight: '600', family: 'display' });
  assert.equal(type.tabLabel.fixed, true);
});

test('textStyle compõe o estilo do RN sem escala', () => {
  assert.deepEqual(textStyle('body', (n) => n), {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: FONT_FAMILY.sans,
  });
  assert.equal(FONT_FAMILY.sans, undefined);
  assert.deepEqual(textStyle('body', (n) => n), {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: undefined,
  });
});

test('textStyle aplica a escala a tamanho e entrelinha', () => {
  const s = textStyle('body', (n) => Math.round(n * 1.35));
  assert.equal(s.fontSize, 23);
  assert.equal(s.lineHeight, 30);
});

test('textStyle ignora a escala nos papéis fixos (rótulo da tab bar)', () => {
  const s = textStyle('tabLabel', (n) => n * 2);
  assert.equal(s.fontSize, 11);
  assert.equal(s.lineHeight, 13);
});

test('textStyle lança Error para papel desconhecido', () => {
  assert.throws(() => textStyle('inexistente', (n) => n), Error);
});

test('icon tem três tamanhos', () => {
  assert.deepEqual(icon, { sm: 18, md: 22, lg: 26 });
});

test('thumb traz os lados das miniaturas (notícia, capa de artigo e estação 7:5)', () => {
  assert.deepEqual(thumb, { sm: 56, md: 72, seasonW: 56, seasonH: 40 });
});

test('motion traz durações, curva e escala de press', () => {
  assert.deepEqual(motion, {
    touch: 150,
    aba: 200,
    layout: 350,
    screen: 350,
    heavy: 500,
    spring: 550,
    stagger: 40,
    easing: [0.25, 0.1, 0.25, 1],
    press: { scale: 0.97 },
  });
});

test('shadow usa o formato boxShadow do RN 0.81 com um item', () => {
  const KEYS = ['offsetX', 'offsetY', 'blurRadius', 'color'];
  for (const name of ['card', 'floating', 'sheet']) {
    const list = shadow[name].boxShadow;
    assert.ok(Array.isArray(list), `${name}.boxShadow é array`);
    assert.equal(list.length, 1, `${name}.boxShadow tem 1 item`);
    assert.deepEqual(Object.keys(list[0]).sort(), [...KEYS].sort(), `${name}: chaves do item`);
  }
});

test('FONT_FAMILY_BY_PLATFORM resolve a serifa por plataforma', () => {
  assert.equal(FONT_FAMILY_BY_PLATFORM.ios.serif, 'Georgia');
  assert.equal(FONT_FAMILY_BY_PLATFORM.android.serif, 'serif');
  assert.ok(FONT_FAMILY_BY_PLATFORM.web.serif.startsWith('Georgia'));
  for (const os of ['ios', 'android', 'web']) {
    assert.equal(FONT_FAMILY_BY_PLATFORM[os].display, 'CormorantGaramond-SemiBold', `${os}.display`);
    assert.equal(FONT_FAMILY_BY_PLATFORM[os].sans, undefined, `${os}.sans`);
  }
});
