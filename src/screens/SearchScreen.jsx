import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Fuse from 'fuse.js';
import { articles } from '../data/articles';
import { references } from '../data/references';
import { useTheme } from '../context/ThemeContext';

// Cria os índices uma vez (fora do componente) pra não recriar a cada render.
const articleIndex = new Fuse(articles, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'summary', weight: 2 },
    { name: 'body', weight: 1 },
    { name: 'category', weight: 1.5 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

const referenceIndex = new Fuse(references, {
  keys: [
    { name: 'ref', weight: 3 },
    { name: 'topic', weight: 2 },
    { name: 'text', weight: 1 },
    { name: 'fullSource', weight: 1.5 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export default function SearchScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [busy, setBusy] = useState(false);

  // Debounce de 200ms para não rodar busca a cada tecla
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
    if (q.length < 2) return { articles: [], references: [] };
    const aHits = articleIndex.search(q).slice(0, 10);
    const rHits = referenceIndex.search(q).slice(0, 15);
    return {
      articles: aHits.map((h) => ({ ...h.item, score: h.score })),
      references: rHits.map((h) => ({ ...h.item, score: h.score })),
    };
  }, [debouncedQuery]);

  const totalHits = results.articles.length + results.references.length;
  const styles = makeStyles(colors, fs);

  // Sugestão de "você quis dizer" — se zero resultados mas algum match parcial existe
  const suggestion = useMemo(() => {
    if (totalHits > 0 || debouncedQuery.trim().length < 3) return null;
    // Tenta com threshold mais frouxo
    const loose = new Fuse(
      [...articles.map((a) => ({ type: 'a', item: a, text: a.title })),
       ...references.map((r) => ({ type: 'r', item: r, text: r.ref + ' ' + r.topic }))],
      { keys: ['text'], threshold: 0.6, ignoreLocation: true }
    );
    const top = loose.search(debouncedQuery.trim())[0];
    return top ? top.item.text : null;
  }, [debouncedQuery, totalHits]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={colors.textSubtle} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar em artigos e referências..."
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

      {busy && query.length >= 2 && (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
      )}

      {!busy && debouncedQuery.length >= 2 && totalHits === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>Nada encontrado</Text>
          {suggestion ? (
            <Text style={styles.emptySub}>
              Você quis dizer{' '}
              <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
                {suggestion}
              </Text>
              ?
            </Text>
          ) : (
            <Text style={styles.emptySub}>Tenta uma palavra diferente.</Text>
          )}
        </View>
      )}

      <FlatList
        data={[
          ...(results.articles.length > 0 ? [{ type: 'header', label: 'Artigos' }] : []),
          ...results.articles.map((a) => ({ type: 'article', item: a })),
          ...(results.references.length > 0 ? [{ type: 'header', label: 'Referências' }] : []),
          ...results.references.map((r) => ({ type: 'reference', item: r })),
        ]}
        keyExtractor={(item, i) => `${item.type}-${item.item?.id || item.label}-${i}`}
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
      backgroundColor: c.card, margin: 16, paddingHorizontal: 14, paddingVertical: 4,
      borderRadius: 12,
    },
    input: { flex: 1, height: 44, fontSize: fs(15), color: c.text },
    empty: { alignItems: 'center', padding: 40, gap: 10 },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    emptySub: { fontSize: fs(13), color: c.textMuted, textAlign: 'center' },
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
