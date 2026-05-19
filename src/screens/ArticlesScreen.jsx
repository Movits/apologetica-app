import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Todos', 'Existência de Deus', 'Igreja Católica', 'Sagrada Escritura', 'Moral', 'Outros'];

export default function ArticlesScreen({ route }) {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const [category, setCategory] = useState('Todos');

  // Abre artigo específico via deep link (da busca global)
  useEffect(() => {
    if (route?.params?.openId) {
      navigation.navigate('ArticleDetail', { articleId: route.params.openId });
      navigation.setParams?.({ openId: undefined });
    }
  }, [route?.params?.openId]);

  // Reseta categoria ao tocar no tab de novo
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        setCategory('Todos');
      }
    });
    return unsub;
  }, [navigation]);

  const filtered = articles.filter((a) =>
    category === 'Todos' || a.category === category
  );

  const styles = makeStyles(colors, fs);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item && styles.catChipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.catText, category === item && styles.catTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum artigo encontrado.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardCat}>{item.category}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    catList: { maxHeight: 60, paddingLeft: 16, paddingTop: 14, marginBottom: 4 },
    catChip: {
      borderWidth: 1,
      borderColor: c.divider,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: c.card,
    },
    catChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    catText: { fontSize: fs(13), color: c.textMuted },
    catTextActive: { color: '#fff', fontWeight: 'bold' },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    cardCat: { fontSize: fs(11), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase' },
    cardTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    cardSummary: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18) },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
  });
