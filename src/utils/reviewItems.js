// Da chave de um cartão de revisão (src/utils/review.js) à pergunta que a tela
// mostra. Módulo PURO (só dados), testado em tests/reviewItems.test.mjs: toda
// pergunta de lição e todo id do quiz precisam resolver.
//
// Devolve { key, kind, articleId, question, questionEn, options, optionsEn,
// correct, why, whyEn } ou null quando o conteúdo sumiu (a tela pula e o
// cartão fica, sem quebrar nada). `articleId` é o artigo a reler: o da lição,
// ou o relatedArticle da pergunta do quiz (pode ser null).
import { LESSONS } from '../data/lessons';
import { QUIZ, DAILY_QUESTIONS } from '../data/quiz';
import { dueKeys, parseKey } from './review';

const QUIZ_BY_ID = new Map([...QUIZ, ...DAILY_QUESTIONS].map((q) => [q.id, q]));

// "Antes de ler: X?" vira "X?" na revisão (a pessoa já leu).
const HOOK_PREFIX = /^(antes de ler|before you read)\s*[:：]\s*/i;
const unprefix = (s) => {
  const out = String(s || '').replace(HOOK_PREFIX, '');
  return out.charAt(0).toUpperCase() + out.slice(1);
};

export function reviewItem(key) {
  const k = parseKey(key);
  if (!k) return null;
  if (k.kind === 'quiz') {
    const q = QUIZ_BY_ID.get(k.quizId);
    if (!q) return null;
    return {
      key,
      kind: 'quiz',
      articleId: q.relatedArticle ?? null,
      question: q.question,
      questionEn: q.questionEn,
      options: q.options,
      optionsEn: q.optionsEn,
      correct: q.correct,
      why: q.why,
      whyEn: q.whyEn,
    };
  }
  const lesson = LESSONS[k.articleId];
  if (!lesson) return null;
  if (k.kind === 'hook') {
    const h = lesson.hook;
    if (!h) return null;
    return {
      key,
      kind: 'hook',
      articleId: k.articleId,
      question: unprefix(h.question),
      questionEn: h.questionEn ? unprefix(h.questionEn) : undefined,
      options: h.options,
      optionsEn: h.optionsEn,
      correct: h.correct,
      why: h.note,
      whyEn: h.noteEn,
    };
  }
  const q = lesson.check && lesson.check[k.index];
  if (!q) return null;
  return {
    key,
    kind: 'check',
    articleId: k.articleId,
    question: q.question,
    questionEn: q.questionEn,
    options: q.options,
    optionsEn: q.optionsEn,
    correct: q.correct,
    why: q.why,
    whyEn: q.whyEn,
  };
}

// Perguntas vencidas que ainda existem no conteúdo, na ordem da revisão. Um
// cartão cuja pergunta sumiu não entra na contagem nem na sessão.
export function dueItems(cards, today, limit = Infinity) {
  const out = [];
  for (const key of dueKeys(cards, today)) {
    const item = reviewItem(key);
    if (item) out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}
