import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppIcon from './AppIcon';

// Banner de seção reutilizável (ícone + título + descrição + contagem).
// Fundo opaco para servir como cabeçalho fixo (sticky) em SectionList sem
// deixar o conteúdo aparecer por baixo. Usado em Artigos, Referências e
// na página dedicada de categoria.
export default function SectionBanner({ iconSet = 'ion', icon, title, subtitle, countLabel }) {
  const { colors, fs } = useTheme();
  const styles = makeStyles(colors, fs);
  return (
    <View style={styles.banner}>
      <View style={styles.iconBox}>
        <AppIcon set={iconSet} name={icon} size={24} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {countLabel ? <Text style={styles.count}>{countLabel}</Text> : null}
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: c.bg,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
    },
    iconBox: {
      width: 46, height: 46, borderRadius: 11, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    title: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    subtitle: { fontSize: fs(12), color: c.textMuted, marginTop: 2, lineHeight: fs(17) },
    count: { fontSize: fs(10), color: c.accentText, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  });
