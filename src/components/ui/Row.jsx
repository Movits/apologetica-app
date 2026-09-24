import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from './PressScale';

// Linha de lista para dentro de um Group: ícone à esquerda (caixa de 28),
// título e subtítulo no meio, `trailing` à direita ('chevron', texto ou nó).
// Com `onPress` vira um PressScale com role de botão e fundo levemente
// escurecido enquanto pressionada, sem `onPress` é uma View estática.
// `titleColor` pinta o título (uma ação destrutiva usa `danger` no ícone e
// no rótulo); `subtitleLines` limita o subtítulo (default: sem limite).
// `leading` é um nó no lugar da caixa de ícone (capa, avatar, disco colorido);
// `chevron` desenha o chevron mesmo com `trailing` sendo um nó (contador +
// seta), e `trailing="chevron"` continua valendo; `titleRole` troca o papel do
// título ('body' padrão, 'headline' para linhas de destaque); `onLongPress` e
// o resto das props (`role`, `aria-*`, `haptic`, `testID`) vão ao PressScale.
export default function Row({
  icon,
  iconColor,
  leading,
  title,
  titleColor,
  titleRole = 'body',
  subtitle,
  subtitleLines,
  trailing,
  chevron,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  titleLines = 1,
  style,
  children,
  haptic,
  ...rest
}) {
  const { colors, tokens, text } = useTheme();
  const { space, icon: iconSize } = tokens;

  const base = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.sm,
  };
  const dim = disabled ? { opacity: 0.4 } : null;

  const arrow = <Ionicons name="chevron-forward" size={iconSize.sm} color={colors.textTertiary} />;
  let trail = null;
  if (trailing === 'chevron') {
    trail = arrow;
  } else if (typeof trailing === 'string' || typeof trailing === 'number') {
    trail = <Text style={[text('body'), { color: colors.textSubtle }]}>{trailing}</Text>;
  } else if (trailing) {
    trail = trailing;
  }
  // `chevron` junto de um trailing próprio: os dois lado a lado, com o mesmo
  // respiro que separa as colunas da linha.
  if (chevron && trailing !== 'chevron') {
    trail = trail
      ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>{trail}{arrow}</View>
      : arrow;
  }

  const content = (
    <>
      {leading ?? (icon ? (
        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={iconSize.md} color={iconColor ?? colors.tint} />
        </View>
      ) : null)}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <Text style={[text(titleRole), { color: titleColor ?? colors.text }]} numberOfLines={titleLines || undefined}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={subtitleLines || undefined}>
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
      {trail}
    </>
  );

  if (!onPress && !onLongPress) {
    return (
      <View style={[base, dim, style]} aria-label={accessibilityLabel} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </View>
    );
  }

  return (
    <PressScale
      role="button"
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      haptic={haptic}
      aria-label={accessibilityLabel}
      aria-disabled={disabled || undefined}
      style={({ pressed }) => [base, pressed ? { backgroundColor: colors.separator } : null, dim, style]}
      {...rest}
    >
      {content}
    </PressScale>
  );
}
