// Motor da Jornada: pontos (XP), níveis e conquistas por cima da leitura dos
// artigos. Módulo PURO (sem react-native, sem AsyncStorage) para rodar em
// tests/journey.test.mjs. Quem persiste é src/utils/journeyStore.js, e as
// telas só chamam applyEvent com o estado lido e o contexto do momento.
//
// Vocabulário: os nomes de nível vêm da iniciação cristã (catecúmeno,
// neófito, discípulo) e da apologética (apologista, defensor da fé, mestre),
// nunca de jogo de celular. Ver brain/3-App/Funcionalidades/Jornada.md.
//
// Estado (AsyncStorage 'journey:state'):
//   { v: 1, xp, lessons: { [articleId]: { read, hook, check: { best, perfect,
//     attempts }, done } }, badges: { [badgeId]: timestamp }, days: { [AAAA-MM-DD]: true } }
// `days` guarda os dias em que o quiz diário rendeu XP (um por dia).
//
// Eventos (applyEvent):
//   { type: 'read', articleId }                       chegou aos 90% do artigo
//   { type: 'hook', articleId, choice, correct }      respondeu a previsão
//   { type: 'check', articleId, score, total }        terminou o teste rápido
//   { type: 'dailyQuiz', dateKey, correct }           pergunta diária
//   { type: 'sync' }                                  só reavalia conquistas
//
// Contexto (ctx): o que o motor precisa e não vive no estado:
//   articlesByCategory: { [categoria]: [ids] }  (de src/data/articles)
//   streak: dias seguidos de leitura (readingProgress.getStreak)
//   quizStreak: dias seguidos do quiz diário (chave quiz:streak)
//   planCompleted: { [trackId]: boolean }       (trilhos do plano concluídos)
//
// Tudo é idempotente: repetir um evento nunca dá XP de novo, e uma conquista
// desbloqueada fica desbloqueada.

export const STATE_VERSION = 1;

// XP por evento. Um artigo completo (lido, previsão, teste perfeito) vale 70.
export const XP = {
  articleRead: 20,
  hook: 5,
  checkCorrect: 10,
  checkPerfect: 15,
  dailyQuiz: 15,
};

// Limiares calibrados para 83 artigos: Neófito com 2 artigos completos,
// Discípulo com 6, Apologista com 13, Defensor com 26, Mestre com 46.
export const LEVELS = [
  { id: 'catecumeno', min: 0, name: 'Catecúmeno', nameEn: 'Catechumen' },
  { id: 'neofito', min: 120, name: 'Neófito', nameEn: 'Neophyte' },
  { id: 'discipulo', min: 400, name: 'Discípulo', nameEn: 'Disciple' },
  { id: 'apologista', min: 900, name: 'Apologista', nameEn: 'Apologist' },
  { id: 'defensor', min: 1800, name: 'Defensor da Fé', nameEn: 'Defender of the Faith' },
  { id: 'mestre', min: 3200, name: 'Mestre', nameEn: 'Master' },
];

// Slug de cada categoria (os ids dos artigos são os nomes em PT).
export const CATEGORY_SLUGS = {
  'Existência de Deus': 'existencia-deus',
  'Igreja Católica': 'igreja-catolica',
  'Sagrada Escritura': 'sagrada-escritura',
  'Moral': 'moral',
  'Outras Religiões': 'outras-religioes',
  'História da Igreja': 'historia-igreja',
};

const categoryBadge = (category, name, nameEn, desc, descEn, icon) => ({
  id: `categoria-${CATEGORY_SLUGS[category]}`,
  kind: 'category',
  category,
  icon,
  name,
  nameEn,
  desc,
  descEn,
});

