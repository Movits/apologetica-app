import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { articles } from '../data/articles';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFavorites } from '../utils/favorites';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function FavoritesScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const ids = await getFavorites();
        if (!active) return;
        const ordered = ids
          .map((id) => articles.find((a) => a.id === id))
          .filter(Boolean);
        setItems(ordered);
        setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>{t('common.loading')}</Text></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="star-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>{t('empty.favorites')}</Text>
        <Text style={styles.muted}>
          {isEn
            ? 'Tap the star at the top of an article to save it here.'
            : 'Toque na estrela no topo de um artigo para salvá-lo aqui.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ArticleFromSearch', { articleId: item.id })}
          >
            <Ionicons name="star" size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardCat}>{isEn ? t(`category.${item.category}`) : item.category}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{isEn ? (item.titleEn || item.title) : item.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{isEn ? (item.summaryEn || item.summary) : item.summary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      />
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10, backgroundColor: c.bg },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(20) },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8,
    },
    cardCat: { fontSize: fs(10), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    cardTitle: { fontSize: fs(14), color: c.primaryText, fontWeight: '600', marginBottom: 2 },
    cardSummary: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(17) },
  });
