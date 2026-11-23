import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeBookmark } from './bibleBookmarkCore';
import { markProgressDirty } from './syncSignal';

// "Continuar" da Bíblia: o último ponto lido dentro da aba Bíblia. Local em
// AsyncStorage (vale no modo visitante) e sincronizado com a conta pelo
// progressSync. Consulta vinda de fora (referência, terço, busca) não grava
// aqui: quem decide é a BibleScreen.
const KEY = 'bible:bookmark';

export async function getBibleBookmark() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? sanitizeBookmark(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function setBibleBookmark({ bookId, chapter, ratio = 0, verse = null, lang = null }) {
  const limpo = sanitizeBookmark({ bookId, chapter, ratio, verse, lang, at: Date.now() });
  if (!limpo) return null;
  try { await AsyncStorage.setItem(KEY, JSON.stringify(limpo)); } catch {}
  markProgressDirty(KEY);
  return limpo;
}

export async function clearBibleBookmark() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
  markProgressDirty(KEY, { overwrite: true });
}
