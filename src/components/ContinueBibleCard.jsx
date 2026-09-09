import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Card "Continue lendo" no topo da lista de livros da Bíblia.
// Só aparece quando existe uma posição salva (ver src/utils/bibleProgress.js).
// Não sequestra a navegação: a retomada é sempre um toque do usuário.
export default function ContinueBibleCard({ label, chapterRatio = 0, stats, onPress }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const styles = makeStyles(colors, fs);
  const pct = Math.round(Math.max(0, Math.min(1, chapterRatio)) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('bible.continue')}: ${label}`}
    >
      <View style={styles.iconBox}>
        <Ionicons name="play" size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{t('bible.continue')}</Text>
        <Text style={styles.title} numberOfLines={1}>{label}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        {stats?.chaptersRead > 0 && (
          <Text style={styles.stats}>
            {isEn
              ? `${stats.chaptersRead} of ${stats.total} chapters read`
              : `${stats.chaptersRead} de ${stats.total} capítulos lidos`}
          </Text>
        )}
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
      marginHorizontal: 16, marginBottom: 12,
    },
    iconBox: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: c.accent,
      justifyContent: 'center', alignItems: 'center', paddingLeft: 2,
    },
    label: {
      fontSize: fs(10), color: c.accent, fontWeight: 'bold',
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2,
    },
    title: { fontSize: fs(14), color: c.primaryText, fontWeight: '600' },
    track: {
      height: 3, backgroundColor: c.divider, borderRadius: 2,
      marginTop: 6, overflow: 'hidden',
    },
    fill: { height: '100%', backgroundColor: c.accent },
    stats: { fontSize: fs(11), color: c.textSubtle, marginTop: 5 },
  });
