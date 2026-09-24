import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadSet } from '../utils/readingProgress';
import { openArticle } from '../navigation/links';
import { EmptyState } from '../components/ui';
import ArticleListItem, { ArticleListSeparator } from '../components/ArticleListItem';

// Tela dedicada a uma categoria de artigos. Recebe route.params.category
// (nome PT, igual ao campo article.category). O título vem do header do stack
// (options em App.js); aqui ficam a descrição do tema, a contagem e a lista no
// mesmo item da aba Artigos (ArticleListItem), sem repetir a categoria em cada
// linha. Abre o detalhe via ArticleFromSearch (openArticle), instância de
// ArticleDetailScreen registrada no HomeStack. O recuo da tab bar já vem do
// contentStyle do stack.
export default function CategoryArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const [readSet, setReadSet] = useState(() => new Set());

  const category = route?.params?.category;
  const list = useMemo(() => sortByRank(articles.filter((a) => a.category === category)), [category]);

  // Artigos marcados como lidos (AsyncStorage), relidos a cada foco da tela.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getReadSet().then((set) => { if (alive) setReadSet(set); });
      return () => { alive = false; };
    }, [])
  );

  const description = t(`category.${category}.desc`);
  const countLabel = list.length === 1 ? t('articles.count.one') : t('articles.count', { n: list.length });

  return (
    <FlatList
      data={list}
      keyExtractor={(a) => String(a.id)}
      contentContainerStyle={{ paddingHorizontal: space.md, paddingBottom: space.xl }}
      ListHeaderComponent={
        <View style={{ paddingTop: space.sm, paddingBottom: space.xs, gap: space.xxs }}>
          <Text style={[text('subhead'), { color: colors.textSubtle }]}>{description}</Text>
          <Text style={[text('footnote'), { color: colors.textTertiary }]}>{countLabel}</Text>
        </View>
      }
      ItemSeparatorComponent={ArticleListSeparator}
      ListEmptyComponent={<EmptyState icon="newspaper-outline" title={t('articles.empty')} />}
      renderItem={({ item }) => (
        <ArticleListItem
          article={item}
          read={readSet.has(item.id)}
          showCategory={false}
          onPress={() => openArticle(navigation, item.id)}
        />
      )}
    />
  );
}
