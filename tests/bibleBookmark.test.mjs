import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canonIndex,
  isAhead,
  nextChapterRef,
  prevChapterRef,
  sanitizeBookmark,
  START_REF,
} from '../src/utils/bibleBookmarkCore.js';
import { BIBLE_BOOKS } from '../src/data/bible.js';

const first = BIBLE_BOOKS[0];
const second = BIBLE_BOOKS[1];
const last = BIBLE_BOOKS[BIBLE_BOOKS.length - 1];

test('o começo da leitura é o capítulo 1 do primeiro livro do cânon', () => {
  assert.deepEqual(START_REF, { bookId: first.id, chapter: 1 });
});

test('canonIndex ordena livro antes de capítulo', () => {
  assert.ok(canonIndex({ bookId: first.id, chapter: first.totalChapters }) < canonIndex({ bookId: second.id, chapter: 1 }));
  assert.equal(canonIndex({ bookId: 'nao-existe', chapter: 1 }), -1);
});

test('nextChapterRef avança dentro do livro e atravessa para o livro seguinte', () => {
  assert.deepEqual(nextChapterRef({ bookId: first.id, chapter: 1 }), { bookId: first.id, chapter: 2 });
  assert.deepEqual(nextChapterRef({ bookId: first.id, chapter: first.totalChapters }), { bookId: second.id, chapter: 1 });
  assert.equal(nextChapterRef({ bookId: last.id, chapter: last.totalChapters }), null);
  assert.equal(nextChapterRef({ bookId: 'nao-existe', chapter: 1 }), null);
});

test('isAhead: capítulo depois, ou mesmo capítulo mais adiante na rolagem', () => {
  const a = { bookId: first.id, chapter: 3, ratio: 0.5 };
  assert.equal(isAhead({ bookId: first.id, chapter: 4, ratio: 0 }, a), true);
  assert.equal(isAhead({ bookId: first.id, chapter: 2, ratio: 1 }, a), false);
  assert.equal(isAhead({ bookId: first.id, chapter: 3, ratio: 0.6 }, a), true);
  assert.equal(isAhead({ bookId: first.id, chapter: 3, ratio: 0.4 }, a), false);
  assert.equal(isAhead({ bookId: second.id, chapter: 1, ratio: 0 }, a), true);
  // Sem marcador ainda, qualquer ponto válido serve.
  assert.equal(isAhead({ bookId: first.id, chapter: 1, ratio: 0 }, null), true);
});

test('sanitizeBookmark descarta lixo do armazenamento', () => {
  assert.equal(sanitizeBookmark(null), null);
  assert.equal(sanitizeBookmark({ bookId: 'nao-existe', chapter: 1 }), null);
  assert.equal(sanitizeBookmark({ bookId: first.id, chapter: 0 }), null);
  assert.equal(sanitizeBookmark({ bookId: first.id, chapter: first.totalChapters + 1 }), null);
  assert.equal(sanitizeBookmark({ bookId: first.id, chapter: 1.5 }), null);
  const ok = sanitizeBookmark({ bookId: first.id, chapter: 2, ratio: 7, verse: 'x', lang: 'pt', at: 5 });
  assert.deepEqual(ok, { bookId: first.id, chapter: 2, ratio: 1, verse: null, lang: 'pt', at: 5 });
  const comVerso = sanitizeBookmark({ bookId: first.id, chapter: 2, verse: 4 });
  assert.equal(comVerso.verse, 4);
  assert.equal(comVerso.ratio, 0);
});

test('prevChapterRef volta dentro do livro e atravessa para o fim do livro anterior', () => {
  assert.deepEqual(prevChapterRef({ bookId: second.id, chapter: 3 }), { bookId: second.id, chapter: 2 });
  assert.deepEqual(prevChapterRef({ bookId: second.id, chapter: 1 }), { bookId: first.id, chapter: first.totalChapters });
  assert.equal(prevChapterRef({ bookId: first.id, chapter: 1 }), null);
  assert.equal(prevChapterRef({ bookId: 'nao-existe', chapter: 2 }), null);
});
