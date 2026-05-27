// Metadados dos 73 livros do cânon católico.
// `name`/`short`: PT (Ave Maria). `nameEn`/`shortEn`: EN (Douay-Rheims).
// `apiId`: identificador legado.

export const BIBLE_BOOKS = [
  // ========== PENTATEUCO / PENTATEUCH ==========
  { id: 'gn', apiId: 'genesis', name: 'Gênesis', nameEn: 'Genesis', short: 'Gn', shortEn: 'Gn', testament: 'AT', group: 'Pentateuco', groupEn: 'Pentateuch', totalChapters: 50, deutero: false },
  { id: 'ex', apiId: 'exodus', name: 'Êxodo', nameEn: 'Exodus', short: 'Ex', shortEn: 'Ex', testament: 'AT', group: 'Pentateuco', groupEn: 'Pentateuch', totalChapters: 40, deutero: false },
  { id: 'lv', apiId: 'leviticus', name: 'Levítico', nameEn: 'Leviticus', short: 'Lv', shortEn: 'Lv', testament: 'AT', group: 'Pentateuco', groupEn: 'Pentateuch', totalChapters: 27, deutero: false },
  { id: 'nm', apiId: 'numbers', name: 'Números', nameEn: 'Numbers', short: 'Nm', shortEn: 'Num', testament: 'AT', group: 'Pentateuco', groupEn: 'Pentateuch', totalChapters: 36, deutero: false },
  { id: 'dt', apiId: 'deuteronomy', name: 'Deuteronômio', nameEn: 'Deuteronomy', short: 'Dt', shortEn: 'Dt', testament: 'AT', group: 'Pentateuco', groupEn: 'Pentateuch', totalChapters: 34, deutero: false },

  // ========== HISTÓRICOS / HISTORICAL ==========
  { id: 'js', apiId: 'joshua', name: 'Josué', nameEn: 'Joshua', short: 'Js', shortEn: 'Jos', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 24, deutero: false },
  { id: 'jz', apiId: 'judges', name: 'Juízes', nameEn: 'Judges', short: 'Jz', shortEn: 'Jdg', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 21, deutero: false },
  { id: 'rt', apiId: 'ruth', name: 'Rute', nameEn: 'Ruth', short: 'Rt', shortEn: 'Rt', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 4, deutero: false },
  { id: '1sm', apiId: '1 samuel', name: '1 Samuel', nameEn: '1 Samuel', short: '1Sm', shortEn: '1Sm', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 31, deutero: false },
  { id: '2sm', apiId: '2 samuel', name: '2 Samuel', nameEn: '2 Samuel', short: '2Sm', shortEn: '2Sm', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 24, deutero: false },
  { id: '1rs', apiId: '1 kings', name: '1 Reis', nameEn: '1 Kings', short: '1Rs', shortEn: '1Kg', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 22, deutero: false },
  { id: '2rs', apiId: '2 kings', name: '2 Reis', nameEn: '2 Kings', short: '2Rs', shortEn: '2Kg', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 25, deutero: false },
  { id: '1cr', apiId: '1 chronicles', name: '1 Crônicas', nameEn: '1 Chronicles', short: '1Cr', shortEn: '1Chr', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 29, deutero: false },
  { id: '2cr', apiId: '2 chronicles', name: '2 Crônicas', nameEn: '2 Chronicles', short: '2Cr', shortEn: '2Chr', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 36, deutero: false },
  { id: 'esd', apiId: 'ezra', name: 'Esdras', nameEn: 'Ezra', short: 'Esd', shortEn: 'Ezr', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 10, deutero: false },
  { id: 'ne', apiId: 'nehemiah', name: 'Neemias', nameEn: 'Nehemiah', short: 'Ne', shortEn: 'Neh', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 13, deutero: false },
  { id: 'tb', apiId: null, name: 'Tobias', nameEn: 'Tobit', short: 'Tb', shortEn: 'Tb', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 14, deutero: true },
  { id: 'jt', apiId: null, name: 'Judite', nameEn: 'Judith', short: 'Jt', shortEn: 'Jdt', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 16, deutero: true },
  { id: 'est', apiId: 'esther', name: 'Ester', nameEn: 'Esther', short: 'Est', shortEn: 'Est', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 16, deutero: false },
  { id: '1mc', apiId: null, name: '1 Macabeus', nameEn: '1 Maccabees', short: '1Mc', shortEn: '1Mac', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 16, deutero: true },
  { id: '2mc', apiId: null, name: '2 Macabeus', nameEn: '2 Maccabees', short: '2Mc', shortEn: '2Mac', testament: 'AT', group: 'Históricos', groupEn: 'Historical', totalChapters: 15, deutero: true },

  // ========== SAPIENCIAIS / WISDOM ==========
  { id: 'jo_at', apiId: 'job', name: 'Jó', nameEn: 'Job', short: 'Jó', shortEn: 'Jb', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 42, deutero: false },
  { id: 'sl', apiId: 'psalms', name: 'Salmos', nameEn: 'Psalms', short: 'Sl', shortEn: 'Ps', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 150, deutero: false },
  { id: 'pr', apiId: 'proverbs', name: 'Provérbios', nameEn: 'Proverbs', short: 'Pr', shortEn: 'Pr', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 31, deutero: false },
  { id: 'ecl', apiId: 'ecclesiastes', name: 'Eclesiastes', nameEn: 'Ecclesiastes', short: 'Ecl', shortEn: 'Ec', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 12, deutero: false },
  { id: 'ct', apiId: 'song of solomon', name: 'Cântico dos Cânticos', nameEn: 'Song of Solomon', short: 'Ct', shortEn: 'Sg', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 8, deutero: false },
  { id: 'sb', apiId: null, name: 'Sabedoria', nameEn: 'Wisdom', short: 'Sb', shortEn: 'Wis', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 19, deutero: true },
  { id: 'eclo', apiId: null, name: 'Eclesiástico (Sirácida)', nameEn: 'Sirach (Ecclesiasticus)', short: 'Eclo', shortEn: 'Sir', testament: 'AT', group: 'Sapienciais', groupEn: 'Wisdom', totalChapters: 51, deutero: true },

  // ========== PROFÉTICOS / PROPHETIC ==========
  { id: 'is', apiId: 'isaiah', name: 'Isaías', nameEn: 'Isaiah', short: 'Is', shortEn: 'Is', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 66, deutero: false },
  { id: 'jr', apiId: 'jeremiah', name: 'Jeremias', nameEn: 'Jeremiah', short: 'Jr', shortEn: 'Jr', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 52, deutero: false },
  { id: 'lm', apiId: 'lamentations', name: 'Lamentações', nameEn: 'Lamentations', short: 'Lm', shortEn: 'Lm', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 5, deutero: false },
  { id: 'br', apiId: null, name: 'Baruque', nameEn: 'Baruch', short: 'Br', shortEn: 'Bar', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 6, deutero: true },
  { id: 'ez', apiId: 'ezekiel', name: 'Ezequiel', nameEn: 'Ezekiel', short: 'Ez', shortEn: 'Ez', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 48, deutero: false },
  { id: 'dn', apiId: 'daniel', name: 'Daniel', nameEn: 'Daniel', short: 'Dn', shortEn: 'Dn', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 14, deutero: false },
  { id: 'os', apiId: 'hosea', name: 'Oséias', nameEn: 'Hosea', short: 'Os', shortEn: 'Hos', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 14, deutero: false },
  { id: 'jl', apiId: 'joel', name: 'Joel', nameEn: 'Joel', short: 'Jl', shortEn: 'Jl', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 4, deutero: false },
  { id: 'am', apiId: 'amos', name: 'Amós', nameEn: 'Amos', short: 'Am', shortEn: 'Am', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 9, deutero: false },
  { id: 'ab', apiId: 'obadiah', name: 'Abdias', nameEn: 'Obadiah', short: 'Ab', shortEn: 'Ob', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 1, deutero: false },
  { id: 'jn_at', apiId: 'jonah', name: 'Jonas', nameEn: 'Jonah', short: 'Jn', shortEn: 'Jon', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 4, deutero: false },
  { id: 'mq', apiId: 'micah', name: 'Miquéias', nameEn: 'Micah', short: 'Mq', shortEn: 'Mic', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 7, deutero: false },
  { id: 'na', apiId: 'nahum', name: 'Naum', nameEn: 'Nahum', short: 'Na', shortEn: 'Na', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 3, deutero: false },
  { id: 'hab', apiId: 'habakkuk', name: 'Habacuque', nameEn: 'Habakkuk', short: 'Hab', shortEn: 'Hab', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 3, deutero: false },
  { id: 'sf', apiId: 'zephaniah', name: 'Sofonias', nameEn: 'Zephaniah', short: 'Sf', shortEn: 'Zep', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 3, deutero: false },
  { id: 'ag', apiId: 'haggai', name: 'Ageu', nameEn: 'Haggai', short: 'Ag', shortEn: 'Hag', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 2, deutero: false },
  { id: 'zc', apiId: 'zechariah', name: 'Zacarias', nameEn: 'Zechariah', short: 'Zc', shortEn: 'Zec', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 14, deutero: false },
  { id: 'ml', apiId: 'malachi', name: 'Malaquias', nameEn: 'Malachi', short: 'Ml', shortEn: 'Mal', testament: 'AT', group: 'Proféticos', groupEn: 'Prophetic', totalChapters: 3, deutero: false },

  // ========== EVANGELHOS / GOSPELS ==========
  { id: 'mt', apiId: 'matthew', name: 'Mateus', nameEn: 'Matthew', short: 'Mt', shortEn: 'Mt', testament: 'NT', group: 'Evangelhos', groupEn: 'Gospels', totalChapters: 28, deutero: false },
  { id: 'mc', apiId: 'mark', name: 'Marcos', nameEn: 'Mark', short: 'Mc', shortEn: 'Mk', testament: 'NT', group: 'Evangelhos', groupEn: 'Gospels', totalChapters: 16, deutero: false },
  { id: 'lc', apiId: 'luke', name: 'Lucas', nameEn: 'Luke', short: 'Lc', shortEn: 'Lk', testament: 'NT', group: 'Evangelhos', groupEn: 'Gospels', totalChapters: 24, deutero: false },
  { id: 'jo', apiId: 'john', name: 'João', nameEn: 'John', short: 'Jo', shortEn: 'Jn', testament: 'NT', group: 'Evangelhos', groupEn: 'Gospels', totalChapters: 21, deutero: false },

  // ========== ATOS / ACTS ==========
  { id: 'at', apiId: 'acts', name: 'Atos dos Apóstolos', nameEn: 'Acts of the Apostles', short: 'At', shortEn: 'Ac', testament: 'NT', group: 'Atos e Cartas', groupEn: 'Acts and Letters', totalChapters: 28, deutero: false },

  // ========== CARTAS PAULINAS / PAULINE EPISTLES ==========
  { id: 'rm', apiId: 'romans', name: 'Romanos', nameEn: 'Romans', short: 'Rm', shortEn: 'Rm', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 16, deutero: false },
  { id: '1cor', apiId: '1 corinthians', name: '1 Coríntios', nameEn: '1 Corinthians', short: '1Cor', shortEn: '1Cor', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 16, deutero: false },
  { id: '2cor', apiId: '2 corinthians', name: '2 Coríntios', nameEn: '2 Corinthians', short: '2Cor', shortEn: '2Cor', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 13, deutero: false },
  { id: 'gl', apiId: 'galatians', name: 'Gálatas', nameEn: 'Galatians', short: 'Gl', shortEn: 'Gal', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 6, deutero: false },
  { id: 'ef', apiId: 'ephesians', name: 'Efésios', nameEn: 'Ephesians', short: 'Ef', shortEn: 'Eph', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 6, deutero: false },
  { id: 'fl', apiId: 'philippians', name: 'Filipenses', nameEn: 'Philippians', short: 'Fl', shortEn: 'Php', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 4, deutero: false },
  { id: 'cl', apiId: 'colossians', name: 'Colossenses', nameEn: 'Colossians', short: 'Cl', shortEn: 'Col', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 4, deutero: false },
  { id: '1ts', apiId: '1 thessalonians', name: '1 Tessalonicenses', nameEn: '1 Thessalonians', short: '1Ts', shortEn: '1Th', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 5, deutero: false },
  { id: '2ts', apiId: '2 thessalonians', name: '2 Tessalonicenses', nameEn: '2 Thessalonians', short: '2Ts', shortEn: '2Th', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 3, deutero: false },
  { id: '1tm', apiId: '1 timothy', name: '1 Timóteo', nameEn: '1 Timothy', short: '1Tm', shortEn: '1Tm', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 6, deutero: false },
  { id: '2tm', apiId: '2 timothy', name: '2 Timóteo', nameEn: '2 Timothy', short: '2Tm', shortEn: '2Tm', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 4, deutero: false },
  { id: 'tt', apiId: 'titus', name: 'Tito', nameEn: 'Titus', short: 'Tt', shortEn: 'Tit', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 3, deutero: false },
  { id: 'fm', apiId: 'philemon', name: 'Filêmon', nameEn: 'Philemon', short: 'Fm', shortEn: 'Phm', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 1, deutero: false },
  { id: 'hb', apiId: 'hebrews', name: 'Hebreus', nameEn: 'Hebrews', short: 'Hb', shortEn: 'Heb', testament: 'NT', group: 'Cartas Paulinas', groupEn: 'Pauline Epistles', totalChapters: 13, deutero: false },

  // ========== CARTAS CATÓLICAS / CATHOLIC EPISTLES ==========
  { id: 'tg', apiId: 'james', name: 'Tiago', nameEn: 'James', short: 'Tg', shortEn: 'Jas', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 5, deutero: false },
  { id: '1pd', apiId: '1 peter', name: '1 Pedro', nameEn: '1 Peter', short: '1Pd', shortEn: '1Pt', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 5, deutero: false },
  { id: '2pd', apiId: '2 peter', name: '2 Pedro', nameEn: '2 Peter', short: '2Pd', shortEn: '2Pt', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 3, deutero: false },
  { id: '1jo', apiId: '1 john', name: '1 João', nameEn: '1 John', short: '1Jo', shortEn: '1Jn', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 5, deutero: false },
  { id: '2jo', apiId: '2 john', name: '2 João', nameEn: '2 John', short: '2Jo', shortEn: '2Jn', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 1, deutero: false },
  { id: '3jo', apiId: '3 john', name: '3 João', nameEn: '3 John', short: '3Jo', shortEn: '3Jn', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 1, deutero: false },
  { id: 'jd', apiId: 'jude', name: 'Judas', nameEn: 'Jude', short: 'Jd', shortEn: 'Jud', testament: 'NT', group: 'Cartas Católicas', groupEn: 'Catholic Epistles', totalChapters: 1, deutero: false },

  // ========== APOCALIPSE / REVELATION ==========
  { id: 'ap', apiId: 'revelation', name: 'Apocalipse', nameEn: 'Revelation', short: 'Ap', shortEn: 'Rev', testament: 'NT', group: 'Apocalíptico', groupEn: 'Apocalyptic', totalChapters: 22, deutero: false },
];

export function getBook(bookId) {
  return BIBLE_BOOKS.find((b) => b.id === bookId) ?? null;
}

// Helper: nome do livro no idioma escolhido.
export function bookName(book, isEn = false) {
  if (!book) return '';
  return isEn ? (book.nameEn || book.name) : book.name;
}

export function bookShort(book, isEn = false) {
  if (!book) return '';
  return isEn ? (book.shortEn || book.short) : book.short;
}
