// Rótulo curto de uma referência (Onda 9c): "Mateus 16,18-19", "Catecismo 882",
// "Dei Verbum 9". Referência bíblica sai do `bibleNav` pelo formatVerseRef,
// com o nome do livro vindo de bible.js (em EN, o `bibleNavEn` quando a
// numeração da Douay-Rheims difere da Ave Maria, ex.: Joel). As demais usam
// o `ref` curado dos dados, traduzido por translateRef quando falta `refEn`.
// Módulo puro (sem react-native), coberto por tests/refLabel.test.mjs.
import { getBook, bookName } from '../data/bible';
import { translateRef } from '../data/references';
import { formatVerseRef } from './verseRef';

// Rótulo de um versículo solto ({ bookId, chapter, verse | verseStart,
// verseEnd? }): "João 3,16" em PT, "John 3:16" em EN. Vazio se o livro não
// existe. É o que marcações, notas e busca montavam à mão com
// formatVerseRef + bookName + getBook.
export function verseLabel(nav, isEn = false) {
  const book = nav ? getBook(nav.bookId) : null;
  if (!book) return '';
  return formatVerseRef({ ...nav, bookName: bookName(book, isEn) }, isEn);
}

export function refLabel(item, isEn = false) {
  if (!item) return '';
  const label = verseLabel((isEn && item.bibleNavEn) || item.bibleNav, isEn);
  if (label) return label;
  if (isEn && item.refEn) return item.refEn;
  return translateRef(item.ref, isEn) || '';
}
