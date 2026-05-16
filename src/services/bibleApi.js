import { BIBLE_BOOKS, getBook } from '../data/bible';
import { getLocalChapter } from '../data/bibleContent';
import { ALMEIDA } from '../data/bibleAlmeida';

// Tudo bundled localmente: Almeida (66 livros canônicos) + curado (deuterocanônicos
// e overrides). Não há mais chamadas de rede para a Bíblia. Resposta é síncrona.

// Retorna { total, verses: [{n, t}], source } ou null se não tiver conteúdo.
export function getChapter(bookId, chapter) {
  const book = getBook(bookId);
  if (!book) return null;

  // 1. Conteúdo curado / override / deuterocanônico (precedência máxima)
  const local = getLocalChapter(bookId, chapter);
  if (local) return { ...local, source: 'local' };

  // 2. Almeida bundled (66 livros canônicos)
  const almeidaBook = ALMEIDA[bookId];
  if (almeidaBook) {
    const chapterArr = almeidaBook[chapter - 1]; // 0-indexed
    if (chapterArr) {
      return {
        total: chapterArr.length,
        verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
        source: 'almeida',
      };
    }
  }

  // 3. Sem conteúdo (deuterocanônico ainda não digitado, por exemplo)
  return null;
}

// Para navegação entre capítulos: retorna se o capítulo seguinte/anterior existe
export function hasChapter(bookId, chapter) {
  const book = getBook(bookId);
  if (!book || chapter < 1 || chapter > book.totalChapters) return false;
  return getChapter(bookId, chapter) !== null;
}

// Compatibilidade: alguns lugares ainda podem importar fetchChapter (assíncrono).
export async function fetchChapter(bookId, chapter) {
  return getChapter(bookId, chapter);
}

// Quantos capítulos de cada livro temos disponíveis (para mostrar em status)
export function getBookAvailability(bookId) {
  const book = getBook(bookId);
  if (!book) return { available: 0, total: 0 };
  let count = 0;
  for (let c = 1; c <= book.totalChapters; c++) {
    if (getChapter(bookId, c)) count++;
  }
  return { available: count, total: book.totalChapters };
}
