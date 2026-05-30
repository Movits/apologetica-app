// Variante web: @sentry/react-native não roda na web, então aqui é no-op.
// O Metro resolve este arquivo automaticamente em builds web.
export function initSentry() {}

export function wrap(App) {
  return App;
}

export function captureException() {}
