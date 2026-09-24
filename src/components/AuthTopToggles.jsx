import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PressScale } from './ui';

// Pílulas de tema (claro/escuro) e idioma no canto superior direito, usadas nas
// telas de entrada: Onboarding, Login e Cadastro. Cada pílula tem 44 de altura
// (o alvo vem do tamanho, sem área extra de toque), ícone `icon.md` na cor `tint` e rótulo
// em `textSubtle`. O tema expõe `aria-pressed` (ligado = escuro).
export default function AuthTopToggles() {
  const { colors, tokens, text, darkMode, setDarkMode } = useTheme();
  const { lang, setLang } = useLanguage();
  const insets = useSafeAreaInsets();
  const { space, radius, icon } = tokens;
  const isEn = lang === 'en';

  const pill = {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: space.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + space.xs,
        right: space.md,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
      }}
    >
      <PressScale
        role="button"
        aria-label={isEn ? (darkMode ? 'Light theme' : 'Dark theme') : (darkMode ? 'Tema claro' : 'Tema escuro')}
        aria-pressed={darkMode}
        onPress={() => setDarkMode(!darkMode)}
        style={pill}
      >
        <Ionicons name={darkMode ? 'sunny-outline' : 'moon-outline'} size={icon.md} color={colors.tint} />
      </PressScale>
      <PressScale
        role="button"
        aria-label={isEn ? 'Switch language to Portuguese' : 'Mudar o idioma para inglês'}
        onPress={() => setLang(isEn ? 'pt' : 'en')}
        style={pill}
      >
        <Ionicons name="language-outline" size={icon.md} color={colors.tint} />
        <Text style={[text('subhead'), { color: colors.textSubtle, fontWeight: '600' }]}>
          {isEn ? 'Português' : 'English'}
        </Text>
      </PressScale>
    </View>
  );
}
