import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Pílula "+N XP": fundo `badgeBg` e texto `badgeText` (o par de selo da
// paleta, AA nos dois temas), sem dourado como texto. Com `animated` entra
// com o FadeInDown dos tokens, para marcar o momento do ganho.
export default function XpChip({ n, animated, style }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, radius } = tokens;
  if (!n) return null;
  const Wrapper = animated ? Animated.View : View;
  return (
    <Wrapper
      entering={animated ? FadeInDown.duration(tokens.motion.layout) : undefined}
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: space.sm,
          paddingVertical: space.xxs,
          borderRadius: radius.full,
          backgroundColor: colors.badgeBg,
        },
        style,
      ]}
    >
      <Text style={[text('footnote'), { color: colors.badgeText, fontWeight: '600' }]}>{t('lesson.xp', { n })}</Text>
    </Wrapper>
  );
}
