import { XP, normalizeState } from './journey';

// Como juntar o progresso de dois aparelhos da mesma conta. Módulo puro
// (testes em tests/progressMerge.test.mjs); quem lê, grava e fala com o
// Firestore é src/services/progressSync.js.
//
// Regra geral: nada que um aparelho conquistou se perde. Conjuntos viram a
// união, contadores ficam com o maior, e um ponto único ("onde parei") fica
// com o mais recente. Todas as funções aceitam null de um dos lados e nunca
// mutam a entrada.

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ===== Jornada =====

// XP que o próprio estado explica (leitura, previsão, teste, pergunta do
// dia). O que sobra no `xp` gravado veio das revisões, que o estado não
// registra passo a passo.
export function journeyBaseXp(state) {
  const s = normalizeState(state);
  let xp = 0;
  for (const l of Object.values(s.lessons)) {
    if (!l) continue;
    if (l.read) xp += XP.articleRead;
    if (l.hook != null) xp += XP.hook;
    if (l.check && l.check.attempts > 0) {
      xp += num(l.check.first ?? l.check.best) * XP.checkCorrect;
      if (l.check.perfect) xp += XP.checkPerfect;
    }
  }
  for (const v of Object.values(s.days)) if (v === true) xp += XP.dailyQuiz;
  return xp;
}

function mergeLesson(a, b) {
  if (!a) return b;
  if (!b) return a;
  const out = { ...b, ...a };
  out.read = Boolean(a.read || b.read) || undefined;
  if (!out.read) delete out.read;
  out.hook = a.hook ?? b.hook;
  if (out.hook == null) delete out.hook;
  const ca = a.check;
  const cb = b.check;
  if (ca || cb) {
    const pa = num(ca && ca.attempts);
    const pb = num(cb && cb.attempts);
    const win = pa > pb || (pa === pb && num(ca && ca.best) >= num(cb && cb.best)) ? ca : cb;
    out.check = { ...win, best: Math.max(num(ca && ca.best), num(cb && cb.best)) };
    delete out.draft;
  } else {
    delete out.check;
    const draft = a.draft || b.draft;
    if (draft) out.draft = draft;
  }
  const done = [a.done, b.done].filter((d) => Number.isFinite(d));
  if (done.length) out.done = Math.min(...done);
  else delete out.done;
  return out;
}

function mergeCard(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.mastered !== b.mastered) return a.mastered ? a : b;
  if (num(a.reps) !== num(b.reps)) return num(a.reps) > num(b.reps) ? a : b;
  return String(a.due || '') >= String(b.due || '') ? a : b;
}

export function mergeJourney(a, b) {
  const sa = normalizeState(a);
  const sb = normalizeState(b);
  const lessons = {};
  for (const id of new Set([...Object.keys(sa.lessons), ...Object.keys(sb.lessons)])) {
    lessons[id] = mergeLesson(sa.lessons[id], sb.lessons[id]);
  }
  const badges = { ...sb.badges };
  for (const [id, at] of Object.entries(sa.badges)) {
    badges[id] = id in badges ? Math.min(num(at), num(badges[id])) : at;
  }
  // A primeira resposta do dia é a que vale: o lado `a` (o aparelho) tem a
  // palavra quando os dois responderam.
  const days = { ...sb.days, ...sa.days };
  const review = {};
  for (const k of new Set([...Object.keys(sa.review), ...Object.keys(sb.review)])) {
    review[k] = mergeCard(sa.review[k], sb.review[k]);
  }
  const merged = { v: sa.v, xp: 0, lessons, badges, days, review };
  const extra = Math.max(0, sa.xp - journeyBaseXp(sa), sb.xp - journeyBaseXp(sb));
  merged.xp = journeyBaseXp(merged) + extra;
  return merged;
}

// ===== Artigos, plano, sequência =====

export function mergeIdSet(a, b) {
  return [...new Set([...arr(a), ...arr(b)])];
}

// Para o que é um ponto só (último artigo, onde parou na Bíblia, marcador da
// leitura): o mais recente, pelo `at` que cada um já grava.
export function mergeLatestAt(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return num(a.at) >= num(b.at) ? a : b;
}

// As datas da sequência estão em "AAAA-M-D" sem zero à esquerda: compara
// como data, não como texto.
const dayValue = (s) => {
  const [y, m, d] = String(s || '').split('-').map(Number);
  return y ? y * 10000 + (m || 0) * 100 + (d || 0) : 0;
};

export function mergeReadingStreak(a, b) {
  if (!a || !a.lastDate) return b || a || null;
  if (!b || !b.lastDate) return a;
  const da = dayValue(a.lastDate);
  const db = dayValue(b.lastDate);
  if (da !== db) return da > db ? a : b;
  return num(a.count) >= num(b.count) ? a : b;
}

export function mergePlan(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  const completed = mergeIdSet(a.completed, b.completed).sort((x, y) => x - y);
  return { ...b, ...a, completed, lastDay: Math.max(num(a.lastDay), num(b.lastDay)) };
}

// ===== Bíblia =====

export function mergeBibleRead(a, b) {
  const out = {};
  const ma = obj(a);
  const mb = obj(b);
  for (const id of new Set([...Object.keys(ma), ...Object.keys(mb)])) {
    out[id] = mergeIdSet(ma[id], mb[id]).sort((x, y) => x - y);
  }
  return out;
}

// ===== Quiz diário =====

export function mergeQuizHistory(a, b) {
  return { ...obj(b), ...obj(a) };
}

export function mergeQuizStreak(a, b) {
  return String(Math.max(parseInt(a, 10) || 0, parseInt(b, 10) || 0));
}

// ===== Favoritos =====
// A lista sozinha não diz se um favorito sumiu porque foi tirado ou porque
// nunca existiu naquele aparelho. O registro `log` guarda, por artigo, se está
// marcado e quando mudou. Um id que só está na lista (de antes do registro)
// conta como marcado, no tempo 0.

function favLog(side) {
  const s = obj(side);
  const log = {};
  for (const id of arr(s.list)) log[id] = { on: true, at: 0 };
  for (const [id, e] of Object.entries(obj(s.log))) {
    if (e && typeof e === 'object') log[id] = { on: Boolean(e.on), at: num(e.at) };
  }
  return log;
}

export function mergeFavorites(a, b) {
  const la = favLog(a);
  const lb = favLog(b);
  const log = { ...lb };
  for (const [id, e] of Object.entries(la)) {
    if (!log[id] || e.at >= log[id].at) log[id] = e;
  }
  // A ordem da lista é a do aparelho (mais recente primeiro); o que veio só
  // do outro lado entra pela data.
  const order = [...arr(obj(a).list), ...arr(obj(b).list)];
  const ids = Object.keys(log).map((k) => (Number.isFinite(Number(k)) ? Number(k) : k));
  const pos = (id) => {
    const i = order.indexOf(id);
    return i < 0 ? Infinity : i;
  };
  const list = ids
    .filter((id) => log[id].on)
    .sort((x, y) => (log[y].at - log[x].at) || (pos(x) - pos(y)));
  return { list, log };
}

export function favoritesList(merged) {
  return arr(obj(merged).list);
}
