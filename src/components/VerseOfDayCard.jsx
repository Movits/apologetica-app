import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { getVerseOfDay } from '../data/dailyVerses';
import { shareVerse } from '../utils/share';
import { useTheme } from '../context/ThemeContext';

export default function VerseOfDayCard({ onOpen }) {
  const { colors, fs } = useTheme();
  const verse = useMemo(() => getVerseOfDay(), []);
  const styles = makeStyles(colors, fs);

  const handleShare = () =>
    shareVerse({
      bookName: verse.ref.split(' ').slice(0, -1).join(' '),
      chapter: verse.ref.match(/(\d+),/)?.[1],
      verse: verse.verse,
      text: verse.text,
    });

  const openVerse = () =>
    onOpen?.({ bookId: verse.bookId, chapter: verse.chapter, verse: verse.verse });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="sunny-outline" size={18} color={colors.accent} />
        </View>
        <Text style={styles.headerLabel}>Versículo do dia</Text>
      </View>

      <Text style={styles.verseText}>"{verse.text}"</Text>
      <Text style={styles.verseRef}>{verse.ref}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={openVerse}>
          <Ionicons name="book-outline" size={16} color={colors.accent} />
          <Text style={styles.actionText}>Ler no contexto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color={colors.accent} />
          <Text style={styles.actionText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: c.accent,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    headerIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.badgeBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerLabel: {
      fontSize: fs(12),
      color: c.textSubtle,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    verseText: {
      fontSize: fs(16),
      color: c.text,
      lineHeight: fs(24),
      fontStyle: 'italic',
      marginBottom: 8,
    },
    verseRef: {
      fontSize: fs(13),
      color: c.accent,
      fontWeight: 'bold',
      marginBottom: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      paddingTop: 12,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
      flex: 1,
      justifyContent: 'center',
    },
    actionText: { color: c.accent, fontSize: fs(13), fontWeight: '600' },
  });
