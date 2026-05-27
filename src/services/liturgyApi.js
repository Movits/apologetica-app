import AsyncStorage from '@react-native-async-storage/async-storage';

// API community-mantida que faz scraping da CNBB:
// https://github.com/Dancrf/liturgia-diaria
const API_URL = 'https://liturgia.up.railway.app/v2/';
const CACHE_KEY = 'liturgy:cache';

// Retorna a liturgia do dia. Estratégia:
// 1. Se o cache existe e é de hoje, devolve cache (instantâneo, offline-friendly).
// 2. Senão, tenta buscar da API.
// 3. Se a API falhar e há cache (mesmo de outro dia), devolve o cache.
// 4. Se tudo falhar, lança erro.
export async function getLiturgy() {
  const todayKey = formatDateKey(new Date());

  // 1. Tenta cache primeiro
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.dateKey === todayKey && parsed.data) {
        return { ...parsed.data, source: 'cache', fetchedAt: parsed.fetchedAt };
      }
    }
  } catch {
    // ignora erro de cache, tenta rede
  }

  // 2. Busca da API com timeout para não travar offline indefinidamente
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // 3. Salva no cache
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ dateKey: todayKey, data, fetchedAt: Date.now() })
    ).catch(() => {});
    return { ...data, source: 'network', fetchedAt: Date.now() };
  } catch (err) {
    // 4. Fallback pra cache antigo (melhor que nada)
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data) {
          return { ...parsed.data, source: 'stale', fetchedAt: parsed.fetchedAt };
        }
      }
    } catch {
      // sem fallback
    }
    // Erro identificável pra UI mostrar mensagem clara de offline
    const e = new Error('OFFLINE_NO_CACHE');
    e.code = 'OFFLINE_NO_CACHE';
    throw e;
  }
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getLiturgicalColorHex(cor) {
  const map = {
    'branco': '#fafafa',
    'verde': '#3a7d4b',
    'vermelho': '#a02020',
    'roxo': '#5d3a85',
    'rosa': '#d88aaa',
    'preto': '#1a1a1a',
    'dourado': '#c9a84c',
  };
  if (!cor) return '#888';
  const k = cor.toLowerCase().trim();
  return map[k] || '#888';
}

// Curta explicação do significado de cada cor litúrgica na Missa.
export function getLiturgicalColorMeaning(cor) {
  const map = {
    'branco': 'Alegria e pureza. Usada no Tempo Pascal, Natal, festas de Cristo, da Virgem Maria e dos santos não mártires.',
    'vermelho': 'Sangue e fogo do Espírito. Usada no Domingo de Ramos, Sexta-feira Santa, Pentecostes e nas festas dos mártires.',
    'verde': 'Esperança e crescimento na fé. Usada no Tempo Comum, fora dos tempos fortes.',
    'roxo': 'Penitência e preparação. Usada no Advento, na Quaresma e nas missas pelos defuntos.',
    'rosa': 'Alegria contida no meio da penitência. Usada apenas no 3º domingo do Advento (Gaudete) e 4º da Quaresma (Laetare).',
    'preto': 'Luto. Pode ser usada nas missas pelos defuntos, embora hoje seja rara.',
    'dourado': 'Solenidade. Pode substituir branco, vermelho ou verde em festas de grande importância.',
  };
  if (!cor) return '';
  return map[cor.toLowerCase().trim()] || '';
}
