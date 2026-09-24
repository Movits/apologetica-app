import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, SectionList, Linking } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { referencesWithEn, resolveRefUrl } from '../data/references';
import { REFERENCE_SOURCES, translateSource } from '../data/referenceSources';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick } from '../utils/i18nData';
import { refLabel } from '../utils/refLabel';
import { openBible } from '../navigation/links';
import { Button, Chip, ChipRow, EmptyState, ListSeparator, PressScale, SearchField } from '../components/ui';

// Catálogo de referências (Onda 9c): busca por texto, filtro por fonte em
// chips e lista agrupada por fonte. Cada linha mostra a citação e abre o
// RefDetail; "Ler no app" e "Fonte" ficam como botões irmãos da linha, e não
// dentro dela, para não aninhar toques.

// Chave de filtro "todas as fontes".
const ALL = 'all';

// Tempo em que o destaque da chegada por deep link fica cheio antes de sumir.
const HIGHLIGHT_HOLD_MS = 1500;

// Busca sem acento e sem caixa, nos campos que a pessoa enxerga. O texto de
// cada referência (rótulo, ref, citação, tema, fonte, autor) é normalizado uma
// vez por idioma, aqui no módulo, e a busca só compara `includes` nele (antes
// normalizava os seis campos das 200 referências a cada tecla).
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const haystack = (item, isEn) => norm([
  refLabel(item, isEn),
  item.ref,
  pick(item, 'text', isEn),
  pick(item, 'topic', isEn),
  pick(item, 'fullSource', isEn),
  pick(item, 'author', isEn),
].join('\n'));
const HAYSTACK = {
  pt: new Map(referencesWithEn.map((r) => [r.id, haystack(r, false)])),
  en: new Map(referencesWithEn.map((r) => [r.id, haystack(r, true)])),
};

// Destaque da chegada por deep link: fundo deepLinkHl cheio por um instante e
// depois desvanece. Fica atrás do conteúdo (renderizado antes dele) e só é
// montado na linha destacada, para as outras 200 não carregarem um shared
// value e um estilo animado cada.
function HighlightBackdrop() {
  const { colors, tokens } = useTheme();
  const hl = useSharedValue(1);
  useEffect(() => {
    hl.value = withDelay(HIGHLIGHT_HOLD_MS, withTiming(0, { duration: tokens.motion.heavy }));
  }, [hl, tokens.motion.heavy]);
  const hlStyle = useAnimatedStyle(() => ({ opacity: hl.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.deepLinkHl }, hlStyle]}
    />
  );
}

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
      {highlighted ? <HighlightBackdrop /> : null}
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
    const hay = HAYSTACK[isEn ? 'en' : 'pt'];
    return REFERENCE_SOURCES
      .filter((s) => source === ALL || s.id === source)
      .map((s) => ({ meta: s, data: referencesWithEn.filter((r) => r.source === s.id && (!q || hay.get(r.id).includes(q))) }))
      .filter((s) => s.data.length > 0);
  }, [query, source, isEn]);

  // Chegada por deep link (highlightId): limpa filtro e busca para o item
  // existir na lista e o destaca. O scroll fica no efeito seguinte, porque os
  // índices precisam ser os das seções renderizadas.
  const highlightId = route?.params?.highlightId;
  const pendingScroll = useRef(null);
  useEffect(() => {
    if (!highlightId) return;
    pendingScroll.current = highlightId;
    setQuery('');
    setSource(ALL);
    setHighlightedId(highlightId);
  }, [highlightId]);

  // Rola até o item pendente assim que `sections` for a lista completa (sem
  // busca nem chip). Os índices vêm de `sections`, e não de REFERENCE_SOURCES:
  // as seções descartam fontes vazias (Ciência e Mídia hoje), então a posição
  // de uma fonte na lista não é a posição dela no catálogo de fontes.
  // Tentativas porque a lista virtualizada pode ainda não ter medido o alvo.
  // O pendente é consumido na primeira passada, então digitar depois não rola
  // de novo nem apaga a busca.
  useEffect(() => {
    if (!highlightId || pendingScroll.current !== highlightId) return undefined;
    if (query !== '' || source !== ALL) return undefined;
    pendingScroll.current = null;
    let sectionIndex = -1;
    let itemIndex = -1;
    sections.some((s, si) => {
      const ii = s.data.findIndex((r) => r.id === highlightId);
      if (ii >= 0) { sectionIndex = si; itemIndex = ii; }
      return ii >= 0;
    });
    if (sectionIndex < 0) return undefined;
    const scrollTry = (animated) => {
      try {
        listRef.current?.scrollToLocation({ sectionIndex, itemIndex, viewPosition: 0.15, animated });
      } catch {}
    };
    const timers = [50, 300, 600].map((ms, i) => setTimeout(() => scrollTry(i > 0), ms));
    return () => timers.forEach(clearTimeout);
  }, [highlightId, sections, query, source]);

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

  // A hairline do Group (ListSeparator) sobre o fundo do card, para os cantos
  // do grupo continuarem contínuos (o card é virtualizado).
  const Separator = useCallback(
    () => (
      <View style={{ marginHorizontal: space.md, backgroundColor: colors.card }}>
        <ListSeparator />
      </View>
    ),
    [space.md, colors.card]
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
      <ChipRow scroll style={{ marginTop: space.xxs }}>
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
      </ChipRow>
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
