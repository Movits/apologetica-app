// O Safari do iPhone guarda o HTML do app, e o atalho da tela de início é o
// caso pior: pode continuar servindo um index.html antigo por dias depois de um
// deploy. Como o <script> do bundle tem hash no nome, HTML velho significa
// bundle velho, e o usuário fica preso numa versão anterior sem perceber.
//
// A identidade do build aqui é o NOME DO ARQUIVO DO BUNDLE, não uma variável
// injetada na config. Foi uma escolha por evidência: com a config, o Metro
// cacheia o valor resolvido e dois builds seguidos saíam com o mesmo id, o que
// deixaria a verificação sempre calada. O hash do bundle, ao contrário, muda
// exatamente quando o código muda, e é o que o HTML aponta.
//
// O deploy publica um version.json com o nome do bundle daquele build. Se o
// bundle em execução não é o que o servidor anuncia, o que está rodando é
// cache velho: recarregamos uma vez.

const CHAVE_SESSAO = 'appg:updateReloaded';

// Nome do arquivo do bundle que ESTA rodando, lido da própria tag <script>.
function bundleEmExecucao() {
  try {
    const tags = Array.from(document.querySelectorAll('script[src]'));
    const tag = tags.find((s) => /AppEntry-[^/]+\.js$/.test(s.getAttribute('src') || ''));
    if (!tag) return null;
    return tag.getAttribute('src').split('/').pop();
  } catch {
    return null;
  }
}

// Usado na tela de Ajustes: os primeiros caracteres do hash identificam o build
// que o aparelho está rodando, que era impossível de saber antes.
export function getBuildId() {
  const nome = bundleEmExecucao();
  if (!nome) return null;
  const m = nome.match(/AppEntry-([0-9a-f]+)\.js$/i);
  return m ? m[1] : null;
}

export async function checkForWebUpdate() {
  const atual = bundleEmExecucao();
  if (!atual) return;

  try {
    // No máximo um reload por aba. A marca é gravada ANTES do reload de
    // propósito: não existe caminho que leve a um laço de recarregamento.
    if (window.sessionStorage?.getItem(CHAVE_SESSAO)) return;

    // Relativo ao documento (o app vive em /apologetica-app/app/), e no-store
    // para não comparar cache com cache.
    const resp = await fetch('version.json', { cache: 'no-store' });
    if (!resp.ok) return;

    const { bundle } = await resp.json();
    if (!bundle || bundle === atual) return;

    window.sessionStorage?.setItem(CHAVE_SESSAO, '1');
    window.location.reload();
  } catch {
    // Sem rede, sem version.json, storage bloqueado: segue com o que tem.
  }
}
