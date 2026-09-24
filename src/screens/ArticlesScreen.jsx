import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES, POPULAR_IDS, sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadSet } from '../utils/readingProgress';
import { categoryLabel, pick } from '../utils/i18nData';
import { Chip, ChipRow, EmptyState, LargeTitleScreen, SearchField } from '../components/ui';
import ArticleListItem, { ArticleListSeparator } from '../components/ArticleListItem';

// Filtros fixos da linha de chips, antes das categorias. Os ids das categorias
// são os nomes em PT (campo article.category), como em articleCategories.js.
const FILTER_ALL = 'all';
const FILTER_POPULAR = 'popular';

// Busca sem acento nem caixa ("Igreja" acha "igreja", "Maria" acha "María").
const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Título e resumo já normalizados, por idioma e por id, calculados uma vez no
// módulo: a busca compara `includes` neles em vez de normalizar os 83
// artigos a cada tecla.
const foldArticle = (a, isEn) => `${fold(pick(a, 'title', isEn))}\n${fold(pick(a, 'summary', isEn))}`;
const FOLDED = {
  pt: new Map(articles.map((a) => [a.id, foldArticle(a, false)])),
  en: new Map(articles.map((a) => [a.id, foldArticle(a, true)])),
};

const keyExtractor = (a) => String(a.id);

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
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTER_ALL);
  const [readSet, setReadSet] = useState(() => new Set());

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
    const folded = FOLDED[isEn ? 'en' : 'pt'];
    return base.filter((a) => folded.get(a.id).includes(q));
  }, [filter, query, isEn]);

  const showCategory = filter === FILTER_ALL || filter === FILTER_POPULAR;
  const openArticle = useCallback((articleId) => navigation.navigate('ArticleDetail', { articleId }), [navigation]);
  const clearFilters = () => { setQuery(''); setFilter(FILTER_ALL); };

  // Estável entre renders (memo do ArticleListItem): só muda quando os lidos
  // ou o filtro mudam.
  const renderItem = useCallback(
    ({ item }) => (
      <ArticleListItem article={item} read={readSet.has(item.id)} showCategory={showCategory} onPress={openArticle} />
    ),
    [readSet, showCategory, openArticle]
  );

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
              <ChipRow scroll style={{ marginHorizontal: -space.md, marginTop: space.sm, marginBottom: space.xs }}>
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
              </ChipRow>
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
          renderItem={renderItem}
        />
      )}
    />
  );
}
