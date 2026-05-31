import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { watchHighlights, removeHighlight } from '../services/userData';
import { confirmAction } from '../utils/dialog';
import { getBook, bookName } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shareHighlight } from '../utils/share';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function HighlightsScreen({ navigation }) {
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
    const unsub = watchHighlights((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const open = (h) => {
    navigation.navigate('Bíblia', {
      bookId: h.bookId,
      chapter: h.chapter,
      highlightVerse: h.verse,
    });
  };

  const confirmRemove = (h) => {
    confirmAction({
      title: isEn ? 'Remove highlight?' : 'Remover marcação?',
      message: isEn ? 'This highlight will be deleted.' : 'Esta marcação será excluída.',
      confirmText: t('common.remove'),
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: () => removeHighlight(h.id),
    });
  };

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (loading) {
    return <View style={styles.center}><Text style={styles.muted}>{t('common.loading')}</Text></View>;
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>{t('empty.createAccount')}</Text>
        <Text style={styles.muted}>
          {isEn
            ? 'Highlights are saved and synced between devices when you have an account.'
            : 'Marcações ficam salvas e sincronizadas entre dispositivos quando você tem conta.'}
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

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="bookmark-outline" size={56} color={colors.textSubtle} />
        <Text style={styles.emptyTitle}>{t('empty.highlights')}</Text>
        <Text style={styles.muted}>
          {isEn
            ? 'Touch and hold a verse in the Bible to create a highlight.'
            : 'Toque e segure em um versículo na Bíblia para criar uma marcação.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <FlatList
      data={items}
      keyExtractor={(h) => h.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      scrollEventThrottle={32}
      renderItem={({ item }) => {
        const book = getBook(item.bookId);
        const bn = bookName(book, isEn);
        const ch = getChapter(item.bookId, item.chapter, isEn ? 'en' : 'pt');
        const verseText = ch?.verses?.find((v) => v.n === item.verse)?.t || '';
        const sep = isEn ? ':' : ',';
        const onShare = () => shareHighlight({
          bookName: bn,
          chapter: item.chapter,
          verse: item.verse,
          text: verseText,
        });
        return (
          <TouchableOpacity style={styles.card} onPress={() => open(item)} onLongPress={() => confirmRemove(item)}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.ref}>
                {bn} {item.chapter}{sep}{item.verse}
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
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
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
