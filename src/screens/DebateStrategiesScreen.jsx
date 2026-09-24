import { useState, useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DEBATE_STRATEGIES } from '../data/debateStrategies';
import { pick } from '../utils/i18nData';
import { Chip, EmptyState, Group, PressScale, SearchField } from '../components/ui';

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
        <View style={{ flexDirection: 'row', gap: space.xs }}>
          {chips.map((c) => (
            <Chip key={c.key} label={c.label} selected={filter === c.key} onPress={() => setFilter(c.key)} haptic />
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.md, gap: space.sm }}
        ListEmptyComponent={<EmptyState icon="search-outline" title={t('debate.empty')} message={t('glossary.emptyHint')} />}
        renderItem={({ item }) => (
          <StrategyCard
            item={item}
            open={expanded === item.id}
            onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
          />
        )}
      />
    </View>
  );
}

// Um item: cabeçalho pressionável (nome em headline, tipo em subhead, chevron)
// e, aberto, três blocos separados pela hairline do Group: definição em body,
// exemplo em serifa e como usar ou responder.
function StrategyCard({ item, open, onToggle }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, icon } = tokens;
  const isFallacy = item.section === 'falacia';
  const label = [text('footnote'), { color: colors.textSubtle }];
  const block = { padding: space.md, gap: space.xxs };

  return (
    <Group>
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
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[text('headline'), { color: colors.text }]}>{pick(item, 'name', isEn)}</Text>
          <Text style={[text('subhead'), { color: colors.textSubtle }]}>
            {isFallacy ? t('debate.fallacy') : t('debate.tactic')}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={icon.sm} color={colors.textTertiary} />
      </PressScale>

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
}
