// Rótulo curto de uma referência (Onda 9c): "Mateus 16,18-19", "Catecismo 882",
// "Dei Verbum 9". Referência bíblica sai do `bibleNav` pelo formatVerseRef,
// com o nome do livro vindo de bible.js (em EN, o `bibleNavEn` quando a
// numeração da Douay-Rheims difere da Ave Maria, ex.: Joel). As demais usam
// o `ref` curado dos dados, traduzido por translateRef quando falta `refEn`.
// Módulo puro (sem react-native), coberto por tests/refLabel.test.mjs.
import { getBook, bookName } from '../data/bible';
import { translateRef } from '../data/references';
import { formatVerseRef } from './verseRef';

export function refLabel(item, isEn = false) {
  if (!item) return '';
  const nav = (isEn && item.bibleNavEn) || item.bibleNav;
  const book = nav ? getBook(nav.bookId) : null;
  if (book) {
    return formatVerseRef({ bookName: bookName(book, isEn), ...nav }, isEn);
  }
  if (isEn && item.refEn) return item.refEn;
  return translateRef(item.ref, isEn) || '';
}
