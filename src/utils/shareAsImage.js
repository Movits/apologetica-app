// Captura uma View ref como PNG e abre o sheet de compartilhamento.
// Requer: react-native-view-shot e expo-sharing.
// Instalar com:
//   npx expo install react-native-view-shot expo-sharing
//
// Se algum desses pacotes não estiver instalado, o fallback é compartilhar texto.

import { Share } from 'react-native';

let captureRef = null;
let Sharing = null;

try {
  captureRef = require('react-native-view-shot').captureRef;
} catch {
  // não instalado — fallback
}

try {
  Sharing = require('expo-sharing');
} catch {
  // não instalado — fallback
}

export async function captureAndShareImage(viewRef, fallbackMessage) {
  if (!viewRef?.current || !captureRef || !Sharing) {
    // Fallback: compartilha texto simples.
    return Share.share({ message: fallbackMessage }).catch(() => {});
  }
  try {
    const uri = await captureRef(viewRef.current, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return Share.share({ message: fallbackMessage }).catch(() => {});
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Compartilhar versículo',
    });
    return { ok: true };
  } catch (e) {
    // Em caso de falha de captura, recai para texto.
    return Share.share({ message: fallbackMessage }).catch(() => {});
  }
}
