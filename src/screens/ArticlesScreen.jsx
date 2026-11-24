import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES, POPULAR_IDS, countByCategory, sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadSet } from '../utils/readingProgress';
import { keepIfSame } from '../utils/sets';
import { useJourney } from '../hooks/useJourney';
import { isLessonComplete, lessonOf } from '../utils/journey';
import { categoryLabel, pick } from '../utils/i18nData';
import { Chip, ChipRow, EmptyState, LargeTitleScreen, SearchField } from '../components/ui';
import ArticleListItem, { ArticleListSeparator } from '../components/ArticleListItem';
import ArticleCard from '../components/ArticleCard';
import { PAGE_MAX, columnInnerWidth } from '../components/ReadingColumn';
import useLayout from '../hooks/useLayout';
import { gridColumns, sideMargin } from '../utils/layout';

// Filtros fixos da linha de chips, antes das categorias. Os ids das categorias
// são os nomes em PT (campo article.category), como em articleCategories.js.
const FILTER_ALL = 'all';
const FILTER_POPULAR = 'popular';

// Busca sem acento nem caixa ("Igreja" acha "igreja", "Maria" acha "María").
const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Título e resumo já normalizados, por idioma e por id, calculados uma vez
// por idioma na primeira busca: a busca compara `includes` neles em vez de
// normalizar os artigos a cada tecla. Não no carregamento do módulo, porque
// os campos em inglês só chegam quando o idioma vira inglês (data/english.js).
const foldArticle = (a, isEn) => `${fold(pick(a, 'title', isEn))}\n${fold(pick(a, 'summary', isEn))}`;
const FOLDED = {};
const foldedFor = (isEn) => {
  const key = isEn ? 'en' : 'pt';
  if (!FOLDED[key]) FOLDED[key] = new Map(articles.map((a) => [a.id, foldArticle(a, isEn)]));
  return FOLDED[key];
};

const keyExtractor = (a) => String(a.id);

// Desktop: largura da lista de temas à esquerda e a largura mínima de um
// cartão da grade (proporções da página).
const RAIL_W = 220;
const CARD_MIN = 260;
const MAX_COLS = 4;

// Quanto a lista monta além da tela. O padrão da FlatList (21 telas) montava
// os 85 artigos de uma vez e, na web, baixava todas as capas ao abrir a aba.
// Cinco telas (duas acima, duas abaixo) bastam para a rolagem não mostrar
// buraco.
const LIST_WINDOW = { initialNumToRender: 12, maxToRenderPerBatch: 12, windowSize: 5 };

// Lista base de cada filtro: tudo por relevância, os "mais buscados" na ordem
// curada, ou uma categoria por relevância.
function articlesFor(filter) {
  if (filter === FILTER_POPULAR) {
    return POPULAR_IDS.map((id) => articles.find((a) => a.id === id)).filter(Boolean);
  }
  if (filter === FILTER_ALL) return sortByRank(articles);
  return sortByRank(articles.filter((a) => a.category === filter));
}

