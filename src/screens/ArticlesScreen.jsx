import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES, POPULAR_IDS, sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadSet } from '../utils/readingProgress';
import { categoryLabel, pick } from '../utils/i18nData';
import { fullBleedContentOptions } from '../navigation/chrome';
import { Chip, EmptyState, LargeTitleScreen, SearchField } from '../components/ui';
import ArticleListItem, { ArticleListSeparator } from '../components/ArticleListItem';

// Filtros fixos da linha de chips, antes das categorias. Os ids das categorias
// são os nomes em PT (campo article.category), como em articleCategories.js.
const FILTER_ALL = 'all';
const FILTER_POPULAR = 'popular';

// Busca sem acento nem caixa ("Igreja" acha "igreja", "Maria" acha "María").
const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTER_ALL);
  const [readSet, setReadSet] = useState(() => new Set());

  // O header do stack sai (o large title é da tela) e o recuo da tab bar que o
  // stack põe em toda tela também, porque a lista já compensa por dentro.
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false, ...fullBleedContentOptions(colors) });
  }, [navigation, colors]);

  // Abre artigo específico via deep link (da busca global ou outra tela).
  useEffect(() => {
    const articleId = route?.params?.articleId || route?.params?.openId;
    if (articleId) {
      navigation.navigate('ArticleDetail', { articleId });
      navigation.setParams?.({ openId: undefined, articleId: undefined });
    }
  }, [navigation, route?.params?.openId, route?.params?.articleId]);

  // Volta ao topo ao tocar no tab de novo (o popToTop pro detalhe é automático).
  useEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  // Artigos marcados como lidos (AsyncStorage), relidos a cada foco da aba.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getReadSet().then((set) => { if (alive) setReadSet(set); });
      return () => { alive = false; };
    }, [])
  );

  const filters = useMemo(
    () => [
      { id: FILTER_ALL, label: t('articles.filter.all') },
      { id: FILTER_POPULAR, label: t('category.popular'), icon: 'star-outline' },
      ...ARTICLE_CATEGORIES.map((cat) => ({ id: cat.id, label: categoryLabel(cat.id, t), icon: cat.icon })),
    ],
    [t]
  );

  // Filtro por chip e, por cima, a busca por texto no título e no resumo do
  // idioma em uso.
  const data = useMemo(() => {
    const base = articlesFor(filter);
    const q = fold(query.trim());
    if (!q) return base;
    return base.filter((a) => fold(pick(a, 'title', isEn)).includes(q) || fold(pick(a, 'summary', isEn)).includes(q));
  }, [filter, query, isEn]);

  const showCategory = filter === FILTER_ALL || filter === FILTER_POPULAR;
  const openArticle = (articleId) => navigation.navigate('ArticleDetail', { articleId });
  const clearFilters = () => { setQuery(''); setFilter(FILTER_ALL); };

  return (
    <LargeTitleScreen
      title={t('header.articles')}
      subtitle={t('articles.count', { n: articles.length })}
      renderList={({ header, ...listProps }) => (
        <Animated.FlatList
          ref={listRef}
          {...listProps}
          data={data}
          keyExtractor={(a) => String(a.id)}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View>
              {header}
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder={t('articles.searchPlaceholder')}
                clearLabel={t('common.clear')}
              />
              {/* Chips sangram até as bordas da tela (a lista tem recuo
                  lateral), com o mesmo recuo dentro do conteúdo rolável. */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ marginHorizontal: -space.md, marginTop: space.sm, marginBottom: space.xs }}
                contentContainerStyle={{ paddingHorizontal: space.md, gap: space.xs }}
              >
                {filters.map((f) => (
                  <Chip
                    key={f.id}
                    label={f.label}
                    icon={f.icon}
                    selected={filter === f.id}
                    onPress={() => setFilter(f.id)}
                    haptic
                  />
                ))}
              </ScrollView>
            </View>
          }
          ItemSeparatorComponent={ArticleListSeparator}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title={t('articles.empty')}
              message={t('articles.emptyHint')}
              action={{ label: t('articles.clearFilters'), onPress: clearFilters }}
            />
          }
          renderItem={({ item }) => (
            <ArticleListItem
              article={item}
              read={readSet.has(item.id)}
              showCategory={showCategory}
              onPress={() => openArticle(item.id)}
            />
          )}
        />
      )}
    />
  );
}
