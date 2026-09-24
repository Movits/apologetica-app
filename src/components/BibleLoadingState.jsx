import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui';

// Estado enquanto a tradução da Bíblia está sendo baixada, e o de falha com
// nova tentativa. Fica num componente só porque mais de uma tela mostra texto
// bíblico e todas precisam do mesmo par. Mesma gramática do EmptyState (ícone
// discreto, título em headline, mensagem em subhead, botão secundário), sem
// ser um EmptyState porque o erro de rede é erro, não lista vazia.
//
// Importa que isto NÃO se confunda com "capítulo em preparação", que é outra
// coisa: aquele significa que um capítulo deuterocanônico ainda não foi
// adicionado ao app, e nenhuma espera resolve.
//
// `compacto`: versão menor para dentro de uma lista (título em footnote,
// recuo vertical menor e sem a linha de explicação).
export default function BibleLoadingState({ erro, onTentarDeNovo, compacto = false }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, icon } = tokens;

  const box = {
    flex: compacto ? 0 : 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: compacto ? space.lg : space.xxxl,
    paddingHorizontal: space.xl,
    gap: space.xs,
  };
  const title = [text(compacto ? 'footnote' : 'headline'), { color: colors.text, textAlign: 'center' }];
  const sub = [text('subhead'), { color: colors.textSubtle, textAlign: 'center' }];

  if (erro) {
    return (
      <View style={box}>
        <Ionicons name="cloud-offline-outline" size={compacto ? icon.md : icon.lg} color={colors.textTertiary} />
        <Text style={title}>{t('bible.loadError')}</Text>
        <Text style={sub}>{t('bible.loadErrorSub')}</Text>
        {onTentarDeNovo ? (
          <Button
            variant="secondary"
            full={false}
            label={t('common.tryAgain')}
            onPress={onTentarDeNovo}
            style={{ marginTop: space.sm }}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={box} aria-busy aria-label={t('bible.loading')}>
      <ActivityIndicator size={compacto ? 'small' : 'large'} color={colors.accent} />
      <Text style={title}>{t('bible.loading')}</Text>
      {!compacto ? <Text style={sub}>{t('bible.loadingSub')}</Text> : null}
    </View>
  );
}
