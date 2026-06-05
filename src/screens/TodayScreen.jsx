import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import VerseOfDayCard from '../components/VerseOfDayCard';
import SaintTodayCard from '../components/SaintTodayCard';
import LiturgyCard from '../components/LiturgyCard';
import NewsCard from '../components/NewsCard';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import CrossMark from '../components/CrossMark';

const COLUMN_MAX = 720;   // largura da coluna central no desktop
const CROSS_SIZE = 160;   // altura da cruz decorativa das laterais

// Página "Dia de Hoje": reúne o conteúdo diário (Versículo, Santo, Liturgia)
// que antes ficava na home. Acessível pela seção Espiritualidade (Ferramentas).
export default function TodayScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  // No desktop sobra espaço dos dois lados da coluna central: enche cada gutter
  // com a cruz do app (marca d'água). Só na web e se o gutter for largo o bastante.
  const gutter = (width - COLUMN_MAX) / 2;
  const showSideCrosses = Platform.OS === 'web' && gutter >= 150;
  const crossW = Math.round(CROSS_SIZE * 0.62);
  const crossLeft = Math.max(0, gutter / 2 - crossW / 2);

  const dateLabel = useMemo(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [isEn]);

  const openVerse = ({ bookId, chapter, verse }) =>
    navigation.navigate('Bíblia', { bookId, chapter, highlightVerse: verse });

  return (
    <View style={styles.container}>
      {showSideCrosses && (
        <>
          <View pointerEvents="none" style={[styles.sideCross, { left: crossLeft }]}>
            <CrossMark size={CROSS_SIZE} />
          </View>
          <View pointerEvents="none" style={[styles.sideCross, { right: crossLeft }]}>
            <CrossMark size={CROSS_SIZE} />
          </View>
        </>
      )}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.column}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <NewsCard />
          <LiturgyCard onOpen={() => navigation.navigate('Liturgy')} />
          <SaintTodayCard />
          <VerseOfDayCard onOpen={openVerse} />
        </View>
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, alignItems: 'center' },
    // No desktop a página vira uma coluna central; no celular ocupa 100%.
    column: { width: '100%', ...(Platform.OS === 'web' ? { maxWidth: COLUMN_MAX } : null) },
    // Cruz decorativa nas laterais (só desktop): centralizada verticalmente.
    sideCross: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' },
    dateLabel: {
      fontSize: fs(13), color: c.textSubtle, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
    },
  });
