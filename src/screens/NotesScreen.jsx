import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { watchNotes } from '../services/userData';
import { getBook } from '../data/bible';
import { useTheme } from '../context/ThemeContext';

export default function NotesScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchNotes((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const formatRef = (n) => {
    const book = getBook(n.bookId);
    const range = n.verseStart === n.verseEnd ? `${n.verseStart}` : `${n.verseStart}-${n.verseEnd}`;
    return `${book?.name} ${n.chapter},${range}`;
  };

  const styles = makeStyles(colors, fs);

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>Carregando...</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={56} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>Nenhuma nota ainda</Text>
          <Text style={styles.muted}>
            Toque e segure em um versículo na Bíblia e escolha "Anotar" para criar sua primeira nota.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
            >
              <Text style={styles.ref}>{formatRef(item)}</Text>
              <Text style={styles.body} numberOfLines={4}>{item.text}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(20) },
    card: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8 },
    ref: { fontSize: fs(13), fontWeight: 'bold', color: c.accent, marginBottom: 6 },
    body: { fontSize: fs(14), color: c.text, lineHeight: fs(20) },
  });
