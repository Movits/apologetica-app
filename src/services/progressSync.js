import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { READING_TRACKS } from '../data/readingPlan';
import { setProgressDirtyHandler } from '../utils/syncSignal';
import { getJourney, adoptJourney } from '../utils/journeyStore';
import {
  mergeJourney, mergeIdSet, mergeLatestAt, mergeReadingStreak, mergePlan,
  mergeBibleRead, mergeQuizHistory, mergeQuizStreak, mergeFavorites,
} from '../utils/progressMerge';

// Sincroniza com a conta o progresso que mora no aparelho (AsyncStorage):
// Jornada (XP, nível, lições, conquistas, revisão), artigos lidos, favoritos,
// sequência de dias, plano de leitura, quiz diário, último artigo e o
// progresso e o marcador da Bíblia. Sem conta (visitante), nada sai do
// aparelho, como antes.
//
// Cada item vira um documento em users/{uid}/progress/{id} com o valor em
// JSON. Sincronizar é: ler o documento, juntar com o local pelas regras de
// src/utils/progressMerge.js, gravar o resultado nos dois lados. Acontece ao
// entrar na conta, ao voltar para o app e alguns segundos depois de cada
// mudança local.
//
// `epoch` marca o último "zerar" daquele item. Um aparelho que ainda tem o
// dado de antes do zerar recebe o da conta em vez de juntar, senão devolveria
// o que foi apagado.

const COL = 'progress';
const EPOCHS_KEY = 'sync:epochs';
const DEBOUNCE_MS = 2500;
const FOREGROUND_MIN_MS = 60 * 1000;

const parse = (raw) => {
  if (raw == null) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const jsonItem = (key, merge) => ({
  id: key,
  read: async () => parse(await AsyncStorage.getItem(key)),
  write: async (v) => {
    if (v == null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(v));
  },
  merge,
});

const ITEMS = [
  {
    id: 'journey:state',
    read: () => getJourney(),
    // A Jornada tem cache em memória e fila própria: grava por lá.
    write: (v, { replace } = {}) => adoptJourney(v, { replace }),
    merge: mergeJourney,
  },
  jsonItem('reading:read', mergeIdSet),
  jsonItem('reading:streak', mergeReadingStreak),
  ...READING_TRACKS.map((t) => jsonItem(`reading:plan:${t.id}`, mergePlan)),
  jsonItem('lastRead:article', mergeLatestAt),
  jsonItem('quiz:history', mergeQuizHistory),
  {
    id: 'quiz:streak',
    read: () => AsyncStorage.getItem('quiz:streak'),
    write: async (v) => {
      if (v == null) await AsyncStorage.removeItem('quiz:streak');
      else await AsyncStorage.setItem('quiz:streak', String(v));
    },
    merge: mergeQuizStreak,
  },
  {
    id: 'favorites',
    read: async () => {
      const [list, log] = await Promise.all([
        AsyncStorage.getItem('favorites:articles'),
        AsyncStorage.getItem('favorites:log'),
      ]);
      return { list: parse(list) || [], log: parse(log) || {} };
    },
    write: async (v) => {
      await AsyncStorage.setItem('favorites:articles', JSON.stringify((v && v.list) || []));
      await AsyncStorage.setItem('favorites:log', JSON.stringify((v && v.log) || {}));
    },
    merge: mergeFavorites,
  },
  jsonItem('bible:read', mergeBibleRead),
  jsonItem('bible:position', mergeLatestAt),
  jsonItem('bible:bookmark', mergeLatestAt),
];
const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function getEpochs() {
  return parse(await AsyncStorage.getItem(EPOCHS_KEY).catch(() => null)) || {};
}
async function setEpoch(id, epoch) {
  const all = await getEpochs();
  all[id] = epoch;
  await AsyncStorage.setItem(EPOCHS_KEY, JSON.stringify(all)).catch(() => {});
}

const listeners = new Set();
export function subscribeProgressSync(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// Itens sincronizados em fila: um de cada vez, para a leitura e a escrita
// do mesmo documento nunca se cruzarem.
let queue = Promise.resolve();
function enqueue(fn) {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}

async function syncItem(uid, item, { overwrite = false } = {}) {
  const ref = doc(db, 'users', uid, COL, item.id);
  if (overwrite) {
    const local = await item.read();
    const epoch = Date.now();
    await setDoc(ref, { value: JSON.stringify(local ?? null), epoch, updatedAt: serverTimestamp() });
    await setEpoch(item.id, epoch);
    return false;
  }
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : null;
  const remote = data ? parse(data.value) : null;
  const remoteEpoch = Number(data && data.epoch) || 0;
  const localEpoch = Number((await getEpochs())[item.id]) || 0;

  if (remoteEpoch > localEpoch) {
    // Outro aparelho zerou este item depois da última vez que este viu:
    // o local é de antes do zerar e é trocado pelo da conta.
    await item.write(remote, { replace: true });
    await setEpoch(item.id, remoteEpoch);
    return true;
  }

  const local = await item.read();
  if (local == null && remote == null) return false;
  const merged = item.merge(local, remote);
  let changed = false;
  if (!same(merged, local)) {
    // Relê e junta de novo na hora de gravar: algo pode ter mudado no
    // aparelho enquanto o documento vinha da rede.
    const now = await item.read();
    await item.write(item.merge(now, merged));
    changed = true;
  }
  if (!same(merged, remote)) {
    await setDoc(ref, { value: JSON.stringify(merged ?? null), epoch: remoteEpoch, updatedAt: serverTimestamp() });
  }
  return changed;
}

async function runSync(ids, opts) {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  let changed = false;
  for (const id of ids) {
    const item = BY_ID.get(id);
    if (!item) continue;
    try {
      if (await syncItem(uid, item, opts)) changed = true;
    } catch {
      // Sem rede ou sem permissão: tenta de novo na próxima vez.
    }
  }
  if (changed) listeners.forEach((fn) => { try { fn(); } catch {} });
  return changed;
}

let lastFull = 0;
export function syncAllProgress() {
  lastFull = Date.now();
  return enqueue(() => runSync(ITEMS.map((i) => i.id)));
}

// Mudança local: junta os avisos de alguns segundos num envio só.
const pending = new Map();
let timer = null;
function onDirty(id, opts) {
  if (!auth.currentUser) return;
  const prev = pending.get(id);
  pending.set(id, { overwrite: Boolean(opts.overwrite || (prev && prev.overwrite)) });
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    const batch = [...pending.entries()];
    pending.clear();
    for (const [bid, o] of batch) enqueue(() => runSync([bid], o));
  }, DEBOUNCE_MS);
}

let started = false;
// Chamado uma vez (App.js). Sincroniza ao entrar na conta e ao voltar para
// o app (no máximo uma vez por minuto), e liga o aviso de mudança local.
export function startProgressSync() {
  if (started) return;
  started = true;
  setProgressDirtyHandler(onDirty);
  onAuthStateChanged(auth, (u) => { if (u) syncAllProgress(); });
  AppState.addEventListener('change', (state) => {
    if (state === 'active' && auth.currentUser && Date.now() - lastFull > FOREGROUND_MIN_MS) syncAllProgress();
  });
}
