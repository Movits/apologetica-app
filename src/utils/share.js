import { Share } from 'react-native';

// Mensagem de promoção sutil incluída no fim de cada compartilhamento.
// URL fica em branco até o app estar nas lojas (Play Store / App Store).
const APP_PROMO_URL = ''; // ← preencher quando publicar

const APP_PROMO = APP_PROMO_URL
  ? `\n\n✝ Enviado pelo APPologética — apologética católica e Bíblia, gratuito.\n${APP_PROMO_URL}`
  : '\n\n✝ Enviado pelo APPologética';

export function shareVerse({ bookName, chapter, verse, text }) {
  const msg = `"${text}"\n\n${bookName} ${chapter},${verse}${APP_PROMO}`;
  return Share.share({ message: msg }).catch(() => {});
}

export function shareVerseRange({ bookName, chapter, verseStart, verseEnd, text }) {
  const range = verseStart === verseEnd ? `${verseStart}` : `${verseStart}-${verseEnd}`;
  const msg = `"${text}"\n\n${bookName} ${chapter},${range}${APP_PROMO}`;
  return Share.share({ message: msg }).catch(() => {});
}

export function shareHighlight({ bookName, chapter, verse, text }) {
  return shareVerse({ bookName, chapter, verse, text });
}

export function shareNote({ bookName, chapter, verseStart, verseEnd, verseText, noteText }) {
  const range = verseStart === verseEnd ? `${verseStart}` : `${verseStart}-${verseEnd}`;
  let msg = '';
  if (verseText) msg += `"${verseText}"\n\n`;
  msg += `${bookName} ${chapter},${range}\n\n`;
  msg += `Reflexão:\n${noteText}`;
  msg += APP_PROMO;
  return Share.share({ message: msg }).catch(() => {});
}

export function shareArticle({ title, summary }) {
  const msg = `${title}\n\n${summary}${APP_PROMO}`;
  return Share.share({ message: msg }).catch(() => {});
}
