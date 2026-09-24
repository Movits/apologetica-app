import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getNews } from '../services/newsApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { EmptyState, Group, PressScale } from './ui';
import Skeleton from './Skeleton';

// Rótulo de data curto e relativo (hoje / ontem / 4 de jun).
function relDate(ts, t, isEn) {
  if (!ts) return '';
  const now = new Date();
  const d = new Date(ts);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startThat) / 86400000);
  if (diffDays <= 0) return t('common.today');
  if (diffDays === 1) return t('common.yesterday');
  return d.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'short' });
}

// Lado da miniatura de cada notícia.
const THUMB = 56;

// Linhas de placeholder enquanto o feed carrega (mesma forma das notícias).
const PLACEHOLDER_ROWS = 3;

// Uma notícia: miniatura (do feed ou da og:image da matéria), título em
// headline, fonte e data em footnote. Toque abre a matéria no navegador.
function NewsRow({ item, onPress }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon } = tokens;
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(item.image) && !failed;
  const meta = [item.source, item.pubDate ? relDate(item.pubDate, t, isEn) : null].filter(Boolean).join(' · ');

  return (
    <PressScale
      role="link"
      aria-label={`${item.title}, ${meta}`}
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 44 },
        pressed ? { backgroundColor: colors.separator } : null,
      ]}
    >
      <View
        aria-hidden
        style={{
          width: THUMB,
          height: THUMB,
          borderRadius: radius.sm,
          overflow: 'hidden',
          backgroundColor: colors.separator,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasImage ? (
          <Image
            source={{ uri: item.image }}
            accessible={false}
            resizeMode="cover"
            style={{ width: THUMB, height: THUMB }}
            onError={() => setFailed(true)}
          />
        ) : (
          <Ionicons name="newspaper-outline" size={icon.md} color={colors.textTertiary} />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]} numberOfLines={3}>{item.title}</Text>
        {meta ? <Text style={[text('footnote'), { color: colors.textSubtle }]} numberOfLines={1}>{meta}</Text> : null}
      </View>
      <Ionicons name="open-outline" size={icon.sm} color={colors.textTertiary} />
    </PressScale>
  );
}

function PlaceholderRow() {
  const { tokens, text } = useTheme();
  const { space } = tokens;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm }}>
      <Skeleton width={THUMB} height={THUMB} radius="sm" />
      <View style={{ flex: 1, gap: space.xs }}>
        <Skeleton width="90%" height={text('headline').lineHeight} />
        <Skeleton width="55%" />
      </View>
    </View>
  );
}

// Notícias católicas no Conteúdo do dia: um Group com uma linha por matéria
// (newsApi devolve até 6, com cache de 3h por idioma). Carregando: linhas com
// a forma do card, sem spinner. Sem rede: estado vazio com "Tentar de novo",
// que força uma nova busca ignorando o cache.
export default function NewsCard({ style }) {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    getNews(lang, { force: attempt > 0 })
      .then((data) => {
        if (!alive) return;
        const list = data?.items || [];
        setItems(list);
        setStatus(list.length ? 'ok' : 'error');
      })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [lang, attempt]);

  const open = (url) => { if (url) WebBrowser.openBrowserAsync(url).catch(() => {}); };
  const retry = () => setAttempt((n) => n + 1);

  if (status === 'loading') {
    return (
      <Group header={t('news.title')} style={style}>
        <View aria-busy aria-label={t('common.loading')}>
          {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => <PlaceholderRow key={i} />)}
        </View>
      </Group>
    );
  }

  if (status === 'error') {
    return (
      <Group header={t('news.title')} style={style}>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('news.offline')}
          action={{ label: t('common.tryAgain'), onPress: retry }}
        />
      </Group>
    );
  }

  return (
    <Group header={t('news.title')} style={style}>
      {items.map((item, i) => (
        <NewsRow key={`${item.link}-${i}`} item={item} onPress={() => open(item.link)} />
      ))}
    </Group>
  );
}
