// Converte a Bíblia Douay-Rheims-Challoner em formato JSON compacto.
// Fonte: github.com/scrollmapper/bible_databases (DRC.json)
// Formato fonte: { translation, books: [{ name, chapters: [{ chapter, verses: [{verse, text}]}]}]}
// Formato destino: { bookId: [[v1, v2, ...], [v1, v2, ...]] }

import fs from 'node:fs';
import path from 'node:path';

const SOURCE = path.join(process.cwd(), 'scripts', 'source', 'douay-rheims.json');
const OUTPUT = path.join(process.cwd(), 'src', 'data', 'bibleDouayRheims.js');

const BOOK_MAP = {
  'Genesis': 'gn', 'Exodus': 'ex', 'Leviticus': 'lv', 'Numbers': 'nm', 'Deuteronomy': 'dt',
  'Joshua': 'js', 'Judges': 'jz', 'Ruth': 'rt',
  '1 Samuel': '1sm', '2 Samuel': '2sm', 'I Samuel': '1sm', 'II Samuel': '2sm',
  '1 Kings': '1rs', '2 Kings': '2rs', 'I Kings': '1rs', 'II Kings': '2rs',
  '1 Chronicles': '1cr', '2 Chronicles': '2cr', 'I Chronicles': '1cr', 'II Chronicles': '2cr',
  'Ezra': 'esd', 'Nehemiah': 'ne', 'Tobit': 'tb', 'Judith': 'jt', 'Esther': 'est',
  'Job': 'jo_at', 'Psalms': 'sl', 'Proverbs': 'pr', 'Ecclesiastes': 'ecl',
  'Song of Solomon': 'ct', 'Song of Songs': 'ct', 'Canticle of Canticles': 'ct',
  'Wisdom': 'sb', 'Wisdom of Solomon': 'sb', 'Sirach': 'eclo', 'Ecclesiasticus': 'eclo',
  'Isaiah': 'is', 'Isaias': 'is', 'Jeremiah': 'jr', 'Jeremias': 'jr',
  'Lamentations': 'lm', 'Baruch': 'br', 'Ezekiel': 'ez', 'Ezechiel': 'ez',
  'Daniel': 'dn', 'Hosea': 'os', 'Osee': 'os', 'Joel': 'jl', 'Amos': 'am',
  'Obadiah': 'ab', 'Abdias': 'ab', 'Jonah': 'jn_at', 'Jonas': 'jn_at',
  'Micah': 'mq', 'Micheas': 'mq', 'Nahum': 'na', 'Habakkuk': 'hab', 'Habacuc': 'hab',
  'Zephaniah': 'sf', 'Sophonias': 'sf', 'Haggai': 'ag', 'Aggeus': 'ag',
  'Zechariah': 'zc', 'Zacharias': 'zc', 'Malachi': 'ml', 'Malachias': 'ml',
  '1 Maccabees': '1mc', 'I Maccabees': '1mc', '1 Machabees': '1mc',
  '2 Maccabees': '2mc', 'II Maccabees': '2mc', '2 Machabees': '2mc',
  'Matthew': 'mt', 'Mark': 'mc', 'Luke': 'lc', 'John': 'jo',
  'Acts': 'at', 'Acts of the Apostles': 'at',
  'Romans': 'rm',
  '1 Corinthians': '1cor', '2 Corinthians': '2cor', 'I Corinthians': '1cor', 'II Corinthians': '2cor',
  'Galatians': 'gl', 'Ephesians': 'ef', 'Philippians': 'fl', 'Colossians': 'cl',
  '1 Thessalonians': '1ts', '2 Thessalonians': '2ts', 'I Thessalonians': '1ts', 'II Thessalonians': '2ts',
  '1 Timothy': '1tm', '2 Timothy': '2tm', 'I Timothy': '1tm', 'II Timothy': '2tm',
  'Titus': 'tt', 'Philemon': 'fm', 'Hebrews': 'hb',
  'James': 'tg', '1 Peter': '1pd', '2 Peter': '2pd', 'I Peter': '1pd', 'II Peter': '2pd',
  '1 John': '1jo', '2 John': '2jo', '3 John': '3jo', 'I John': '1jo', 'II John': '2jo', 'III John': '3jo',
  'Jude': 'jd', 'Revelation': 'ap', 'Apocalypse': 'ap', 'Revelation of John': 'ap',
};

// Jó e Jonas usam os ids do app ('jo_at' e 'jn_at'). Até outubro de 2026 eles
// saíam como 'jó' e 'jn', e o inglês desses dois livros caía no português.

// Versículos que a fonte deixa em branco no meio do capítulo, com o texto da
// Douay-Rheims-Challoner em drbo.org. (Os brancos no fim do capítulo são
// versículos que a fonte juntou ao anterior: viram bloco na tela.)
const MISSING = {
  '1rs 17,19': 'And Elias said to her: Give me thy son. And he took him out of her bosom, and carried him into the upper chamber where he abode, and laid him upon his own bed.',
  'pr 30,29': 'There are three things, which go well, and the fourth that walketh happily:',
  'br 6,37': 'They shall not pity the widow, nor do good to the fatherless.',
};
// Erros de digitação da fonte, conferidos em drbo.org.
const TYPOS = {
  'at 7,59': ['Lord, lay not his sin', 'Lord, lay not this sin'],
};

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const books = raw.books || [];

const out = {};
const unmapped = new Set();
for (const book of books) {
  const bookId = BOOK_MAP[book.name];
  if (!bookId) {
    unmapped.add(book.name);
    continue;
  }
  out[bookId] = [];
  for (const ch of book.chapters || []) {
    const verses = (ch.verses || []).map((v) => v.text);
    out[bookId].push(verses);
  }
}

for (const [ref, text] of Object.entries(MISSING)) {
  const [id, cv] = ref.split(' ');
  const [ch, v] = cv.split(',').map(Number);
  if (out[id]?.[ch - 1]?.[v - 1] !== '') throw new Error(`Versículo ${ref} não está em branco na fonte`);
  out[id][ch - 1][v - 1] = text;
}
for (const [ref, [de, para]] of Object.entries(TYPOS)) {
  const [id, cv] = ref.split(' ');
  const [ch, v] = cv.split(',').map(Number);
  if (!out[id]?.[ch - 1]?.[v - 1]?.includes(de)) throw new Error(`Correção não encontrada em ${ref}`);
  out[id][ch - 1][v - 1] = out[id][ch - 1][v - 1].replace(de, para);
}

if (unmapped.size > 0) {
  console.warn('Livros sem mapeamento:', [...unmapped]);
}

const content = `// Bíblia Douay-Rheims-Challoner (DRC, domínio público).
// Gerada por scripts/convert-douay-rheims.mjs.
export const DRA = ${JSON.stringify(out)};
`;

fs.writeFileSync(OUTPUT, content);
console.log(`Gerado ${OUTPUT}: ${Object.keys(out).length} livros`);
console.log(`Tamanho: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
