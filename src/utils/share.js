import { Platform, Share } from 'react-native';
import { notify } from './dialog';
import { formatVerseRef } from './verseRef';

// Mensagem de promoção sutil incluída no fim de cada compartilhamento.
// URL fica em branco até o app estar nas lojas (Play Store / App Store).
const APP_PROMO_URL = ''; // ← preencher quando publicar

const APP_PROMO = APP_PROMO_URL
  ? `\n\nEnviado pelo APPologética ✝\nApologética católica e Bíblia, gratuito.\n${APP_PROMO_URL}`
  : '\n\nEnviado pelo APPologética ✝';

// No nativo usa a folha de compartilhamento. Na web, Share.share só existe se o
// navegador tiver Web Share API; senão (ex.: desktop) copia para a área de
// transferência e avisa, para o botão nunca falhar em silêncio.
async function doShare(message) {
  if (Platform.OS === 'web') {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text: message });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        notify('Copiado', 'Texto copiado para a área de transferência.');
        return;
      }
    } catch {
      // usuário cancelou o share ou API indisponível — silencioso
    }
    return;
  }
  return Share.share({ message }).catch(() => {});
}

// A referência sai no formato do idioma (PT "João 3,16", EN "John 3:16"). Um
// `ref` pronto (ex.: o "Salmo 23,1" curado do versículo do dia) tem prioridade
// sobre bookName/chapter/verse. Sem `isEn`, o formato é o PT, como antes.
export function shareVerse({ bookName, chapter, verse, text, ref, isEn = false }) {
  const label = ref || formatVerseRef({ bookName, chapter, verse }, isEn);
  const msg = `"${text}"\n\n${label}${APP_PROMO}`;
  return doShare(msg);
}

export function shareHighlight(params) {
  return shareVerse(params);
}

export function shareNote({ bookName, chapter, verseStart, verseEnd, verseText, noteText, isEn = false }) {
  let msg = '';
  if (verseText) msg += `"${verseText}"\n\n`;
  msg += `${formatVerseRef({ bookName, chapter, verseStart, verseEnd }, isEn)}\n\n`;
  msg += `${isEn ? 'Reflection' : 'Reflexão'}:\n${noteText}`;
  msg += APP_PROMO;
  return doShare(msg);
}

export function shareArticle({ title, summary }) {
  const msg = `${title}\n\n${summary}${APP_PROMO}`;
  return doShare(msg);
}

export function shareDialogue({ objection, answer, source }) {
  let msg = `"${objection}"\n\n${answer}`;
  if (source) msg += `\n\n(${source})`;
  msg += APP_PROMO;
  return doShare(msg);
}
