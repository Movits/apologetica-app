import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Notícias católicas para o card "Dia de hoje". Estratégia igual à liturgia:
// busca da rede com cache em AsyncStorage e fallback offline.
//
// Os feeds RSS oficiais (Vatican News, ACI Digital) bloqueiam fetch direto do
// navegador (CORS) e às vezes de clientes não-browser (403). Por isso buscamos
// via rss2json, que faz o fetch server-side e devolve JSON uniforme, funcionando
// tanto no app quanto na web. Cada feed é tentado isoladamente; se um falhar,
// os outros ainda aparecem.

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

const FEEDS = {
  pt: [
    { source: 'ACI Digital', url: 'https://www.acidigital.com/rss/rss.php' },
    { source: 'Vatican News', url: 'https://www.vaticannews.va/pt.rss.xml' },
  ],
  en: [
    { source: 'Vatican News', url: 'https://www.vaticannews.va/en.rss.xml' },
    { source: 'CNA', url: 'https://www.catholicnewsagency.com/rss/news.xml' },
  ],
};

const TTL_MS = 3 * 60 * 60 * 1000; // revalida a cada 3 horas
const MAX_ITEMS = 6;
const cacheKey = (lang) => `news:cache:v5:${lang}`; // v5: sem raspagem de página na web, miniatura de 168 px

async function fetchFeed(feed) {
  // Sem &count: o endpoint gratuito (sem api key) rejeita esse parâmetro (HTTP 422).
  // Ele já devolve ~10 itens; cortamos para MAX_ITEMS adiante.
  const url = `${RSS2JSON}${encodeURIComponent(feed.url)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const json = await res.json();
    if (json.status !== 'ok' || !Array.isArray(json.items)) return [];
    return json.items
      .map((it) => ({
        title: (it.title || '').trim(),
        link: it.link || it.guid || '',
        source: feed.source,
        pubDate: it.pubDate ? new Date(String(it.pubDate).replace(' ', 'T')).getTime() || 0 : 0,
        image: it.thumbnail || it.enclosure?.link || null,
      }))
      .filter((x) => x.title && x.link);
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

// Feeds da ACI/CNA não trazem imagem no RSS, mas as páginas dos artigos têm
// og:image. No nativo buscamos a página direto (sem CORS). Na web isso exigia
// raspar a página por serviços de terceiros (microlink, jina, allorigins,
// codetabs): até 4 pedidos por notícia, com espera de 12 s cada, recusas
// frequentes (HTTP 429) e o link de cada notícia enviado a esses serviços. Com
// as notícias na Início, isso pesava em toda abertura do app. Na web, então, a
// notícia sem imagem no feed aparece sem foto (o NewsCard já trata).
// Serve as imagens por um CDN/proxy (wsrv.nl): contorna CORS/hotlink de qualquer
// host, converte para jpg e redimensiona. A miniatura do NewsCard tem 56 px
// (tokens.thumb.sm): 168 px cobre telas 3x (antes vinha com 1000 px).
const WSRV = 'https://wsrv.nl/?url=';
const NEWS_THUMB_PX = 168;
function proxyImg(url) {
  if (!url || url.startsWith('https://wsrv.nl/')) return url || null;
  return `${WSRV}${encodeURIComponent(url)}&w=${NEWS_THUMB_PX}&h=${NEWS_THUMB_PX}&fit=cover&output=jpg&q=75`;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x2F;/g, '/');
}

function extractImage(html) {
  const h = html.slice(0, 200000); // og:image às vezes vem depois do head
  const m =
    h.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    h.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
    h.match(/<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i);
  return m ? decodeEntities(m[1]) : null;
}

async function fetchText(url, headers) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeoutId);
    return res.ok ? await res.text() : null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function resolveImage(articleUrl) {
  if (!articleUrl) return null;
  // Só no nativo (ver o comentário acima de extractImage).
  if (Platform.OS === 'web') return null;
  const html = await fetchText(articleUrl);
  return html ? extractImage(html) : null;
}

export async function getNews(lang = 'pt', { force = false } = {}) {
  const key = cacheKey(lang);

  // 1. Cache fresco?
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const p = JSON.parse(cached);
      if (!force && p.fetchedAt && Date.now() - p.fetchedAt < TTL_MS && p.items?.length) {
        return { items: p.items, source: 'cache', fetchedAt: p.fetchedAt };
      }
    }
  } catch {
    // ignora erro de cache
  }

  // 2. Busca todos os feeds do idioma (cada um isolado)
  const feeds = FEEDS[lang] || FEEDS.pt;
  const lists = await Promise.all(feeds.map(fetchFeed));
  let items = lists.flat();

  // dedupe por link, mais recentes primeiro
  const seen = new Set();
  items = items.filter((it) => (seen.has(it.link) ? false : (seen.add(it.link), true)));
  items.sort((a, b) => b.pubDate - a.pubDate);
  items = items.slice(0, MAX_ITEMS);

  // Completa a foto dos itens sem imagem buscando a og:image da página (em paralelo).
  await Promise.all(
    items.map(async (it) => {
      if (!it.image) it.image = await resolveImage(it.link);
    })
  );
  // Roteia toda imagem pelo CDN/proxy para exibir de forma uniforme e confiável.
  items.forEach((it) => { it.image = proxyImg(it.image); });

  if (items.length > 0) {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ fetchedAt: Date.now(), items })
    ).catch(() => {});
    return { items, source: 'network', fetchedAt: Date.now() };
  }

  // 3. Fallback: cache antigo (melhor que nada)
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const p = JSON.parse(cached);
      if (p.items?.length) return { items: p.items, source: 'stale', fetchedAt: p.fetchedAt };
    }
  } catch {
    // sem fallback
  }

  const e = new Error('NEWS_UNAVAILABLE');
  e.code = 'NEWS_UNAVAILABLE';
  throw e;
}
