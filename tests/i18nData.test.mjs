import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pick, pickAll, categoryLabel, pickPair, tOr } from '../src/utils/i18nData.js';
import { translate } from '../src/i18n/strings.js';

// Padrão que o app repete em dezenas de lugares: `isEn ? (a.titleEn || a.title)
// : a.title`. O helper mantém o fallback para PT quando a tradução falta.

const item = {
  title: 'Título',
  titleEn: 'Title',
  summary: 'Resumo',
  summaryEn: '',
  body: 'Corpo',
};

test('pick devolve a tradução em EN quando ela existe', () => {
  assert.equal(pick(item, 'title', true), 'Title');
});

test('pick devolve o PT quando isEn é falso, mesmo com tradução', () => {
  assert.equal(pick(item, 'title', false), 'Título');
  assert.equal(pick(item, 'title'), 'Título');
});

test('pick cai para o PT quando a tradução falta ou é vazia', () => {
  assert.equal(pick(item, 'summary', true), 'Resumo');
  assert.equal(pick(item, 'body', true), 'Corpo');
});

test('pick tolera campo inexistente e item nulo', () => {
  assert.equal(pick(item, 'nope', true), undefined);
  assert.equal(pick(item, 'nope', false), undefined);
  assert.equal(pick(null, 'title', true), undefined);
  assert.equal(pick(undefined, 'title', false), undefined);
});

test('pick aplica o fallback ao PT só quando falta a tradução curada', () => {
  // Imita os translate* de references.js: mexe no valor só quando isEn.
  const upper = (v, isEn) => (isEn && v ? v.toUpperCase() : v);
  assert.equal(pick(item, 'title', true, upper), 'Title');
  assert.equal(pick(item, 'summary', true, upper), 'RESUMO');
  assert.equal(pick(item, 'summary', false, upper), 'Resumo');
  assert.equal(pick(item, 'nope', true, upper), undefined);
  assert.equal(pick(null, 'title', true, upper), undefined);
});

test('pickAll monta um objeto só com os campos pedidos', () => {
  assert.deepEqual(pickAll(item, ['title', 'summary'], true), { title: 'Title', summary: 'Resumo' });
  assert.deepEqual(pickAll(item, ['title', 'summary'], false), { title: 'Título', summary: 'Resumo' });
  assert.deepEqual(pickAll(item, ['nope'], true), { nope: undefined });
  assert.deepEqual(pickAll(null, ['title'], true), { title: undefined });
});

test('categoryLabel traduz pela chave category.<id> das strings', () => {
  const tPt = (k) => translate('pt', k);
  const tEn = (k) => translate('en', k);
  assert.equal(categoryLabel('Existência de Deus', tPt), 'Existência de Deus');
  assert.equal(categoryLabel('Existência de Deus', tEn), 'Existence of God');
  assert.equal(categoryLabel('História da Igreja', tEn), 'Church History');
  assert.equal(categoryLabel('popular', tEn), 'Most searched');
});

test('categoryLabel cai no próprio id quando não há tradução', () => {
  // translate devolve a própria chave quando ela não existe.
  const tEn = (k) => translate('en', k);
  assert.equal(categoryLabel('Categoria Nova', tEn), 'Categoria Nova');
  // t que devolve vazio ou não é função também cai no id.
  assert.equal(categoryLabel('Moral', () => ''), 'Moral');
  assert.equal(categoryLabel('Moral', null), 'Moral');
  assert.equal(categoryLabel('', tEn), '');
});

// pickPair e tOr (Fase 5): o `isEn ? en : pt` de valores soltos e o "t ou
// fallback" que categoryLabel já fazia por dentro.
test('pickPair escolhe o EN só quando pedido e existente', () => {
  assert.equal(pickPair('Olá', 'Hello', true), 'Hello');
  assert.equal(pickPair('Olá', 'Hello', false), 'Olá');
  assert.equal(pickPair('Olá', 'Hello'), 'Olá');
  assert.equal(pickPair('Olá', '', true), 'Olá');
  assert.equal(pickPair('Olá', undefined, true), 'Olá');
  assert.equal(pickPair(undefined, undefined, true), undefined);
});

test('tOr devolve a tradução, ou o fallback quando a chave não existe', () => {
  const tEn = (k) => translate('en', k);
  assert.equal(tOr(tEn, 'common.save', 'x'), 'Save');
  assert.equal(tOr(tEn, 'chave.inexistente', 'padrão'), 'padrão');
  assert.equal(tOr(() => '', 'k', 'padrão'), 'padrão');
  assert.equal(tOr(null, 'k', 'padrão'), 'padrão');
  assert.equal(tOr(undefined, 'k'), undefined);
});
