// Instalação do app web como aplicativo no computador ou no celular (PWA).
//
// O Chrome e o Edge disparam `beforeinstallprompt` uma vez, logo na abertura,
// quando o site pode ser instalado (manifesto + HTTPS). Guardamos o evento já
// na carga deste módulo (importado pelo App.js) para a linha "Instalar neste
// computador" de Ajustes poder abrir o diálogo do navegador depois. O app
// instalado abre em janela própria, aparece no menu Iniciar/Dock e se atualiza
// sozinho a cada deploy (src/utils/webUpdate.web.js confere o version.json).
// Safari e Firefox não têm esse evento: lá a instalação é pelo menu do
// navegador, e a landing explica o caminho.

let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(Boolean(deferred)));

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export function canInstallApp() {
  return Boolean(deferred);
}

export function onInstallAvailabilityChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Abre o diálogo de instalação do navegador. Devolve true se o usuário aceitou.
export async function promptInstallApp() {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  notify();
  try {
    await e.prompt();
    const choice = await e.userChoice;
    return choice?.outcome === 'accepted';
  } catch {
    return false;
  }
}
