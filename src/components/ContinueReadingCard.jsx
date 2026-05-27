import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { getLastRead } from '../utils/lastRead';

// Card "Continue lendo" na Home, baseado no ultimo artigo aberto.
export default function ContinueReadingCard({ onOpen, refreshKey }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [last, setLast] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getLastRead();
      if (!mounted) return;
      if (data?.articleId) {
        const a = articles.find((x) => x.id === data.articleId);
        setLast(a || null);
      } else {
        setLast(null);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  if (!last) return null;

  const styles = makeStyles(colors, fs);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onOpen(last.id)}>
      <View style={styles.iconBox}>
        <Ionicons name="play" size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{t('home.continueReading')}</Text>
        <Text style={styles.title} numberOfLines={2}>{isEn ? (last.titleEn || last.title) : last.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 12, padding: 13,
      borderLeftWidth: 3, borderLeftColor: c.accent,
      marginBottom: 12,
    },
    iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent, justifyContent: 'center', alignItems: 'center', paddingLeft: 2 },
    label: { fontSize: fs(10), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    title: { fontSize: fs(14), color: c.primaryText, fontWeight: '600', lineHeight: fs(18) },
  });
