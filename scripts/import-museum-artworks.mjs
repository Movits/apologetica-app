// Importa do Museu Virtual (repositório irmão, ../museu-virtual) as obras que
// também ilustram artigos do app, no formato de src/data/artworks/<slug>.js:
// placa, aula (descrição), lupas e a pirâmide Deep Zoom (DZI) do acervo.
//
// Só cria arquivos que ainda não existem: a tradução EN e a ponte com o artigo
// (notes) são escritas no app e não podem ser sobrescritas por uma reimportação.
// Para reimportar uma obra, apague o arquivo dela antes.
//
// Uso: node scripts/import-museum-artworks.mjs [caminho/do/museu-virtual]
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const MUSEUM = resolve(process.argv[2] || join(ROOT, '..', 'museu-virtual'));
const OUT_DIR = join(ROOT, 'src/data/artworks');
const MUSEUM_BASE = 'https://movits.github.io/museu-virtual/';

// Obra do museu -> artigos do app que a usam como imagem principal.
const MATCHES = {
  'criacao-de-adao': [1, 42],
  'noite-estrelada': [9],
  'ceia-em-emaus': [5],
  'o-angelus': [62],
  'ultima-ceia': [7],
  'bodas-de-cana': [4],
  'torre-de-babel': [77],
};

const q = (s) => JSON.stringify(s);
const list = (arr, indent) => `[\n${arr.map((p) => `${indent}  ${q(p)},`).join('\n')}\n${indent}]`;

for (const [slug, articles] of Object.entries(MATCHES)) {
  const out = join(OUT_DIR, `${slug}.js`);
  if (existsSync(out)) { console.log('já existe, mantido:', slug); continue; }
  const { default: o } = await import(pathToFileURL(join(MUSEUM, 'src/data/obras', `${slug}.js`)));
  const tilesBase = o.tilesBase || `${MUSEUM_BASE}tiles/`;
  const lupas = o.lupas.map((l) => `    {
      id: ${q(l.id)},
      title: ${q(l.titulo)},
      titleEn: ${q('')},
      x: ${l.x}, y: ${l.y}, w: ${l.w}, h: ${l.h},
      text: ${list(l.texto, '      ')},
      textEn: [],
    },`).join('\n');

  writeFileSync(out, `// Lição da obra: placa, aula e lupas. Importada do Museu Virtual
// (scripts/import-museum-artworks.mjs); a tradução EN e a ponte com o artigo
// são do app. Coordenadas das lupas normalizadas (0 a 1) sobre a imagem do DZI.
export default {
  slug: ${q(slug)},
  articles: ${q(articles)},
  museum: ${q(slug)},
  dzi: ${q(`${tilesBase}${slug}/${slug}.dzi`)},
  title: ${q(o.titulo)},
  titleEn: ${q('')},
  artist: ${q(o.artista)},
  artistLife: ${q(o.vidaArtista || '')},
  date: ${q(o.ano)},
  technique: ${q(o.tecnica)},
  techniqueEn: ${q('')},
  dimensions: ${q(o.dimensoes || '')},
  location: ${q(o.museu)},
  locationEn: ${q('')},
  style: ${q(o.estilo || '')},
  styleEn: ${q('')},
  intro: ${list(o.descricao, '  ')},
  introEn: [],
  notes: {},
  notesEn: {},
  lupas: [
${lupas}
  ],
};
`);
  console.log('importada:', slug, `(${o.lupas.length} lupas)`);
}
