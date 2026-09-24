import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, SectionList, ScrollView, Linking } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { references, resolveRefUrl } from '../data/references';
import { referencesEn } from '../data/references-en';
import { REFERENCE_SOURCES, translateSource } from '../data/referenceSources';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick } from '../utils/i18nData';
import { refLabel } from '../utils/refLabel';
import { openBible } from '../navigation/links';
import { Button, Chip, EmptyState, PressScale, SearchField } from '../components/ui';

// Catálogo de referências (Onda 9c): busca por texto, filtro por fonte em
// chips e lista agrupada por fonte. Cada linha mostra a citação e abre o
// RefDetail; "Ler no app" e "Fonte" ficam como botões irmãos da linha, e não
// dentro dela, para não aninhar toques.

// Dados já mesclados com a tradução EN (textEn, topicEn, refEn...), lidos com
// `pick` para caírem no PT quando a tradução falta.
const refsWithEn = references.map((r) => {
  const en = referencesEn[r.id];
  return en ? { ...r, ...en } : r;
});

// Chave de filtro "todas as fontes".
const ALL = 'all';

// Tempo em que o destaque da chegada por deep link fica cheio antes de sumir.
const HIGHLIGHT_HOLD_MS = 1500;

// Busca sem acento e sem caixa, nos campos que a pessoa enxerga.
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const matches = (item, q, isEn) => {
  if (!q) return true;
  const fields = [
    refLabel(item, isEn),
    item.ref,
    pick(item, 'text', isEn),
    pick(item, 'topic', isEn),
    pick(item, 'fullSource', isEn),
    pick(item, 'author', isEn),
  ];
  return fields.some((f) => norm(f).includes(q));
};

