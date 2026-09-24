import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from './PressScale';

// Pílula selecionável (filtro, segmento). O alvo de toque é o PressScale
// externo de 44, a pílula visível tem 34 de altura. Selecionada: fundo tint
// e texto onTint; senão fundo card, texto normal e hairline.
export default function Chip({ label, selected = false, icon, onPress, haptic, disabled, style, ...rest }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon: iconSize } = tokens;
  const fg = selected ? colors.onTint : colors.text;

  return (
    <PressScale
      role="button"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      haptic={haptic ? 'selection' : undefined}
      onPress={onPress}
      style={[{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }, disabled ? { opacity: 0.4 } : null, style]}
      {...rest}
    >
      <View
        style={{
          height: 34,
          paddingHorizontal: space.md,
          borderRadius: radius.full,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.xxs,
          backgroundColor: selected ? colors.tint : colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: selected ? colors.tint : colors.separator,
        }}
      >
        {icon ? <Ionicons name={icon} size={iconSize.sm} color={fg} /> : null}
        <Text style={[text('subhead'), { fontWeight: '600', color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressScale>
  );
}