// Catálogo de conquistas. `icon` é o Ionicons de reserva; a marca vetorial
// desenhada para cada id vive em src/data/journeyMarks.js.
export const BADGES = [
  {
    id: 'primeiro-passo', kind: 'milestone', icon: 'footsteps-outline',
    name: 'Primeiro passo', nameEn: 'First step',
    desc: 'Concluiu a primeira lição: leu um artigo e fez o teste.',
    descEn: 'Completed your first lesson: read an article and took the check.',
  },
  categoryBadge('Existência de Deus', 'Teólogo natural', 'Natural theologian',
    'Completou todos os artigos sobre a existência de Deus.',
    'Completed every article on the existence of God.', 'planet-outline'),
  categoryBadge('Igreja Católica', 'Filho da Igreja', 'Child of the Church',
    'Completou todos os artigos sobre a Igreja Católica.',
    'Completed every article on the Catholic Church.', 'home-outline'),
  categoryBadge('Sagrada Escritura', 'Escriba', 'Scribe',
    'Completou todos os artigos sobre a Sagrada Escritura.',
    'Completed every article on Sacred Scripture.', 'book-outline'),
  categoryBadge('Moral', 'Consciência reta', 'Upright conscience',
    'Completou todos os artigos de moral.',
    'Completed every article on morality.', 'compass-outline'),
  categoryBadge('Outras Religiões', 'Diálogo', 'Dialogue',
    'Completou todos os artigos sobre outras religiões.',
    'Completed every article on other religions.', 'globe-outline'),
  categoryBadge('História da Igreja', 'Historiador', 'Historian',
    'Completou todos os artigos de história da Igreja.',
    'Completed every article on Church history.', 'time-outline'),
  {
    id: 'sequencia-3', kind: 'streak', threshold: 3, icon: 'flame-outline',
    name: 'Três dias', nameEn: 'Three days',
    desc: 'Leu em três dias seguidos.', descEn: 'Read on three days in a row.',
  },
  {
    id: 'sequencia-7', kind: 'streak', threshold: 7, icon: 'flame',
    name: 'Uma semana', nameEn: 'One week',
    desc: 'Leu em sete dias seguidos.', descEn: 'Read on seven days in a row.',
  },
  {
    id: 'sequencia-30', kind: 'streak', threshold: 30, icon: 'bonfire-outline',
    name: 'Um mês', nameEn: 'One month',
    desc: 'Leu em trinta dias seguidos.', descEn: 'Read on thirty days in a row.',
  },
  {
    id: 'dez-perfeitos', kind: 'milestone', icon: 'ribbon-outline',
    name: 'Sem errar', nameEn: 'Flawless',
    desc: 'Gabaritou o teste de dez artigos.', descEn: 'Perfect score on ten article checks.',
  },
  {
    id: 'trinta-artigos', kind: 'milestone', icon: 'library-outline',
    name: 'Trinta artigos', nameEn: 'Thirty articles',
    desc: 'Concluiu trinta lições.', descEn: 'Completed thirty lessons.',
  },
  {
    id: 'todos-os-artigos', kind: 'milestone', icon: 'trophy-outline',
    name: 'Apologista completo', nameEn: 'Complete apologist',
    desc: 'Concluiu todas as lições do app.', descEn: 'Completed every lesson in the app.',
  },
  {
    id: 'trilho-fundamentos', kind: 'plan', trackId: 'fundamentos', icon: 'calendar-outline',
    name: 'Fundamentos', nameEn: 'Foundations',
    desc: 'Terminou o trilho Fundamentos do plano de leitura.',
    descEn: 'Finished the Foundations track of the reading plan.',
  },
  {
    id: 'trilho-aprofundamento', kind: 'plan', trackId: 'aprofundamento', icon: 'school-outline',
    name: 'Aprofundamento', nameEn: 'Going deeper',
    desc: 'Terminou o trilho Aprofundamento do plano de leitura.',
    descEn: 'Finished the Going Deeper track of the reading plan.',
  },
  {
    id: 'quiz-7', kind: 'quizStreak', threshold: 7, icon: 'help-circle-outline',
    name: 'Semana de quiz', nameEn: 'Quiz week',
    desc: 'Acertou a pergunta do dia sete dias seguidos.',
    descEn: 'Got the daily question right seven days in a row.',
  },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));

export function createState() {
  return { v: STATE_VERSION, xp: 0, lessons: {}, badges: {}, days: {} };
}

const num = (v, min = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, n) : min;
};
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

// Aceita o que vier do AsyncStorage (nulo, string, versão antiga) e devolve
// um estado íntegro. Nunca lança.
export function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return createState();
  return {
    v: STATE_VERSION,
    xp: Math.round(num(raw.xp)),
    lessons: obj(raw.lessons),
    badges: obj(raw.badges),
    days: obj(raw.days),
  };
}

// Nível atual para um total de XP: { level, index, next, progress, toNext }.
// `progress` é a fração dentro do nível (0 a 1); no último nível é 1.
export function levelFor(xp) {
  const total = num(xp);
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (total >= LEVELS[i].min) index = i;
  const level = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  if (!next) return { level, index, next: null, progress: 1, toNext: 0 };
  const span = next.min - level.min;
  return {
    level,
    index,
    next,
    progress: Math.min(1, (total - level.min) / span),
    toNext: Math.max(0, next.min - total),
  };
}

export function lessonOf(state, articleId) {
  return (state && state.lessons && state.lessons[articleId]) || null;
}

export function isLessonComplete(lesson) {
  return Boolean(lesson && lesson.read && lesson.check && lesson.check.attempts > 0);
}

const CHECK_TOTAL = 3;

