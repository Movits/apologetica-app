import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Título de seção em display (text('section')) com ação opcional à direita
// ({ label, onPress }). A ação tem alvo de 44 sem esticar a linha: o excedente
// vira margem negativa, então o espaçamento do título não muda com a ação.
export default function SectionTitle({ title, children, action, style }) {
  const { colors, tokens, text } = useTheme();
  const { space } = tokens;
  const sectionText = text('section');
  const bleed = Math.max(0, (44 - sectionText.lineHeight) / 2);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: space.xl,
          marginBottom: space.sm,
          marginHorizontal: space.md,
        },
        style,
      ]}
    >
      <Text role="heading" style={[sectionText, { color: colors.text, flex: 1 }]}>
        {title ?? children}
      </Text>
      {action ? (
        <Pressable
          role="button"
          onPress={action.onPress}
          style={{ minHeight: 44, justifyContent: 'center', paddingLeft: space.sm, marginVertical: -bleed }}
        >
          <Text style={[text('subhead'), { color: colors.tint }]}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
