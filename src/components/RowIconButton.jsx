import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Botão de ícone de 44x44 para o `trailing` de uma Row das listas do usuário
// (remover dos favoritos, "mais ações"). É um Pressable simples, não um
// PressScale, porque a linha já escala ao toque e dois PressScale aninhados
// dobram a escala.
export default function RowIconButton({ icon, label, onPress, color }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={icon} size={tokens.icon.md} color={color ?? colors.tint} />
    </Pressable>
  );
}