// Aplica um evento e devolve { state, gained, unlocked }. Não muta a entrada.
export function applyEvent(prev, event, ctx = {}) {
  const base = normalizeState(prev);
  const state = {
    ...base,
    lessons: { ...base.lessons },
    badges: { ...base.badges },
    days: { ...base.days },
  };
  let gained = 0;
  const now = Date.now();
  const type = event && event.type;
  const id = event && event.articleId;

  const touch = () => {
    const current = state.lessons[id] || {};
    const next = { ...current, check: current.check ? { ...current.check } : undefined };
    if (!next.check) delete next.check;
    state.lessons[id] = next;
    return next;
  };

  if (type === 'read' && id != null) {
    const l = touch();
    if (!l.read) {
      l.read = true;
      gained += XP.articleRead;
    }
  } else if (type === 'hook' && id != null) {
    const l = touch();
    if (l.hook == null) {
      l.hook = num(event.choice);
      gained += XP.hook;
    }
  } else if (type === 'check' && id != null) {
    const l = touch();
    const total = event.total == null ? CHECK_TOTAL : Math.max(1, Math.round(num(event.total, 1)));
    const score = Math.min(total, Math.round(num(event.score)));
    const prevCheck = l.check || { best: 0, perfect: false, attempts: 0 };
    const best = Math.max(prevCheck.best, score);
    gained += (best - prevCheck.best) * XP.checkCorrect;
    const perfect = prevCheck.perfect || score >= total;
    if (perfect && !prevCheck.perfect) gained += XP.checkPerfect;
    l.check = { best, perfect, attempts: prevCheck.attempts + 1 };
  } else if (type === 'dailyQuiz') {
    const key = String(event.dateKey || '');
    if (key && event.correct && !state.days[key]) {
      state.days[key] = true;
      gained += XP.dailyQuiz;
    }
  } else if (type !== 'sync') {
    return { state: base, gained: 0, unlocked: [] };
  }

  // Momento da conclusão da lição (lida e com teste), para ordenar e contar.
  if (id != null) {
    const l = state.lessons[id];
    if (l && isLessonComplete(l) && !l.done) l.done = now;
  }

  state.xp = base.xp + gained;
  const unlocked = evaluateBadges(state, ctx, now);
  return { state, gained, unlocked };
}

// Desbloqueia o que o estado e o contexto já justificam. Muta `state.badges`
// (o chamador já clonou) e devolve os ids novos.
function evaluateBadges(state, ctx, now) {
  const unlocked = [];
  const lessons = Object.values(state.lessons);
  const completed = lessons.filter(isLessonComplete).length;
  const perfect = lessons.filter((l) => l.check && l.check.perfect).length;
  const byCategory = obj(ctx.articlesByCategory);
  const totalArticles = Object.values(byCategory).reduce((n, ids) => n + (ids ? ids.length : 0), 0);
  const streak = num(ctx.streak);
  const quizStreak = num(ctx.quizStreak);
  const planCompleted = obj(ctx.planCompleted);

  const earned = (badge) => {
    switch (badge.kind) {
      case 'category': {
        const ids = byCategory[badge.category];
        return Boolean(ids && ids.length) && ids.every((aid) => isLessonComplete(state.lessons[aid]));
      }
      case 'streak':
        return streak >= badge.threshold;
      case 'quizStreak':
        return quizStreak >= badge.threshold;
      case 'plan':
        return Boolean(planCompleted[badge.trackId]);
      case 'milestone':
        if (badge.id === 'primeiro-passo') return completed >= 1;
        if (badge.id === 'dez-perfeitos') return perfect >= 10;
        if (badge.id === 'trinta-artigos') return completed >= 30;
        if (badge.id === 'todos-os-artigos') return totalArticles > 0 && completed >= totalArticles;
        return false;
      default:
        return false;
    }
  };

  for (const badge of BADGES) {
    if (state.badges[badge.id]) continue;
    if (earned(badge)) {
      state.badges[badge.id] = now;
      unlocked.push(badge.id);
    }
  }
  return unlocked;
}

// Sequência de dias "viva": a contagem guardada só vale se o último dia foi
// hoje ou ontem (readingProgress.getStreak devolve a contagem crua, e uma
// sequência de 7 dias terminada há duas semanas não pode desbloquear nada
// nem aparecer com a chama). `today` e `yesterday` chegam no formato da
// chave gravada, que é de quem chama.
export function liveStreak(streak, today, yesterday) {
  if (!streak || !streak.count || !streak.lastDate) return 0;
  return streak.lastDate === today || streak.lastDate === yesterday ? num(streak.count) : 0;
}

// Progresso de uma lista de artigos (uma categoria, um trilho).
export function categoryProgress(state, ids) {
  const s = normalizeState(state);
  const list = Array.isArray(ids) ? ids : [];
  let read = 0;
  let completed = 0;
  let perfect = 0;
  for (const aid of list) {
    const l = s.lessons[aid];
    if (!l) continue;
    if (l.read) read += 1;
    if (isLessonComplete(l)) completed += 1;
    if (l.check && l.check.perfect) perfect += 1;
  }
  return { read, completed, perfect, total: list.length };
}

// Números da tela Minha Jornada.
export function journeyStats(state, ctx = {}) {
  const s = normalizeState(state);
  const byCategory = obj(ctx.articlesByCategory);
  const all = Object.values(byCategory).flat();
  const prog = categoryProgress(s, all);
  return {
    xp: s.xp,
    ...levelFor(s.xp),
    read: prog.read,
    completed: prog.completed,
    perfect: prog.perfect,
    total: prog.total,
    badges: Object.keys(s.badges).length,
    badgesTotal: BADGES.length,
  };
}
