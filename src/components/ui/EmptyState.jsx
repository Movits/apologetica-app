import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

// Estado vazio centralizado: ícone discreto, título em headline, mensagem em
// subhead secundário e ação opcional ({ label, onPress }) como botão
// secundário de largura própria.
export default function EmptyState({ icon = 'folder-open-outline', title, message, action, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, icon: iconSize } = tokens;

  return (
    <View style={[{ alignItems: 'center', padding: space.xl, gap: space.xs }, style]}>
      {icon ? <Ionicons name={icon} size={iconSize.lg} color={colors.textTertiary} /> : null}
      {title ? (
        <Text style={[text('headline'), { color: colors.text, textAlign: 'center' }]}>{title}</Text>
      ) : null}
      {message ? (
        <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>{message}</Text>
      ) : null}
      {action ? (
        <Button
          variant="secondary"
          full={false}
          label={action.label}
          onPress={action.onPress}
          style={{ marginTop: space.sm }}
        />
      ) : null}
    </View>
  );
}