// Aba Artigos (Onda 9): large title próprio, campo de busca por texto, linha
// de chips com os filtros (tudo, mais buscados, categorias) e a lista no
// estilo Apple Books (ArticleListItem). Rola por baixo da tab bar translúcida
// (LargeTitleScreen compensa a altura por dentro).
export default function ArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const { isWide, width } = useLayout();
  const listRef = useRef(null);
  const railRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTER_ALL);
  const [readSet, setReadSet] = useState(() => new Set());
  const journey = useJourney();

  // Volta ao topo ao tocar no tab de novo (o popToTop pro detalhe é automático).
  useScrollToTop(listRef);

  // Abre artigo específico via deep link (da busca global ou outra tela).
  useEffect(() => {
    const articleId = route?.params?.articleId || route?.params?.openId;
    if (articleId) {
      navigation.navigate('ArticleDetail', { articleId });
      navigation.setParams?.({ openId: undefined, articleId: undefined });
    }
  }, [navigation, route?.params?.openId, route?.params?.articleId]);

  // Artigos marcados como lidos (AsyncStorage), relidos a cada foco da aba.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getReadSet().then((set) => { if (alive) setReadSet(keepIfSame(set)); });
      return () => { alive = false; };
    }, [])
  );

  const filters = useMemo(
    () => [
      { id: FILTER_ALL, label: t('articles.filter.all'), count: articles.length },
      { id: FILTER_POPULAR, label: t('category.popular'), count: POPULAR_IDS.length },
      ...ARTICLE_CATEGORIES.map((cat) => ({ id: cat.id, label: categoryLabel(cat.id, t), count: countByCategory(cat.id) })),
    ],
    [t]
  );

  // Filtro por chip e, por cima, a busca por texto no título e no resumo do
  // idioma em uso.
  const data = useMemo(() => {
    const base = articlesFor(filter);
    const q = fold(query.trim());
    if (!q) return base;
    const folded = foldedFor(isEn);
    return base.filter((a) => folded.get(a.id).includes(q));
  }, [filter, query, isEn]);

  const showCategory = filter === FILTER_ALL || filter === FILTER_POPULAR;
  const openArticle = useCallback((articleId) => navigation.navigate('ArticleDetail', { articleId }), [navigation]);
  const clearFilters = () => { setQuery(''); setFilter(FILTER_ALL); };

  // Estável entre renders (memo do ArticleListItem): só muda quando os lidos
  // ou o filtro mudam.
  const renderItem = useCallback(
    ({ item }) => (
      <ArticleListItem
        article={item}
        read={readSet.has(item.id)}
        completed={isLessonComplete(lessonOf(journey, item.id))}
        showCategory={showCategory}
        onPress={openArticle}
      />
    ),
    [readSet, journey, showCategory, openArticle]
  );

  // Grade do desktop: colunas pela largura que sobra ao lado dos temas (menos
  // um recuo para a barra de rolagem não cobrir a última coluna).
  const gap = space.md;
  const side = sideMargin(width, PAGE_MAX, space.md);
  const gridW = columnInnerWidth(width, PAGE_MAX, space.md) - RAIL_W - space.xl - space.md;
  const cols = gridColumns(gridW, CARD_MIN, gap, MAX_COLS);
  const cardW = Math.floor((gridW - gap * (cols - 1)) / cols);
  // Desktop (web): a roda do mouse sobre os temas rola a grade, como no resto
  // da página. Só quando os temas cabem inteiros; em janela baixa eles rolam
  // sozinhos.
  useEffect(() => {
    if (!isWide || Platform.OS !== 'web') return undefined;
    const rail = railRef.current?.getScrollableNode?.();
    if (!rail) return undefined;
    const onWheel = (e) => {
      if (rail.scrollHeight > rail.clientHeight + 1) return;
      const list = listRef.current?.getScrollableNode?.();
      if (!list) return;
      e.preventDefault();
      // deltaMode 1 = linhas (Firefox): uma linha vale um passo da grade.
      list.scrollTop += e.deltaMode === 1 ? e.deltaY * space.md : e.deltaY;
    };
    rail.addEventListener('wheel', onWheel, { passive: false });
    return () => rail.removeEventListener('wheel', onWheel);
  }, [isWide, space.md]);

  const renderCard = useCallback(
    ({ item }) => (
      <ArticleCard
        article={item}
        read={readSet.has(item.id)}
        completed={isLessonComplete(lessonOf(journey, item.id))}
        showCategory={showCategory}
        width={cardW}
        onPress={openArticle}
      />
    ),
    [readSet, journey, showCategory, cardW, openArticle]
  );

  const search = (
    <SearchField
      value={query}
      onChangeText={setQuery}
      placeholder={t('articles.searchPlaceholder')}
      clearLabel={t('common.clear')}
    />
  );
  const empty = (
    <EmptyState
      icon="search-outline"
      title={t('articles.empty')}
      message={t('articles.emptyHint')}
      action={{ label: t('articles.clearFilters'), onPress: clearFilters }}
    />
  );

  if (isWide) {
    // A grade rola na largura toda da área (a roda do mouse funciona em
    // qualquer ponto e a barra de rolagem fica na borda da janela), com o
    // título e a busca no topo dela. Os temas ficam fixos à esquerda, por
    // cima da margem que a grade deixa para eles.
    return (
      <LargeTitleScreen
        title={t('header.articles')}
        subtitle={t('articles.count', { n: articles.length })}
        maxWidth={PAGE_MAX}
        renderList={({ header, contentContainerStyle, ...listProps }) => {
          const { paddingTop, paddingBottom } = StyleSheet.flatten(contentContainerStyle);
          return (
            <View style={styles.wide}>
              <Animated.FlatList
                key={`grid-${cols}`}
                ref={listRef}
                {...listProps}
                style={styles.grid}
                contentContainerStyle={{
                  paddingTop,
                  paddingBottom,
                  paddingLeft: side + RAIL_W + space.xl,
                  paddingRight: side,
                }}
                data={data}
                numColumns={cols}
                columnWrapperStyle={cols > 1 ? { gap } : undefined}
                ItemSeparatorComponent={GridGap}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                {...LIST_WINDOW}
                ListHeaderComponent={
                  <View style={{ marginBottom: space.lg }}>
                    {header}
                    {search}
                  </View>
                }
                ListEmptyComponent={empty}
                renderItem={renderCard}
              />
              <ScrollView
                ref={railRef}
                role="tablist"
                aria-orientation="vertical"
                style={[styles.rail, { left: side, width: RAIL_W }]}
                contentContainerStyle={{ paddingTop: paddingTop + space.xxs, paddingBottom, gap: space.xxs }}
              >
                {filters.map((f) => (
                  <TopicItem
                    key={f.id}
                    label={f.label}
                    count={f.count}
                    selected={filter === f.id}
                    onPress={() => setFilter(f.id)}
                  />
                ))}
              </ScrollView>
            </View>
          );
        }}
      />
    );
  }

  return (
    <LargeTitleScreen
      title={t('header.articles')}
      subtitle={t('articles.count', { n: articles.length })}
      renderList={({ header, ...listProps }) => (
        <Animated.FlatList
          ref={listRef}
          {...listProps}
          data={data}
          keyExtractor={keyExtractor}
          keyboardShouldPersistTaps="handled"
          {...LIST_WINDOW}
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View>
              {header}
              {search}
              {/* Chips sangram até as bordas da tela (a lista tem recuo
                  lateral), com o mesmo recuo dentro do conteúdo rolável. */}
              <ChipRow scroll style={{ marginHorizontal: -space.md, marginTop: space.sm, marginBottom: space.xs }}>
                {filters.map((f) => (
                  <Chip
                    key={f.id}
                    label={f.label}
                    selected={filter === f.id}
                    onPress={() => setFilter(f.id)}
                    haptic
                  />
                ))}
              </ChipRow>
            </View>
          }
          ItemSeparatorComponent={ArticleListSeparator}
          ListEmptyComponent={empty}
          renderItem={renderItem}
        />
      )}
    />
  );
}

