import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

// Aviso inline para o modo visitante: cadeado, mensagem e dois botões (entrar
// em primary, alternativa em plain). Os rótulos chegam por props, as strings
// `gate.*` entram noutra onda.
export default function GateNotice({
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  style,
}) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon } = tokens;

  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: radius.md, padding: space.md, gap: space.sm },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Ionicons name="lock-closed-outline" size={icon.md} color={colors.tint} />
        <Text style={[text('subhead'), { color: colors.text, flex: 1 }]}>{message}</Text>
      </View>
      {primaryLabel ? <Button variant="primary" label={primaryLabel} onPress={onPrimary} /> : null}
      {secondaryLabel ? <Button variant="plain" label={secondaryLabel} onPress={onSecondary} /> : null}
    </View>
  );
}
