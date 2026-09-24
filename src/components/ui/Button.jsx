import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from './PressScale';

// Botão nas três variantes do protótipo: primary (fundo tint), secondary
// (fundo card com hairline) e plain (só texto). Rótulo em headline, ícone
// opcional antes dele. `disabled` e `loading` bloqueiam o toque, `loading`
// troca o rótulo pelo ActivityIndicator mantendo a altura.
export default function Button({
  variant = 'primary',
  label,
  children,
  icon,
  disabled,
  loading,
  haptic,
  full = true,
  onPress,
  style,
  textStyle,
  ...rest
}) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon: iconSize } = tokens;
  const plain = variant === 'plain';
  const fg = variant === 'primary' ? colors.onTint : colors.tint;
  const labelStyle = text('headline');
  const blocked = Boolean(disabled || loading);

  const base = {
    minHeight: plain ? 44 : 50,
    paddingHorizontal: plain ? space.sm : space.lg,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    alignSelf: full ? 'stretch' : 'center',
    backgroundColor: variant === 'primary' ? colors.tint : variant === 'secondary' ? colors.card : 'transparent',
  };
  const outline = variant === 'secondary'
    ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator }
    : null;

  return (
    <PressScale
      role="button"
      haptic={haptic}
      onPress={onPress}
      disabled={blocked}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      style={[base, outline, disabled ? { opacity: 0.4 } : null, style]}
      {...rest}
    >
      {loading ? (
        <View style={{ height: labelStyle.lineHeight, justifyContent: 'center' }}>
          <ActivityIndicator color={fg} />
        </View>
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={iconSize.sm} color={fg} /> : null}
          <Text style={[labelStyle, { color: fg }, textStyle]}>{label ?? children}</Text>
        </>
      )}
    </PressScale>
  );
}
