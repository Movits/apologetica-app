import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { watchNotes } from '../services/userData';
import { getBook, bookName } from '../data/bible';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function NotesScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const { user, exitGuest } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const unsub = watchNotes((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const formatRef = (n) => {
    const book = getBook(n.bookId);
    const range = n.verseStart === n.verseEnd ? `${n.verseStart}` : `${n.verseStart}-${n.verseEnd}`;
    const sep = isEn ? ':' : ',';
    return `${bookName(book, isEn)} ${n.chapter}${sep}${range}`;
  };

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>{t('common.loading')}</Text></View>;
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>{t('empty.createAccount')}</Text>
        <Text style={styles.muted}>
          {isEn
            ? 'Notes are saved and synced between devices when you have an account.'
            : 'Notas ficam salvas e sincronizadas entre dispositivos quando você tem conta.'}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
          onPress={() => exitGuest()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fs(14) }}>{t('auth.signup')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={56} color={colors.textSubtle} />
          <Text style={styles.emptyTitle}>{t('empty.notes')}</Text>
          <Text style={styles.muted}>
            {isEn
              ? 'Touch and hold a verse in the Bible and choose "Note" to create your first note.'
              : 'Toque e segure em um versículo na Bíblia e escolha "Anotar" para criar sua primeira nota.'}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(n) => n.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            onLayout={onLayout}
            scrollEventThrottle={32}
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
          <ScrollHint direction="up" visible={showTop} />
          <ScrollHint direction="down" visible={showBottom} />
        </>
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
