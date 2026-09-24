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
export default function Row({
  icon,
  iconColor,
  title,
  titleColor,
  subtitle,
  subtitleLines,
  trailing,
  onPress,
  disabled,
  accessibilityLabel,
  titleLines = 1,
  style,
  children,
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

  let trail = null;
  if (trailing === 'chevron') {
    trail = <Ionicons name="chevron-forward" size={iconSize.sm} color={colors.textTertiary} />;
  } else if (typeof trailing === 'string' || typeof trailing === 'number') {
    trail = <Text style={[text('body'), { color: colors.textSubtle }]}>{trailing}</Text>;
  } else if (trailing) {
    trail = trailing;
  }

  const content = (
    <>
      {icon ? (
        <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={iconSize.md} color={iconColor ?? colors.tint} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <Text style={[text('body'), { color: titleColor ?? colors.text }]} numberOfLines={titleLines || undefined}>
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

  if (!onPress) {
    return (
      <View style={[base, dim, style]} aria-label={accessibilityLabel} aria-disabled={disabled || undefined}>
        {content}
      </View>
    );
  }

  return (
    <PressScale
      role="button"
      onPress={onPress}
      disabled={disabled}
      aria-label={accessibilityLabel}
      aria-disabled={disabled || undefined}
      style={({ pressed }) => [base, pressed ? { backgroundColor: colors.separator } : null, dim, style]}
    >
      {content}
    </PressScale>
  );
}
