import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { references } from '../data/references';
import { useTheme } from '../context/ThemeContext';

const SOURCES = ['Todos', 'Bíblia', 'Catecismo', 'Documentos', 'Teólogos'];

export default function ReferencesScreen({ route }) {
  const { colors, fs } = useTheme();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('Todos');
  const [expanded, setExpanded] = useState(null);
  const listRef = useRef(null);

  // Deep link: vindo de um artigo, abrir e expandir a referência específica.
  useEffect(() => {
    if (route?.params?.highlightId) {
      const id = route.params.highlightId;
      setSearch('');
      setSource('Todos');
      setExpanded(id);
      setTimeout(() => {
        const idx = references.findIndex((r) => r.id === id);
        if (idx >= 0 && listRef.current) {
          listRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.1 });
        }
      }, 300);
    }
  }, [route?.params?.highlightId]);

  const filtered = references.filter((r) => {
    const matchSearch =
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase()) ||
      r.topic.toLowerCase().includes(search.toLowerCase()) ||
      r.fullSource.toLowerCase().includes(search.toLowerCase());
    const matchSource = source === 'Todos' || r.source === source;
    return matchSearch && matchSource;
  });

  const openUrl = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  const styles = makeStyles(colors, fs);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar versículo, tema, fonte..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textSubtle}
        />
      </View>

      <FlatList
        horizontal
        data={SOURCES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.sourceList}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, source === item && styles.chipActive]}
            onPress={() => setSource(item)}
          >
            <Text style={[styles.chipText, source === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma referência encontrada.</Text>}
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <View style={[styles.card, isOpen && styles.cardOpen]}>
              <TouchableOpacity onPress={() => setExpanded(isOpen ? null : item.id)}>
                <View style={styles.cardTop}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.source}</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textSubtle}
                  />
                </View>
                <Text style={styles.cardRef}>{item.ref}</Text>
                <Text style={styles.cardFullSource}>{item.fullSource}</Text>
                {(item.author || item.year) && (
                  <Text style={styles.cardMeta}>
                    {item.author}{item.author && item.year ? ' · ' : ''}{item.year}
                  </Text>
                )}
                <Text style={styles.cardTopic}>{item.topic}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.expanded}>
                  <Text style={styles.cardText}>{item.text}</Text>
                  <View style={styles.actions}>
                    {item.url && (
                      <TouchableOpacity style={styles.actionBtn} onPress={() => openUrl(item.url)}>
                        <Ionicons name="open-outline" size={16} color={colors.accent} />
                        <Text style={styles.actionText}>Abrir fonte oficial</Text>
                      </TouchableOpacity>
                    )}
                    {item.urlStrongs && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openUrl(item.urlStrongs)}
                      >
                        <Ionicons name="library-outline" size={16} color={colors.accent} />
                        <Text style={styles.actionText}>Língua original (Bible Hub)</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      marginBottom: 8,
      backgroundColor: c.card,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 42, fontSize: fs(15), color: c.text },
    sourceList: { maxHeight: 44, paddingLeft: 16, marginBottom: 4 },
    chip: {
      borderWidth: 1,
      borderColor: c.divider,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { fontSize: fs(13), color: c.textMuted },
    chipTextActive: { color: '#fff', fontWeight: 'bold' },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    cardOpen: { borderWidth: 1, borderColor: c.accent },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    badge: { backgroundColor: c.badgeBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { fontSize: fs(11), color: c.primary, fontWeight: 'bold' },
    cardRef: { fontSize: fs(15), fontWeight: 'bold', color: c.primary },
    cardFullSource: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
    cardMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2, fontStyle: 'italic' },
    cardTopic: { fontSize: fs(12), color: c.textSubtle, marginTop: 4 },
    expanded: { marginTop: 10, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 10 },
    cardText: { fontSize: fs(15), color: c.text, lineHeight: fs(24) },
    actions: { marginTop: 12, gap: 8 },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
      alignSelf: 'flex-start',
    },
    actionText: { color: c.accent, fontSize: fs(13), fontWeight: '600' },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
  });
