import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LAYOUT,
  navModeFor,
  contentWidthFor,
  sideMargin,
  gridColumns,
  spreadColumns,
} from '../src/utils/layout.js';

test('navModeFor: barra no celular, cápsula no tablet, lateral no desktop', () => {
  assert.equal(navModeFor(390), 'bar');
  assert.equal(navModeFor(LAYOUT.capsuleAt - 1), 'bar');
  assert.equal(navModeFor(LAYOUT.capsuleAt), 'capsule');
  assert.equal(navModeFor(LAYOUT.sidebarAt - 1), 'capsule');
  assert.equal(navModeFor(LAYOUT.sidebarAt), 'sidebar');
  assert.equal(navModeFor(1920), 'sidebar');
});

test('contentWidthFor: desconta a barra lateral só quando ela aparece', () => {
  assert.equal(contentWidthFor(390), 390);
  assert.equal(contentWidthFor(900), 900);
  assert.equal(contentWidthFor(1440), 1440 - LAYOUT.sidebarWidth);
});

test('sideMargin: o mínimo no celular, o que sobra da coluna no desktop', () => {
  assert.equal(sideMargin(390, 720, 16), 16);
  assert.equal(sideMargin(1000, 720, 16), 140);
});

test('gridColumns: quantas colunas de pelo menos minCell cabem, com teto', () => {
  assert.equal(gridColumns(320, 260, 16, 3), 1);
  assert.equal(gridColumns(560, 260, 16, 3), 2);
  assert.equal(gridColumns(900, 260, 16, 3), 3);
  assert.equal(gridColumns(2000, 260, 16, 3), 3);
  assert.equal(gridColumns(0, 260, 16, 3), 1);
});

test('LAYOUT: a lateral só entra quando sobra espaço para a coluna de leitura', () => {
  assert.ok(LAYOUT.sidebarAt - LAYOUT.sidebarWidth >= 720);
  assert.ok(LAYOUT.pageMax > 720);
});

test('spreadColumns: reparte em k colunas, em rodízio, sem perder a ordem', () => {
  assert.deepEqual(spreadColumns(['a', 'b', 'c'], 3), [['a'], ['b'], ['c']]);
  assert.deepEqual(spreadColumns(['a', 'b', 'c'], 2), [['a', 'c'], ['b']]);
  assert.deepEqual(spreadColumns(['a', 'b', 'c', 'd', 'e'], 2), [['a', 'c', 'e'], ['b', 'd']]);
  assert.deepEqual(spreadColumns(['a', 'b'], 1), [['a', 'b']]);
  assert.deepEqual(spreadColumns(['a'], 3), [['a']]);
  assert.deepEqual(spreadColumns([], 2), []);
});
