import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ARTICLE_CATEGORIES, countByCategory } from '../data/articleCategories';
import { DIALOGUES } from '../data/dialogues';
import { consumeStartIntent } from '../utils/onboarding';
import AppIcon from '../components/AppIcon';
import CrossMark from '../components/CrossMark';
import ContinueReadingCard from '../components/ContinueReadingCard';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef(null);
  const styles = makeStyles(colors, fs, insets.top);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  // Ativacao do onboarding v2: abre o dialogo que o usuario escolheu, uma vez.
  useEffect(() => {
    let alive = true;
    consumeStartIntent().then((dialogueId) => {
      if (alive && dialogueId) navigation.navigate('Dialogue', { dialogueId });
    });
    return () => { alive = false; };
  }, [navigation]);

  // Scroll to top quando o usuario toca novamente no tab Inicio
  useEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  const openArticle = (articleId) =>
    navigation.navigate('ArticleFromSearch', { articleId });

  const openSearch = () => navigation.navigate('Search');

  const openCategory = (category) =>
    navigation.navigate('CategoryArticles', { category });

  // Objeção do dia: rotação determinística (mesma pra todos no dia), com o
  // ano na semente pra variar entre anos, igual ao getVerseOfDay.
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const dailyObjection = DIALOGUES[(dayOfYear + now.getFullYear() * 7) % DIALOGUES.length];

  return (
    <View style={styles.container}>
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      scrollEventThrottle={32}
    >
      <View style={styles.hero}>
        <CrossMark size={fs(34)} color={colors.accent} opacity={1} />
        <Text style={styles.heroTitle}>APPologética</Text>
        <Text style={styles.heroSub}>{t('home.hero.verse')}</Text>
        <Text style={styles.heroRef}>{t('home.hero.ref')}</Text>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={openSearch}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <Text style={styles.searchPlaceholder}>{t('home.search')}</Text>
      </TouchableOpacity>

      <ContinueReadingCard onOpen={openArticle} refreshKey={refreshKey} />

      {/* Objeção do dia: uma pergunta difícil com roteiro de resposta rápido. */}
      <TouchableOpacity
        style={styles.objectionCard}
        onPress={() => navigation.navigate('Dialogue', { dialogueId: dailyObjection.id })}
      >
        <View style={styles.objectionHeader}>
          <Ionicons name="chatbubbles-outline" size={15} color={colors.accent} />
          <Text style={styles.objectionKicker}>{t('home.objection.title')}</Text>
        </View>
        <Text style={styles.objectionText}>
          {isEn ? dailyObjection.objectionEn : dailyObjection.objection}
        </Text>
        <View style={styles.objectionCtaRow}>
          <Text style={styles.objectionCta}>{t('home.objection.cta')}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </View>
      </TouchableOpacity>

      {/* Centro da Home: categorias de artigos de apologética. */}
      <Text style={styles.sectionTitle}>{t('home.section.learn')}</Text>
      <View style={styles.categoryGrid}>
        {ARTICLE_CATEGORIES.map((cat) => {
          const count = countByCategory(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryTile}
              onPress={() => openCategory(cat.id)}
            >
              <View style={styles.categoryIcon}>
                <AppIcon set={cat.iconSet} name={cat.icon} size={22} color={colors.primaryText} />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {isEn ? t(`category.${cat.id}`) : cat.id}
              </Text>
              <Text style={styles.categoryCount}>
                {count} {isEn ? (count === 1 ? 'article' : 'articles') : (count === 1 ? 'artigo' : 'artigos')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Acesso às referências (versículos, Catecismo, documentos). */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('References')}>
        <View style={styles.cardIcon}>
          <Ionicons name="library-outline" size={22} color={colors.primaryText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>{t('home.card.references')}</Text>
          <Text style={styles.cardSub}>{t('home.card.referencesSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>
    </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs, topInset = 0) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingTop: 16 + topInset, paddingBottom: 30 },
    hero: {
      alignItems: 'center', backgroundColor: c.primary, borderRadius: 14,
      padding: 16, marginBottom: 12,
    },
    heroTitle: { color: '#fff', fontSize: fs(20), fontWeight: 'bold', marginTop: 4 },
    heroSub: {
      color: c.heroSub,
      fontSize: fs(12),
      textAlign: 'center',
      marginTop: 6,
      lineHeight: fs(17),
    },
    heroRef: { color: c.accent, fontSize: fs(11), marginTop: 6, fontStyle: 'italic', fontWeight: 'bold' },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
      marginBottom: 12,
    },
    searchPlaceholder: { color: c.textSubtle, fontSize: fs(14) },
    sectionTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 10, marginTop: 0 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    categoryTile: {
      width: '48.5%',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    categoryIcon: {
      width: 40, height: 40, borderRadius: 9, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    categoryName: { fontSize: fs(14), color: c.primaryText, fontWeight: 'bold', lineHeight: fs(19) },
    categoryCount: { fontSize: fs(11), color: c.accentText, fontWeight: 'bold', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderRadius: 10, padding: 13, marginBottom: 9, gap: 12,
    },
    cardIcon: {
      width: 40, height: 40, borderRadius: 9, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    cardLabel: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    cardSub: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
    objectionCard: {
      backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 12,
      borderLeftWidth: 4, borderLeftColor: c.accent,
    },
    objectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    objectionKicker: {
      fontSize: fs(11), color: c.accentText, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    objectionText: { fontSize: fs(15), color: c.text, fontWeight: '600', marginTop: 8, lineHeight: fs(21) },
    objectionCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
    objectionCta: { fontSize: fs(12.5), color: c.accentText, fontWeight: 'bold' },
  });
