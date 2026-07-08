// Wrapper do Sentry para nativo. Mantém o @sentry/react-native isolado deste
// módulo para que a versão web (sentry.web.js) possa substituí-lo sem arrastar
// o pacote nativo para o bundle web.
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Sentry tem módulos nativos que não existem no Expo Go.
// Só inicializa em standalone (preview/production build).
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export function initSentry() {
  if (isExpoGo) return;
  try {
    Sentry.init({
      dsn: 'https://787cc318d8fe8083c42accd0e7866cc2@o4511423581650945.ingest.us.sentry.io/4511423587876864',
      // Crash-only: sem PII e sem gravacao de sessao, para bater com a politica
      // de privacidade (o app nao rastreia comportamento de uso).
      sendDefaultPii: false,
      enableLogs: false,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  } catch (e) {
    // Ignora: Sentry não está disponível neste ambiente
  }
}

// Em Expo Go o Sentry.wrap quebra (módulo nativo ausente), então passa direto.
export function wrap(App) {
  return isExpoGo ? App : Sentry.wrap(App);
}

export function captureException(err) {
  if (isExpoGo) return;
  try { Sentry.captureException(err); } catch {}
}
