import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { glossary, glossaryByTerm } from '../data/glossary';
import { pick } from '../utils/i18nData';
import { EmptyState, PressScale, SearchField } from '../components/ui';

// Posição do termo na tela ao rolar até ele (fração da altura visível).
const SCROLL_VIEW_POSITION = 0.12;

// Glossário apologético: busca no topo e a lista como uma única lista
// agrupada (a FlatList é o card, para manter a virtualização e o
// scrollToIndex do link [[termo]] vindo do artigo). Cada termo mostra duas
// linhas da definição e expande ao toque.
export default function GlossaryScreen({ route }) {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space, radius } = tokens;
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const listRef = useRef(null);

  // Quando aberto via link de um artigo, expande E rola até o termo.
  useEffect(() => {
    const term = route?.params?.highlightTerm;
    if (!term) return;
    const entry = glossaryByTerm(term);
    if (!entry) return;
    setExpanded(entry.id);
    setQuery('');
    const index = glossary.findIndex((g) => g.id === entry.id);
    if (index < 0) return;
    const id = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, viewPosition: SCROLL_VIEW_POSITION, animated: false });
    }, 150);
    return () => clearTimeout(id);
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

  const empty = filtered.length === 0;
  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.xs }}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('glossary.search')}
          clearLabel={t('common.clear')}
          autoCorrect={false}
        />
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(g) => g.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { margin: space.md, marginTop: space.xs },
          empty ? null : { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' },
        ]}
        ItemSeparatorComponent={() => <View style={separator} />}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, viewPosition: SCROLL_VIEW_POSITION, animated: false }), 80);
        }}
        ListEmptyComponent={<EmptyState icon="search-outline" title={t('glossary.empty')} message={t('glossary.emptyHint')} />}
        renderItem={({ item }) => (
          <TermRow
            item={item}
            open={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
          />
        )}
      />
    </View>
  );
}

// Linha de termo: headline com o termo, definição em subhead (duas linhas
// fechada, inteira aberta) e chevron. `aria-expanded` acompanha o estado.
function TermRow({ item, open, onToggle }) {
  const { colors, tokens, text } = useTheme();
  const { isEn } = useLanguage();
  const { space, icon } = tokens;

  return (
    <PressScale
      role="button"
      aria-expanded={open}
      onPress={onToggle}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          gap: space.sm,
        },
        pressed ? { backgroundColor: colors.separator } : null,
      ]}
    >
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]}>{pick(item, 'term', isEn)}</Text>
        <Text
          style={[text('subhead'), { color: open ? colors.text : colors.textSubtle }]}
          numberOfLines={open ? undefined : 2}
        >
          {pick(item, 'definition', isEn)}
        </Text>
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={icon.sm} color={colors.textTertiary} />
    </PressScale>
  );
}
