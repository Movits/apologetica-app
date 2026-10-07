import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyEvent, normalizeState, createState } from './journey';
import { articles } from '../data/articles';
import { READING_TRACKS } from '../data/readingPlan';
import { bumpStreak, getLiveStreak, getPlanProgress, markAsRead } from './readingProgress';
import { addDays, todayKey } from './daily';

// Persistência e distribuição do estado da Jornada (src/utils/journey.js é
// o motor puro). Fica no aparelho, em AsyncStorage, como favoritos e
// progresso: vale no modo visitante e não custa uma escrita de rede.
//
// - getJourney(): estado atual (cache em memória depois da primeira leitura).
// - dispatchJourney(event): aplica um evento com o contexto do momento
//   (streaks, trilhos) e grava. As chamadas são enfileiradas, então dois
//   eventos seguidos (lido + teste) nunca se atropelam.
// - subscribeJourney(fn): avisa a cada mudança (a Início e a lista de artigos
//   se atualizam sem reler o armazenamento a cada foco).
// - resetJourney(): apaga tudo (botão em Minha Jornada).

const KEY = 'journey:state';
const QUIZ_STREAK_KEY = 'quiz:streak';
const QUIZ_HISTORY_KEY = 'quiz:history';

let cache = null;
// Leitura inicial em andamento: quem chegar durante o await espera a mesma
// promessa, em vez de ler de novo e sobrescrever um estado já atualizado.
let loading = null;
let queue = Promise.resolve();
const listeners = new Set();

// Ids dos artigos por categoria, calculados uma vez: é o universo que as
// conquistas de categoria e "todos os artigos" medem.
export const ARTICLES_BY_CATEGORY = articles.reduce((acc, a) => {
  (acc[a.category] = acc[a.category] || []).push(a.id);
  return acc;
}, {});

function load() {
  if (cache) return Promise.resolve(cache);
  if (!loading) {
    loading = AsyncStorage.getItem(KEY)
      .then((raw) => normalizeState(raw ? JSON.parse(raw) : null))
      .catch(() => createState())
      .then((state) => {
        // Um dispatch pode ter gravado enquanto a leitura corria: o que está
        // no cache é mais novo que o que veio do disco.
        if (!cache) cache = state;
        loading = null;
        return cache;
      });
  }
  return loading;
}

function emit(state) {
  listeners.forEach((fn) => {
    try { fn(state); } catch {}
  });
}

export function getJourney() {
  return load();
}

export function subscribeJourney(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// Sequência do quiz diário que ainda vale: a contagem gravada só se a
// pergunta de hoje foi acertada, ou se ainda não foi respondida e a de ontem
// foi acertada. O histórico é o de QuizScreen (quiz:history, chaves todayKey).
async function liveQuizStreak() {
  const [countRaw, histRaw] = await Promise.all([
    AsyncStorage.getItem(QUIZ_STREAK_KEY).catch(() => null),
    AsyncStorage.getItem(QUIZ_HISTORY_KEY).catch(() => null),
  ]);
  const count = parseInt(countRaw, 10) || 0;
  if (!count) return 0;
  let hist = {};
  try { hist = JSON.parse(histRaw) || {}; } catch {}
  const now = new Date();
  const today = hist[todayKey(now)];
  const yesterday = hist[todayKey(addDays(now, -1))];
  if (today) return today.correct ? count : 0;
  return yesterday && yesterday.correct ? count : 0;
}

// Contexto que o motor precisa e não vive no estado da jornada.
async function buildContext() {
  const [streak, quizStreak, ...plans] = await Promise.all([
    getLiveStreak().catch(() => 0),
    liveQuizStreak(),
    ...READING_TRACKS.map((t) => getPlanProgress(t.id).catch(() => ({ completed: [] }))),
  ]);
  const planCompleted = {};
  READING_TRACKS.forEach((t, i) => {
    const done = new Set(plans[i]?.completed || []);
    planCompleted[t.id] = t.days.length > 0 && t.days.every((d) => done.has(d.day));
  });
  return {
    articlesByCategory: ARTICLES_BY_CATEGORY,
    streak,
    quizStreak,
    planCompleted,
  };
}

// Aplica e grava. Devolve { state, gained, unlocked } do motor.
export function dispatchJourney(event) {
  const run = async () => {
    const prev = await load();
    // Ler ou testar um artigo conta na sequência de dias de leitura (antes só
    // os dias do plano contavam). bumpStreak é idempotente dentro do dia.
    if (event && (event.type === 'read' || event.type === 'check')) {
      await bumpStreak().catch(() => {});
      // O selo "Lido" das listas (reading:read) anda junto com a jornada.
      await markAsRead(event.articleId).catch(() => {});
    }
    const ctx = await buildContext();
    const result = applyEvent(prev, event, ctx);
    // applyEvent sempre devolve um objeto novo: compara o conteúdo, senão
    // um evento repetido (previsão já respondida) gravaria e avisaria à toa.
    const changed = JSON.stringify(result.state) !== JSON.stringify(prev);
    cache = result.state;
    if (changed) {
      await AsyncStorage.setItem(KEY, JSON.stringify(result.state)).catch(() => {});
      emit(result.state);
    }
    return result;
  };
  const next = queue.then(run, run);
  // A fila nunca fica rejeitada: um erro numa chamada não trava as seguintes.
  queue = next.catch(() => {});
  return next;
}

export async function resetJourney() {
  cache = createState();
  await AsyncStorage.removeItem(KEY).catch(() => {});
  emit(cache);
  return cache;
}
