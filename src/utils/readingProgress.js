import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_READ = 'reading:read';
const KEY_PLAN = 'reading:plan';
const KEY_STREAK = 'reading:streak';

// Sequencia de dias (streak) de leitura, mecanismo de retencao apontado pela
// pesquisa (Capela/Hallow). Global: qualquer dia de plano concluido conta.
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function getStreak() {
  try {
    const raw = await AsyncStorage.getItem(KEY_STREAK);
    return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
  } catch {
    return { count: 0, lastDate: null };
  }
}

// Registra atividade de hoje: mantem se ja marcou hoje, +1 se foi ontem,
// reinicia em 1 caso contrario. Usa data LOCAL (sem drift de fuso).
export async function bumpStreak() {
  const s = await getStreak();
  const today = localDateStr();
  if (s.lastDate === today) return s;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const count = s.lastDate === localDateStr(y) ? (s.count || 0) + 1 : 1;
  const next = { count, lastDate: today };
  await AsyncStorage.setItem(KEY_STREAK, JSON.stringify(next)).catch(() => {});
  return next;
}

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
  await bumpStreak().catch(() => {});
  return state;
}

export async function resetPlanProgress(trackId = 'fundamentos') {
  await AsyncStorage.removeItem(planKey(trackId)).catch(() => {});
}
