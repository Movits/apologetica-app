// Regera os dois índices das lições de obras em src/data/artworks/:
// - all.js: importa todas as lições (o conteúdo pesado, cerca de 400 KB
//   comprimidos). Só é carregado quando o visualizador de obras abre, por
//   import() dinâmico, que na web vira um pedaço separado do bundle (como as
//   Bíblias) e no nativo continua embutido.
// - index.js: o resumo leve que o resto do app importa (artigo -> slug, número
//   de lupas e se vem do Museu Virtual), mais loadArtwork() e museumUrl().
// Rodar depois de criar, apagar ou mudar as lupas de uma lição, e então
// `npm test` (tests/artworks.test.mjs confere as lições e o resumo).
//
// Uso: node scripts/generate-artworks-index.mjs
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DIR = join(ROOT, 'src/data/artworks');

const slugs = readdirSync(DIR)
  .filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'all.js')
  .map((f) => f.replace(/\.js$/, ''))
  .sort();

const ident = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^(\d)/, '_$1');

const all = `// GERADO por scripts/generate-artworks-index.mjs. Não editar à mão: crie ou
// apague a lição na pasta e rode o script.
//
// Todas as lições (placa, aula e lupas). Pesado: o app carrega este arquivo
// sob demanda por loadArtwork() (index.js), nunca por import estático.
${slugs.map((s) => `import ${ident(s)} from './${s}';`).join('\n')}

export const ARTWORKS = [
${slugs.map((s) => `  ${ident(s)},`).join('\n')}
];

const BY_ARTICLE = new Map();
for (const art of ARTWORKS) {
  for (const id of art.articles) BY_ARTICLE.set(id, art);
}

export function artworkForArticle(articleId) {
  return BY_ARTICLE.get(articleId) ?? null;
}
`;

// Resumo por artigo, calculado das próprias lições.
const summary = {};
for (const s of slugs) {
  const { default: art } = await import(pathToFileURL(join(DIR, `${s}.js`)).href);
  for (const id of art.articles) {
    summary[id] = { slug: art.slug, lupas: art.lupas.length, museum: Boolean(art.museum) };
  }
}
const summaryLines = Object.keys(summary)
  .map(Number)
  .sort((a, b) => a - b)
  .map((id) => {
    const { slug, lupas, museum } = summary[id];
    return `  ${id}: { slug: '${slug}', lupas: ${lupas}${museum ? ', museum: true' : ''} },`;
  });

const index = `// GERADO por scripts/generate-artworks-index.mjs. Não editar à mão.
//
// Lições de obras de arte (placa, aula e lupas) mostradas no visualizador de
// obras quando o leitor toca na imagem de um artigo. Este arquivo é o resumo
// leve que o app importa (o selo "Explorar a obra · N detalhes" do artigo);
// o conteúdo vem de all.js por loadArtwork(), só quando o visualizador abre.
// As lições com \`museum\` vieram do Museu Virtual e trazem a pirâmide Deep Zoom
// (\`dzi\`) do acervo; as demais usam a pirâmide de miniaturas da Commons
// (src/data/artImages.js), e as coordenadas das lupas valem sobre ela.

export const ARTWORK_SUMMARY = {
${summaryLines.join('\n')}
};

export function artworkSummary(articleId) {
  return ARTWORK_SUMMARY[articleId] ?? null;
}

// Lição completa do artigo (ou null). No nativo resolve na hora; na web
// baixa o pedaço das lições na primeira vez.
export function loadArtwork(articleId) {
  if (!ARTWORK_SUMMARY[articleId]) return Promise.resolve(null);
  return import('./all').then((m) => m.artworkForArticle(articleId));
}

export const MUSEUM_URL = 'https://movits.github.io/museu-virtual/';

// Página da obra no Museu Virtual (HashRouter), com a lupa aberta se houver.
export function museumUrl(art, lupaId) {
  if (!art?.museum) return null;
  return \`\${MUSEUM_URL}#/obra/\${art.museum}\${lupaId ? \`?lupa=\${lupaId}\` : ''}\`;
}
`;

writeFileSync(join(DIR, 'all.js'), all);
writeFileSync(join(DIR, 'index.js'), index);
console.log(`${slugs.length} lições em all.js, ${summaryLines.length} artigos no resumo de index.js`);
