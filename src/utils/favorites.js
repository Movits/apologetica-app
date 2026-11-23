import AsyncStorage from '@react-native-async-storage/async-storage';
import { markProgressDirty } from './syncSignal';

const KEY = 'favorites:articles';
// Quando cada artigo entrou ou saiu dos favoritos ({ [id]: { on, at } }).
// É o que deixa a sincronização entre aparelhos saber que um favorito foi
// tirado, em vez de devolvê-lo (ver mergeFavorites em progressMerge.js).
const LOG_KEY = 'favorites:log';

export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(articleId) {
  const list = await getFavorites();
  return list.includes(articleId);
}

export async function toggleFavorite(articleId) {
  const list = await getFavorites();
  const idx = list.indexOf(articleId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift(articleId);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  try {
    const log = JSON.parse((await AsyncStorage.getItem(LOG_KEY)) || '{}') || {};
    log[articleId] = { on: idx < 0, at: Date.now() };
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {}
  markProgressDirty('favorites');
  return list;
}
