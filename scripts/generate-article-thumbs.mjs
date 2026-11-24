// Gera as miniaturas das imagens dos artigos e o mapa src/data/articleThumbs.js.
//
// Por quê: as listas e a grade da aba Artigos mostravam a imagem inteira
// (~1000 px, até 370 KB) numa capa de 72 px ou num cartão de ~280 px. Abrir a
// aba baixava e decodificava ~15 MB. A miniatura tem 480 px de largura (cobre
// o cartão do desktop em tela 2x e a capa quadrada do celular em 3x) e fica
// perto de 20-40 KB. A imagem inteira continua no topo do artigo e no
// visualizador.
//
// Uso: node scripts/generate-article-thumbs.mjs
// Rode de novo depois de adicionar ou trocar a imagem de um artigo
// (tests/articleThumbs.test.mjs cobra que todo artigo tem miniatura).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(ROOT, 'assets/articles');
const OUT = path.join(SRC, 'thumbs');
const WIDTH = 480;
const QUALITY = 72;

fs.mkdirSync(OUT, { recursive: true });

// id -> nome do arquivo, lido dos arquivos de artigo (aceita CRLF).
const map = new Map();
const dir = path.join(ROOT, 'src/data/articles');
for (const f of fs.readdirSync(dir)) {
  if (f === 'index.js') continue;
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /\r?\n {4}id: (\d+),[\s\S]*?\r?\n {4}image: require\('\.\.\/\.\.\/\.\.\/assets\/articles\/([^']+)'\)/g;
  for (const m of src.matchAll(re)) map.set(Number(m[1]), m[2]);
}

let before = 0;
let after = 0;
for (const file of new Set(map.values())) {
  const input = path.join(SRC, file);
  const output = path.join(OUT, file);
  before += fs.statSync(input).size;
  const img = await Jimp.read(input);
  if (img.bitmap.width > WIDTH) img.resize(WIDTH, Jimp.AUTO);
  await img.quality(QUALITY).writeAsync(output);
  after += fs.statSync(output).size;
}

const ids = [...map.keys()].sort((a, b) => a - b);
const lines = ids.map((id) => `  ${id}: require('../../assets/articles/thumbs/${map.get(id)}'),`);
const body = `// GERADO por scripts/generate-article-thumbs.mjs: não edite à mão.
// Miniatura (480 px) da imagem de cada artigo, por id. Listas, grade e
// cartões usam esta; o topo do artigo e o visualizador usam a imagem inteira.
export const ARTICLE_THUMBS = {
${lines.join('\n')}
};

// Miniatura do artigo, ou a imagem inteira se a miniatura faltar.
export const articleThumb = (article) => ARTICLE_THUMBS[article.id] || article.image;
`;
fs.writeFileSync(path.join(ROOT, 'src/data/articleThumbs.js'), body);
console.log(`${ids.length} artigos, ${new Set(map.values()).size} imagens: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
