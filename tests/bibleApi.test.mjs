import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureBible, isBibleLoaded, getChapter, getVerse } from '../src/services/bibleApi.js';
import { BIBLE_BOOKS } from '../src/data/bible.js';

// getVerse (Fase 5): leitura direta de um versículo, no lugar de
// getChapter(...)?.verses?.find((v) => v.n === n)?.t que Marcações, Notas e o
// editor de nota repetiam. Segue as regras de fallback de getChapter.
//
// O módulo guarda as traduções carregadas em estado próprio, então a ordem
// aqui importa: o primeiro teste roda ANTES de carregar o inglês.

await ensureBible('pt');

test('EN pedido sem a Douay-Rheims carregada cai no PT, como getChapter', () => {
  assert.equal(isBibleLoaded('en'), false);
  assert.equal(getVerse('jo', 3, 16, 'en'), getChapter('jo', 3, 'pt').verses[15].t);
});

test('lê o versículo certo em cada tradução', async () => {
  await ensureBible('en');
  assert.equal(isBibleLoaded('en'), true);
  const pt = getVerse('jo', 3, 16, 'pt');
  const en = getVerse('jo', 3, 16, 'en');
  assert.equal(typeof pt, 'string');
  assert.equal(typeof en, 'string');
  assert.notEqual(pt, en);
  assert.equal(pt, getChapter('jo', 3, 'pt').verses.find((v) => v.n === 16).t);
  assert.equal(en, getChapter('jo', 3, 'en').verses.find((v) => v.n === 16).t);
  // Sem idioma é PT.
  assert.equal(getVerse('gn', 1, 1), getChapter('gn', 1).verses[0].t);
});

// Jó e Jonas tinham outra chave na Douay-Rheims ('jó', 'jn') e o inglês caía
// no PT sem aviso. Todo livro do cânon precisa existir nas duas traduções.
test('todo livro do cânon abre em inglês sem cair no PT', () => {
  const semEn = BIBLE_BOOKS.filter((b) => {
    const ch = getChapter(b.id, 1, 'en');
    return !ch || ch.fallback;
  }).map((b) => b.id);
  assert.deepEqual(semEn, []);
  assert.notEqual(getVerse('jo_at', 1, 1, 'en'), getVerse('jo_at', 1, 1, 'pt'));
  assert.notEqual(getVerse('jn_at', 1, 1, 'en'), getVerse('jn_at', 1, 1, 'pt'));
});

test('devolve null fora do cânon, do capítulo ou do versículo', () => {
  assert.equal(getVerse('zzz', 1, 1, 'pt'), null);
  assert.equal(getVerse('jo', 99, 1, 'pt'), null);
  assert.equal(getVerse('jo', 3, 999, 'pt'), null);
  assert.equal(getVerse('jo', 3, 0, 'pt'), null);
  assert.equal(getVerse('jo', 3, 999, 'en'), null);
  assert.equal(getVerse('jo', 0, 1, 'en'), null);
});

test('capítulo com menos versículos em EN: sem fallback por versículo (regra do capítulo)', () => {
  // Procura um capítulo em que a Douay-Rheims tem menos versículos que a Ave
  // Maria. getChapter devolve o capítulo EN inteiro nesse caso (o versículo
  // extra vira "não encontrado"), e getVerse faz o mesmo: null, não o PT.
  let found = null;
  for (const bookId of ['sl', 'jl', 'dn', 'est', 'ml', 'os', 'nm', 'gn']) {
    const totalCh = getChapter(bookId, 1, 'pt') ? 200 : 0;
    for (let ch = 1; ch <= totalCh && !found; ch++) {
      const pt = getChapter(bookId, ch, 'pt');
      const en = getChapter(bookId, ch, 'en');
      if (!pt) break;
      if (en && !en.fallback && en.total < pt.total) found = { bookId, ch, verse: pt.total };
    }
    if (found) break;
  }
  if (!found) return; // nenhuma diferença de numeração nos livros olhados
  assert.equal(typeof getVerse(found.bookId, found.ch, found.verse, 'pt'), 'string');
  assert.equal(getVerse(found.bookId, found.ch, found.verse, 'en'), null);
});

// Blocos da edição impressa: a Ave Maria imprime alguns grupos de versículos
// juntos (Josué 19,2-7, listas de cidades e genealogias). O dado guarda o
// texto no primeiro número e deixa os seguintes vazios, para a numeração
// continuar certa; a tela mostra uma linha só, "2-7".
test('chapterVerses junta o bloco numa linha com o intervalo', async () => {
  const { chapterVerses } = await import('../src/services/bibleApi.js');
  assert.deepEqual(chapterVerses(['a', 'b', '', '', 'c']), [
    { n: 1, t: 'a' },
    { n: 2, t: 'b', end: 4 },
    { n: 5, t: 'c' },
  ]);
  assert.deepEqual(chapterVerses(['a', 'b']), [{ n: 1, t: 'a' }, { n: 2, t: 'b' }]);
  assert.deepEqual(chapterVerses(['a', '']), [{ n: 1, t: 'a', end: 2 }]);
});

test('verseText devolve o texto do bloco para qualquer número dentro dele', async () => {
  const { verseText } = await import('../src/services/bibleApi.js');
  const ch = ['a', 'b', '', '', 'c'];
  assert.equal(verseText(ch, 1), 'a');
  assert.equal(verseText(ch, 2), 'b');
  assert.equal(verseText(ch, 3), 'b');
  assert.equal(verseText(ch, 4), 'b');
  assert.equal(verseText(ch, 5), 'c');
  assert.equal(verseText(ch, 6), null);
  assert.equal(verseText(ch, 0), null);
  assert.equal(verseText(undefined, 1), null);
});

test('getChapter conta os números do capítulo, não as linhas', () => {
  // Josué 19 tem os blocos 2-7, 17-23, 35-39 e 41-46: 51 números em 31 linhas.
  const ch = getChapter('js', 19, 'pt');
  assert.equal(ch.total, 51);
  assert.equal(ch.verses.length, 31);
  assert.equal(ch.total, ch.verses.reduce((n, v) => n + (v.end ? v.end - v.n + 1 : 1), 0));
});

test('verseSpan devolve o intervalo da linha que contém o número', async () => {
  const { verseSpan } = await import('../src/services/bibleApi.js');
  const ch = ['a', 'b', '', '', 'c'];
  assert.deepEqual(verseSpan(ch, 1), { start: 1, end: 1 });
  assert.deepEqual(verseSpan(ch, 2), { start: 2, end: 4 });
  assert.deepEqual(verseSpan(ch, 3), { start: 2, end: 4 });
  assert.deepEqual(verseSpan(ch, 5), { start: 5, end: 5 });
  assert.equal(verseSpan(ch, 6), null);
  assert.equal(verseSpan(ch, 0), null);
  assert.equal(verseSpan(undefined, 1), null);
});
