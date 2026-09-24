import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatVerseRef } from '../src/utils/verseRef.js';

// Formatos que as telas montam à mão hoje (02b, C25): "Livro cap,verso" em PT,
// "Livro cap:verso" em EN, intervalo "a-b" sem repetir quando a === b, e só o
// capítulo quando não há versículo. O nome do livro vem pronto do chamador.

test('PT usa vírgula: intervalo, versículo único e só capítulo', () => {
  assert.equal(formatVerseRef({ bookName: 'João', chapter: 3, verse: 3, verseEnd: 5 }, false), 'João 3,3-5');
  assert.equal(formatVerseRef({ bookName: 'João', chapter: 3, verse: 16 }, false), 'João 3,16');
  assert.equal(formatVerseRef({ bookName: 'João', chapter: 3 }, false), 'João 3');
});

test('EN usa dois-pontos: intervalo, versículo único e só capítulo', () => {
  assert.equal(formatVerseRef({ bookName: 'John', chapter: 3, verse: 3, verseEnd: 5 }, true), 'John 3:3-5');
  assert.equal(formatVerseRef({ bookName: 'John', chapter: 3, verse: 16 }, true), 'John 3:16');
  assert.equal(formatVerseRef({ bookName: 'John', chapter: 3 }, true), 'John 3');
});

test('verseEnd igual a verse não repete o número', () => {
  assert.equal(formatVerseRef({ bookName: 'João', chapter: 3, verse: 16, verseEnd: 16 }, false), 'João 3,16');
  assert.equal(formatVerseRef({ bookName: 'John', chapter: 3, verse: 16, verseEnd: 16 }, true), 'John 3:16');
});

test('verseStart é sinônimo de verse (formato das notas)', () => {
  assert.equal(formatVerseRef({ bookName: '1 Pedro', chapter: 3, verseStart: 15, verseEnd: 16 }, false), '1 Pedro 3,15-16');
  assert.equal(formatVerseRef({ bookName: '1 Peter', chapter: 3, verseStart: 15, verseEnd: 16 }, true), '1 Peter 3:15-16');
  assert.equal(formatVerseRef({ bookName: 'Salmos', chapter: 23, verseStart: 1, verseEnd: 1 }, false), 'Salmos 23,1');
});

test('isEn omitido cai em PT e números podem vir como string', () => {
  assert.equal(formatVerseRef({ bookName: 'Mateus', chapter: 16, verse: 18 }), 'Mateus 16,18');
  assert.equal(formatVerseRef({ bookName: 'Mateus', chapter: '16', verse: '18' }, false), 'Mateus 16,18');
  assert.equal(formatVerseRef({ bookName: 'Matthew', chapter: '16', verse: '18', verseEnd: '19' }, true), 'Matthew 16:18-19');
});

test('sem nome de livro devolve só a parte numérica', () => {
  assert.equal(formatVerseRef({ chapter: 3, verse: 16 }, true), '3:16');
  assert.equal(formatVerseRef({ chapter: 3 }, false), '3');
});

test('nomes de livro com espaço e abreviação passam intactos', () => {
  assert.equal(formatVerseRef({ bookName: 'Atos dos Apóstolos', chapter: 4, verse: 12 }, false), 'Atos dos Apóstolos 4,12');
  assert.equal(formatVerseRef({ bookName: 'Sl', chapter: 23, verse: 1 }, false), 'Sl 23,1');
});
