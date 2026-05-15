import { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { articles } from '../data/articles';
import { referenceById } from '../data/references';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = ['Todos', 'Existência de Deus', 'Igreja Católica', 'Sagrada Escritura', 'Moral', 'Outros'];

export default function ArticlesScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [selected, setSelected] = useState(null);

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todos' || a.category === category;
    return matchSearch && matchCat;
  });

  const openReference = (refId) => {
    setSelected(null);
    setTimeout(() => {
      navigation.navigate('Referências', { highlightId: refId });
    }, 250);
  };

  const styles = makeStyles(colors, fs);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artigos..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textSubtle}
        />
      </View>

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
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCat}>{item.category}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
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
                  <Text style={styles.refHint}>Toque em qualquer referência para abrir o texto completo.</Text>
                  {selected.references.map((refId) => {
                    const r = referenceById(refId);
                    if (!r) return null;
                    return (
                      <TouchableOpacity
                        key={refId}
                        style={styles.refItem}
                        onPress={() => openReference(refId)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.refItemRef}>{r.ref}</Text>
                          <Text style={styles.refItemSource}>
                            {r.fullSource} {r.author ? `(${r.author}` : ''}{r.year ? `, ${r.year})` : r.author ? ')' : ''}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      marginBottom: 8,
      backgroundColor: c.card,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 42, fontSize: fs(15), color: c.text },
    catList: { maxHeight: 44, paddingLeft: 16, marginBottom: 4 },
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
    cardTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primary, marginBottom: 4 },
    cardSummary: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18) },
    empty: { textAlign: 'center', color: c.textSubtle, marginTop: 40, fontSize: fs(15) },
    modal: { flex: 1, backgroundColor: c.bg },
    modalClose: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, gap: 8 },
    modalCloseText: { fontSize: fs(16), color: c.primary },
    modalContent: { padding: 20, paddingBottom: 60 },
    modalCat: { fontSize: fs(12), color: c.accent, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
    modalTitle: { fontSize: fs(22), fontWeight: 'bold', color: c.primary, marginBottom: 16 },
    modalBody: { fontSize: fs(16), color: c.text, lineHeight: fs(26) },
    refBox: { marginTop: 28, backgroundColor: c.card, borderRadius: 12, padding: 16 },
    refTitle: { fontWeight: 'bold', color: c.primary, marginBottom: 4, fontSize: fs(15) },
    refHint: { fontSize: fs(11), color: c.textSubtle, marginBottom: 10, fontStyle: 'italic' },
    refItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      gap: 8,
    },
    refItemRef: { fontSize: fs(14), color: c.primary, fontWeight: '600' },
    refItemSource: { fontSize: fs(11), color: c.textMuted, marginTop: 2 },
  });
