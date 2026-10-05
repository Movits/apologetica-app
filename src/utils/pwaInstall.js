// Instalação do app web como aplicativo (PWA). No nativo não existe: o app já
// é instalado pela loja. A variante web (pwaInstall.web.js) faz o trabalho.
export function canInstallApp() {
  return false;
}

export function onInstallAvailabilityChange() {
  return () => {};
}

export async function promptInstallApp() {
  return false;
}
