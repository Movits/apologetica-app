import { BIBLE_BOOKS } from '../data/bible';

// Regras puras do marcador da leitura contínua (a Bíblia lida do início ao
// fim). O armazenamento fica em bibleBookmark.js. Aqui só o que dá para
// testar sem React Native: ordem no cânon, próximo capítulo, "está adiante" e
// a limpeza do que vem do disco.
//
// O marcador é diferente do "continue lendo" de bibleProgress.js: aquele é o
// último capítulo aberto, e qualquer consulta pode movê-lo. O marcador só se
// move quando a pessoa está lendo PELA leitura contínua (entrou pelo cartão
// "Minha leitura", avançou com o próximo capítulo) ou quando ela mesma pede
// "Marcar minha leitura aqui". Busca, referência, terço e liturgia nunca o tocam.

const INDICE_LIVRO = Object.fromEntries(BIBLE_BOOKS.map((b, i) => [b.id, i]));
const CAPS = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.id, b.totalChapters || 0]));

// Posição absoluta de um capítulo no cânon (0 = primeiro capítulo do primeiro
// livro). -1 para livro ou capítulo inválido.
const INICIO_LIVRO = (() => {
  const out = {};
  let n = 0;
  for (const b of BIBLE_BOOKS) { out[b.id] = n; n += b.totalChapters || 0; }
  return out;
})();

export const START_REF = { bookId: BIBLE_BOOKS[0].id, chapter: 1 };

function capValido(bookId, chapter) {
  const max = CAPS[bookId];
  return Boolean(max) && Number.isInteger(chapter) && chapter >= 1 && chapter <= max;
}

export function canonIndex({ bookId, chapter } = {}) {
  if (!capValido(bookId, chapter)) return -1;
  return INICIO_LIVRO[bookId] + chapter - 1;
}

// Capítulo seguinte na ordem do cânon, atravessando de um livro para o
// próximo. Null no fim do Apocalipse ou para referência inválida.
export function nextChapterRef({ bookId, chapter } = {}) {
  if (!capValido(bookId, chapter)) return null;
  if (chapter < CAPS[bookId]) return { bookId, chapter: chapter + 1 };
  const prox = BIBLE_BOOKS[INDICE_LIVRO[bookId] + 1];
  return prox ? { bookId: prox.id, chapter: 1 } : null;
}

// Capítulo anterior na ordem do cânon, atravessando para o último capítulo
// do livro anterior. Null em Gênesis 1 ou para referência inválida.
export function prevChapterRef({ bookId, chapter } = {}) {
  if (!capValido(bookId, chapter)) return null;
  if (chapter > 1) return { bookId, chapter: chapter - 1 };
  const ant = BIBLE_BOOKS[INDICE_LIVRO[bookId] - 1];
  return ant ? { bookId: ant.id, chapter: ant.totalChapters } : null;
}

// `a` está depois de `b`? Capítulo vem antes da rolagem. O marcador só anda
// para a frente sozinho: voltar um capítulo para relembrar não puxa o ponto
// para trás. Sem `b` (ainda não há marcador), qualquer ponto válido serve.
export function isAhead(a, b) {
  const ia = canonIndex(a || {});
  if (ia < 0) return false;
  if (!b) return true;
  const ib = canonIndex(b);
  if (ib < 0) return true;
  if (ia !== ib) return ia > ib;
  return (Number(a.ratio) || 0) > (Number(b.ratio) || 0);
}

// O armazenamento é dado não confiável (versão antiga, livro renomeado,
// capítulo fora da faixa). Devolve o marcador limpo ou null.
export function sanitizeBookmark(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const { bookId, chapter } = raw;
  if (!capValido(bookId, chapter)) return null;
  const ratio = Math.max(0, Math.min(1, Number(raw.ratio) || 0));
  const verse = Number.isInteger(raw.verse) && raw.verse >= 1 ? raw.verse : null;
  const lang = raw.lang === 'pt' || raw.lang === 'en' ? raw.lang : null;
  const at = Number.isFinite(raw.at) ? raw.at : 0;
  return { bookId, chapter, ratio, verse, lang, at };
}
