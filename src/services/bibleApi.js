import { getBook } from '../data/bible';
import { AVEMARIA } from '../data/bibleAveMaria';
import { DRA } from '../data/bibleDouayRheims';

// Tudo bundled localmente:
//   - Português: Bíblia Ave Maria completa (73 livros, ~4 MB)
//   - Inglês: Douay-Rheims-Challoner (73 livros, ~4.5 MB)
// Resposta síncrona, sem rede, sem cache.

// Retorna { total, verses: [{n, t}], source, language } ou null.
// `language` pode ser 'pt' ou 'en'. Fallback automático para PT se EN não estiver disponível.
export function getChapter(bookId, chapter, language = 'pt') {
  const book = getBook(bookId);
  if (!book) return null;

  if (language === 'en' && DRA) {
    const bookData = DRA[bookId];
    if (bookData) {
      const chapterArr = bookData[chapter - 1];
      if (chapterArr) {
        return {
          total: chapterArr.length,
          verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
          source: 'douay-rheims',
          language: 'en',
        };
      }
    }
    // se EN pedido mas indisponível, devolve PT marcado como fallback
    const fallback = getChapter(bookId, chapter, 'pt');
    if (fallback) return { ...fallback, language: 'pt', fallback: true };
    return null;
  }

  const bookData = AVEMARIA[bookId];
  if (!bookData) return null;

  const chapterArr = bookData[chapter - 1];
  if (!chapterArr) return null;

  return {
    total: chapterArr.length,
    verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
    source: 'avemaria',
    language: 'pt',
  };
}
