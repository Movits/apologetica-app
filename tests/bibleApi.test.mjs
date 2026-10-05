import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureBible, isBibleLoaded, getChapter, getVerse } from '../src/services/bibleApi.js';

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