// Uma referência da lista. Memoizada: o SectionList re-renderiza ao digitar
// e a lista tem 200 itens. `first`/`last` dão os cantos do card do grupo,
// já que o card é virtualizado (cada linha desenha o próprio pedaço).
const RefItem = memo(function RefItem({
  item, isEn, t, highlighted, first, last, onOpen, onOpenInBible, onOpenUrl,
}) {
  const { colors, tokens, text } = useTheme();
  const { space, radius } = tokens;
  const label = refLabel(item, isEn);
  const topic = pick(item, 'topic', isEn);
  const url = resolveRefUrl(item, item, isEn);

  // Destaque da chegada por deep link: fundo deepLinkHl cheio por um instante
  // e depois desvanece. Fica atrás do conteúdo (renderizado antes dele).
  const hl = useSharedValue(0);
  useEffect(() => {
    if (!highlighted) {
      hl.value = 0;
      return;
    }
    hl.value = 1;
    hl.value = withDelay(HIGHLIGHT_HOLD_MS, withTiming(0, { duration: tokens.motion.heavy }));
  }, [highlighted, hl, tokens.motion.heavy]);
  const hlStyle = useAnimatedStyle(() => ({ opacity: hl.value }));

  return (
    <View
      style={{
        marginHorizontal: space.md,
        backgroundColor: colors.card,
        borderTopLeftRadius: first ? radius.md : 0,
        borderTopRightRadius: first ? radius.md : 0,
        borderBottomLeftRadius: last ? radius.md : 0,
        borderBottomRightRadius: last ? radius.md : 0,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.deepLinkHl }, hlStyle]}
      />
      <PressScale
        role="button"
        onPress={() => onOpen(item.id)}
        style={({ pressed }) => [
          { minHeight: 44, paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.xs },
          pressed ? { backgroundColor: colors.separator } : null,
        ]}
      >
        <Text style={[text('bodySerif'), { color: colors.text }]} numberOfLines={4}>
          {pick(item, 'text', isEn)}
        </Text>
        <Text style={[text('footnote'), { color: colors.textSubtle, marginTop: space.xxs }]} numberOfLines={2}>
          {label}{topic ? ` · ${topic}` : ''}
        </Text>
      </PressScale>
      {item.bibleNav || url ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.xs, paddingBottom: space.xxs }}>
          {item.bibleNav ? (
            <Button
              variant="plain"
              full={false}
              icon="book-outline"
              label={t('ref.readInApp')}
              onPress={() => onOpenInBible((isEn && item.bibleNavEn) || item.bibleNav)}
            />
          ) : null}
          {url ? (
            <Button
              variant="plain"
              full={false}
              icon="open-outline"
              label={t('ref.openSourceShort')}
              onPress={() => onOpenUrl(url)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

export default function ReferencesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const [query, setQuery] = useState('');
  const [source, setSource] = useState(ALL);
  const [highlightedId, setHighlightedId] = useState(null);
  const listRef = useRef(null);

  // Seções por fonte, na ordem de REFERENCE_SOURCES, já filtradas pelo chip e
  // pela busca (seções vazias somem).
  const sections = useMemo(() => {
    const q = norm(query.trim());
    return REFERENCE_SOURCES
      .filter((s) => source === ALL || s.id === source)
      .map((s) => ({ meta: s, data: refsWithEn.filter((r) => r.source === s.id && matches(r, q, isEn)) }))
      .filter((s) => s.data.length > 0);
  }, [query, source, isEn]);

  // Chegada por deep link (highlightId): limpa filtro e busca para o item
  // existir na lista, destaca e rola até ele (tentativas porque a lista
  // virtualizada pode ainda não ter medido o alvo).
  const highlightId = route?.params?.highlightId;
  useEffect(() => {
    if (!highlightId) return undefined;
    setQuery('');
    setSource(ALL);
    setHighlightedId(highlightId);
    let sectionIndex = -1;
    let itemIndex = -1;
    REFERENCE_SOURCES.forEach((s, si) => {
      if (sectionIndex >= 0) return;
      const ii = refsWithEn.filter((r) => r.source === s.id).findIndex((r) => r.id === highlightId);
      if (ii >= 0) { sectionIndex = si; itemIndex = ii; }
    });
    if (sectionIndex < 0) return undefined;
    const scrollTry = (animated) => {
      try {
        listRef.current?.scrollToLocation({ sectionIndex, itemIndex, viewPosition: 0.15, animated });
      } catch {}
    };
    const timers = [50, 300, 600].map((ms, i) => setTimeout(() => scrollTry(i > 0), ms));
    return () => timers.forEach(clearTimeout);
  }, [highlightId]);

  const handleOpen = useCallback((id) => navigation.navigate('RefDetail', { highlightId: id }), [navigation]);
  const handleOpenInBible = useCallback((nav) => openBible(navigation, nav), [navigation]);
  const handleOpenUrl = useCallback((url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }, []);

  const renderItem = useCallback(
    ({ item, index, section }) => (
      <RefItem
        item={item}
        isEn={isEn}
        t={t}
        highlighted={highlightedId === item.id}
        first={index === 0}
        last={index === section.data.length - 1}
        onOpen={handleOpen}
        onOpenInBible={handleOpenInBible}
        onOpenUrl={handleOpenUrl}
      />
    ),
    [isEn, t, highlightedId, handleOpen, handleOpenInBible, handleOpenUrl]
  );

  // Cabeçalho do grupo, como o `header` do Group: fonte e contagem em footnote.
  const renderSectionHeader = useCallback(
    ({ section }) => {
      const n = section.data.length;
      const count = n === 1 ? t('ref.countOne') : t('ref.count', { n });
      return (
        <Text style={[text('footnote'), { color: colors.textSubtle, marginHorizontal: space.md, marginTop: space.lg, marginBottom: space.xs }]}>
          {translateSource(section.meta.id, isEn)} · {count}
        </Text>
      );
    },
    [t, text, colors.textSubtle, space, isEn]
  );

  // Separador de meia linha entre itens, sobre o fundo do card para os cantos
  // do grupo continuarem contínuos.
  const Separator = useCallback(
    () => (
      <View style={{ marginHorizontal: space.md, backgroundColor: colors.card }}>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md }} />
      </View>
    ),
    [space.md, colors.card, colors.separator]
  );

  const chips = [{ id: ALL, label: t('ref.all') }, ...REFERENCE_SOURCES.map((s) => ({ id: s.id, label: translateSource(s.id, isEn), icon: s.icon }))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={t('ref.search')}
        clearLabel={t('common.clear')}
        autoCorrect={false}
        style={{ marginHorizontal: space.md, marginTop: space.sm }}
      />
      {/* Trilho dos chips com a altura do alvo de toque: sem `height` e
          `flexShrink: 0` a web encolhe o ScrollView horizontal a quase nada. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space.md, gap: space.xs, alignItems: 'center' }}
        style={{ flexGrow: 0, flexShrink: 0, height: 44, marginTop: space.xxs }}
      >
        {chips.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            icon={c.icon}
            selected={source === c.id}
            onPress={() => setSource(c.id)}
            haptic
          />
        ))}
      </ScrollView>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={Separator}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: space.xl }}
        ListEmptyComponent={
          <EmptyState icon="library-outline" title={t('ref.empty')} message={t('ref.emptyHint')} style={{ marginTop: space.xl }} />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={6}
        windowSize={7}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
}
