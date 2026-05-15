import { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { references } from '../data/references';

const COLORS = { primary: '#1a3a5c', accent: '#c9a84c', bg: '#f5f0e8' };

const SOURCES = ['Todos', 'Bíblia', 'CIC', 'Documentos'];

export default function ReferencesScreen() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('Todos');
  const [expanded, setExpanded] = useState(null);

  const filtered = references.filter((r) => {
    const matchSearch =
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase()) ||
      r.topic.toLowerCase().includes(search.toLowerCase());
    const matchSource = source === 'Todos' || r.source === source;
    return matchSearch && matchSource;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar versículo, tema..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
      </View>

      <FlatList
        horizontal
        data={SOURCES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.sourceList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, source === item && styles.chipActive]}
            onPress={() => setSource(item)}
          >
            <Text style={[styles.chipText, source === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.ref}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma referência encontrada.</Text>}
        renderItem={({ item }) => {
          const isOpen = expanded === item.ref;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setExpanded(isOpen ? null : item.ref)}
            >
              <View style={styles.cardTop}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.source}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#aaa" />
              </View>
              <Text style={styles.cardRef}>{item.ref}</Text>
              <Text style={styles.cardTopic}>{item.topic}</Text>
              {isOpen && <Text style={styles.cardText}>{item.text}</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, marginBottom: 8, backgroundColor: '#fff',
    borderRadius: 10, paddingHorizontal: 12, elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 42, fontSize: 15, color: '#222' },
  sourceList: { maxHeight: 44, paddingLeft: 16, marginBottom: 4 },
  chip: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { backgroundColor: '#eef2f7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  cardRef: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  cardTopic: { fontSize: 12, color: '#888', marginTop: 2 },
  cardText: { fontSize: 15, color: '#333', lineHeight: 24, marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});
