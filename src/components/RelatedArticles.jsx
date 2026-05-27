import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { getRelatedArticles } from '../data/articleRelations';

// Seção "Ver também" renderizada no fim do artigo, antes do NextPrev.
// Mostra artigos tematicamente relacionados (de qualquer categoria),
// diferente do NextPrev que só navega dentro da mesma categoria.
export default function RelatedArticles({ currentId, onOpen }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const styles = makeStyles(colors, fs);

  const related = getRelatedArticles(currentId, articles);
  if (!related || related.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('articles.relatedTitle')}</Text>
      {related.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={styles.card}
          onPress={() => onOpen(a.id)}
          activeOpacity={0.7}
        >
          <View style={styles.catBadge}>
            <Text style={styles.category}>{isEn ? t(`category.${a.category}`) : a.category}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{isEn ? (a.titleEn || a.title) : a.title}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { marginTop: 24 },
    label: {
      fontSize: fs(11),
      color: c.textSubtle,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      textAlign: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.divider,
      gap: 10,
    },
    catBadge: {
      backgroundColor: c.badgeBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
    },
    category: {
      fontSize: fs(10),
      color: c.accent,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    title: {
      flex: 1,
      fontSize: fs(13),
      color: c.primaryText,
      fontWeight: '600',
      lineHeight: fs(18),
    },
  });
