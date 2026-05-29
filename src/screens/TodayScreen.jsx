import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import VerseOfDayCard from '../components/VerseOfDayCard';
import SaintTodayCard from '../components/SaintTodayCard';
import LiturgyCard from '../components/LiturgyCard';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Página "Dia de Hoje": reúne o conteúdo diário (Versículo, Santo, Liturgia)
// que antes ficava na home. Acessível pela seção Espiritualidade (Ferramentas).
export default function TodayScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

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
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <VerseOfDayCard onOpen={openVerse} />
        <SaintTodayCard />
        <LiturgyCard onOpen={() => navigation.navigate('Liturgy')} />
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16 },
    dateLabel: {
      fontSize: fs(13), color: c.textSubtle, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
    },
  });
