import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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

// Card de notícias católicas no "Dia de hoje". Busca via newsApi (rede + cache +
// fallback offline). Tocar numa manchete abre a matéria no navegador.
export default function NewsCard() {
  const { colors, fs } = useTheme();
  const { t, isEn, lang } = useLanguage();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const styles = makeStyles(colors, fs);
  const open = (url) => { if (url) WebBrowser.openBrowserAsync(url).catch(() => {}); };

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
        items.map((it, i) => (
          <TouchableOpacity
            key={`${it.link}-${i}`}
            style={[styles.item, i > 0 && styles.itemBorder]}
            onPress={() => open(it.link)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>{it.title}</Text>
              <Text style={styles.itemMeta}>
                {it.source}{it.pubDate ? ` · ${relDate(it.pubDate, isEn)}` : ''}
              </Text>
            </View>
            <Ionicons name="open-outline" size={15} color={colors.textSubtle} style={{ marginLeft: 8, marginTop: 2 }} />
          </TouchableOpacity>
        ))
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
    head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
    icon: {
      width: 38, height: 38, borderRadius: 9, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    label: { fontSize: fs(11), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    item: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9 },
    itemBorder: { borderTopWidth: 1, borderTopColor: c.divider },
    itemTitle: { fontSize: fs(13), color: c.text, fontWeight: '600', lineHeight: fs(18) },
    itemMeta: { fontSize: fs(11), color: c.textMuted, marginTop: 3 },
    error: { fontSize: fs(12), color: c.textMuted, marginTop: 4, marginLeft: 4, fontStyle: 'italic' },
  });