// Vão vertical entre as linhas da grade.
function GridGap() {
  const { tokens } = useTheme();
  return <View style={{ height: tokens.space.md }} />;
}

// Item da lista de temas do desktop: rótulo e contagem, fundo `badgeBg` e
// texto na cor de destaque quando selecionado (como a barra lateral).
function TopicItem({ label, count, selected, onPress }) {
  const { colors, tokens, text } = useTheme();
  const [hovered, setHovered] = useState(false);
  const { space, radius } = tokens;
  const color = selected ? colors.tint : colors.text;
  return (
    <Pressable
      role="tab"
      aria-selected={selected}
      aria-label={`${label}, ${count}`}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.topic,
        {
          paddingHorizontal: space.sm,
          borderRadius: radius.sm,
          backgroundColor: selected || hovered ? colors.badgeBg : 'transparent',
        },
      ]}
    >
      <Text numberOfLines={1} style={[text('callout'), { color, flex: 1, fontWeight: selected ? '600' : '400' }]}>
        {label}
      </Text>
      <Text style={[text('footnote'), { color: colors.textSubtle }]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wide: { flex: 1 },
  grid: { flex: 1 },
  rail: { position: 'absolute', top: 0, bottom: 0, flexGrow: 0 },
  topic: { minHeight: 44, flexDirection: 'row', alignItems: 'center', cursor: 'pointer' },
});
