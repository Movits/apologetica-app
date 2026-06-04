import { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { glossary, glossaryByTerm } from '../data/glossary';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function GlossaryScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');

  // Quando aberto via link [[termo]] de um artigo, expande automaticamente.
  useEffect(() => {
    const term = route?.params?.highlightTerm;
    if (term) {
      const entry = glossaryByTerm(term);
      if (entry) setExpanded(entry.id);
    }
  }, [route?.params?.highlightTerm]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glossary;
    return glossary.filter(
      (g) =>
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q) ||
        g.termEn?.toLowerCase().includes(q) ||
        g.definitionEn?.toLowerCase().includes(q)
    );
  }, [query]);

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const [focused, setFocused] = useState(false);
  const styles = makeStyles(colors, fs);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.searchRow, focused && styles.searchRowFocused]}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isEn ? 'Search term...' : 'Buscar termo...'}
          placeholderTextColor={colors.textSubtle}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
          ListEmptyComponent={<Text style={styles.empty}>{isEn ? 'No term found.' : 'Nenhum termo encontrado.'}</Text>}
          renderItem={({ item }) => {
            const isOpen = expanded === item.id;
            return (
              <TouchableOpacity
                style={[styles.card, isOpen && styles.cardOpen]}
                onPress={() => setExpanded(isOpen ? null : item.id)}
              >
                <View style={styles.headRow}>
                  <Text style={styles.term}>{isEn ? (item.termEn || item.term) : item.term}</Text>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSubtle} />
                </View>
                {isOpen && (
                  <Text style={styles.def}>{isEn ? (item.definitionEn || item.definition) : item.definition}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    searchRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: c.card, margin: 16, paddingHorizontal: 14,
      borderRadius: 12, minHeight: 48,
      borderWidth: 1.5, borderColor: 'transparent',
    },
    searchRowFocused: { borderColor: c.accent },
    input: { flex: 1, color: c.text, fontSize: fs(14), paddingVertical: 10, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null) },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    cardOpen: { borderWidth: 1, borderColor: c.accent },
    headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    term: { fontSize: fs(15), color: c.primaryText, fontWeight: 'bold' },
    def: { marginTop: 8, fontSize: fs(13), color: c.text, lineHeight: fs(20) },
    empty: { textAlign: 'center', color: c.textSubtle, fontSize: fs(14), marginTop: 40 },
  });
