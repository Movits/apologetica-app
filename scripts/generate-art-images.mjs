// Gera src/data/artImages.js: para cada artigo com imagem da Wikimedia
// Commons, o arquivo de origem, o caminho de hash e as dimensões do original.
// O visualizador de obras monta com isso a pirâmide de miniaturas-padrão
// (960, 1920, 3840 px) servidas por thumb.wikimedia.org, e o herói do artigo
// troca a imagem local (~1000 px) pela de 1280 px quando há rede.
//
// O nome do arquivo vem do `imageHd` de cada artigo (URL do proxy wsrv.nl com
// Special:FilePath). O proxy em si não é mais usado: a Wikimedia passou a
// limitar o wsrv (HTTP 429) e 66 das 83 URLs falhavam em outubro de 2026.
//
// Uso: node scripts/generate-art-images.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ARTICLES_DIR = join(ROOT, 'src/data/articles');
const OUT = join(ROOT, 'src/data/artImages.js');
// Política da Wikimedia: User-Agent identificável, sem dados pessoais.
const UA = 'APPologetica-app/1.0 (https://github.com/Movits/apologetica-app)';

function articleFiles() {
  return readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.js') && f !== 'index.js');
}

// Pares { id, file } na ordem do arquivo: cada `imageHd` pertence ao último
// `id:` numérico visto antes dele.
function collect() {
  const out = [];
  for (const f of articleFiles()) {
    const src = readFileSync(join(ARTICLES_DIR, f), 'utf8');
    const re = /\bid:\s*(\d+),|imageHd:\s*'([^']+)'/g;
    let id = null;
    for (const m of src.matchAll(re)) {
      if (m[1]) { id = Number(m[1]); continue; }
      const url = new URL(m[2]);
      const inner = url.searchParams.get('url') || m[2];
      const name = decodeURIComponent(inner.split('Special:FilePath/')[1] || '');
      if (id != null && name) out.push({ id, name });
    }
  }
  return out;
}

async function imageInfo(names) {
  const info = {};
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40);
    const api = new URL('https://commons.wikimedia.org/w/api.php');
    api.search = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo',
      iiprop: 'url|size|mime', titles: batch.map((n) => `File:${n}`).join('|'),
    });
    const res = await fetch(api, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Commons API ${res.status}`);
    const json = await res.json();
    const norm = new Map((json.query.normalized || []).map((n) => [n.to, n.from]));
    for (const p of json.query.pages) {
      const ii = p.imageinfo?.[0];
      const asked = (norm.get(p.title) || p.title).replace(/^File:/, '');
      if (!ii) { console.warn('sem imageinfo:', asked); continue; }
      // https://upload.wikimedia.org/wikipedia/commons/0/02/Nome.jpg
      const m = ii.url.split('?')[0].match(/\/commons\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/);
      info[asked] = { path: m[1], file: m[2], width: ii.width, height: ii.height, mime: ii.mime };
    }
  }
  return info;
}

const items = collect();
const info = await imageInfo([...new Set(items.map((i) => i.name))]);
const lines = items
  .sort((a, b) => a.id - b.id)
  .map(({ id, name }) => {
    const i = info[name];
    if (!i) return null;
    return `  ${id}: { path: '${i.path}', file: ${JSON.stringify(i.file)}, width: ${i.width}, height: ${i.height} },`;
  })
  .filter(Boolean);

writeFileSync(
  OUT,
  `// GERADO por scripts/generate-art-images.mjs. Não editar à mão.\n` +
  `// Imagem de origem (Wikimedia Commons) de cada artigo, pelo id do artigo:\n` +
  `// caminho de hash, nome do arquivo já codificado para URL e tamanho do\n` +
  `// original em px. As URLs saem de src/utils/artImage.js.\n` +
  `export const ART_IMAGES = {\n${lines.join('\n')}\n};\n`,
);
console.log(`${lines.length} imagens em ${OUT}`);
const mimes = Object.values(info).reduce((a, i) => ({ ...a, [i.mime]: (a[i.mime] || 0) + 1 }), {});
console.log('tipos:', mimes);
