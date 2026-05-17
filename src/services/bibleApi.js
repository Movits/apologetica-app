import { getBook } from '../data/bible';
import { AVEMARIA } from '../data/bibleAveMaria';

// Tudo bundled localmente: Bíblia Ave Maria completa (73 livros).
// Resposta síncrona, sem rede, sem cache.

// Retorna { total, verses: [{n, t}], source } ou null se não tiver conteúdo.
export function getChapter(bookId, chapter) {
  const book = getBook(bookId);
  if (!book) return null;

  const bookData = AVEMARIA[bookId];
  if (!bookData) return null;

  const chapterArr = bookData[chapter - 1]; // 0-indexed
  if (!chapterArr) return null;

  return {
    total: chapterArr.length,
    verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
    source: 'avemaria',
  };
}

// Compatibilidade: alguns lugares ainda podem importar fetchChapter (assíncrono).
export async function fetchChapter(bookId, chapter) {
  return getChapter(bookId, chapter);
}
