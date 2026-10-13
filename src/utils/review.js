// Revisão espaçada da Jornada (caixas de Leitner). Módulo PURO, testado em
// tests/review.test.mjs. Quem guarda os cartões é o estado da Jornada
// (state.review, em src/utils/journey.js) e quem mostra é ReviewScreen.
//
// A regra, do jeito que a pessoa lê no app:
// - Errou uma pergunta (teste rápido, previsão "Antes de ler" ou pergunta do
//   dia): ela volta amanhã na Revisão.
// - Acertou no teste rápido: volta em uma semana, para fixar.
// - Na Revisão, cada acerto empurra a próxima vez para mais longe
//   (1, 3, 7, 16 e 35 dias) e errar devolve a pergunta para amanhã.
// - Acertou na última caixa: a pergunta está dominada e não volta mais.
//
// Datas são chaves 'AAAA-MM-DD' em hora local (todayKey de src/utils/daily.js),
// e a conta de dias é feita em UTC sobre a chave, então horário de verão não
// desloca nada.

// Dias até a próxima revisão em cada caixa (índice = caixa).
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35];
// Perguntas por sessão de revisão: curta o bastante para caber num intervalo.
export const REVIEW_SESSION_SIZE = 5;
// Caixa de entrada de uma pergunta acertada no teste (volta em 7 dias).
export const FIRST_BOX_RIGHT = 2;
// "Etapa" da pergunta dominada, acima da última caixa: conta para o XP.
export const MASTERED_LEVEL = REVIEW_INTERVALS.length;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function addDaysKey(dateKey, n) {
  const m = DATE_RE.exec(String(dateKey || ''));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + Number(n || 0)));
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Chaves estáveis. As perguntas do teste são guardadas pelo índice na lição,
// por isso uma lição publicada nunca reordena as perguntas (CLAUDE.md).
export const lessonKey = (articleId, index) => `a:${articleId}:${index}`;
export const hookKey = (articleId) => `a:${articleId}:h`;
export const quizKey = (quizId) => `q:${quizId}`;

export function parseKey(key) {
  if (typeof key !== 'string') return null;
  let m = /^a:(\d+):(h|\d+)$/.exec(key);
  if (m) {
    const articleId = Number(m[1]);
    return m[2] === 'h' ? { kind: 'hook', articleId } : { kind: 'check', articleId, index: Number(m[2]) };
  }
  m = /^q:(.+)$/.exec(key);
  if (m) return { kind: 'quiz', quizId: m[1] };
  return null;
}

// `maxBox` é a etapa mais alta já paga: o XP da revisão só paga etapa nova
// (caixa acima de maxBox, ou a pergunta dominada), então errar de propósito
// para repetir uma etapa não rende. Quem cria o cartão pode marcar etapas
// como já pagas (`maxBox`): a previsão já valeu XP na hora, a pergunta do dia
// só recupera o que valia.
export function newCard(correct, today, opts = {}) {
  const box = correct ? FIRST_BOX_RIGHT : 0;
  const maxBox = Math.max(box, Number.isFinite(opts.maxBox) ? opts.maxBox : box);
  return { box, due: addDaysKey(today, REVIEW_INTERVALS[box]), reps: 0, lapses: 0, maxBox };
}

// Resposta numa revisão. Devolve um cartão novo (não muta a entrada).
export function answerCard(card, correct, today) {
  const reps = (card.reps || 0) + 1;
  const lapses = card.lapses || 0;
  const prevMax = card.maxBox ?? card.box ?? 0;
  if (!correct) return { box: 0, due: addDaysKey(today, REVIEW_INTERVALS[0]), reps, lapses: lapses + 1, maxBox: prevMax };
  const box = (card.box || 0) + 1;
  if (box >= REVIEW_INTERVALS.length) {
    return { box: REVIEW_INTERVALS.length - 1, due: null, reps, lapses, maxBox: MASTERED_LEVEL, mastered: true };
  }
  return { box, due: addDaysKey(today, REVIEW_INTERVALS[box]), reps, lapses, maxBox: Math.max(prevMax, box) };
}

export function isDue(card, today) {
  return Boolean(card && !card.mastered && card.due && card.due <= today);
}

// Chaves vencidas, as mais atrasadas primeiro e, no empate, a caixa mais baixa
// (a pergunta menos firme). `limit` corta a sessão.
export function dueKeys(cards, today, limit = Infinity) {
  if (!cards || typeof cards !== 'object') return [];
  return Object.keys(cards)
    .filter((k) => isDue(cards[k], today))
    .sort((a, b) => {
      const ca = cards[a];
      const cb = cards[b];
      if (ca.due !== cb.due) return ca.due < cb.due ? -1 : 1;
      if ((ca.box || 0) !== (cb.box || 0)) return (ca.box || 0) - (cb.box || 0);
      return a < b ? -1 : a > b ? 1 : 0;
    })
    .slice(0, limit);
}

export function reviewSummary(cards, today) {
  const list = cards && typeof cards === 'object' ? Object.values(cards) : [];
  let due = 0;
  let mastered = 0;
  let nextDue = null;
  for (const c of list) {
    if (!c) continue;
    if (c.mastered) { mastered += 1; continue; }
    if (isDue(c, today)) due += 1;
    else if (c.due && (!nextDue || c.due < nextDue)) nextDue = c.due;
  }
  return { due, learning: list.length - mastered, mastered, total: list.length, nextDue };
}

// Ordem de exibição das opções. Nos dados a resposta certa cai quase sempre na
// mesma posição, e quem percebe o padrão acerta sem ler. A ordem é
// determinística pela semente (a mesma pergunta não se embaralha a cada
// renderização) e muda quando a semente muda (tentativa nova, dia novo).
export function shuffledOrder(n, seed) {
  const order = Array.from({ length: Math.max(0, n | 0) }, (_, i) => i);
  // FNV-1a para a semente e mulberry32 para os sorteios.
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Dias de `from` até `to` (chaves AAAA-MM-DD); negativo se `to` vem antes.
export function daysBetween(from, to) {
  const a = DATE_RE.exec(String(from || ''));
  const b = DATE_RE.exec(String(to || ''));
  if (!a || !b) return null;
  const ta = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  const tb = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((tb - ta) / 86400000);
}
