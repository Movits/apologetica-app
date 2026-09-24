import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { PressScale } from './ui';

// Linha das listas de dados do usuário (favoritos, marcações, notas, páginas
// do caderno). Difere da Row base em três pontos que essas listas pedem:
// título em headline (não body), um nó `leading` livre (o ponto de cor da
// marcação) e `onLongPress` para as ações do item. Layout:
//   [leading] título (headline) ............ [trailing] chevron
//             subtitle (subhead ou bodySerif, `subtitleLines`)
//             caption (footnote terciário)
// `trailing` é um nó, em geral um RowIconButton (o botão de 44 das ações),
// que fica ao lado do chevron.
export default function UserDataRow({
  leading,
  title,
  titleLines = 1,
  subtitle,
  subtitleLines = 2,
  subtitleSerif = false,
  caption,
  trailing,
  onPress,
  onLongPress,
  accessibilityLabel,
}) {
  const { colors, tokens, text } = useTheme();
  const { space, icon } = tokens;

  return (
    <PressScale
      role="button"
      aria-label={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          paddingLeft: space.md,
          paddingRight: trailing ? space.xs : space.md,
          paddingVertical: space.sm,
          gap: space.sm,
        },
        pressed ? { backgroundColor: colors.separator } : null,
      ]}
    >
      {leading ?? null}
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]} numberOfLines={titleLines || undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[text(subtitleSerif ? 'bodySerif' : 'subhead'), { color: subtitleSerif ? colors.text : colors.textSubtle }]}
            numberOfLines={subtitleLines || undefined}
          >
            {subtitle}
          </Text>
        ) : null}
        {caption ? (
          <Text style={[text('footnote'), { color: colors.textTertiary }]} numberOfLines={1}>{caption}</Text>
        ) : null}
      </View>
      {trailing ?? null}
      <Ionicons name="chevron-forward" size={icon.sm} color={colors.textTertiary} />
    </PressScale>
  );
}

// Botão de ícone de 44x44 para dentro de uma UserDataRow (remover dos
// favoritos, "mais ações"). É um Pressable simples, não um PressScale, porque
// a linha já escala ao toque e dois PressScale aninhados dobram a escala.
export function RowIconButton({ icon, label, onPress, color }) {
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
