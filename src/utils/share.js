import { Platform, Share } from 'react-native';
import { notify } from './dialog';
import { formatVerseRef } from './verseRef';

// Mensagem de promoção sutil incluída no fim de cada compartilhamento.
// URL fica em branco até o app estar nas lojas (Play Store / App Store).
const APP_PROMO_URL = ''; // ← preencher quando publicar

const APP_PROMO = APP_PROMO_URL
  ? `\n\nEnviado pelo APPologética ✝\nApologética católica e Bíblia, gratuito.\n${APP_PROMO_URL}`
  : '\n\nEnviado pelo APPologética ✝';

// No nativo usa a folha de compartilhamento. Na web, navigator.share só existe
// se o navegador tiver Web Share API e só funciona dentro do gesto do usuário:
// fora dele (Safari, chamada vinda de um setTimeout) lança NotAllowedError.
// Sem a API, ou se ela recusar por qualquer motivo que não seja a pessoa
// cancelando a folha (AbortError), copia para a área de transferência e avisa,
// para o botão nunca falhar em silêncio.
async function doShare(message) {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.share) {
      try {
        await nav.share({ text: message });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    try {
      if (nav?.clipboard) {
        await nav.clipboard.writeText(message);
        notify('Copiado', 'Texto copiado para a área de transferência.');
      }
    } catch {
      // área de transferência indisponível (sem permissão ou fora do gesto), silencioso
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

// Marcação compartilhada é um versículo: mesmo texto, mesma folha.
export const shareHighlight = shareVerse;

// Referência do catálogo (versículo, Catecismo, documento, estudo): a citação
// entre aspas e a procedência já pronta na linha de baixo ("Mateus 16,18-19
// (Apóstolo Mateus, séc. I d.C.)").
export function shareReference({ text, label }) {
  return doShare(`"${text}"\n\n${label}${APP_PROMO}`);
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

// Texto pronto (uma leitura da liturgia, por exemplo) com a promoção no fim.
// Quem monta a mensagem é a tela; aqui só entra o rodapé e a folha de
// compartilhamento certa por plataforma.
export function shareText(message) {
  return doShare(`${message}${APP_PROMO}`);
}

export function shareDialogue({ objection, answer, source }) {
  let msg = `"${objection}"\n\n${answer}`;
  if (source) msg += `\n\n(${source})`;
  msg += APP_PROMO;
  return doShare(msg);
}
