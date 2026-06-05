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

// Progresso do plano de leitura, agora POR TRILHO (reading:plan:<trackId>).
// A chave antiga reading:plan (trilho único) migra para 'fundamentos' na 1a leitura.
const planKey = (trackId) => `reading:plan:${trackId}`;

export async function getPlanProgress(trackId = 'fundamentos') {
  try {
    const raw = await AsyncStorage.getItem(planKey(trackId));
    if (raw) return JSON.parse(raw);
    if (trackId === 'fundamentos') {
      const legacy = await AsyncStorage.getItem(KEY_PLAN);
      if (legacy) {
        await AsyncStorage.setItem(planKey('fundamentos'), legacy).catch(() => {});
        return JSON.parse(legacy);
      }
    }
    return { completed: [], lastDay: 0 };
  } catch {
    return { completed: [], lastDay: 0 };
  }
}

export async function markPlanDay(trackId, day) {
  const state = await getPlanProgress(trackId);
  if (!state.completed.includes(day)) {
    state.completed.push(day);
  }
  state.lastDay = Math.max(state.lastDay, day);
  await AsyncStorage.setItem(planKey(trackId), JSON.stringify(state));
  return state;
}

export async function resetPlanProgress(trackId = 'fundamentos') {
  await AsyncStorage.removeItem(planKey(trackId)).catch(() => {});
}
