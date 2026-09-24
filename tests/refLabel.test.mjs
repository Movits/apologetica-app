import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refLabel, verseLabel } from '../src/utils/refLabel.js';

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

// verseLabel (Fase 5): só a parte bíblica do refLabel, para as telas que têm
// um { bookId, chapter, verse } solto (marcações, notas, busca) e montavam
// formatVerseRef + bookName + getBook cada uma por si.
test('verseLabel monta o rótulo de um { bookId, chapter, verse } no idioma', () => {
  assert.equal(verseLabel({ bookId: 'jo', chapter: 3, verse: 16 }, false), 'João 3,16');
  assert.equal(verseLabel({ bookId: 'jo', chapter: 3, verse: 16 }, true), 'John 3:16');
  assert.equal(verseLabel({ bookId: 'mt', chapter: 16, verse: 18, verseEnd: 19 }, true), 'Matthew 16:18-19');
  // As notas guardam verseStart no Firestore.
  assert.equal(verseLabel({ bookId: 'mt', chapter: 5, verseStart: 3, verseEnd: 12 }, false), 'Mateus 5,3-12');
  // Campos extras do item (texto, ref pronto) não atrapalham.
  assert.equal(verseLabel({ bookId: 'gn', chapter: 1, verse: 1, text: 'No princípio', ref: 'x' }, false), 'Gênesis 1,1');
});

test('verseLabel devolve vazio sem livro conhecido ou sem nav', () => {
  assert.equal(verseLabel({ bookId: 'zzz', chapter: 1, verse: 1 }, false), '');
  assert.equal(verseLabel(null, false), '');
  assert.equal(verseLabel(undefined, true), '');
});
