import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Pílulas de tema (claro/escuro) e idioma no canto superior direito.
// Usado nas telas de entrada: Onboarding, Login e Cadastro.
export default function AuthTopToggles() {
  const { colors, fs, darkMode, setDarkMode } = useTheme();
  const { lang, setLang } = useLanguage();
  const styles = makeStyles(colors, fs);

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.pill} onPress={() => setDarkMode(!darkMode)} hitSlop={12}>
        <Ionicons name={darkMode ? 'sunny-outline' : 'moon-outline'} size={14} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.pill} onPress={() => setLang(lang === 'pt' ? 'en' : 'pt')} hitSlop={12}>
        <Ionicons name="language-outline" size={14} color={colors.textMuted} />
        <Text style={styles.langText}>{lang === 'pt' ? 'English' : 'Português'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    row: {
      position: 'absolute', top: 50, right: 20, zIndex: 10,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
      borderWidth: 1, borderColor: c.divider, backgroundColor: c.card,
    },
    langText: { color: c.textMuted, fontSize: fs(11), fontWeight: '600' },
  });
