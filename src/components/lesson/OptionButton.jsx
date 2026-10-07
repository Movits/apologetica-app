import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from '../ui/PressScale';

// Alternativa de resposta (quiz, previsão e teste rápido das lições).
// `state`: 'idle' | 'correct' | 'wrong'. Certo e errado aparecem só no ícone e
// na hairline (success/danger), o fundo continua `card`. É um rádio:
// `aria-checked` marca a escolhida. `centered` centra o rótulo (verdadeiro ou
// falso lado a lado).
export default function OptionButton({ label, state = 'idle', checked, disabled, onPress, centered, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon } = tokens;
  const tone = state === 'correct' ? colors.success : state === 'wrong' ? colors.danger : null;
  const iconName = state === 'correct' ? 'checkmark-circle' : state === 'wrong' ? 'close-circle' : null;

  return (
    <PressScale
      role="radio"
      aria-checked={Boolean(checked)}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          gap: space.sm,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          borderRadius: radius.md,
          backgroundColor: pressed ? colors.separator : colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: tone ?? colors.separator,
        },
        style,
      ]}
    >
      <Text
        style={[
          centered ? text('headline') : text('body'),
          { color: colors.text, textAlign: centered ? 'center' : 'left' },
          centered ? null : { flex: 1 },
        ]}
      >
        {label}
      </Text>
      {iconName ? <Ionicons name={iconName} size={icon.md} color={tone} /> : null}
    </PressScale>
  );
}
