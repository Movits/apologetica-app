// Referência de versículo no formato que o app exibe (Onda 8, S4):
//   PT  "João 3,16"   "João 3,3-5"   "João 3"
//   EN  "John 3:16"   "John 3:3-5"   "John 3"
// O nome do livro vem pronto do chamador (bookName/bookShort de bible.js);
// aqui só se decide o separador do idioma e o intervalo. `verseStart` é aceito
// como sinônimo de `verse` (é o campo das notas no Firestore). Módulo puro.
export function formatVerseRef({ bookName, chapter, verse, verseStart, verseEnd } = {}, isEn = false) {
  const sep = isEn ? ':' : ',';
  const start = verse ?? verseStart;
  let numbers = chapter == null ? '' : String(chapter);
  if (start != null && start !== '') {
    numbers += `${sep}${start}`;
    // Intervalo só quando o fim existe e é diferente do início ("3,16-16" nunca).
    if (verseEnd != null && verseEnd !== '' && String(verseEnd) !== String(start)) {
      numbers += `-${verseEnd}`;
    }
  }
  return bookName ? `${bookName} ${numbers}`.trim() : numbers;
}
