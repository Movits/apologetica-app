import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_MODES, resolveThemeMode, isDarkFor } from '../src/utils/themeMode.js';

// Tema em três estados (sistema, claro, escuro). O módulo precisa ser puro
// (sem react-native) para rodar aqui; o ThemeContext só aplica o resultado.

test('THEME_MODES são sistema, claro e escuro, nessa ordem', () => {
  assert.deepEqual(THEME_MODES, ['system', 'light', 'dark']);
});

test('resolveThemeMode: a escolha da landing (appg_theme) vence a salva', () => {
  assert.equal(resolveThemeMode({ landing: 'dark', saved: 'light' }), 'dark');
  assert.equal(resolveThemeMode({ landing: 'light', saved: 'dark' }), 'light');
  assert.equal(resolveThemeMode({ landing: 'light', saved: 'system' }), 'light');
});

test('resolveThemeMode: sem landing, vale o modo salvo', () => {
  assert.equal(resolveThemeMode({ landing: null, saved: 'dark' }), 'dark');
  assert.equal(resolveThemeMode({ landing: undefined, saved: 'light' }), 'light');
  assert.equal(resolveThemeMode({ landing: null, saved: 'system' }), 'system');
});

test('resolveThemeMode: landing só conta como light/dark, nunca como system', () => {
  // A landing nunca grava 'system'; se gravasse, cai no salvo.
  assert.equal(resolveThemeMode({ landing: 'system', saved: 'dark' }), 'dark');
});

test('resolveThemeMode: valores inválidos ou ausentes caem em system', () => {
  assert.equal(resolveThemeMode({ landing: 'blue', saved: 'true' }), 'system');
  assert.equal(resolveThemeMode({ landing: '', saved: '' }), 'system');
  assert.equal(resolveThemeMode({ landing: null, saved: null }), 'system');
  assert.equal(resolveThemeMode({}), 'system');
  assert.equal(resolveThemeMode(), 'system');
});

test('isDarkFor: explícito ignora o sistema, system segue o sistema', () => {
  assert.equal(isDarkFor('dark', 'light'), true);
  assert.equal(isDarkFor('dark', 'dark'), true);
  assert.equal(isDarkFor('light', 'dark'), false);
  assert.equal(isDarkFor('light', 'light'), false);
  assert.equal(isDarkFor('system', 'dark'), true);
  assert.equal(isDarkFor('system', 'light'), false);
});

test('isDarkFor: sistema sem esquema conhecido é claro', () => {
  assert.equal(isDarkFor('system', null), false);
  assert.equal(isDarkFor('system', undefined), false);
});
