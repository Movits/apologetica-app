import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fuse from 'fuse.js';
import { articles } from '../data/articles';
import { references } from '../data/references';
import { DAILY_VERSES } from '../data/dailyVerses';
import { useTheme } from '../context/ThemeContext';

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

export default function SearchScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setBusy(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

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
  const styles = makeStyles(colors, fs);

  // Para sugestão "Você quis dizer", usa threshold mais frouxo
  // mas só sugere se a sugestão tiver score razoável.
  const suggestion = useMemo(() => {
    if (totalHits > 0 || debouncedQuery.trim().length < 3) return null;
    const looseArticle = new Fuse(articles, {
      keys: ['title', 'summary'],
      threshold: 0.55,
      includeScore: true,
    });
    const looseVerse = new Fuse(DAILY_VERSES, {
      keys: ['text', 'ref'],
      threshold: 0.55,
      includeScore: true,
    });
    const a = looseArticle.search(debouncedQuery.trim())[0];
    const v = looseVerse.search(debouncedQuery.trim())[0];
    // Pega a melhor sugestão (menor score = melhor)
    const candidates = [
      a && { type: 'article', label: a.item.title, item: a.item, score: a.score },
      v && { type: 'verse', label: v.item.ref, item: v.item, score: v.score },
    ].filter(Boolean);
    if (candidates.length === 0) return null;
    candidates.sort((x, y) => x.score - y.score);
    return candidates[0];
  }, [debouncedQuery, totalHits]);

  const openSuggestion = () => {
    if (!suggestion) return;
    if (suggestion.type === 'article') {
      navigation.navigate('Artigos', { openId: suggestion.item.id });
    } else if (suggestion.type === 'verse') {
      const v = suggestion.item;
      navigation.navigate('Bíblia', { bookId: v.bookId, chapter: v.chapter, highlightVerse: v.verse });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={colors.textSubtle} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="O que você procura?"
          placeholderTextColor={colors.textSubtle}
          autoFocus
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      {busy && query.length >= 3 && (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      )}

      {!busy && debouncedQuery.length >= 3 && totalHits === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>Nada encontrado</Text>
          {suggestion ? (
            <TouchableOpacity onPress={openSuggestion} style={styles.suggestionBtn}>
              <Text style={styles.emptySub}>Você quis dizer:</Text>
              <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
              <Text style={styles.suggestionHint}>Toque para abrir</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptySub}>Tente palavras diferentes ou trechos exatos.</Text>
          )}
        </View>
      )}

      <FlatList
        data={[
          ...(results.articles.length > 0 ? [{ type: 'header', label: 'Artigos' }] : []),
          ...results.articles.map((a) => ({ type: 'article', item: a })),
          ...(results.verses.length > 0 ? [{ type: 'header', label: 'Versículos' }] : []),
          ...results.verses.map((v) => ({ type: 'verse', item: v })),
          ...(results.references.length > 0 ? [{ type: 'header', label: 'Referências' }] : []),
          ...results.references.map((r) => ({ type: 'reference', item: r })),
        ]}
        keyExtractor={(item, i) => `${item.type}-${item.item?.id || item.item?.ref || item.label}-${i}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionHeader}>{item.label}</Text>;
          }
          if (item.type === 'article') {
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Artigos', { openId: item.item.id })}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="book-outline" size={20} color={colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCategory}>{item.item.category}</Text>
                  <Text style={styles.cardTitle}>{item.item.title}</Text>
                  <Text style={styles.cardSub} numberOfLines={2}>{item.item.summary}</Text>
                </View>
              </TouchableOpacity>
            );
          }
          if (item.type === 'verse') {
            const v = item.item;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('Bíblia', { bookId: v.bookId, chapter: v.chapter, highlightVerse: v.verse })}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="bookmark-outline" size={20} color={colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCategory}>{v.ref}</Text>
                  <Text style={styles.cardSub} numberOfLines={3}>"{v.text}"</Text>
                </View>
              </TouchableOpacity>
            );
          }
          if (item.type === 'reference') {
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('Referências', { highlightId: item.item.id })
                }
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="library-outline" size={20} color={colors.primaryText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCategory}>{item.item.source}</Text>
                  <Text style={styles.cardTitle}>{item.item.ref}</Text>
                  <Text style={styles.cardSub} numberOfLines={2}>{item.item.topic}</Text>
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    searchRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: c.card, margin: 16, paddingHorizontal: 14,
      borderRadius: 12,
      minHeight: 52,
    },
    input: {
      flex: 1,
      fontSize: fs(15),
      color: c.text,
      paddingVertical: 12,
      textAlignVertical: 'center',
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
