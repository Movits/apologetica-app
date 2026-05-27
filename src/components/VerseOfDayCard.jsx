import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef } from 'react';
import { getVerseOfDay } from '../data/dailyVerses';
import { shareVerse } from '../utils/share';
import { captureAndShareImage } from '../utils/shareAsImage';
import ShareVerseCard from './ShareVerseCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function VerseOfDayCard({ onOpen }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const verse = useMemo(() => getVerseOfDay(), []);
  const styles = makeStyles(colors, fs);
  const shareCardRef = useRef(null);

  const text = isEn ? (verse.textEn || verse.text) : verse.text;
  const ref = isEn ? (verse.refEn || verse.ref) : verse.ref;

  const handleShare = () =>
    shareVerse({
      bookName: ref.split(/[\s:,]/).slice(0, -1).join(' '),
      chapter: ref.match(/[:,](\d+)/)?.[1],
      verse: verse.verse,
      text,
    });

  const handleShareAsImage = () =>
    captureAndShareImage(shareCardRef, `"${text}"\n\n${ref}`);

  const openVerse = () =>
    onOpen?.({ bookId: verse.bookId, chapter: verse.chapter, verse: verse.verse });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="sunny-outline" size={18} color={colors.accent} />
        </View>
        <Text style={styles.headerLabel}>{t('home.verse.label')}</Text>
      </View>

      <Text style={styles.verseText}>"{text}"</Text>
      <Text style={styles.verseRef}>{ref}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={openVerse}>
          <Ionicons name="book-outline" size={16} color={colors.accent} />
          <Text style={styles.actionText}>{t('home.verse.readContext')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color={colors.accent} />
          <Text style={styles.actionText}>{t('home.verse.shareText')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShareAsImage}>
          <Ionicons name="image-outline" size={16} color={colors.accent} />
          <Text style={styles.actionText}>{t('home.verse.shareImage')}</Text>
        </TouchableOpacity>
      </View>

      {/* Card offscreen renderizado para captura como imagem. */}
      <View style={styles.offscreen} pointerEvents="none">
        <ShareVerseCard ref={shareCardRef} text={text} passageRef={ref} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: c.accent,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    headerIcon: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.badgeBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerLabel: {
      fontSize: fs(11),
      color: c.textSubtle,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    verseText: {
      fontSize: fs(14),
      color: c.text,
      lineHeight: fs(21),
      fontStyle: 'italic',
      marginBottom: 6,
    },
    verseRef: {
      fontSize: fs(12),
      color: c.accent,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      paddingTop: 10,
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
    actionText: { color: c.accent, fontSize: fs(12), fontWeight: '600' },
    offscreen: { position: 'absolute', left: -10000, top: -10000, opacity: 0 },
  });
