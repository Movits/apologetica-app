import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES } from '../data/dialogues';

// Objeções do Modo Diálogo que respondem ao artigo aberto, no fim do artigo.
// A lista é derivada do campo relatedArticle dos próprios diálogos, então não
// existe dado novo a manter em sincronia: criar um diálogo apontando para um
// artigo já o faz aparecer aqui.
export default function RelatedDialogues({ currentId, onOpen }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const styles = makeStyles(colors, fs);

  const related = DIALOGUES.filter((d) => d.relatedArticle === currentId);
  if (related.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('articles.objectionsTitle')}</Text>
      {related.map((d) => (
        <TouchableOpacity
          key={d.id}
          style={styles.card}
          onPress={() => onOpen(d.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles-outline" size={18} color={colors.accent} />
          <Text style={styles.objection} numberOfLines={3}>
            {isEn ? (d.objectionEn || d.objection) : d.objection}
          </Text>
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
    objection: {
      flex: 1,
      fontSize: fs(13),
      color: c.primaryText,
      fontWeight: '600',
      lineHeight: fs(18),
      fontStyle: 'italic',
    },
  });
