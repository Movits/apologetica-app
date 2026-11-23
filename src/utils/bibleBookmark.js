import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeBookmark, isAhead } from './bibleBookmarkCore';
import { markProgressDirty } from './syncSignal';

// Marcador da leitura contínua (Bíblia do início ao fim), local em
// AsyncStorage como o resto do progresso, para valer também no modo
// visitante. As regras (o que é "adiante", o próximo capítulo) estão em
// bibleBookmarkCore.js. A chave é separada de `bible:position` de propósito:
// abrir uma passagem por referência mexe naquela e nunca nesta.
const KEY = 'bible:bookmark';

export async function getBibleBookmark() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? sanitizeBookmark(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

// Grava o marcador onde a pessoa pediu, mesmo que seja para trás.
export async function setBibleBookmark({ bookId, chapter, ratio = 0, verse = null, lang = null }) {
  const limpo = sanitizeBookmark({ bookId, chapter, ratio, verse, lang, at: Date.now() });
  if (!limpo) return null;
  try { await AsyncStorage.setItem(KEY, JSON.stringify(limpo)); } catch {}
  markProgressDirty(KEY);
  return limpo;
}

// Avanço automático durante a leitura contínua: só grava se o ponto novo
// estiver depois do salvo. Devolve o marcador que ficou valendo.
export async function advanceBibleBookmark(point) {
  const atual = await getBibleBookmark();
  if (!isAhead(point, atual)) return atual;
  return setBibleBookmark(point);
}

export async function clearBibleBookmark() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
  markProgressDirty(KEY, { overwrite: true });
}
