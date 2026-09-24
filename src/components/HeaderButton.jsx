import { ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PressScale } from './ui';

// Botão de header: vai no headerRight do stack (Caderno, página do caderno)
// ou na barra própria de um modal (editor de nota). Com `icon` é um alvo de
// 44x44 com o Ionicons em tint e `aria-label` = label; sem ícone é o rótulo
// curto em headline na cor tint ("Salvar"). `loading` troca o conteúdo por um
// ActivityIndicator sem mudar o tamanho, `disabled` baixa a opacidade e
// bloqueia o toque, `danger` pinta em `colors.danger`.
export default function HeaderButton({ icon, label, onPress, loading, disabled, danger, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon: iconSize } = tokens;
  const color = danger ? colors.danger : colors.tint;
  const blocked = Boolean(disabled || loading);

  return (
    <PressScale
      role="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      disabled={blocked}
      onPress={blocked ? undefined : onPress}
      style={[
        {
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.md,
          paddingHorizontal: icon ? 0 : space.sm,
        },
        disabled ? { opacity: 0.4 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : icon ? (
        <Ionicons name={icon} size={iconSize.md} color={color} />
      ) : (
        <Text style={[text('headline'), { color }]}>{label}</Text>
      )}
    </PressScale>
  );
}
