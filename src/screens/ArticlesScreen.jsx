import { useEffect, useMemo, useRef } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES } from '../data/articleCategories';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import SectionBanner from '../components/SectionBanner';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Aba Artigos: página única com todos os artigos, separados por cabeçalho fixo
// (SectionBanner) por categoria. O banner do topo troca ao rolar de uma seção
// para outra (stickySectionHeadersEnabled).
export default function ArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const listRef = useRef(null);

  // Abre artigo específico via deep link (da busca global ou outra tela)
  useEffect(() => {
    const articleId = route?.params?.articleId || route?.params?.openId;
    if (articleId) {
      navigation.navigate('ArticleDetail', { articleId });
      navigation.setParams?.({ openId: undefined, articleId: undefined });
    }
  }, [route?.params?.openId, route?.params?.articleId]);

  // Volta ao topo ao tocar no tab de novo (o popToTop pro detalhe é automático)
  useEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        try {
          listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, viewPosition: 0, animated: true });
        } catch {}
      }
    });
    return unsub;
  }, [navigation]);

  // Seções na ordem das categorias, ignorando categorias sem artigos.
  const sections = useMemo(
    () =>
      ARTICLE_CATEGORIES
        .map((cat) => ({ meta: cat, data: articles.filter((a) => a.category === cat.id) }))
        .filter((s) => s.data.length > 0),
    []
  );

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  const countLabel = (n) =>
    isEn ? `${n} ${n === 1 ? 'article' : 'articles'}` : `${n} ${n === 1 ? 'artigo' : 'artigos'}`;

  return (
    <View style={styles.container}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(a) => String(a.id)}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>{isEn ? 'No articles found.' : 'Nenhum artigo encontrado.'}</Text>}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
        onScrollToIndexFailed={() => {}}
        renderSectionHeader={({ section }) => (
          <SectionBanner
            iconSet={section.meta.iconSet}
            icon={section.meta.icon}
            title={isEn ? t(`category.${section.meta.id}`) : section.meta.id}
            subtitle={t(`category.${section.meta.id}.desc`)}
            countLabel={countLabel(section.data.length)}
          />
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{isEn ? (item.titleEn || item.title) : item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
              </View>
              <Text style={styles.cardSummary} numberOfLines={2}>{isEn ? (item.summaryEn || item.summary) : item.summary}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    itemWrap: { paddingHorizontal: 16 },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 },
    cardTitle: { flex: 1, fontSize: fs(16), fontWeight: 'bold', color: c.primaryText },
    cardSummary: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18) },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
  });
