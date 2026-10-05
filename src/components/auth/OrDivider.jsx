import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Divisor "ou" entre os campos e as outras formas de entrar (Login, Cadastro):
// hairline, "ou"/"or" em footnote secundário, hairline. Um só visual.
export default function OrDivider() {
  const { colors, tokens, text } = useTheme();
  const { isEn } = useLanguage();
  const { space } = tokens;
  const line = { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.separator };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.md }}>
      <View style={line} />
      <Text style={[text('footnote'), { color: colors.textSubtle }]}>{isEn ? 'or' : 'ou'}</Text>
      <View style={line} />
    </View>
  );
}
