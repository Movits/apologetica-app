import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIBLE_BOOKS, getBook } from '../data/bible';
import { getLocalChapter } from '../data/bibleContent';

const API_BASE = 'https://bible-api.com';
const TRANSLATION = 'almeida';

const cacheKey = (bookId, chapter) => `bible:${bookId}:${chapter}`;

// Retorna { total, verses: [{n, t}] } ou null se livro é deutero sem conteúdo local.
// Levanta erro se request falhar (e sem cache).
export async function fetchChapter(bookId, chapter) {
  // 1. Tenta conteúdo local (curado ou deuterocanônico)
  const local = getLocalChapter(bookId, chapter);
  if (local) return { ...local, source: 'local' };

  const book = getBook(bookId);
  if (!book) throw new Error('Livro não encontrado');

  // 2. Se deuterocanônico sem conteúdo local, devolve placeholder
  if (book.deutero) {
    return {
      total: 0,
      verses: [],
      source: 'unavailable',
      message: 'Este capítulo dos deuterocanônicos ainda não está disponível no app. Em breve.',
    };
  }

  // 3. Tenta cache do AsyncStorage
  try {
    const cached = await AsyncStorage.getItem(cacheKey(bookId, chapter));
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, source: 'cache' };
    }
  } catch {
    // Ignora erros de cache, vamos pra rede
  }

  // 4. Busca da API
  if (!book.apiId) {
    throw new Error('Livro não disponível na API');
  }

  const url = `${API_BASE}/${encodeURIComponent(book.apiId)}+${chapter}?translation=${TRANSLATION}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao buscar (${response.status})`);
  }

  const data = await response.json();
  if (!data?.verses?.length) {
    throw new Error('Capítulo não retornou versículos');
  }

  const result = {
    total: data.verses.length,
    verses: data.verses.map((v) => ({ n: v.verse, t: (v.text || '').trim() })),
  };

  // 5. Salva em cache (não bloqueia se falhar)
  AsyncStorage.setItem(cacheKey(bookId, chapter), JSON.stringify(result)).catch(() => {});

  return { ...result, source: 'api' };
}

// Pré-aquece (opcional): busca múltiplos capítulos em paralelo
export async function preloadChapters(refs) {
  await Promise.all(
    refs.map(({ bookId, chapter }) => fetchChapter(bookId, chapter).catch(() => null))
  );
}

// Limpa todo o cache da Bíblia
export async function clearBibleCache() {
  const keys = await AsyncStorage.getAllKeys();
  const bibleKeys = keys.filter((k) => k.startsWith('bible:'));
  if (bibleKeys.length) await AsyncStorage.multiRemove(bibleKeys);
  return bibleKeys.length;
}

// Lista quais capítulos estão em cache (para mostrar em settings)
export async function listCachedChapters() {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter((k) => k.startsWith('bible:')).map((k) => {
    const [, bookId, chapter] = k.split(':');
    return { bookId, chapter: Number(chapter) };
  });
}
