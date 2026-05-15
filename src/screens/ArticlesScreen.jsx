import { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { articles } from '../data/articles';

const COLORS = { primary: '#1a3a5c', accent: '#c9a84c', bg: '#f5f0e8' };

const CATEGORIES = ['Todos', 'Existência de Deus', 'Igreja Católica', 'Sagrada Escritura', 'Moral', 'Outros'];

export default function ArticlesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [selected, setSelected] = useState(null);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todos' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artigos..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
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
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCat}>{item.category}</Text>
              <Ionicons name="chevron-forward" size={16} color="#aaa" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            <Text style={styles.modalCloseText}>Voltar</Text>
          </TouchableOpacity>
          {selected && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalCat}>{selected.category}</Text>
              <Text style={styles.modalTitle}>{selected.title}</Text>
              <Text style={styles.modalBody}>{selected.body}</Text>
              {selected.references?.length > 0 && (
                <View style={styles.refBox}>
                  <Text style={styles.refTitle}>Referências</Text>
                  {selected.references.map((r, i) => (
                    <Text key={i} style={styles.refItem}>• {r}</Text>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 42, fontSize: 15, color: '#222' },
  catList: { maxHeight: 44, paddingLeft: 16, marginBottom: 4 },
  catChip: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff',
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: '#555' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardCat: { fontSize: 11, color: COLORS.accent, fontWeight: 'bold', textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  cardSummary: { fontSize: 13, color: '#555', lineHeight: 18 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  modal: { flex: 1, backgroundColor: COLORS.bg },
  modalClose: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, gap: 8 },
  modalCloseText: { fontSize: 16, color: COLORS.primary },
  modalContent: { padding: 20, paddingBottom: 60 },
  modalCat: { fontSize: 12, color: COLORS.accent, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 16 },
  modalBody: { fontSize: 16, color: '#333', lineHeight: 26 },
  refBox: { marginTop: 28, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  refTitle: { fontWeight: 'bold', color: COLORS.primary, marginBottom: 8, fontSize: 15 },
  refItem: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 20 },
});
