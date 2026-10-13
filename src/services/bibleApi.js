import { getBook, bookName } from '../data/bible';
import { formatVerseRef } from '../utils/verseRef';

// As duas Bíblias pesavam 2,81 MB dos 4,44 MB que a versão web transferia: 63%
// do download inicial, sempre as duas, mesmo para quem lê num idioma só, e tudo
// isso antes de aparecer a primeira palavra na tela. Agora cada tradução é um
// pedaço separado, carregado quando a Bíblia é aberta de verdade.
//
// getChapter e searchBible CONTINUAM SÍNCRONOS de propósito. Torná-los
// assíncronos espalharia promessas por lugares onde isso é ruim: o renderItem
// da tela de Marcações chamaria uma por linha, e o compartilhar de nota perderia
// o gesto do usuário que o navigator.share exige. Em vez disso quem vai exibir
// texto bíblico chama ensureBible(lang) antes (ver src/hooks/useBibleReady.js);
// depois de carregado, o acesso é o mesmo de sempre.
//
// No nativo o import() é resolvido em tempo de build e o dado continua dentro do
// app: nada de rede, o offline segue igual.

let AVEMARIA = null;
let DRA = null;
// Uma promessa por idioma, guardada para que N telas pedindo ao mesmo tempo
// gerem um download só.
const carregando = {};

function jaCarregada(lang) {
  return lang === 'en' ? DRA !== null : AVEMARIA !== null;
}

export function isBibleLoaded(language = 'pt') {
  return jaCarregada(language === 'en' ? 'en' : 'pt');
}

// Carrega a tradução do idioma pedido. Idempotente e seguro para chamadas
// concorrentes. Rejeita se o pedaço não vier (rede caiu no meio), e nesse caso
// a promessa é descartada para permitir nova tentativa.
export function ensureBible(language = 'pt') {
  const lang = language === 'en' ? 'en' : 'pt';
  if (jaCarregada(lang)) return Promise.resolve();
  if (!carregando[lang]) {
    carregando[lang] = (lang === 'en'
      ? import('../data/bibleDouayRheims').then((m) => { DRA = m.DRA; })
      : import('../data/bibleAveMaria').then((m) => { AVEMARIA = m.AVEMARIA; })
    ).catch((err) => {
      delete carregando[lang];
      throw err;
    });
  }
  return carregando[lang];
}

// Blocos da edição impressa: a Ave Maria imprime alguns grupos de versículos
// juntos (Josué 19,2-7, listas de cidades, genealogias). O dado guarda o texto
// do bloco no primeiro número e deixa os seguintes como '' para a numeração
// continuar certa (Josué 19,40 é o 40 de verdade). Aqui o bloco vira uma linha
// só, com `end` ("2-7" na tela).
export function chapterVerses(chapterArr) {
  const verses = [];
  chapterArr.forEach((t, i) => {
    if (t === '' && verses.length) verses[verses.length - 1].end = i + 1;
    else verses.push({ n: i + 1, t });
  });
  return verses;
}

// Texto do versículo `n`, ou null fora do capítulo. Um número dentro de um
// bloco devolve o texto do bloco inteiro.
export function verseText(chapterArr, n) {
  if (!chapterArr || !(n >= 1) || n > chapterArr.length) return null;
  for (let i = n - 1; i >= 0; i--) if (chapterArr[i] !== '') return chapterArr[i] ?? null;
  return null;
}

// Intervalo { start, end } da linha que contém o versículo `n` (o bloco
// inteiro quando `n` cai num bloco), ou null fora do capítulo. É o rótulo
// certo de uma marcação feita num número do meio de um bloco.
export function verseSpan(chapterArr, n) {
  if (!chapterArr || !(n >= 1) || n > chapterArr.length) return null;
  let start = n;
  while (start > 1 && chapterArr[start - 1] === '') start--;
  if (chapterArr[start - 1] === '') return null;
  let end = n;
  while (end < chapterArr.length && chapterArr[end] === '') end++;
  return { start, end };
}

