import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { getNews } from '../services/newsApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Rótulo de data curto e relativo (hoje / ontem / 4 de jun).
function relDate(ts, isEn) {
  if (!ts) return '';
  const now = new Date();
  const d = new Date(ts);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startThat) / 86400000);
  if (diffDays <= 0) return isEn ? 'today' : 'hoje';
  if (diffDays === 1) return isEn ? 'yesterday' : 'ontem';
  return d.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'short' });
}

const ASPECT = 16 / 9; // slide na proporção da imagem (mostra a foto quase inteira)

// Carrossel de notícias católicas no "Dia de hoje". Cada card tem foto (do feed
// ou da og:image do artigo) + título; passa sozinho a cada 3s e dá pra arrastar,
// usar as setas ou os pontos. Tocar abre a matéria no navegador.
export default function NewsCard() {
  const { colors, fs } = useTheme();
  const { t, isEn, lang } = useLanguage();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState({});

  const listRef = useRef(null);
  const idxRef = useRef(0);
  const pauseUntil = useRef(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    getNews(lang)
      .then((data) => mounted && setItems(data.items))
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [lang]);

  useEffect(() => { idxRef.current = index; }, [index]);

  // Auto-advance: roda sempre, mas pula enquanto estiver pausado (após interação).
  useEffect(() => {
    if (!items || items.length < 2 || !width) return;
    const id = setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      const next = (idxRef.current + 1) % items.length;
      idxRef.current = next;
      setIndex(next);
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    }, 3000);
    return () => clearInterval(id);
  }, [items, width]);

  const styles = makeStyles(colors, fs);
  const slideH = width > 0 ? Math.round(width / ASPECT) : 190;
  const open = (url) => { if (url) WebBrowser.openBrowserAsync(url).catch(() => {}); };

  const goTo = (i) => {
    if (!width || !items?.length) return;
    const n = ((i % items.length) + items.length) % items.length;
    idxRef.current = n;
    setIndex(n);
    listRef.current?.scrollToOffset({ offset: n * width, animated: true });
    pauseUntil.current = Date.now() + 6000; // pausa o auto após ação manual
  };

  const onMomentumEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1));
    idxRef.current = i;
    setIndex(i);
  };

  const renderItem = ({ item }) => {
    const hasImg = item.image && !failed[item.link];
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.slide, { width, height: slideH }]}
        onPress={() => open(item.link)}
      >
        {hasImg ? (
          <Image
            source={{ uri: item.image }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setFailed((f) => ({ ...f, [item.link]: true }))}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, hasImg ? styles.overlay : styles.noImgBg]} />
        {!hasImg && (
          <Ionicons name="newspaper-outline" size={44} color={colors.accent} style={styles.bgIcon} />
        )}
        <View style={styles.slideContent}>
          <Text style={styles.slideMeta}>
            {item.source}{item.pubDate ? ` · ${relDate(item.pubDate, isEn)}` : ''}
          </Text>
          <Text style={styles.slideTitle} numberOfLines={3}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const showControls = !loading && !error && items && items.length > 1;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons name="newspaper-outline" size={20} color={colors.primaryText} />
        </View>
        <Text style={styles.label}>{t('news.title')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} style={{ alignSelf: 'flex-start', marginTop: 8, marginLeft: 4 }} />
      ) : error || !items?.length ? (
        <Text style={styles.error}>{t('news.offline')}</Text>
      ) : (
        <>
          <View style={[styles.carousel, { height: slideH }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {width > 0 && (
              <FlatList
                ref={listRef}
                data={items}
                extraData={slideH}
                keyExtractor={(it, i) => `${it.link}-${i}`}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                onScrollBeginDrag={() => { pauseUntil.current = Date.now() + 6000; }}
                onMomentumScrollEnd={onMomentumEnd}
              />
            )}

            {showControls && (
              <>
                <TouchableOpacity style={[styles.arrow, styles.arrowLeft]} onPress={() => goTo(index - 1)} hitSlop={8}>
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.arrow, styles.arrowRight]} onPress={() => goTo(index + 1)} hitSlop={8}>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>

          {showControls && (
            <View style={styles.dots}>
              {items.map((it, i) => (
                <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={6}>
                  <View style={[styles.dot, i === index && styles.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card, borderRadius: 12, padding: 12, marginBottom: 10,
      borderLeftWidth: 4, borderLeftColor: c.accent,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    icon: {
      width: 38, height: 38, borderRadius: 9, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    label: { fontSize: fs(11), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    error: { fontSize: fs(12), color: c.textMuted, marginTop: 4, marginLeft: 4, fontStyle: 'italic' },

    carousel: { borderRadius: 10, overflow: 'hidden', backgroundColor: c.primary },
    slide: { justifyContent: 'flex-end' },
    overlay: { backgroundColor: 'rgba(13, 23, 34, 0.5)' },
    noImgBg: { backgroundColor: c.primary },
    bgIcon: { position: 'absolute', top: 18, right: 18, opacity: 0.5 },
    slideContent: { padding: 14 },
    slideMeta: { fontSize: fs(11), color: c.accent, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    slideTitle: { fontSize: fs(15), color: '#fff', fontWeight: 'bold', lineHeight: fs(20) },

    arrow: {
      position: 'absolute', top: '50%', marginTop: -16,
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    },
    arrowLeft: { left: 8 },
    arrowRight: { right: 8 },

    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.divider },
    dotActive: { backgroundColor: c.accent, width: 18 },
  });
