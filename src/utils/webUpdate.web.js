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

// A tag <script> do bundle é a única referência estável que temos: o Expo a
// escreve com caminho ABSOLUTO, já resolvido para o baseUrl do deploy.
function tagDoBundle() {
  try {
    const tags = Array.from(document.querySelectorAll('script[src]'));
    return tags.find((s) => /AppEntry-[^/]+\.js$/.test(s.getAttribute('src') || '')) || null;
  } catch {
    return null;
  }
}

// Nome do arquivo do bundle que ESTA rodando.
function bundleEmExecucao() {
  const tag = tagDoBundle();
  return tag ? tag.getAttribute('src').split('/').pop() : null;
}

// Raiz onde o app está servido, derivada do src do bundle
// (.../app/_expo/static/js/web/AppEntry-x.js -> .../app/).
//
// Não dá para buscar 'version.json' relativo ao documento: assim que a
// navegação por URL for ligada na web, o endereço ganha profundidade
// (/app/MainTabs/Biblia) e o relativo passa a apontar para
// /app/MainTabs/version.json, que não existe. A verificação morreria calada.
function raizDoApp() {
  const tag = tagDoBundle();
  if (!tag) return null;
  const src = tag.getAttribute('src') || '';
  const corte = src.indexOf('_expo/');
  if (corte < 0) return null;
  return src.slice(0, corte);
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

    // Ancorado na raiz do app, não no documento, e no-store para não comparar
    // cache com cache.
    const raiz = raizDoApp();
    if (raiz === null) return;
    const resp = await fetch(`${raiz}version.json`, { cache: 'no-store' });
    if (!resp.ok) return;

    const { bundle } = await resp.json();
    if (!bundle || bundle === atual) return;

    window.sessionStorage?.setItem(CHAVE_SESSAO, '1');
    window.location.reload();
  } catch {
    // Sem rede, sem version.json, storage bloqueado: segue com o que tem.
  }
}