// Retorna { total, verses: [{n, t, end?}], source, language } ou null.
// `total` é o número de versículos (o último número), não o de linhas.
// `language` pode ser 'pt' ou 'en'. Fallback automático para PT se EN não estiver disponível.
export function getChapter(bookId, chapter, language = 'pt') {
  const book = getBook(bookId);
  if (!book) return null;

  if (language === 'en' && DRA) {
    const bookData = DRA[bookId];
    if (bookData) {
      const chapterArr = bookData[chapter - 1];
      if (chapterArr) {
        return {
          total: chapterArr.length,
          verses: chapterVerses(chapterArr),
          source: 'douay-rheims',
          language: 'en',
        };
      }
    }
    // se EN pedido mas indisponível, devolve PT marcado como fallback (só
    // funciona se o PT também já tiver sido carregado; senão devolve null e a
    // tela mostra o estado de carregamento).
    const fallback = AVEMARIA ? getChapter(bookId, chapter, 'pt') : null;
    if (fallback) return { ...fallback, language: 'pt', fallback: true };
    return null;
  }

  if (!AVEMARIA) return null;
  const bookData = AVEMARIA[bookId];
  if (!bookData) return null;

  const chapterArr = bookData[chapter - 1];
  if (!chapterArr) return null;

  return {
    total: chapterArr.length,
    verses: chapterVerses(chapterArr),
    source: 'avemaria',
    language: 'pt',
  };
}

// Texto de UM versículo, ou null se o livro, o capítulo ou o versículo não
// existem. Mesmas regras de fallback de getChapter: EN pedido com a
// Douay-Rheims carregada lê nela e só cai para o PT se o CAPÍTULO faltar (um
// versículo a menos na numeração inglesa devolve null, como o `find` nas telas
// devolvia undefined); EN pedido sem a Douay-Rheims lê o PT. Substitui
// getChapter(...)?.verses?.find((v) => v.n === n)?.t nas telas de marcações e
// notas, sem montar o capítulo inteiro a cada linha. Dentro de um bloco da
// edição impressa, devolve o texto do bloco (ver chapterVerses).
export function getVerse(bookId, chapter, verse, language = 'pt') {
  if (!getBook(bookId)) return null;
  if (language === 'en' && DRA) {
    const chapterArr = DRA[bookId]?.[chapter - 1];
    if (chapterArr) return verseText(chapterArr, verse);
  }
  return verseText(AVEMARIA?.[bookId]?.[chapter - 1], verse);
}

// verseSpan no capítulo que getVerse leria (mesmas regras de idioma).
export function getVerseSpan(bookId, chapter, verse, language = 'pt') {
  if (!getBook(bookId)) return null;
  if (language === 'en' && DRA) {
    const chapterArr = DRA[bookId]?.[chapter - 1];
    if (chapterArr) return verseSpan(chapterArr, verse);
  }
  return verseSpan(AVEMARIA?.[bookId]?.[chapter - 1], verse);
}

// Normaliza para busca: minúsculas + remove acentos.
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca full-text offline na Bíblia inteira (varredura por substring, não Fuse:
// ~35 mil versículos por tradução, já residentes em memória). Retorna itens
// prontos para deep-link: { bookId, chapter, verse, ref, text }, com `ref` no
// formato do idioma (formatVerseRef: "João 3,16" em PT, "John 3:16" em EN).
// `language`: 'en' → Douay-Rheims, senão Ave Maria (PT).
export function searchBible(query, { language = 'pt', limit = 30 } = {}) {
  const q = norm(query).trim();
  if (q.length < 3) return [];
  const isEn = language === 'en';
  const data = isEn ? DRA : AVEMARIA;
  if (!data) return [];
  const results = [];
  for (const bookId of Object.keys(data)) {
    const chapters = data[bookId];
    if (!chapters) continue;
    const book = getBook(bookId);
    if (!book) continue;
    const name = bookName(book, isEn);
    for (let ci = 0; ci < chapters.length; ci++) {
      const verses = chapters[ci];
      if (!verses) continue;
      for (let vi = 0; vi < verses.length; vi++) {
        if (norm(verses[vi]).includes(q)) {
          const chapter = ci + 1;
          const verse = vi + 1;
          // Bloco da edição impressa: a referência mostra o intervalo todo.
          let verseEnd = verse;
          while (verses[verseEnd] === '') verseEnd++;
          results.push({
            bookId,
            chapter,
            verse,
            ...(verseEnd > verse ? { verseEnd } : {}),
            ref: formatVerseRef({ bookName: name, chapter, verse, verseEnd }, isEn),
            text: verses[vi],
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}
