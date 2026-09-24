import { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DEBATE_STRATEGIES } from '../data/debateStrategies';
import { pick } from '../utils/i18nData';
import { Chip, ChipRow, EmptyState, Group, Row, SearchField } from '../components/ui';

// Nome e definição (PT e EN) em minúsculas, na ordem de DEBATE_STRATEGIES,
// calculados uma vez no módulo: a busca só compara `includes` neles a cada tecla.
const HAYSTACKS = DEBATE_STRATEGIES.map((s) => [s.name, s.definition, s.nameEn, s.definitionEn].filter(Boolean).join('\n').toLowerCase());

// Ferramenta de treino para debates: táticas que ajudam e falácias a
// identificar e rebater. Busca no topo, filtro por tipo em Chips e cada item
// como um Group que expande ao toque.
export default function DebateStrategiesScreen() {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | tatica | falacia

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEBATE_STRATEGIES.filter((s, i) => {
      if (filter !== 'all' && s.section !== filter) return false;
      return !q || HAYSTACKS[i].includes(q);
    });
  }, [query, filter]);

  // Estável entre renders: o StrategyCard é memoizado e passa o id no toque.
  const toggle = useCallback((id) => setExpanded((cur) => (cur === id ? null : id)), []);

  const chips = [
    { key: 'all', label: t('debate.all') },
    { key: 'tatica', label: t('debate.tactics') },
    { key: 'falacia', label: t('debate.fallacies') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: space.md, paddingTop: space.sm, gap: space.xs }}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('debate.search')}
          clearLabel={t('common.clear')}
          autoCorrect={false}
        />
        <ChipRow>
          {chips.map((c) => (
            <Chip key={c.key} label={c.label} selected={filter === c.key} onPress={() => setFilter(c.key)} haptic />
          ))}
        </ChipRow>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.md, gap: space.sm }}
        ListEmptyComponent={<EmptyState icon="search-outline" title={t('debate.empty')} message={t('debate.emptyHint')} />}
        renderItem={({ item }) => <StrategyCard item={item} open={expanded === item.id} onToggle={toggle} />}
      />
    </View>
  );
}

// Um item: cabeçalho pressionável (Row: nome em headline, tipo em subhead,
// chevron, `aria-expanded`) e, aberto, três blocos separados pela hairline do
// Group: definição em body, exemplo em serifa e como usar ou responder.
// Memoizado: a lista re-renderiza a cada tecla e ao expandir, e só o item
// tocado muda de props.
const StrategyCard = memo(function StrategyCard({ item, open, onToggle }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, icon } = tokens;
  const isFallacy = item.section === 'falacia';
  const label = [text('footnote'), { color: colors.textSubtle }];
  const block = { padding: space.md, gap: space.xxs };

  return (
    <Group>
      <Row
        aria-expanded={open}
        title={pick(item, 'name', isEn)}
        titleRole="headline"
        titleLines={0}
        subtitle={isFallacy ? t('debate.fallacy') : t('debate.tactic')}
        trailing={<Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={icon.sm} color={colors.textTertiary} />}
        onPress={() => onToggle(item.id)}
      />

      {open ? (
        <View style={block}>
          <Text style={[text('body'), { color: colors.text }]}>{pick(item, 'definition', isEn)}</Text>
        </View>
      ) : null}

      {open ? (
        <View style={block}>
          <Text style={label}>{t('debate.example')}</Text>
          <Text style={[text('bodySerif'), { color: colors.text, fontStyle: 'italic' }]}>
            {pick(item, 'example', isEn)}
          </Text>
        </View>
      ) : null}

      {open ? (
        <View style={block}>
          <Text style={label}>{isFallacy ? t('debate.respond') : t('debate.use')}</Text>
          <Text style={[text('body'), { color: colors.text }]}>{pick(item, 'howToRespond', isEn)}</Text>
        </View>
      ) : null}
    </Group>
  );
});
