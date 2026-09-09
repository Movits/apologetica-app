import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIBLE_BOOKS } from '../data/bible';

// Progresso de leitura da Bíblia, local (AsyncStorage) e independente de conta,
// para funcionar também no modo visitante. Duas coisas separadas:
//
//   bible:position  -> onde o usuário parou (um único ponto, o "continue lendo")
//   bible:read      -> quais capítulos já foram lidos até o fim, por livro
//
// Marcações e notas continuam no Firestore (userData.js). Aqui é só progresso,
// que é barato, muda a cada scroll e não vale uma escrita de rede.

const KEY_POSITION = 'bible:position';
const KEY_READ = 'bible:read';

// Quantos capítulos cada livro tem, para validar o que vem do disco.
const CAPS_POR_LIVRO = Object.fromEntries(
  BIBLE_BOOKS.map((b) => [b.id, b.totalChapters || 0])
);

// O storage é dado não confiável: sobra de versão antiga, livro que mudou de
// id, capítulo fora de faixa, duplicata, forma corrompida. Tudo isso entrava
// direto na contagem e inflava o "X de 1334 capítulos lidos".
function sanearMapaLido(bruto) {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return {};
  const limpo = {};
  for (const [bookId, lista] of Object.entries(bruto)) {
    const max = CAPS_POR_LIVRO[bookId];
    if (!max || !Array.isArray(lista)) continue;
    const caps = [...new Set(lista.filter((c) => Number.isInteger(c) && c >= 1 && c <= max))]
      .sort((a, b) => a - b);
    if (caps.length) limpo[bookId] = caps;
  }
  return limpo;
}

// Fração do capítulo que conta como "lido". Não exigimos 100% porque o último
// versículo raramente encosta no fim exato da viewport.
export const READ_THRESHOLD = 0.9;

// ===== Onde parou =====

// ratio: 0..1, quanto do capítulo já foi rolado (para restaurar o scroll).
// `lang` entra junto porque o ratio é uma fração do texto RENDERIZADO: o mesmo
// capítulo em português e em inglês tem alturas diferentes, e restaurar 45% de
// um no outro cai no versículo errado.
export async function saveBiblePosition({ bookId, chapter, ratio = 0, lang = null }) {
  if (!bookId || !chapter) return;
  try {
    await AsyncStorage.setItem(
      KEY_POSITION,
      JSON.stringify({ bookId, chapter, ratio, lang, at: Date.now() })
    );
  } catch {}
}

export async function getBiblePosition() {
  try {
    const raw = await AsyncStorage.getItem(KEY_POSITION);
    if (!raw) return null;
    const pos = JSON.parse(raw);
    // Ignora posição de um livro que não existe mais (dado renomeado, etc.).
    if (!pos?.bookId || !BIBLE_BOOKS.some((b) => b.id === pos.bookId)) return null;
    return pos;
  } catch {
    return null;
  }
}

export async function clearBiblePosition() {
  try { await AsyncStorage.removeItem(KEY_POSITION); } catch {}
}

// ===== Capítulos lidos =====

// Formato em disco: { [bookId]: [1, 2, 5] }. Array em vez de Set porque JSON.
async function getReadMap() {
  try {
    const raw = await AsyncStorage.getItem(KEY_READ);
    return sanearMapaLido(raw ? JSON.parse(raw) : {});
  } catch {
    return {};
  }
}

export async function getReadChapters(bookId) {
  const map = await getReadMap();
  return new Set(map[bookId] || []);
}

// Idempotente: marcar duas vezes o mesmo capítulo não duplica nem reescreve.
export async function markChapterRead(bookId, chapter) {
  if (!bookId || !chapter) return null;
  const map = await getReadMap();
  const list = map[bookId] || [];
  if (list.includes(chapter)) return new Set(list);
  const next = [...list, chapter].sort((a, b) => a - b);
  map[bookId] = next;
  try { await AsyncStorage.setItem(KEY_READ, JSON.stringify(map)); } catch {}
  return new Set(next);
}

export async function unmarkChapterRead(bookId, chapter) {
  const map = await getReadMap();
  const list = map[bookId] || [];
  if (!list.includes(chapter)) return new Set(list);
  const next = list.filter((c) => c !== chapter);
  map[bookId] = next;
  try { await AsyncStorage.setItem(KEY_READ, JSON.stringify(map)); } catch {}
  return new Set(next);
}

// Total de capítulos do cânon, somado do próprio metadado dos livros.
export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((n, b) => n + (b.totalChapters || 0), 0);

// Progresso global: { chaptersRead, total, ratio }.
export async function getBibleStats() {
  const map = await getReadMap();
  const chaptersRead = Object.values(map).reduce((n, list) => n + (list?.length || 0), 0);
  return {
    chaptersRead,
    total: TOTAL_CHAPTERS,
    ratio: TOTAL_CHAPTERS ? chaptersRead / TOTAL_CHAPTERS : 0,
  };
}

export async function resetBibleProgress() {
  try {
    await AsyncStorage.multiRemove([KEY_POSITION, KEY_READ]);
  } catch {}
}
