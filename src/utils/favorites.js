import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorites:articles';

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
  return list;
}
