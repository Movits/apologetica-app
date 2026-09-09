import { getBook, bookName } from '../data/bible';

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

// Retorna { total, verses: [{n, t}], source, language } ou null.
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
          verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
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
    verses: chapterArr.map((t, i) => ({ n: i + 1, t })),
    source: 'avemaria',
    language: 'pt',
  };
}

// Normaliza para busca: minúsculas + remove acentos.
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Busca full-text offline na Bíblia inteira (varredura por substring, não Fuse:
// ~35 mil versículos por tradução, já residentes em memória). Retorna itens
// prontos para deep-link: { bookId, chapter, verse, ref, text }.
// `language`: 'en' → Douay-Rheims, senão Ave Maria (PT).
export function searchBible(query, { language = 'pt', limit = 30 } = {}) {
  const q = norm(query).trim();
  if (q.length < 3) return [];
  const isEn = language === 'en';
  const data = isEn ? DRA : AVEMARIA;
  if (!data) return [];
  const sep = isEn ? ':' : ',';
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
          results.push({
            bookId,
            chapter,
            verse,
            ref: `${name} ${chapter}${sep}${verse}`,
            text: verses[vi],
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}
