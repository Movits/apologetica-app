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

// Guarda uma busca (3+ letras) no topo do histórico, sem repetir e até MAX
// itens, e devolve a lista nova (como removeSearchHistory), para a tela não
// precisar reler. Busca curta não grava e devolve a lista como está.
export async function addSearchHistory(query) {
  const q = query.trim();
  if (q.length < 3) return getSearchHistory();
  const list = await getSearchHistory();
  const filtered = list.filter((x) => x.toLowerCase() !== q.toLowerCase());
  filtered.unshift(q);
  const next = filtered.slice(0, MAX);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

// Apaga uma busca só (o "x" de cada linha do histórico) e devolve a lista
// que sobrou, para a tela não precisar reler.
export async function removeSearchHistory(query) {
  const q = String(query ?? '').trim().toLowerCase();
  const list = await getSearchHistory();
  const next = list.filter((x) => x.toLowerCase() !== q);
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  return next;
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}
