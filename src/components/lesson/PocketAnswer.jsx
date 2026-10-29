import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui';

// "Resposta de bolso": a frase que a pessoa leva para a conversa. Serifa de
// leitura em itálico, aspas em dourado como enfeite (não é texto) e um botão
// de compartilhar, porque é feita para ser mandada a alguém.
export default function PocketAnswer({ sentence, onShare, style }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, radius, icon } = tokens;
  if (!sentence) return null;

  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
        <Ionicons name="chatbox-ellipses-outline" size={icon.sm} color={colors.tint} />
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('lesson.pocket.title')}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Text aria-hidden style={[text('largeTitle'), { color: colors.accent, lineHeight: text('largeTitle').lineHeight, marginTop: -space.xxs }]}>“</Text>
        <Text style={[text('bodySerif'), { color: colors.text, fontStyle: 'italic', flex: 1 }]}>{sentence}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]}>{t('lesson.pocket.hint')}</Text>
        {onShare ? (
          <Button variant="plain" full={false} icon="share-outline" label={t('common.share')} onPress={onShare} />
        ) : null}
      </View>
    </View>
  );
}
