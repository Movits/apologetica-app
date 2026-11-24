import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadSet } from '../utils/readingProgress';
import { keepIfSame } from '../utils/sets';
import { openArticle } from '../navigation/links';
import { EmptyState, ProgressBar } from '../components/ui';
import { useJourney } from '../hooks/useJourney';
import { categoryProgress, isLessonComplete, lessonOf } from '../utils/journey';
import ArticleListItem, { ArticleListSeparator } from '../components/ArticleListItem';
import ArticleCard from '../components/ArticleCard';
import { PAGE_MAX, centeredColumn, columnInnerWidth } from '../components/ReadingColumn';
import useLayout from '../hooks/useLayout';
import { gridColumns } from '../utils/layout';

// Desktop: grade de cartões como a da aba Artigos (largura mínima de um
// cartão e o teto de colunas, proporções da página).
const CARD_MIN = 260;
const MAX_COLS = 5;

// Tela dedicada a uma categoria de artigos. Recebe route.params.category
// (nome PT, igual ao campo article.category). O título vem do header do stack
// (options em App.js); aqui ficam a descrição do tema, a contagem e a lista no
// mesmo item da aba Artigos (ArticleListItem), sem repetir a categoria em cada
// linha. Abre o detalhe via ArticleFromSearch (openArticle), instância de
// ArticleDetailScreen registrada no HomeStack. O recuo da tab bar já vem do
// contentStyle do stack. Em janela larga a lista fica na coluna central.
export default function CategoryArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const { isWide, width } = useLayout();
  const [readSet, setReadSet] = useState(() => new Set());
  const journey = useJourney();

  const category = route?.params?.category;
  const list = useMemo(() => sortByRank(articles.filter((a) => a.category === category)), [category]);

  // Artigos marcados como lidos (AsyncStorage), relidos a cada foco da tela.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getReadSet().then((set) => { if (alive) setReadSet(keepIfSame(set)); });
      return () => { alive = false; };
    }, [])
  );

  const description = t(`category.${category}.desc`);
  const countLabel = list.length === 1 ? t('articles.count.one') : t('articles.count', { n: list.length });
  // Progresso da jornada neste tema (lições concluídas), sob a descrição.
  const prog = journey ? categoryProgress(journey, list.map((a) => a.id)) : null;
  const progLabel = prog ? t('journey.categoryProgress', { n: prog.completed, total: prog.total }) : null;

  // Grade do desktop: colunas pela largura útil da página; no celular, a
  // lista de sempre (ArticleListItem).
  const gap = space.md;
  const gridW = columnInnerWidth(width, PAGE_MAX, space.md);
  const cols = isWide ? gridColumns(gridW, CARD_MIN, gap, MAX_COLS) : 1;
  const cardW = Math.floor((gridW - gap * (cols - 1)) / cols);
  const grid = cols > 1;

  return (
    <FlatList
      key={grid ? `grid-${cols}` : 'list'}
      numColumns={cols}
      columnWrapperStyle={grid ? { gap } : undefined}
      data={list}
      keyExtractor={(a) => String(a.id)}
      contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xl, ...centeredColumn(PAGE_MAX, space.md) }}
      ListHeaderComponent={
        <View style={{ paddingTop: space.sm, paddingBottom: grid ? space.md : space.xs, gap: space.xxs }}>
          <Text style={[text('subhead'), { color: colors.textSubtle }]}>{description}</Text>
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{countLabel}</Text>
          {prog && prog.completed > 0 ? (
            <View style={{ gap: space.xxs, marginTop: space.xxs }}>
              <ProgressBar value={prog.total ? prog.completed / prog.total : 0} accessibilityLabel={progLabel} />
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>{progLabel}</Text>
            </View>
          ) : null}
        </View>
      }
      ItemSeparatorComponent={grid ? GridGap : ArticleListSeparator}
      ListEmptyComponent={<EmptyState icon="newspaper-outline" title={t('articles.empty')} />}
      renderItem={({ item }) => (grid ? (
        <ArticleCard
          article={item}
          read={readSet.has(item.id)}
          completed={isLessonComplete(lessonOf(journey, item.id))}
          showCategory={false}
          width={cardW}
          onPress={(id) => openArticle(navigation, id)}
        />
      ) : (
        <ArticleListItem
          article={item}
          read={readSet.has(item.id)}
          completed={isLessonComplete(lessonOf(journey, item.id))}
          showCategory={false}
          onPress={() => openArticle(navigation, item.id)}
        />
      ))}
    />
  );
}

// Vão vertical entre as linhas da grade.
function GridGap() {
  const { tokens } = useTheme();
  return <View style={{ height: tokens.space.md }} />;
}
