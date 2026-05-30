// Variante web: sem react-native-view-shot (não há captura de View na web v1).
// Compartilha o texto via Web Share API, ou copia para a área de transferência.
// O botão "Imagem" fica oculto na web (ver VerseOfDayCard), então isto é só um
// fallback seguro caso seja chamado.
export async function captureAndShareImage(viewRef, fallbackMessage) {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ text: fallbackMessage });
      return { ok: true };
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(fallbackMessage);
      return { ok: true, copied: true };
    }
  } catch {}
  return { ok: false };
}
