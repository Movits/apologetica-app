import { getBook, bookName } from '../data/bible';
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

// Normaliza para busca: minúsculas + remove acentos.
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca full-text offline na Bíblia inteira (varredura por substring, não Fuse:
// ~35 mil versículos por tradução, já residentes em memória). Retorna itens
// prontos para deep-link: { bookId, chapter, verse, ref, text }.
// `language`: 'en' → Douay-Rheims, senão Ave Maria (PT).
export function searchBible(query, { language = 'pt', limit = 30 } = {}) {
  const q = norm(query).trim();
  if (q.length < 3) return [];
  const isEn = language === 'en';
  const data = isEn ? DRA : AVEMARIA;
  if (!data) return [];
  const sep = isEn ? ':' : ',';
  const results = [];
  for (const bookId of Object.keys(data)) {
    const chapters = data[bookId];
    if (!chapters) continue;
    const book = getBook(bookId);
    if (!book) continue;
    const name = bookName(book, isEn);
    for (let ci = 0; ci < chapters.length; ci++) {
      const verses = chapters[ci];
      if (!verses) continue;
      for (let vi = 0; vi < verses.length; vi++) {
        if (norm(verses[vi]).includes(q)) {
          const chapter = ci + 1;
          const verse = vi + 1;
          results.push({
            bookId,
            chapter,
            verse,
            ref: `${name} ${chapter}${sep}${verse}`,
            text: verses[vi],
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}
