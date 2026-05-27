import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

const CATEGORIES = ['Todos', 'Existência de Deus', 'Igreja Católica', 'Sagrada Escritura', 'Moral', 'Outras Religiões', 'História da Igreja'];

function labelForCategory(cat, isEn, t) {
  if (cat === 'Todos') return isEn ? 'All' : 'Todos';
  return isEn ? t(`category.${cat}`) : cat;
}

export default function ArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [category, setCategory] = useState('Todos');
  const listRef = useRef(null);

  // Abre artigo específico via deep link (da busca global ou outra tela)
  useEffect(() => {
    const articleId = route?.params?.articleId || route?.params?.openId;
    if (articleId) {
      navigation.navigate('ArticleDetail', { articleId });
      navigation.setParams?.({ openId: undefined, articleId: undefined });
    }
  }, [route?.params?.openId, route?.params?.articleId]);

  // Reseta categoria ao tocar no tab de novo (o popToTop pro detalhe é automático)
  useEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setCategory('Todos');
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  const filtered = articles.filter((a) =>
    category === 'Todos' || a.category === category
  );

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item && styles.catChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{labelForCategory(item, isEn, t)}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.empty}>{isEn ? 'No articles found.' : 'Nenhum artigo encontrado.'}</Text>}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardCatBadge}>
                  <Text style={styles.cardCat}>{labelForCategory(item.category, isEn, t)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
              </View>
              <Text style={styles.cardTitle}>{isEn ? (item.titleEn || item.title) : item.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{isEn ? (item.summaryEn || item.summary) : item.summary}</Text>
            </TouchableOpacity>
          )}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    catList: { maxHeight: 60, paddingLeft: 16, paddingTop: 14, marginBottom: 4 },
    catChip: {
      borderWidth: 1,
      borderColor: c.divider,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: c.card,
    },
    catChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    catText: { fontSize: fs(13), color: c.textMuted },
    catTextActive: { color: '#fff', fontWeight: 'bold' },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardCatBadge: {
      backgroundColor: c.badgeBg,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
    },
    cardCat: { fontSize: fs(10), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    cardSummary: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18) },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
  });
