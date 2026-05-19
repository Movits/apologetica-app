import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import VerseOfDayCard from '../components/VerseOfDayCard';
import LiturgyCard from '../components/LiturgyCard';

const HIGHLIGHTS = [
  { icon: 'book-outline', label: 'Artigos de Apologética', sub: 'Textos para responder dúvidas', tab: 'Artigos' },
  { icon: 'library-outline', label: 'Versículos e Referências', sub: 'Bíblia, Catecismo, documentos', tab: 'Referências' },
  { icon: 'bookmark-outline', label: 'Bíblia Sagrada', sub: 'Leia as Escrituras no app', tab: 'Bíblia' },
];

const STUDY = [
  { icon: 'color-fill-outline', label: 'Minhas Marcações', screen: 'Highlights' },
  { icon: 'document-text-outline', label: 'Minhas Notas', screen: 'Notes' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { user } = useAuth();
  const styles = makeStyles(colors, fs);

  const openVerse = ({ bookId, chapter, verse }) => {
    navigation.navigate('Bíblia', { bookId, chapter, highlightVerse: verse });
  };

  const openSearch = () => navigation.navigate('Search');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✝</Text>
        <Text style={styles.heroTitle}>APPologética</Text>
        <Text style={styles.heroSub}>
          Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós.
        </Text>
        <Text style={styles.heroRef}>1 Pedro 3,15</Text>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={openSearch}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <Text style={styles.searchPlaceholder}>Buscar em todo o app...</Text>
      </TouchableOpacity>

      <VerseOfDayCard onOpen={openVerse} />

      <LiturgyCard onOpen={() => navigation.navigate('Liturgy')} />

      <Text style={styles.sectionTitle}>Explorar</Text>
      {HIGHLIGHTS.map((item) => (
        <TouchableOpacity
          key={item.tab}
          style={styles.card}
          onPress={() => navigation.navigate(item.tab)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardSub}>{item.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}

      {user && (
        <>
          <Text style={styles.sectionTitle}>Meu Estudo</Text>
          {STUDY.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={item.icon} size={22} color={colors.primaryText} />
              </View>
              <Text style={[styles.cardLabel, { flex: 1 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 14, paddingBottom: 30 },
    hero: {
      alignItems: 'center', backgroundColor: c.primary, borderRadius: 14,
      padding: 16, marginBottom: 10,
    },
    heroIcon: { fontSize: fs(28), color: c.accent },
    heroTitle: { color: '#fff', fontSize: fs(20), fontWeight: 'bold', marginTop: 4 },
    heroSub: {
      color: c.heroSub,
      fontSize: fs(11),
      textAlign: 'center',
      marginTop: 6,
      lineHeight: fs(15),
    },
    heroRef: { color: c.accent, fontSize: fs(11), marginTop: 6, fontStyle: 'italic', fontWeight: 'bold' },
    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
      marginBottom: 10,
    },
    searchPlaceholder: { color: c.textSubtle, fontSize: fs(13) },
    sectionTitle: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText, marginBottom: 8, marginTop: 8 },
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderRadius: 10, padding: 12, marginBottom: 8, gap: 12,
    },
    cardIcon: {
      width: 36, height: 36, borderRadius: 8, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    cardLabel: { fontSize: fs(14), color: c.text, fontWeight: '600' },
    cardSub: { fontSize: fs(11), color: c.textMuted, marginTop: 1 },
  });
