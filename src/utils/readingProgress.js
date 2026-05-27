import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_READ = 'reading:read';
const KEY_PLAN = 'reading:plan';

// Marca um artigo como lido (set, persiste)
export async function getReadSet() {
  try {
    const raw = await AsyncStorage.getItem(KEY_READ);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export async function markAsRead(articleId) {
  const set = await getReadSet();
  set.add(articleId);
  await AsyncStorage.setItem(KEY_READ, JSON.stringify([...set]));
  return set;
}

// Progresso do plano de leitura (qual dia ja completou)
export async function getPlanProgress() {
  try {
    const raw = await AsyncStorage.getItem(KEY_PLAN);
    return raw ? JSON.parse(raw) : { completed: [], lastDay: 0 };
  } catch {
    return { completed: [], lastDay: 0 };
  }
}

export async function markPlanDay(day) {
  const state = await getPlanProgress();
  if (!state.completed.includes(day)) {
    state.completed.push(day);
  }
  state.lastDay = Math.max(state.lastDay, day);
  await AsyncStorage.setItem(KEY_PLAN, JSON.stringify(state));
  return state;
}

export async function resetPlanProgress() {
  await AsyncStorage.removeItem(KEY_PLAN).catch(() => {});
}
