import { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DEBATE_STRATEGIES } from '../data/debateStrategies';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Ferramenta de treino para debates: táticas que ajudam e falácias a identificar/rebater.
export default function DebateStrategiesScreen() {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | tatica | falacia

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEBATE_STRATEGIES.filter((s) => {
      if (filter !== 'all' && s.section !== filter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.definition.toLowerCase().includes(q) ||
        s.nameEn?.toLowerCase().includes(q) ||
        s.definitionEn?.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  const chips = [
    { key: 'all', label: t('debate.all') },
    { key: 'tatica', label: t('debate.tactics') },
    { key: 'falacia', label: t('debate.fallacies') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t('debate.search')}
          placeholderTextColor={colors.textSubtle}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipsRow}>
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(c.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
          ListEmptyComponent={<Text style={styles.empty}>{isEn ? 'Nothing found.' : 'Nada encontrado.'}</Text>}
          renderItem={({ item }) => {
            const isOpen = expanded === item.id;
            const isFallacy = item.section === 'falacia';
            const badge = isFallacy
              ? (isEn ? 'Fallacy' : 'Falácia')
              : (isEn ? 'Tactic' : 'Tática');
            return (
              <TouchableOpacity
                style={[styles.card, isOpen && styles.cardOpen]}
                onPress={() => setExpanded(isOpen ? null : item.id)}
              >
                <View style={styles.headRow}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.badge, isFallacy ? styles.badgeFallacy : styles.badgeTactic]}>
                      <Text style={[styles.badgeText, isFallacy ? styles.badgeTextFallacy : styles.badgeTextTactic]}>
                        {badge}
                      </Text>
                    </View>
                    <Text style={styles.name}>{isEn ? (item.nameEn || item.name) : item.name}</Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSubtle} />
                </View>
                {isOpen && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.def}>{isEn ? (item.definitionEn || item.definition) : item.definition}</Text>
                    <Text style={styles.fieldLabel}>{t('debate.example')}</Text>
                    <Text style={styles.example}>{isEn ? (item.exampleEn || item.example) : item.example}</Text>
                    <Text style={styles.fieldLabel}>{isFallacy ? t('debate.respond') : t('debate.use')}</Text>
                    <Text style={styles.def}>{isEn ? (item.howToRespondEn || item.howToRespond) : item.howToRespond}</Text>
                  </View>
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
      backgroundColor: c.card, margin: 16, marginBottom: 8, paddingHorizontal: 14,
      borderRadius: 12, minHeight: 48,
    },
    input: { flex: 1, color: c.text, fontSize: fs(14), paddingVertical: 10 },
    chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
    chip: {
      paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
      backgroundColor: c.card, borderWidth: 1, borderColor: c.card,
    },
    chipActive: { backgroundColor: c.badgeBg, borderColor: c.accent },
    chipText: { fontSize: fs(13), color: c.textMuted, fontWeight: '600' },
    chipTextActive: { color: c.primaryText },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    cardOpen: { borderWidth: 1, borderColor: c.accent },
    headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { flex: 1, fontSize: fs(15), color: c.primaryText, fontWeight: 'bold' },
    badge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
    badgeTactic: { backgroundColor: c.badgeBg },
    badgeFallacy: { backgroundColor: c.badgeBg },
    badgeText: { fontSize: fs(10), fontWeight: 'bold' },
    badgeTextTactic: { color: c.accent },
    badgeTextFallacy: { color: c.primaryText },
    def: { fontSize: fs(13), color: c.text, lineHeight: fs(20) },
    fieldLabel: { fontSize: fs(11), color: c.textSubtle, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 12, marginBottom: 3, letterSpacing: 0.5 },
    example: { fontSize: fs(13), color: c.text, lineHeight: fs(20), fontStyle: 'italic' },
    empty: { textAlign: 'center', color: c.textSubtle, fontSize: fs(14), marginTop: 40 },
  });
