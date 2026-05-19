import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { watchHighlights, removeHighlight } from '../services/userData';
import { getBook } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { shareHighlight } from '../utils/share';

export default function HighlightsScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchHighlights((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const open = (h) => {
    navigation.navigate('Bíblia', {
      bookId: h.bookId,
      chapter: h.chapter,
      highlightVerse: h.verse,
    });
  };

  const confirmRemove = (h) => {
    Alert.alert('Remover marcação?', 'Esta marcação será excluída.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeHighlight(h.id) },
    ]);
  };

  const styles = makeStyles(colors, fs);

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>Carregando...</Text></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="bookmark-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>Nenhuma marcação ainda</Text>
        <Text style={styles.muted}>
          Toque e segure em um versículo na Bíblia para criar uma marcação.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={items}
      keyExtractor={(h) => h.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      renderItem={({ item }) => {
        const book = getBook(item.bookId);
        const ch = getChapter(item.bookId, item.chapter);
        const verseText = ch?.verses?.find((v) => v.n === item.verse)?.t || '';
        const onShare = () => shareHighlight({
          bookName: book?.name || '',
          chapter: item.chapter,
          verse: item.verse,
          text: verseText,
        });
        return (
          <TouchableOpacity style={styles.card} onPress={() => open(item)} onLongPress={() => confirmRemove(item)}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.ref}>
                {book?.name} {item.chapter},{item.verse}
              </Text>
              {verseText ? (
                <Text style={styles.verseText} numberOfLines={3}>{verseText}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
              <Ionicons name="share-social-outline" size={18} color={colors.accent} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12, backgroundColor: c.bg },
    emptyTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(20) },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    colorBar: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
    ref: { fontSize: fs(14), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    verseText: { fontSize: fs(13), color: c.text, lineHeight: fs(18) },
    shareBtn: { padding: 8 },
  });
