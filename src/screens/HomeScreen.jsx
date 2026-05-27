import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRequireAccount } from '../components/GuestGate';
import VerseOfDayCard from '../components/VerseOfDayCard';
import LiturgyCard from '../components/LiturgyCard';
import SaintTodayCard from '../components/SaintTodayCard';
import ContinueReadingCard from '../components/ContinueReadingCard';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Os labels dos cards vêm do i18n. Definidos dentro do componente
// (não no escopo do módulo) pra reagir a mudança de idioma.

function buildHighlights(t) {
  return [
    { icon: 'book-outline', label: t('home.card.articles'), sub: t('home.card.articlesSub'), tab: 'Artigos' },
    { icon: 'library-outline', label: t('home.card.references'), sub: t('home.card.referencesSub'), tab: 'Referências' },
    { icon: 'bookmark-outline', label: t('home.card.bible'), sub: t('home.card.bibleSub'), tab: 'Bíblia' },
  ];
}

function buildEspiritualidade(t) {
  return [
    { icon: 'calendar-outline', label: t('home.card.readingPlan'), sub: t('home.card.readingPlanSub'), screen: 'ReadingPlan' },
    { icon: 'flower-outline', label: t('home.card.rosary'), sub: t('home.card.rosarySub'), screen: 'Rosary' },
    { icon: 'shield-checkmark-outline', label: t('home.card.exam'), sub: t('home.card.examSub'), screen: 'ExamConscience' },
    { icon: 'school-outline', label: t('home.card.glossary'), sub: t('home.card.glossarySub'), screen: 'Glossary' },
    { icon: 'map-outline', label: t('home.card.map'), sub: t('home.card.mapSub'), screen: 'BibleMap' },
  ];
}

function buildTreino(t) {
  return [
    { icon: 'help-circle-outline', label: t('home.card.quiz'), sub: t('home.card.quizSub'), screen: 'Quiz' },
    { icon: 'chatbubbles-outline', label: t('home.card.dialogue'), sub: t('home.card.dialogueSub'), screen: 'Dialogue' },
  ];
}

function buildStudy(t) {
  return [
    { icon: 'star-outline', label: t('home.card.favorites'), screen: 'Favorites' },
    { icon: 'color-fill-outline', label: t('home.card.highlights'), screen: 'Highlights' },
    { icon: 'document-text-outline', label: t('home.card.notes'), screen: 'Notes' },
  ];
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const requireAccount = useRequireAccount();
  const insets = useSafeAreaInsets();
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef(null);
  const styles = makeStyles(colors, fs, insets.top);
  const HIGHLIGHTS = buildHighlights(t);
  const ESPIRITUALIDADE = buildEspiritualidade(t);
  const TREINO = buildTreino(t);
  const STUDY = buildStudy(t);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  // Scroll to top quando o usuario toca novamente no tab Inicio
  useEffect(() => {
    // HomeScreen esta dentro de HomeStackScreen, que esta dentro do TabNavigator.
    // getParent() retorna o TabNavigator (onde tabPress eh emitido).
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  const openVerse = ({ bookId, chapter, verse }) => {
    navigation.navigate('Bíblia', { bookId, chapter, highlightVerse: verse });
  };

  const openArticle = (articleId) =>
    navigation.navigate('ArticleFromSearch', { articleId });

  const openSearch = () => navigation.navigate('Search');

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
        <Text style={styles.heroIcon}>✝</Text>
        <Text style={styles.heroTitle}>APPologética</Text>
        <Text style={styles.heroSub}>{t('home.hero.verse')}</Text>
        <Text style={styles.heroRef}>{t('home.hero.ref')}</Text>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={openSearch}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <Text style={styles.searchPlaceholder}>{t('home.search')}</Text>
      </TouchableOpacity>

      <ContinueReadingCard onOpen={openArticle} refreshKey={refreshKey} />

      <VerseOfDayCard onOpen={openVerse} />

      <SaintTodayCard />

      <LiturgyCard onOpen={() => navigation.navigate('Liturgy')} />

      <Text style={styles.sectionTitle}>{t('home.section.explore')}</Text>
      {HIGHLIGHTS.map((item) => (
        <TouchableOpacity
          key={item.tab}
          style={styles.card}
          onPress={() => navigation.navigate(item.tab)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>{t('home.section.spirituality')}</Text>
      {ESPIRITUALIDADE.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>{t('home.section.training')}</Text>
      {TREINO.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>{t('home.section.study')}</Text>
      {STUDY.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.card}
          onPress={() =>
            requireAccount(
              () => navigation.navigate(item.screen),
              {
                title: item.label,
                message: `Para usar ${item.label.toLowerCase()}, crie uma conta gratuita. Seus dados ficam salvos e sincronizados entre dispositivos.`,
                icon: item.icon === 'star-outline' ? 'star-outline' :
                      item.icon === 'color-fill-outline' ? 'color-fill-outline' :
                      'document-text-outline',
              }
            )
          }
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          </View>
          <Text style={[styles.cardLabel, { flex: 1 }]}>{item.label}</Text>
          {!user && (
            <Ionicons name="lock-closed" size={14} color={colors.textSubtle} style={{ marginRight: 6 }} />
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}
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
      padding: 20, marginBottom: 12,
    },
    heroIcon: { fontSize: fs(34), color: c.accent },
    heroTitle: { color: '#fff', fontSize: fs(22), fontWeight: 'bold', marginTop: 6 },
    heroSub: {
      color: c.heroSub,
      fontSize: fs(13),
      textAlign: 'center',
      marginTop: 8,
      lineHeight: fs(18),
    },
    heroRef: { color: c.accent, fontSize: fs(12), marginTop: 8, fontStyle: 'italic', fontWeight: 'bold' },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
      marginBottom: 12,
    },
    searchPlaceholder: { color: c.textSubtle, fontSize: fs(14) },
    sectionTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 10, marginTop: 18 },
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
  });
