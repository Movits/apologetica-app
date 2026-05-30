import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Banner exibido só na web: convida a baixar o app nas lojas.
// Botões marcados "Em breve" enquanto o app não está publicado.
export default function WebDownloadBanner() {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();

  if (Platform.OS !== 'web') return null;

  const styles = makeStyles(colors, fs);
  const soon = isEn ? 'Coming soon' : 'Em breve';

  const StoreButton = ({ icon, store }) => (
    <View style={styles.storeBtn}>
      <Ionicons name={icon} size={20} color={colors.textSubtle} />
      <View>
        <Text style={styles.storeSmall}>{soon}</Text>
        <Text style={styles.storeName}>{store}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />
        <Text style={styles.title}>{isEn ? 'Get the app' : 'Baixe o app'}</Text>
      </View>
      <Text style={styles.sub}>
        {isEn
          ? 'Take APPologética with you, fully offline, on your phone.'
          : 'Leve o APPologética com você, 100% offline, no seu celular.'}
      </Text>
      <View style={styles.stores}>
        <StoreButton icon="logo-apple" store="App Store" />
        <StoreButton icon="logo-google-playstore" store="Google Play" />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: c.accent,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    title: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText },
    sub: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(17), marginBottom: 12 },
    stores: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    storeBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderWidth: 1, borderColor: c.divider, borderRadius: 10,
      paddingVertical: 8, paddingHorizontal: 14, opacity: 0.7,
    },
    storeSmall: { fontSize: fs(9), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 },
    storeName: { fontSize: fs(13), color: c.text, fontWeight: '600' },
  });
