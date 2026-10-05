import AsyncStorage from '@react-native-async-storage/async-storage';

// Último artigo aberto, local (AsyncStorage): alimenta o "Continuar lendo" da
// Início. Guarda { articleId, at, progress? }, com `progress` de 0 a 1 sendo
// a fração máxima já rolada do artigo (gravada pela tela do artigo).
const KEY = 'lastRead:article';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

// `progress` é opcional: sem ele (abertura do artigo), o valor já salvo para o
// MESMO artigo é preservado; para outro artigo o campo some, porque o
// progresso é daquele artigo e não deste.
export async function setLastRead(articleId, progress) {
  try {
    let value = typeof progress === 'number' && Number.isFinite(progress) ? clamp01(progress) : undefined;
    if (value === undefined) {
      const prev = await getLastRead();
      if (prev && prev.articleId === articleId && typeof prev.progress === 'number') value = prev.progress;
    }
    const data = { articleId, at: Date.now() };
    if (value !== undefined) data.progress = value;
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export async function getLastRead() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
