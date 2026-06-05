import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES, sortByRank } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import SectionBanner from '../components/SectionBanner';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Tela dedicada a uma categoria de artigos. Recebe route.params.category
// (nome PT, igual ao campo article.category). Mostra um banner com o tema e
// a lista de artigos daquela categoria. Abre o detalhe via ArticleFromSearch
// (instância de ArticleDetailScreen já registrada no HomeStack).
export default function CategoryArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();

  const category = route?.params?.category;
  const meta = ARTICLE_CATEGORIES.find((c) => c.id === category);
  const list = sortByRank(articles.filter((a) => a.category === category));

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  const countLabel = isEn
    ? `${list.length} ${list.length === 1 ? 'article' : 'articles'}`
    : `${list.length} ${list.length === 1 ? 'artigo' : 'artigos'}`;

  return (
    <View style={styles.container}>
      <SectionBanner
        iconSet={meta?.iconSet}
        icon={meta?.icon || 'book-outline'}
        title={isEn ? t(`category.${category}`) : category}
        subtitle={t(`category.${category}.desc`)}
        countLabel={countLabel}
      />

      <View style={{ flex: 1 }}>
        <FlatList
          data={list}
          keyExtractor={(a) => String(a.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.empty}>{isEn ? 'No articles found.' : 'Nenhum artigo encontrado.'}</Text>}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ArticleFromSearch', { articleId: item.id })}
            >
              <Text style={styles.cardTitle}>{isEn ? (item.titleEn || item.title) : item.title}</Text>
              <Text style={styles.cardSummary} numberOfLines={2}>{isEn ? (item.summaryEn || item.summary) : item.summary}</Text>
            </TouchableOpacity>
          )}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    cardTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    cardSummary: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18) },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
  });
