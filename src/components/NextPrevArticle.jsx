import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';

// Navegacao entre artigos dentro da mesma categoria. Renderizado no fim do artigo.
export default function NextPrevArticle({ current, onOpen }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const styles = makeStyles(colors, fs);

  if (!current) return null;

  const same = articles.filter((a) => a.category === current.category);
  const idx = same.findIndex((a) => a.id === current.id);
  const prev = idx > 0 ? same[idx - 1] : null;
  const next = idx >= 0 && idx < same.length - 1 ? same[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('articles.continueReading')} {isEn ? t(`category.${current.category}`) : current.category}</Text>
      <View style={styles.row}>
        {prev ? (
          <TouchableOpacity style={[styles.card, styles.prev]} onPress={() => onOpen(prev.id)}>
            <View style={styles.headRow}>
              <Ionicons name="chevron-back" size={14} color={colors.accent} />
              <Text style={styles.dir}>{t('common.prev')}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>{isEn ? (prev.titleEn || prev.title) : prev.title}</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}

        {next ? (
          <TouchableOpacity style={[styles.card, styles.next]} onPress={() => onOpen(next.id)}>
            <View style={[styles.headRow, { justifyContent: 'flex-end' }]}>
              <Text style={styles.dir}>{t('common.next')}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.accent} />
            </View>
            <Text style={[styles.title, { textAlign: 'right' }]} numberOfLines={2}>{isEn ? (next.titleEn || next.title) : next.title}</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { marginTop: 24 },
    label: { fontSize: fs(11), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
    row: { flexDirection: 'row', gap: 10 },
    card: { flex: 1, backgroundColor: c.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: c.divider },
    prev: {},
    next: {},
    headRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    dir: { fontSize: fs(11), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    title: { fontSize: fs(13), color: c.primaryText, fontWeight: '600', lineHeight: fs(18) },
  });
