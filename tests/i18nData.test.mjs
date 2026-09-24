import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pick, pickAll, categoryLabel } from '../src/utils/i18nData.js';
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
