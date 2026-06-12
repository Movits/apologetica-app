import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fuse from 'fuse.js';
import { articles } from '../data/articles';
import { references } from '../data/references';
import { DAILY_VERSES } from '../data/dailyVerses';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from '../utils/searchHistory';

// Threshold mais estrito (0.35) pra evitar matches absurdos.
// Fuse.js: 0.0 = match exato, 1.0 = qualquer coisa.

const articleIndex = new Fuse(articles, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'summary', weight: 2 },
    { name: 'body', weight: 1.5 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

const referenceIndex = new Fuse(references, {
  keys: [
    { name: 'ref', weight: 3 },
    { name: 'topic', weight: 2 },
    { name: 'text', weight: 2 },
    { name: 'fullSource', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

// Versículos populares (mesmos do "Versículo do dia") - inclui Jo 3,16 e clássicos
const verseIndex = new Fuse(DAILY_VERSES, {
  keys: [
    { name: 'text', weight: 3 },
    { name: 'ref', weight: 2 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

// Índices "Você quis dizer" criados uma única vez no escopo do módulo
// (antes eram recriados a cada keystroke).
const looseArticleIndex = new Fuse(articles, {
  keys: ['title', 'summary'],
  threshold: 0.55,
  includeScore: true,
});
const looseVerseIndex = new Fuse(DAILY_VERSES, {
  keys: ['text', 'ref'],
  threshold: 0.55,
  includeScore: true,
});

export default function SearchScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [focused, setFocused] = useState(false);

  // Memoiza styles pra que ref não mude por render
  const styles = useMemo(() => makeStyles(colors, fs), [colors, fs]);

  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setBusy(false);
      if (query.trim().length >= 3) {
        addSearchHistory(query).then(() => getSearchHistory().then(setHistory));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const clearHistory = useCallback(async () => {
    await clearSearchHistory();
    setHistory([]);
  }, []);

  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (q.length < 3) return { articles: [], references: [], verses: [] };
    return {
      articles: articleIndex.search(q).slice(0, 8).map((h) => h.item),
      references: referenceIndex.search(q).slice(0, 10).map((h) => h.item),
      verses: verseIndex.search(q).slice(0, 8).map((h) => h.item),
    };
  }, [debouncedQuery]);

  const totalHits = results.articles.length + results.references.length + results.verses.length;
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  // Para sugestão "Você quis dizer", usa threshold mais frouxo.
  const suggestion = useMemo(() => {
    if (totalHits > 0 || debouncedQuery.trim().length < 3) return null;
    const q = debouncedQuery.trim();
    const a = looseArticleIndex.search(q)[0];
    const v = looseVerseIndex.search(q)[0];
    const candidates = [
      a && { type: 'article', label: a.item.title, item: a.item, score: a.score },
      v && { type: 'verse', label: v.item.ref, item: v.item, score: v.score },
    ].filter(Boolean);
    if (candidates.length === 0) return null;
    candidates.sort((x, y) => x.score - y.score);
    return candidates[0];
  }, [debouncedQuery, totalHits]);

  const openSuggestion = useCallback(() => {
    if (!suggestion) return;
    if (suggestion.type === 'article') {
      navigation.navigate('ArticleFromSearch', { articleId: suggestion.item.id });
    } else if (suggestion.type === 'verse') {
      const v = suggestion.item;
      navigation.navigate('Bíblia', { bookId: v.bookId, chapter: v.chapter, highlightVerse: v.verse });
    }
  }, [suggestion, navigation]);

  // Memoiza a lista achatada de resultados pra que a ref não mude
  // a cada keystroke / scroll. Sem isso o FlatList re-renderiza todos os itens.
  const flatData = useMemo(() => [
    ...(results.articles.length > 0 ? [{ type: 'header', label: isEn ? 'Articles' : 'Artigos' }] : []),
    ...results.articles.map((a) => ({ type: 'article', item: a })),
    ...(results.verses.length > 0 ? [{ type: 'header', label: isEn ? 'Verses' : 'Versículos' }] : []),
    ...results.verses.map((v) => ({ type: 'verse', item: v })),
    ...(results.references.length > 0 ? [{ type: 'header', label: isEn ? 'References' : 'Referências' }] : []),
    ...results.references.map((r) => ({ type: 'reference', item: r })),
  ], [results, isEn]);

  const openArticle = useCallback(
    (id) => navigation.navigate('ArticleFromSearch', { articleId: id }),
    [navigation]
  );
  const openVerse = useCallback(
    (v) => navigation.navigate('Bíblia', { bookId: v.bookId, chapter: v.chapter, highlightVerse: v.verse }),
    [navigation]
  );
  const openReference = useCallback(
    (id) => navigation.navigate('RefDetail', { highlightId: id }),
    [navigation]
  );

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.label}</Text>;
    }
    if (item.type === 'article') {
      const a = item.item;
      return (
        <TouchableOpacity style={styles.card} onPress={() => openArticle(a.id)}>
          <View style={styles.cardIcon}>
            <Ionicons name="book-outline" size={20} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>{isEn ? t(`category.${a.category}`) : a.category}</Text>
            <Text style={styles.cardTitle}>{isEn ? (a.titleEn || a.title) : a.title}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>{isEn ? (a.summaryEn || a.summary) : a.summary}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (item.type === 'verse') {
      const v = item.item;
      const refTxt = isEn ? (v.refEn || v.ref) : v.ref;
      const txt = isEn ? (v.textEn || v.text) : v.text;
      return (
        <TouchableOpacity style={styles.card} onPress={() => openVerse(v)}>
          <View style={styles.cardIcon}>
            <Ionicons name="bookmark-outline" size={20} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>{refTxt}</Text>
            <Text style={styles.cardSub} numberOfLines={3}>"{txt}"</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (item.type === 'reference') {
      const r = item.item;
      const srcMap = { 'Bíblia': 'Bible', 'Catecismo': 'Catechism', 'Documentos': 'Documents', 'Teólogos': 'Theologians', 'Outros': 'Others' };
      const src = isEn ? (srcMap[r.source] || r.source) : r.source;
      return (
        <TouchableOpacity style={styles.card} onPress={() => openReference(r.id)}>
          <View style={styles.cardIcon}>
            <Ionicons name="library-outline" size={20} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardCategory}>{src}</Text>
            <Text style={styles.cardTitle}>{r.ref}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>{r.topic}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  }, [styles, colors.primaryText, openArticle, openVerse, openReference, isEn, t]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchRow, focused && styles.searchRowFocused]}>
        <Ionicons name="search-outline" size={20} color={colors.textSubtle} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isEn ? 'What are you looking for?' : 'O que você procura?'}
          placeholderTextColor={colors.textSubtle}
          autoFocus
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel={isEn ? 'Clear search' : 'Limpar busca'}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      {busy && query.length >= 3 && (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      )}

      {query.length < 3 && history.length > 0 && (
        <View style={styles.histBox}>
          <View style={styles.histHead}>
            <Text style={styles.histLabel}>{t('search.recent')}</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.histClear}>{t('search.clear')}</Text>
            </TouchableOpacity>
          </View>
          {history.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.histRow}
              onPress={() => setQuery(q)}
            >
              <Ionicons name="time-outline" size={16} color={colors.textSubtle} />
              <Text style={styles.histText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!busy && debouncedQuery.length >= 3 && totalHits === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>{t('search.empty')}</Text>
          {suggestion ? (
            <TouchableOpacity onPress={openSuggestion} style={styles.suggestionBtn}>
              <Text style={styles.emptySub}>{isEn ? 'Did you mean:' : 'Você quis dizer:'}</Text>
              <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
              <Text style={styles.suggestionHint}>{t('search.tapToOpen')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptySub}>
              {isEn ? 'Try different words or exact phrases.' : 'Tente palavras diferentes ou trechos exatos.'}
            </Text>
          )}
        </View>
      )}

      <View style={{ flex: 1 }}>
        <FlatList
          data={flatData}
          keyExtractor={(item, i) => `${item.type}-${item.item?.id ?? item.item?.ref ?? item.label ?? i}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={6}
          windowSize={8}
          removeClippedSubviews
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    histBox: { paddingHorizontal: 16, paddingTop: 12 },
    histHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    histLabel: { fontSize: fs(11), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
    histClear: { fontSize: fs(11), color: c.accent, fontWeight: '600' },
    histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.divider },
    histText: { fontSize: fs(14), color: c.text, flex: 1 },
    container: { flex: 1, backgroundColor: c.bg },
    searchRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: c.card, margin: 16, paddingHorizontal: 14,
      borderRadius: 12,
      minHeight: 52,
      borderWidth: 1.5, borderColor: 'transparent',
    },
    searchRowFocused: { borderColor: c.accent },
    input: {
      flex: 1,
      fontSize: fs(15),
      color: c.text,
      paddingVertical: 12,
      textAlignVertical: 'center',
      // remove o outline preto padrão do navegador (web); a borda fica na caixa
      ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null),
    },
    empty: { alignItems: 'center', padding: 40, gap: 10 },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    emptySub: { fontSize: fs(13), color: c.textMuted, textAlign: 'center' },
    suggestionBtn: {
      backgroundColor: c.card,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.accent,
      marginTop: 12,
      alignItems: 'center',
      width: '100%',
    },
    suggestionLabel: { fontSize: fs(15), color: c.primaryText, fontWeight: 'bold', marginTop: 6 },
    suggestionHint: { fontSize: fs(11), color: c.accent, marginTop: 4 },
    sectionHeader: {
      fontSize: fs(12), fontWeight: 'bold', color: c.textSubtle,
      textTransform: 'uppercase', letterSpacing: 1,
      marginTop: 8, marginBottom: 8,
    },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8,
    },
    cardIcon: {
      width: 40, height: 40, borderRadius: 10, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    cardCategory: {
      fontSize: fs(10), color: c.accent, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2,
    },
    cardTitle: { fontSize: fs(15), color: c.text, fontWeight: '600', marginBottom: 2 },
    cardSub: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(17) },
  });
