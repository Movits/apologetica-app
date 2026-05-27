import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getSaintToday } from '../data/saints';

const KIND_LABEL = {
  pt: { solenidade: 'Solenidade', festa: 'Festa', memoria: 'Memória', opcional: 'Memória opcional' },
  en: { solenidade: 'Solemnity', festa: 'Feast', memoria: 'Memorial', opcional: 'Optional memorial' },
};

export default function SaintTodayCard() {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const saint = useMemo(() => getSaintToday(), []);
  const styles = makeStyles(colors, fs);

  if (!saint) return null;
  const labels = isEn ? KIND_LABEL.en : KIND_LABEL.pt;
  const name = isEn ? (saint.nameEn || saint.name) : saint.name;
  const summary = isEn ? (saint.summaryEn || saint.summary) : saint.summary;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="rose-outline" size={20} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{isEn ? 'Today' : 'Hoje'} · {labels[saint.kind] || ''}</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.summary} numberOfLines={3}>{summary}</Text>
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 13,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
    },
    iconBox: { width: 36, height: 36, borderRadius: 9, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: fs(10), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
    name: { fontSize: fs(15), color: c.primaryText, fontWeight: 'bold', marginBottom: 4 },
    summary: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(17) },
  });
