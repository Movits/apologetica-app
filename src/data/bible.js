// Metadados dos 73 livros do cânon católico.
// `apiId`: identificador para bible-api.com (Almeida). null para deuterocanônicos.
// `deutero`: true se for deuterocanônico (não está em Almeida, vem do conteúdo local).
// Conteúdo real fica em bible-content.js (curado + deuterocanônicos) ou vem da API.

export const BIBLE_BOOKS = [
  // ========== PENTATEUCO ==========
  { id: 'gn', apiId: 'genesis', name: 'Gênesis', short: 'Gn', testament: 'AT', group: 'Pentateuco', totalChapters: 50, deutero: false },
  { id: 'ex', apiId: 'exodus', name: 'Êxodo', short: 'Ex', testament: 'AT', group: 'Pentateuco', totalChapters: 40, deutero: false },
  { id: 'lv', apiId: 'leviticus', name: 'Levítico', short: 'Lv', testament: 'AT', group: 'Pentateuco', totalChapters: 27, deutero: false },
  { id: 'nm', apiId: 'numbers', name: 'Números', short: 'Nm', testament: 'AT', group: 'Pentateuco', totalChapters: 36, deutero: false },
  { id: 'dt', apiId: 'deuteronomy', name: 'Deuteronômio', short: 'Dt', testament: 'AT', group: 'Pentateuco', totalChapters: 34, deutero: false },

  // ========== HISTÓRICOS ==========
  { id: 'js', apiId: 'joshua', name: 'Josué', short: 'Js', testament: 'AT', group: 'Históricos', totalChapters: 24, deutero: false },
  { id: 'jz', apiId: 'judges', name: 'Juízes', short: 'Jz', testament: 'AT', group: 'Históricos', totalChapters: 21, deutero: false },
  { id: 'rt', apiId: 'ruth', name: 'Rute', short: 'Rt', testament: 'AT', group: 'Históricos', totalChapters: 4, deutero: false },
  { id: '1sm', apiId: '1 samuel', name: '1 Samuel', short: '1Sm', testament: 'AT', group: 'Históricos', totalChapters: 31, deutero: false },
  { id: '2sm', apiId: '2 samuel', name: '2 Samuel', short: '2Sm', testament: 'AT', group: 'Históricos', totalChapters: 24, deutero: false },
  { id: '1rs', apiId: '1 kings', name: '1 Reis', short: '1Rs', testament: 'AT', group: 'Históricos', totalChapters: 22, deutero: false },
  { id: '2rs', apiId: '2 kings', name: '2 Reis', short: '2Rs', testament: 'AT', group: 'Históricos', totalChapters: 25, deutero: false },
  { id: '1cr', apiId: '1 chronicles', name: '1 Crônicas', short: '1Cr', testament: 'AT', group: 'Históricos', totalChapters: 29, deutero: false },
  { id: '2cr', apiId: '2 chronicles', name: '2 Crônicas', short: '2Cr', testament: 'AT', group: 'Históricos', totalChapters: 36, deutero: false },
  { id: 'esd', apiId: 'ezra', name: 'Esdras', short: 'Esd', testament: 'AT', group: 'Históricos', totalChapters: 10, deutero: false },
  { id: 'ne', apiId: 'nehemiah', name: 'Neemias', short: 'Ne', testament: 'AT', group: 'Históricos', totalChapters: 13, deutero: false },
  { id: 'tb', apiId: null, name: 'Tobias', short: 'Tb', testament: 'AT', group: 'Históricos', totalChapters: 14, deutero: true },
  { id: 'jt', apiId: null, name: 'Judite', short: 'Jt', testament: 'AT', group: 'Históricos', totalChapters: 16, deutero: true },
  { id: 'est', apiId: 'esther', name: 'Ester', short: 'Est', testament: 'AT', group: 'Históricos', totalChapters: 10, deutero: false },
  { id: '1mc', apiId: null, name: '1 Macabeus', short: '1Mc', testament: 'AT', group: 'Históricos', totalChapters: 16, deutero: true },
  { id: '2mc', apiId: null, name: '2 Macabeus', short: '2Mc', testament: 'AT', group: 'Históricos', totalChapters: 15, deutero: true },

  // ========== SAPIENCIAIS ==========
  { id: 'jo_at', apiId: 'job', name: 'Jó', short: 'Jó', testament: 'AT', group: 'Sapienciais', totalChapters: 42, deutero: false },
  { id: 'sl', apiId: 'psalms', name: 'Salmos', short: 'Sl', testament: 'AT', group: 'Sapienciais', totalChapters: 150, deutero: false },
  { id: 'pr', apiId: 'proverbs', name: 'Provérbios', short: 'Pr', testament: 'AT', group: 'Sapienciais', totalChapters: 31, deutero: false },
  { id: 'ecl', apiId: 'ecclesiastes', name: 'Eclesiastes', short: 'Ecl', testament: 'AT', group: 'Sapienciais', totalChapters: 12, deutero: false },
  { id: 'ct', apiId: 'song of solomon', name: 'Cântico dos Cânticos', short: 'Ct', testament: 'AT', group: 'Sapienciais', totalChapters: 8, deutero: false },
  { id: 'sb', apiId: null, name: 'Sabedoria', short: 'Sb', testament: 'AT', group: 'Sapienciais', totalChapters: 19, deutero: true },
  { id: 'eclo', apiId: null, name: 'Eclesiástico (Sirácida)', short: 'Eclo', testament: 'AT', group: 'Sapienciais', totalChapters: 51, deutero: true },

  // ========== PROFÉTICOS ==========
  { id: 'is', apiId: 'isaiah', name: 'Isaías', short: 'Is', testament: 'AT', group: 'Proféticos', totalChapters: 66, deutero: false },
  { id: 'jr', apiId: 'jeremiah', name: 'Jeremias', short: 'Jr', testament: 'AT', group: 'Proféticos', totalChapters: 52, deutero: false },
  { id: 'lm', apiId: 'lamentations', name: 'Lamentações', short: 'Lm', testament: 'AT', group: 'Proféticos', totalChapters: 5, deutero: false },
  { id: 'br', apiId: null, name: 'Baruque', short: 'Br', testament: 'AT', group: 'Proféticos', totalChapters: 6, deutero: true },
  { id: 'ez', apiId: 'ezekiel', name: 'Ezequiel', short: 'Ez', testament: 'AT', group: 'Proféticos', totalChapters: 48, deutero: false },
  { id: 'dn', apiId: 'daniel', name: 'Daniel', short: 'Dn', testament: 'AT', group: 'Proféticos', totalChapters: 12, deutero: false },
  { id: 'os', apiId: 'hosea', name: 'Oséias', short: 'Os', testament: 'AT', group: 'Proféticos', totalChapters: 14, deutero: false },
  { id: 'jl', apiId: 'joel', name: 'Joel', short: 'Jl', testament: 'AT', group: 'Proféticos', totalChapters: 3, deutero: false },
  { id: 'am', apiId: 'amos', name: 'Amós', short: 'Am', testament: 'AT', group: 'Proféticos', totalChapters: 9, deutero: false },
  { id: 'ab', apiId: 'obadiah', name: 'Abdias', short: 'Ab', testament: 'AT', group: 'Proféticos', totalChapters: 1, deutero: false },
  { id: 'jn_at', apiId: 'jonah', name: 'Jonas', short: 'Jn', testament: 'AT', group: 'Proféticos', totalChapters: 4, deutero: false },
  { id: 'mq', apiId: 'micah', name: 'Miquéias', short: 'Mq', testament: 'AT', group: 'Proféticos', totalChapters: 7, deutero: false },
  { id: 'na', apiId: 'nahum', name: 'Naum', short: 'Na', testament: 'AT', group: 'Proféticos', totalChapters: 3, deutero: false },
  { id: 'hab', apiId: 'habakkuk', name: 'Habacuque', short: 'Hab', testament: 'AT', group: 'Proféticos', totalChapters: 3, deutero: false },
  { id: 'sf', apiId: 'zephaniah', name: 'Sofonias', short: 'Sf', testament: 'AT', group: 'Proféticos', totalChapters: 3, deutero: false },
  { id: 'ag', apiId: 'haggai', name: 'Ageu', short: 'Ag', testament: 'AT', group: 'Proféticos', totalChapters: 2, deutero: false },
  { id: 'zc', apiId: 'zechariah', name: 'Zacarias', short: 'Zc', testament: 'AT', group: 'Proféticos', totalChapters: 14, deutero: false },
  { id: 'ml', apiId: 'malachi', name: 'Malaquias', short: 'Ml', testament: 'AT', group: 'Proféticos', totalChapters: 4, deutero: false },

  // ========== EVANGELHOS ==========
  { id: 'mt', apiId: 'matthew', name: 'Mateus', short: 'Mt', testament: 'NT', group: 'Evangelhos', totalChapters: 28, deutero: false },
  { id: 'mc', apiId: 'mark', name: 'Marcos', short: 'Mc', testament: 'NT', group: 'Evangelhos', totalChapters: 16, deutero: false },
  { id: 'lc', apiId: 'luke', name: 'Lucas', short: 'Lc', testament: 'NT', group: 'Evangelhos', totalChapters: 24, deutero: false },
  { id: 'jo', apiId: 'john', name: 'João', short: 'Jo', testament: 'NT', group: 'Evangelhos', totalChapters: 21, deutero: false },

  // ========== ATOS ==========
  { id: 'at', apiId: 'acts', name: 'Atos dos Apóstolos', short: 'At', testament: 'NT', group: 'Atos e Cartas', totalChapters: 28, deutero: false },

  // ========== CARTAS PAULINAS ==========
  { id: 'rm', apiId: 'romans', name: 'Romanos', short: 'Rm', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 16, deutero: false },
  { id: '1cor', apiId: '1 corinthians', name: '1 Coríntios', short: '1Cor', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 16, deutero: false },
  { id: '2cor', apiId: '2 corinthians', name: '2 Coríntios', short: '2Cor', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 13, deutero: false },
  { id: 'gl', apiId: 'galatians', name: 'Gálatas', short: 'Gl', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 6, deutero: false },
  { id: 'ef', apiId: 'ephesians', name: 'Efésios', short: 'Ef', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 6, deutero: false },
  { id: 'fl', apiId: 'philippians', name: 'Filipenses', short: 'Fl', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 4, deutero: false },
  { id: 'cl', apiId: 'colossians', name: 'Colossenses', short: 'Cl', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 4, deutero: false },
  { id: '1ts', apiId: '1 thessalonians', name: '1 Tessalonicenses', short: '1Ts', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 5, deutero: false },
  { id: '2ts', apiId: '2 thessalonians', name: '2 Tessalonicenses', short: '2Ts', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 3, deutero: false },
  { id: '1tm', apiId: '1 timothy', name: '1 Timóteo', short: '1Tm', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 6, deutero: false },
  { id: '2tm', apiId: '2 timothy', name: '2 Timóteo', short: '2Tm', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 4, deutero: false },
  { id: 'tt', apiId: 'titus', name: 'Tito', short: 'Tt', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 3, deutero: false },
  { id: 'fm', apiId: 'philemon', name: 'Filêmon', short: 'Fm', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 1, deutero: false },
  { id: 'hb', apiId: 'hebrews', name: 'Hebreus', short: 'Hb', testament: 'NT', group: 'Cartas Paulinas', totalChapters: 13, deutero: false },

  // ========== CARTAS CATÓLICAS ==========
  { id: 'tg', apiId: 'james', name: 'Tiago', short: 'Tg', testament: 'NT', group: 'Cartas Católicas', totalChapters: 5, deutero: false },
  { id: '1pd', apiId: '1 peter', name: '1 Pedro', short: '1Pd', testament: 'NT', group: 'Cartas Católicas', totalChapters: 5, deutero: false },
  { id: '2pd', apiId: '2 peter', name: '2 Pedro', short: '2Pd', testament: 'NT', group: 'Cartas Católicas', totalChapters: 3, deutero: false },
  { id: '1jo', apiId: '1 john', name: '1 João', short: '1Jo', testament: 'NT', group: 'Cartas Católicas', totalChapters: 5, deutero: false },
  { id: '2jo', apiId: '2 john', name: '2 João', short: '2Jo', testament: 'NT', group: 'Cartas Católicas', totalChapters: 1, deutero: false },
  { id: '3jo', apiId: '3 john', name: '3 João', short: '3Jo', testament: 'NT', group: 'Cartas Católicas', totalChapters: 1, deutero: false },
  { id: 'jd', apiId: 'jude', name: 'Judas', short: 'Jd', testament: 'NT', group: 'Cartas Católicas', totalChapters: 1, deutero: false },

  // ========== APOCALIPSE ==========
  { id: 'ap', apiId: 'revelation', name: 'Apocalipse', short: 'Ap', testament: 'NT', group: 'Apocalíptico', totalChapters: 22, deutero: false },
];

export function getBook(bookId) {
  return BIBLE_BOOKS.find((b) => b.id === bookId) ?? null;
}
