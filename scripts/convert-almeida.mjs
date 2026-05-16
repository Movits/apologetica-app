// Converte _almeida_raw.json (formato thiagobodruk) para o formato compacto do app.
// Saída: src/data/bibleAlmeida.js exportando ALMEIDA = { bookId: [chapter1Verses, chapter2Verses, ...] }
import fs from 'node:fs';

let txt = fs.readFileSync('./src/data/_almeida_raw.json', 'utf8');
// strip BOM
if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
const raw = JSON.parse(txt);

// Mapeia abreviações thiagobodruk -> IDs usados pelo app (ver src/data/bible.js)
const ABBREV_MAP = {
  ed: 'esd',
  et: 'est',
  'jó': 'jo_at',
  pv: 'pr',
  ec: 'ecl',
  ob: 'ab',
  jn: 'jn_at',
  hc: 'hab',
  atos: 'at',
  '1co': '1cor',
  '2co': '2cor',
  fp: 'fl',
  '1pe': '1pd',
  '2pe': '2pd',
};

const result = {};
for (const book of raw) {
  const id = ABBREV_MAP[book.abbrev] || book.abbrev;
  result[id] = book.chapters;
}

const header = `// Almeida Atualizada - 66 livros canonicos (Antigo + Novo Testamento).
// Bundled offline. Fonte: github.com/thiagobodruk/bible (dominio publico).
// Formato: { bookId: [[v1, v2, ...], [v1, ...], ...] } - chapters indexed 0..N-1.

`;

const output = header + 'export const ALMEIDA = ' + JSON.stringify(result) + ';\n';
fs.writeFileSync('./src/data/bibleAlmeida.js', output);
console.log(`Done. Books: ${Object.keys(result).length}. Size: ${(output.length / 1024 / 1024).toFixed(2)} MB`);
