// Regera src/data/artworks/index.js a partir dos arquivos da pasta: um import
// por lição (ordem alfabética do slug) e o mesmo código de busca de sempre.
// Rodar depois de criar ou apagar uma lição em src/data/artworks/, e então
// `npm test` (tests/artworks.test.mjs confere cada lição).
//
// Uso: node scripts/generate-artworks-index.mjs
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DIR = join(ROOT, 'src/data/artworks');

const slugs = readdirSync(DIR)
  .filter((f) => f.endsWith('.js') && f !== 'index.js')
  .map((f) => f.replace(/\.js$/, ''))
  .sort();

const ident = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^(\d)/, '_$1');

const out = `// GERADO por scripts/generate-artworks-index.mjs. Não editar à mão: crie ou
// apague a lição na pasta e rode o script.
${slugs.map((s) => `import ${ident(s)} from './${s}';`).join('\n')}

// Lições de obras de arte (placa, aula e lupas) mostradas no visualizador de
// obras quando o leitor toca na imagem de um artigo. Cada lição diz em
// \`articles\` quais artigos a usam. As que têm \`museum\` vieram do Museu Virtual
// e trazem a pirâmide Deep Zoom (\`dzi\`) do acervo; as demais usam a pirâmide
// de miniaturas da Commons (src/data/artImages.js), e as coordenadas das lupas
// valem sobre o arquivo da Commons.
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

export const MUSEUM_URL = 'https://movits.github.io/museu-virtual/';

// Página da obra no Museu Virtual (HashRouter), com a lupa aberta se houver.
export function museumUrl(art, lupaId) {
  if (!art?.museum) return null;
  return \`\${MUSEUM_URL}#/obra/\${art.museum}\${lupaId ? \`?lupa=\${lupaId}\` : ''}\`;
}
`;

writeFileSync(join(DIR, 'index.js'), out);
console.log(`${slugs.length} lições em src/data/artworks/index.js`);
