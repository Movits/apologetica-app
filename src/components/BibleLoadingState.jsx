import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Estado enquanto a tradução da Bíblia está sendo baixada, e o de falha com
// nova tentativa. Fica num componente só porque cinco telas mostram texto
// bíblico e todas precisam do mesmo par.
//
// Importa que isto NÃO se confunda com "capítulo em preparação", que é outra
// coisa: aquele significa que um capítulo deuterocanônico ainda não foi
// adicionado ao app, e nenhuma espera resolve.
export default function BibleLoadingState({ erro, onTentarDeNovo, compacto = false }) {
  const { colors, text } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(colors, text, compacto);

  if (erro) {
    return (
      <View style={styles.box}>
        <Ionicons name="cloud-offline-outline" size={compacto ? 28 : 44} color={colors.textSubtle} />
        <Text style={styles.titulo}>{t('bible.loadError')}</Text>
        <Text style={styles.sub}>{t('bible.loadErrorSub')}</Text>
        {onTentarDeNovo && (
          <TouchableOpacity
            style={styles.botao}
            onPress={onTentarDeNovo}
            role="button"
            aria-label={t('common.tryAgain')}
          >
            <Text style={styles.botaoTexto}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <ActivityIndicator size={compacto ? 'small' : 'large'} color={colors.accent} />
      <Text style={styles.titulo}>{t('bible.loading')}</Text>
      {!compacto && <Text style={styles.sub}>{t('bible.loadingSub')}</Text>}
    </View>
  );
}

const makeStyles = (c, text, compacto) =>
  StyleSheet.create({
    box: {
      flex: compacto ? 0 : 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: compacto ? 20 : 40,
      paddingHorizontal: 28,
      gap: 10,
    },
    titulo: {
      ...text(compacto ? 'footnote' : 'callout'),
      fontWeight: '600',
      color: c.primaryText,
      textAlign: 'center',
      marginTop: 4,
    },
    sub: {
      ...text('caption1'),
      color: c.textSubtle,
      textAlign: 'center',
    },
    botao: {
      marginTop: 10,
      paddingVertical: 11,
      paddingHorizontal: 22,
      borderRadius: 10,
      backgroundColor: c.primary,
    },
    botaoTexto: { ...text('subhead'), fontWeight: '600', color: c.onPrimary },
  });
