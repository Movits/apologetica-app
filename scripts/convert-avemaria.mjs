// Converte _avemaria_raw.json (fidalgobr/bibliaAveMariaJSON) para o formato compacto do app.
// Saida: src/data/bibleAveMaria.js exportando AVEMARIA = { bookId: [[v1, v2, ...], ...] }
import fs from 'node:fs';

let txt = fs.readFileSync('./src/data/_avemaria_raw.json', 'utf8');
if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
const data = JSON.parse(txt);

// Mapeia nomes Ave Maria -> IDs do app (ver src/data/bible.js)
const NAME_MAP = {
  // AT canônico
  'Gênesis': 'gn',
  'Êxodo': 'ex',
  'Levítico': 'lv',
  'Números': 'nm',
  'Deuteronômio': 'dt',
  'Josué': 'js',
  'Juízes': 'jz',
  'Rute': 'rt',
  'I Samuel': '1sm',
  'II Samuel': '2sm',
  'I Reis': '1rs',
  'II Reis': '2rs',
  'I Crônicas': '1cr',
  'II Crônicas': '2cr',
  'Esdras': 'esd',
  'Neemias': 'ne',
  'Ester': 'est',
  'Jó': 'jo_at',
  'Salmos': 'sl',
  'Provérbios': 'pr',
  'Eclesiastes': 'ecl',
  'Cântico dos Cânticos': 'ct',
  'Isaías': 'is',
  'Jeremias': 'jr',
  'Lamentações': 'lm',
  'Ezequiel': 'ez',
  'Daniel': 'dn',
  'Oséias': 'os',
  'Joel': 'jl',
  'Amós': 'am',
  'Abdias': 'ab',
  'Jonas': 'jn_at',
  'Miquéias': 'mq',
  'Naum': 'na',
  'Habacuc': 'hab',
  'Sofonias': 'sf',
  'Ageu': 'ag',
  'Zacarias': 'zc',
  'Malaquias': 'ml',
  // AT deuterocanônicos
  'Tobias': 'tb',
  'Judite': 'jt',
  'I Macabeus': '1mc',
  'II Macabeus': '2mc',
  'Sabedoria': 'sb',
  'Eclesiástico': 'eclo',
  'Baruc': 'br',
  // NT
  'São Mateus': 'mt',
  'São Marcos': 'mc',
  'São Lucas': 'lc',
  'São João': 'jo',
  'Atos dos Apóstolos': 'at',
  'Romanos': 'rm',
  'I Coríntios': '1cor',
  'II Coríntios': '2cor',
  'Gálatas': 'gl',
  'Efésios': 'ef',
  'Filipenses': 'fl',
  'Colossenses': 'cl',
  'I Tessalonicenses': '1ts',
  'II Tessalonicenses': '2ts',
  'I Timóteo': '1tm',
  'II Timóteo': '2tm',
  'Tito': 'tt',
  'Filêmon': 'fm',
  'Hebreus': 'hb',
  'São Tiago': 'tg',
  'I São Pedro': '1pd',
  'II São Pedro': '2pd',
  'I São João': '1jo',
  'II São João': '2jo',
  'III São João': '3jo',
  'São Judas': 'jd',
  'Apocalipse': 'ap',
};

const allBooks = [...data.antigoTestamento, ...data.novoTestamento];
const result = {};
const chapterCounts = {};

for (const book of allBooks) {
  const id = NAME_MAP[book.nome];
  if (!id) {
    console.warn('Livro não mapeado:', book.nome);
    continue;
  }
  // Cada capítulo vira array de strings (na ordem dos versículos)
  result[id] = book.capitulos.map((ch) => ch.versiculos.map((v) => v.texto));
  chapterCounts[id] = result[id].length;
}

const mappedCount = Object.keys(result).length;
console.log(`Livros mapeados: ${mappedCount}/73`);
console.log('Contagem de capítulos:', JSON.stringify(chapterCounts, null, 2));

const header = `// Biblia Sagrada Ave Maria - 73 livros do canon catolico completo.
// Fonte: github.com/fidalgobr/bibliaAveMariaJSON (Paulinas Editora).
// Formato compacto: { bookId: [[v1, v2, ...], ...] } - capitulos 0-indexed.

`;
const output = header + 'export const AVEMARIA = ' + JSON.stringify(result) + ';\n';
fs.writeFileSync('./src/data/bibleAveMaria.js', output);
console.log(`Done. Size: ${(output.length / 1024 / 1024).toFixed(2)} MB`);
