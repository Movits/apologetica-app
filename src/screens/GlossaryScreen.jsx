import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { glossary, glossaryByTerm } from '../data/glossary';
import { pick } from '../utils/i18nData';
import { EmptyState, ListSeparator, Row, SearchField } from '../components/ui';

// Posição do termo na tela ao rolar até ele (fração da altura visível).
const SCROLL_VIEW_POSITION = 0.12;

// Termo e definição (PT e EN) em minúsculas, na ordem de `glossary`, calculados
// uma vez no módulo: a busca só compara `includes` neles a cada tecla.
const HAYSTACKS = glossary.map((g) => [g.term, g.definition, g.termEn, g.definitionEn].filter(Boolean).join('\n').toLowerCase());

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
    return glossary.filter((_, i) => HAYSTACKS[i].includes(q));
  }, [query]);

  // Estável entre renders: o TermRow é memoizado e passa o id no toque.
  const toggle = useCallback((id) => setExpanded((cur) => (cur === id ? null : id)), []);

  const empty = filtered.length === 0;

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
        ItemSeparatorComponent={ListSeparator}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
          setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, viewPosition: SCROLL_VIEW_POSITION, animated: false }), 80);
        }}
        ListEmptyComponent={<EmptyState icon="search-outline" title={t('glossary.empty')} message={t('glossary.emptyHint')} />}
        renderItem={({ item }) => <TermRow item={item} open={expanded === item.id} onToggle={toggle} />}
      />
    </View>
  );
}

// Linha de termo: Row com o termo em headline, a definição em subhead (duas
// linhas fechada, inteira e na cor do texto aberta) e chevron; `aria-expanded`
// segue pela Row ao PressScale. Memoizada: a lista re-renderiza a cada tecla
// e ao expandir, e só a linha tocada muda de props.
const TermRow = memo(function TermRow({ item, open, onToggle }) {
  const { colors, tokens, text } = useTheme();
  const { isEn } = useLanguage();
  const { space, icon } = tokens;

  return (
    <Row
      aria-expanded={open}
      title={pick(item, 'term', isEn)}
      titleRole="headline"
      titleLines={0}
      trailing={<Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={icon.sm} color={colors.textTertiary} />}
      onPress={() => onToggle(item.id)}
    >
      <Text
        style={[text('subhead'), { color: open ? colors.text : colors.textSubtle, marginTop: space.xxs }]}
        numberOfLines={open ? undefined : 2}
      >
        {pick(item, 'definition', isEn)}
      </Text>
    </Row>
  );
});
