import Constants from 'expo-constants';

// O Safari do iPhone guarda o HTML do app, e o atalho da tela de início é o
// caso pior: ele pode continuar servindo um index.html antigo por dias depois
// de um deploy. Como o <script> do bundle tem hash no nome, HTML velho significa
// bundle velho, e o usuário fica preso numa versão anterior sem perceber.
//
// A saída aqui é barata e não depende de service worker: o build grava seu id
// dentro do bundle (app.config.js -> extra.buildId) e o deploy publica um
// version.json ao lado com o mesmo id. Se os dois divergem, o que está rodando
// é cache velho, e recarregamos uma vez.

const CHAVE_SESSAO = 'appg:updateReloaded';

export function getBuildId() {
  return Constants.expoConfig?.extra?.buildId || null;
}

export async function checkForWebUpdate() {
  const atual = getBuildId();
  // Em dev o id é 'dev' e não há version.json para comparar.
  if (!atual || atual === 'dev') return;

  try {
    // Recarregar no máximo uma vez por aba. A marca é gravada ANTES do reload
    // de propósito: se algo der errado na comparação depois, não existe caminho
    // que leve a um laço de recarregamento.
    if (window.sessionStorage?.getItem(CHAVE_SESSAO)) return;

    // Relativo ao documento (o app vive em /apologetica-app/app/), e no-store
    // para não comparar cache com cache.
    const resp = await fetch('version.json', { cache: 'no-store' });
    if (!resp.ok) return;

    const { buildId } = await resp.json();
    if (!buildId || buildId === atual) return;

    window.sessionStorage?.setItem(CHAVE_SESSAO, '1');
    window.location.reload();
  } catch {
    // Sem rede, sem version.json, storage bloqueado: segue com o que tem.
  }
}
