// Converte _avemaria_raw.json (fidalgobr/bibliaAveMariaJSON) para o formato compacto do app.
// Saida: src/data/bibleAveMaria.js exportando AVEMARIA = { bookId: [[v1, v2, ...], ...] }
//
// Fonte: o arquivo bibliaAveMaria.json de github.com/fidalgobr/bibliaAveMariaJSON
// (commit bb8c7ac), copiado para src/data/_avemaria_raw.json (gitignored).
//
// A fonte perde a numeração em alguns capítulos: versículos grudados com o
// número no meio do texto ("...se manchar, 30 ou quando..."), blocos da edição
// impressa (Josué 19,2-7) achatados num versículo só e alguns versículos que
// faltam (Atos 3,1). Tudo depois do primeiro defeito ficava com o número
// errado. scripts/source/avemaria-correcoes.json traz esses capítulos já
// recortados nas fronteiras certas, conferidas contra a mesma edição publicada
// em bibliaonline.com.br/avm (ver o _doc do arquivo). Um bloco guarda o texto
// no primeiro número e '' nos seguintes (src/services/bibleApi.js: chapterVerses).
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

// Remove marcadores de nota de rodapé (asteriscos) que ficam órfãos
// porque o JSON original não inclui o texto das notas.
function cleanVerse(text) {
  return text
    .replace(/\u00AD/g, '')        // tira o hífen invisível da diagramação ("en­trando")
    .replace(/\*+/g, '')           // tira asteriscos (notas de rodapé)
    .replace(/\s+([.,;:!?])/g, '$1') // tira espaço antes de pontuação
    .replace(/\s{2,}/g, ' ')       // colapsa espaços duplos
    .trim();
}

for (const book of allBooks) {
  const id = NAME_MAP[book.nome];
  if (!id) {
    console.warn('Livro não mapeado:', book.nome);
    continue;
  }
  // Cada capítulo vira array de strings (na ordem dos versículos)
  result[id] = book.capitulos.map((ch) => ch.versiculos.map((v) => cleanVerse(v.texto)));
  chapterCounts[id] = result[id].length;
}

// Capítulos com a numeração consertada (ver o cabeçalho).
const correcoes = JSON.parse(fs.readFileSync('./scripts/source/avemaria-correcoes.json', 'utf8'));
for (const [ref, verses] of Object.entries(correcoes.capitulos)) {
  const [id, ch] = ref.split(' ');
  if (!result[id]?.[ch - 1]) throw new Error(`Correção para capítulo inexistente: ${ref}`);
  result[id][ch - 1] = verses;
}
// Erros de digitação da fonte, trocados só no versículo indicado.
for (const [ref, trocas] of Object.entries(correcoes.textos || {})) {
  const [id, cv] = ref.split(' ');
  const [ch, v] = cv.split(',').map(Number);
  for (const [de, para] of trocas) {
    const atual = result[id]?.[ch - 1]?.[v - 1];
    if (!atual || !atual.includes(de)) throw new Error(`Correção de texto não encontrada em ${ref}: ${de}`);
    result[id][ch - 1][v - 1] = atual.replace(de, para);
  }
}
console.log(`Capítulos consertados: ${Object.keys(correcoes.capitulos).length}`);

const mappedCount = Object.keys(result).length;
console.log(`Livros mapeados: ${mappedCount}/73`);
console.log('Contagem de capítulos:', JSON.stringify(chapterCounts, null, 2));

const header = `// Biblia Sagrada Ave Maria - 73 livros do canon catolico completo.
// Fonte: github.com/fidalgobr/bibliaAveMariaJSON (Editora Ave-Maria), com a
// numeração consertada por scripts/source/avemaria-correcoes.json.
// Formato compacto: { bookId: [[v1, v2, ...], ...] } - capitulos 0-indexed.

`;
const output = header + 'export const AVEMARIA = ' + JSON.stringify(result) + ';\n';
fs.writeFileSync('./src/data/bibleAveMaria.js', output);
console.log(`Done. Size: ${(output.length / 1024 / 1024).toFixed(2)} MB`);
