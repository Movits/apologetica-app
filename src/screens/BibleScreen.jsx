import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { shareVerse } from '../utils/share';
import { BIBLE_BOOKS } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  watchChapterHighlights, watchChapterNotes,
  addHighlight, removeHighlight,
} from '../services/userData';

const HIGHLIGHT_COLORS = [
  { key: 'yellow', value: '#fff3a6' },
  { key: 'green', value: '#c8f0c0' },
  { key: 'blue', value: '#c4dffb' },
  { key: 'pink', value: '#f8c4d3' },
  { key: 'orange', value: '#ffd9a8' },
];

export default function BibleScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { user } = useAuth();
  const [view, setView] = useState('books');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [highlightVerse, setHighlightVerse] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [actionVerse, setActionVerse] = useState(null);
  const [chapterHighlights, setChapterHighlights] = useState([]);
  const [chapterNotes, setChapterNotes] = useState([]);
  const verseListRef = useRef(null);

  // Deep link de uma referência
  useEffect(() => {
    const params = route?.params;
    if (params?.bookId) {
      const b = BIBLE_BOOKS.find((x) => x.id === params.bookId);
      if (b) {
        setBook(b);
        if (params.chapter) {
          setChapter(params.chapter);
          setHighlightVerse(params.highlightVerse ?? null);
          setView('verses');
        } else {
          setView('chapters');
        }
        navigation?.setParams?.({ bookId: undefined, chapter: undefined, highlightVerse: undefined });
      }
    }
  }, [route?.params?.bookId, route?.params?.chapter, route?.params?.highlightVerse]);

  // Volta pro início da seção quando o usuário aperta o tab Bíblia de novo
  useEffect(() => {
    const unsub = navigation?.addListener?.('tabPress', () => {
      if (navigation.isFocused() && view !== 'books') {
        setView('books');
        setBook(null);
        setChapter(null);
        setHighlightVerse(null);
        setFilterText('');
      }
    });
    return unsub;
  }, [navigation, view]);

  const chapterData = useMemo(() => {
    if (view !== 'verses' || !book || !chapter) return null;
    return getChapter(book.id, chapter);
  }, [view, book?.id, chapter]);

  // Subscreve às marcações e notas deste capítulo
  useEffect(() => {
    if (view !== 'verses' || !book || !chapter || !user) {
      setChapterHighlights([]);
      setChapterNotes([]);
      return;
    }
    const u1 = watchChapterHighlights(book.id, chapter, setChapterHighlights);
    const u2 = watchChapterNotes(book.id, chapter, setChapterNotes);
    return () => { u1(); u2(); };
  }, [view, book?.id, chapter, user]);

  // Mapa: { verseNumber: highlight }
  const highlightsByVerse = useMemo(() => {
    const map = {};
    chapterHighlights.forEach((h) => { map[h.verse] = h; });
    return map;
  }, [chapterHighlights]);

  // Verses with notes (Set of verse numbers covered)
  const versesWithNotes = useMemo(() => {
    const s = new Set();
    chapterNotes.forEach((n) => {
      for (let v = n.verseStart; v <= n.verseEnd; v++) s.add(v);
    });
    return s;
  }, [chapterNotes]);

  // Scroll até versículo destacado
  useEffect(() => {
    if (!chapterData?.verses?.length || !highlightVerse) return;
    const idx = chapterData.verses.findIndex((v) => v.n === highlightVerse);
    if (idx >= 0 && verseListRef.current) {
      setTimeout(() => {
        verseListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
      }, 350);
    }
  }, [chapterData, highlightVerse]);

  const onLongPressVerse = (verse) => {
    if (!user) {
      Alert.alert('Entre na sua conta', 'Faça login em Ajustes para marcar e anotar versículos.');
      return;
    }
    setActionVerse(verse);
  };

  const applyHighlight = async (color) => {
    if (!actionVerse) return;
    const existing = highlightsByVerse[actionVerse.n];
    try {
      if (existing) await removeHighlight(existing.id);
      if (!existing || existing.color !== color) {
        await addHighlight({ bookId: book.id, chapter, verse: actionVerse.n, color });
      }
    } catch (e) {
      Alert.alert('Erro', e.message || 'Não consegui salvar a marcação.');
    }
    setActionVerse(null);
  };

  const openNoteEditor = () => {
    if (!actionVerse) return;
    const v = actionVerse;
    setActionVerse(null);
    navigation.navigate('NoteEditor', {
      bookId: book.id,
      chapter,
      verseStart: v.n,
      verseEnd: v.n,
    });
  };

  const copyVerse = async () => {
    if (!actionVerse) return;
    const refText = `${book.name} ${chapter},${actionVerse.n}\n${actionVerse.t}`;
    await Clipboard.setStringAsync(refText);
    setActionVerse(null);
    Alert.alert('Copiado', 'Versículo copiado para a área de transferência.');
  };

  const shareVerseFromMenu = () => {
    if (!actionVerse) return;
    const v = actionVerse;
    setActionVerse(null);
    shareVerse({ bookName: book.name, chapter, verse: v.n, text: v.t });
  };

  const styles = makeStyles(colors, fs);

  // ===== LIVROS =====
  if (view === 'books') {
    const q = filterText.trim().toLowerCase();
    const filtered = q
      ? BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(q) || b.short.toLowerCase().includes(q))
      : BIBLE_BOOKS;

    const grouped = filtered.reduce((acc, b) => {
      const key = b.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento';
      (acc[key] = acc[key] || []).push(b);
      return acc;
    }, {});

    return (
      <View style={styles.container}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Bíblia Sagrada</Text>
          <Text style={styles.introSub}>
            73 livros do cânon católico, tradução Ave Maria. Toque e segure num versículo para marcar ou anotar.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={colors.textSubtle} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livro..."
            value={filterText}
            onChangeText={setFilterText}
            placeholderTextColor={colors.textSubtle}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {Object.entries(grouped).map(([groupName, books]) => (
            <View key={groupName}>
              <Text style={styles.groupHeader}>{groupName}</Text>
              {books.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.bookRow}
                  onPress={() => { setBook(b); setView('chapters'); }}
                >
                  <View style={styles.bookAbbrev}>
                    <Text style={styles.bookAbbrevText}>{b.short}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookName}>{b.name}</Text>
                    <Text style={styles.bookMeta}>
                      {b.totalChapters} capítulo{b.totalChapters > 1 ? 's' : ''}
                      {b.deutero ? ' · deuterocanônico' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ===== CAPÍTULOS =====
  if (view === 'chapters' && book) {
    const allChapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setView('books')}>
          <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
          <Text style={styles.backText}>Livros</Text>
        </TouchableOpacity>
        <Text style={styles.bookHeader}>{book.name}</Text>
        <FlatList
          key="chapters-grid"
          data={allChapters}
          keyExtractor={(c) => String(c)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chapterCell}
              onPress={() => { setChapter(item); setHighlightVerse(null); setView('verses'); }}
            >
              <Text style={styles.chapterCellText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ===== VERSÍCULOS =====
  if (view === 'verses' && book && chapter) {
    const hasPrev = chapter > 1;
    const hasNext = chapter < book.totalChapters;
    const isEmpty = !chapterData?.verses?.length;
    const goPrev = () => { if (hasPrev) { setHighlightVerse(null); setChapter(chapter - 1); } };
    const goNext = () => { if (hasNext) { setHighlightVerse(null); setChapter(chapter + 1); } };

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => { setChapter(null); setHighlightVerse(null); setView('chapters'); }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
          <Text style={styles.backText}>{book.name}</Text>
        </TouchableOpacity>

        <View style={styles.verseHeader}>
          <Text style={styles.verseHeaderTitle}>{book.name} {chapter}</Text>
        </View>

        {isEmpty ? (
          <View style={styles.center}>
            <Ionicons name="time-outline" size={48} color={colors.textSubtle} />
            <Text style={styles.errorText}>Capítulo em preparação</Text>
            <Text style={styles.errorSub}>
              Este capítulo dos livros deuterocanônicos ainda não foi adicionado ao app.
            </Text>
          </View>
        ) : (
          <FlatList
            key="verses-list"
            ref={verseListRef}
            data={chapterData.verses}
            keyExtractor={(v) => String(v.n)}
            contentContainerStyle={styles.verseList}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isDeepLinked = highlightVerse && item.n === highlightVerse;
              const userHighlight = highlightsByVerse[item.n];
              const hasNote = versesWithNotes.has(item.n);
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  delayLongPress={350}
                  onLongPress={() => onLongPressVerse(item)}
                  style={[
                    styles.verseRow,
                    userHighlight && { backgroundColor: userHighlight.color },
                    isDeepLinked && !userHighlight && styles.verseRowDeepLink,
                  ]}
                >
                  <Text style={[styles.verseNum, isDeepLinked && styles.verseNumHighlight]}>
                    {item.n}
                  </Text>
                  <Text style={[
                    styles.verseText,
                    userHighlight && { color: '#1a1a1a' },
                    isDeepLinked && styles.verseTextHighlight,
                  ]}>
                    {item.t}
                  </Text>
                  {hasNote && (
                    <Ionicons name="document-text" size={14} color={colors.accent} style={{ marginLeft: 6, marginTop: 4 }} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={!hasPrev}
          >
            <Ionicons name="chevron-back" size={20} color={hasPrev ? colors.primaryText : colors.textSubtle} />
            <Text style={[styles.navBtnText, !hasPrev && styles.navBtnTextDisabled]}>
              {hasPrev ? `${book.short} ${chapter - 1}` : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.navCurrent}>{chapter}/{book.totalChapters}</Text>
          <TouchableOpacity
            style={[styles.navBtn, !hasNext && styles.navBtnDisabled, { justifyContent: 'flex-end' }]}
            onPress={goNext}
            disabled={!hasNext}
          >
            <Text style={[styles.navBtnText, !hasNext && styles.navBtnTextDisabled]}>
              {hasNext ? `${book.short} ${chapter + 1}` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={hasNext ? colors.primaryText : colors.textSubtle} />
          </TouchableOpacity>
        </View>

        {/* Menu de ações no long-press */}
        <Modal
          visible={!!actionVerse}
          transparent
          animationType="fade"
          onRequestClose={() => setActionVerse(null)}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActionVerse(null)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalRef}>
                {book.name} {chapter},{actionVerse?.n}
              </Text>
              <Text style={styles.modalVerseText} numberOfLines={3}>{actionVerse?.t}</Text>

              <Text style={styles.modalSection}>Marcar com cor</Text>
              <View style={styles.colorRow}>
                {HIGHLIGHT_COLORS.map((c) => {
                  const current = actionVerse && highlightsByVerse[actionVerse.n]?.color === c.value;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.colorDot, { backgroundColor: c.value }, current && styles.colorDotActive]}
                      onPress={() => applyHighlight(c.value)}
                    >
                      {current && <Ionicons name="checkmark" size={18} color="#333" />}
                    </TouchableOpacity>
                  );
                })}
                {actionVerse && highlightsByVerse[actionVerse.n] && (
                  <TouchableOpacity
                    style={styles.removeColorBtn}
                    onPress={() => applyHighlight(highlightsByVerse[actionVerse.n].color)}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={styles.modalAction} onPress={openNoteEditor}>
                <Ionicons name="document-text-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>Anotar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAction} onPress={shareVerseFromMenu}>
                <Ionicons name="share-social-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>Compartilhar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAction} onPress={copyVerse}>
                <Ionicons name="copy-outline" size={20} color={colors.primaryText} />
                <Text style={styles.modalActionText}>Copiar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return null;
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    intro: { margin: 16, marginBottom: 8, padding: 14, backgroundColor: c.card, borderRadius: 12 },
    introTitle: { fontSize: fs(18), fontWeight: 'bold', color: c.primaryText },
    introSub: { fontSize: fs(12), color: c.textMuted, lineHeight: fs(18), marginTop: 6 },
    searchRow: {
      flexDirection: 'row', alignItems: 'center',
      marginHorizontal: 16, marginBottom: 8,
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 12,
    },
    searchInput: { flex: 1, height: 42, fontSize: fs(15), color: c.text },
    groupHeader: {
      fontSize: fs(13), fontWeight: 'bold', color: c.textSubtle,
      textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8,
    },
    bookRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderRadius: 10, padding: 12, marginBottom: 6, gap: 12,
    },
    bookAbbrev: {
      width: 44, height: 44, borderRadius: 10, backgroundColor: c.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    bookAbbrevText: { color: '#fff', fontWeight: 'bold', fontSize: fs(13) },
    bookName: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    bookMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    backRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 6 },
    backText: { fontSize: fs(15), color: c.primaryText },
    bookHeader: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, paddingHorizontal: 16, marginBottom: 12 },
    chapterGrid: { padding: 12 },
    chapterCell: {
      flex: 1, aspectRatio: 1, margin: 4, borderRadius: 8,
      backgroundColor: c.card, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: c.accent,
    },
    chapterCellText: { color: c.primaryText, fontWeight: 'bold', fontSize: fs(15) },
    verseHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingBottom: 8,
    },
    verseHeaderTitle: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText },
    verseList: { padding: 16, paddingBottom: 24 },
    verseRow: { flexDirection: 'row', marginBottom: 10, padding: 8, borderRadius: 8 },
    verseRowDeepLink: { backgroundColor: c.badgeBg },
    verseNum: {
      fontSize: fs(11), color: c.accent, fontWeight: 'bold',
      marginRight: 8, minWidth: 24, paddingTop: 3,
    },
    verseNumHighlight: { color: c.primaryText },
    verseText: { flex: 1, fontSize: fs(15), color: c.text, lineHeight: fs(23) },
    verseTextHighlight: { fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
    errorText: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    errorSub: { fontSize: fs(13), color: c.textMuted, textAlign: 'center', lineHeight: fs(19) },
    navBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, paddingVertical: 10,
      borderTopWidth: 1, borderTopColor: c.divider, backgroundColor: c.card,
    },
    navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, paddingVertical: 6, paddingHorizontal: 8 },
    navBtnDisabled: { opacity: 0.3 },
    navBtnText: { fontSize: fs(13), color: c.primaryText, fontWeight: '600' },
    navBtnTextDisabled: { color: c.textSubtle },
    navCurrent: { fontSize: fs(12), color: c.textMuted, fontWeight: '600', minWidth: 60, textAlign: 'center' },
    // Modal de ações
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, paddingBottom: 32,
    },
    modalRef: { fontSize: fs(15), fontWeight: 'bold', color: c.accent, marginBottom: 4 },
    modalVerseText: { fontSize: fs(14), color: c.text, lineHeight: fs(20), marginBottom: 16 },
    modalSection: { fontSize: fs(12), fontWeight: 'bold', color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    colorRow: { flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'center' },
    colorDot: {
      width: 38, height: 38, borderRadius: 19,
      justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: c.divider,
    },
    colorDotActive: { borderColor: c.primaryText, borderWidth: 2 },
    removeColorBtn: { marginLeft: 4 },
    modalAction: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.divider,
    },
    modalActionText: { fontSize: fs(15), color: c.text, fontWeight: '500' },
  });
