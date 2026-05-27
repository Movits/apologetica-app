import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'search:history';
const MAX = 8;

export async function getSearchHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addSearchHistory(query) {
  const q = query.trim();
  if (q.length < 3) return;
  const list = await getSearchHistory();
  const filtered = list.filter((x) => x.toLowerCase() !== q.toLowerCase());
  filtered.unshift(q);
  const next = filtered.slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}
