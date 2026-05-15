import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const HIGHLIGHTS = [
  { icon: 'book-outline', label: 'Artigos de Apologética', sub: 'Textos para responder dúvidas comuns', tab: 'Artigos' },
  { icon: 'library-outline', label: 'Versículos e Referências', sub: 'Bíblia, Catecismo, documentos', tab: 'Referências' },
  { icon: 'bookmark-outline', label: 'Bíblia Sagrada', sub: 'Leia as Escrituras no app', tab: 'Bíblia' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const styles = makeStyles(colors, fs);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✝</Text>
        <Text style={styles.heroTitle}>Apologética Católica</Text>
        <Text style={styles.heroSub}>
          Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós.
        </Text>
        <Text style={styles.heroRef}>1 Pedro 3,15</Text>
      </View>

      <Text style={styles.sectionTitle}>Explorar</Text>
      {HIGHLIGHTS.map((item) => (
        <TouchableOpacity
          key={item.tab}
          style={styles.card}
          onPress={() => navigation.navigate(item.tab)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20, paddingBottom: 40 },
    hero: {
      alignItems: 'center',
      backgroundColor: c.primary,
      borderRadius: 16,
      padding: 28,
      marginBottom: 28,
    },
    heroIcon: { fontSize: fs(40), color: c.accent },
    heroTitle: { color: '#fff', fontSize: fs(22), fontWeight: 'bold', marginTop: 10 },
    heroSub: { color: c.heroSub, fontSize: fs(14), textAlign: 'center', marginTop: 10, lineHeight: fs(20) },
    heroRef: { color: c.accent, fontSize: fs(13), marginTop: 10, fontStyle: 'italic', fontWeight: 'bold' },
    sectionTitle: { fontSize: fs(18), fontWeight: 'bold', color: c.primary, marginBottom: 12 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      gap: 14,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.badgeBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardLabel: { fontSize: fs(16), color: c.text, fontWeight: '600' },
    cardSub: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
  });
