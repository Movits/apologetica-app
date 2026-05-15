import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = { primary: '#1a3a5c', accent: '#c9a84c', bg: '#f5f0e8' };

const HIGHLIGHTS = [
  { icon: 'book-outline', label: 'Artigos de Apologética', tab: 'Artigos' },
  { icon: 'library-outline', label: 'Versículos e Referências', tab: 'Referências' },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✝</Text>
        <Text style={styles.heroTitle}>Apologética Católica</Text>
        <Text style={styles.heroSub}>
          Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós.
        </Text>
        <Text style={styles.heroRef}>— 1 Pedro 3,15</Text>
      </View>

      <Text style={styles.sectionTitle}>Explorar</Text>
      {HIGHLIGHTS.map((item) => (
        <TouchableOpacity
          key={item.tab}
          style={styles.card}
          onPress={() => navigation.navigate(item.tab)}
        >
          <Ionicons name={item.icon} size={28} color={COLORS.primary} />
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={20} color="#aaa" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 28,
    marginBottom: 28,
  },
  heroIcon: { fontSize: 40, color: '#c9a84c' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  heroSub: { color: '#ccd9e8', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  heroRef: { color: COLORS.accent, fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  cardLabel: { flex: 1, fontSize: 16, color: '#222' },
});
