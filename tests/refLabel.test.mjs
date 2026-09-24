import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refLabel } from '../src/utils/refLabel.js';

// Referência bíblica: o rótulo vem do bibleNav, não do `ref` escrito à mão.
test('bíblica usa o nome do livro de bible.js e o formato do idioma', () => {
  const item = { ref: 'Mateus 16,18-19', bibleNav: { bookId: 'mt', chapter: 16, verse: 18, verseEnd: 19 } };
  assert.equal(refLabel(item, false), 'Mateus 16,18-19');
  assert.equal(refLabel(item, true), 'Matthew 16:18-19');
});

test('em EN prefere bibleNavEn quando a numeração difere (Joel)', () => {
  const item = {
    ref: 'Joel 2,31',
    bibleNav: { bookId: 'jl', chapter: 3, verse: 4 },
    bibleNavEn: { bookId: 'jl', chapter: 2, verse: 31 },
  };
  assert.equal(refLabel(item, false), 'Joel 3,4');
  assert.equal(refLabel(item, true), 'Joel 2:31');
});

test('não bíblica usa o ref curado, com refEn ou translateRef em inglês', () => {
  assert.equal(refLabel({ ref: 'Catecismo 882' }, false), 'Catecismo 882');
  assert.equal(refLabel({ ref: 'Catecismo 882' }, true), 'Catechism 882');
  assert.equal(refLabel({ ref: 'Dei Verbum 9', refEn: 'Dei Verbum, 9' }, true), 'Dei Verbum, 9');
});

test('bookId desconhecido cai no ref e item nulo devolve vazio', () => {
  assert.equal(refLabel({ ref: 'Fonte X', bibleNav: { bookId: 'zzz', chapter: 1 } }, false), 'Fonte X');
  assert.equal(refLabel(null), '');
});
