import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIBLE_BOOKS } from '../data/bible';
import { useTheme } from '../context/ThemeContext';

export default function BibleScreen({ route }) {
  const { colors, fs } = useTheme();
  const [view, setView] = useState('books'); // 'books' | 'chapters' | 'verses'
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const highlightVerse = route?.params?.highlightVerse;
  const verseListRef = useRef(null);

  // Deep link: ao receber bookId/chapter/verse pelos params, navegar até o versículo
  useEffect(() => {
    if (route?.params?.bookId && route?.params?.chapter) {
      const b = BIBLE_BOOKS.find((x) => x.id === route.params.bookId);
      if (b && b.chapters[route.params.chapter]) {
        setBook(b);
        setChapter(route.params.chapter);
        setView('verses');
      }
    }
  }, [route?.params]);

  const styles = makeStyles(colors, fs);

  // ===== TELA DE LIVROS =====
  if (view === 'books') {
    const grouped = BIBLE_BOOKS.reduce((acc, b) => {
      const key = b.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento';
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    }, {});

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Bíblia Sagrada</Text>
          <Text style={styles.introSub}>
            Tradução baseada na Bíblia Ave Maria. Capítulos disponíveis: principalmente os referenciados nos artigos. Mais conteúdo será adicionado.
          </Text>
        </View>

        {Object.entries(grouped).map(([groupName, books]) => (
          <View key={groupName}>
            <Text style={styles.groupHeader}>{groupName}</Text>
            {books.map((b) => {
              const available = Object.keys(b.chapters).length;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={styles.bookRow}
                  onPress={() => {
                    setBook(b);
                    setView('chapters');
                  }}
                >
                  <View style={styles.bookAbbrev}>
                    <Text style={styles.bookAbbrevText}>{b.short}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookName}>{b.name}</Text>
                    <Text style={styles.bookMeta}>
                      {available} de {b.totalChapters} capítulos disponíveis
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  }

  // ===== TELA DE CAPÍTULOS =====
  if (view === 'chapters' && book) {
    const available = Object.keys(book.chapters).map(Number).sort((a, b) => a - b);
    const allChapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setView('books')}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Livros</Text>
        </TouchableOpacity>

        <Text style={styles.bookHeader}>{book.name}</Text>

        <FlatList
          data={allChapters}
          keyExtractor={(c) => String(c)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => {
            const has = available.includes(item);
            return (
              <TouchableOpacity
                style={[styles.chapterCell, !has && styles.chapterCellDisabled]}
                disabled={!has}
                onPress={() => {
                  setChapter(item);
                  setView('verses');
                }}
              >
                <Text style={[styles.chapterCellText, !has && styles.chapterCellTextDisabled]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }

  // ===== TELA DE VERSÍCULOS =====
  if (view === 'verses' && book && chapter) {
    const verses = book.chapters[chapter] || [];
    const externalUrl = `https://www.bibliacatolica.com.br/biblia-ave-maria/${book.name.toLowerCase().replace(/ /g, '-')}/${chapter}/`;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            setChapter(null);
            setView('chapters');
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>
            {book.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.verseHeader}>
          <Text style={styles.verseHeaderTitle}>
            {book.name} {chapter}
          </Text>
          <TouchableOpacity
            style={styles.externalBtn}
            onPress={() => Linking.openURL(externalUrl).catch(() => {})}
          >
            <Ionicons name="open-outline" size={16} color={colors.accent} />
            <Text style={styles.externalBtnText}>Ver completo</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={verseListRef}
          data={verses}
          keyExtractor={(_, i) => String(i + 1)}
          contentContainerStyle={styles.verseList}
          renderItem={({ item, index }) => {
            const verseNum = index + 1;
            const isHighlight = highlightVerse && verseNum === highlightVerse;
            const isPlaceholder = item.startsWith('[versículo disponível em breve');
            return (
              <View style={[styles.verseRow, isHighlight && styles.verseRowHighlight]}>
                <Text style={[styles.verseNum, isHighlight && styles.verseNumHighlight]}>
                  {verseNum}
                </Text>
                <Text
                  style={[
                    styles.verseText,
                    isHighlight && styles.verseTextHighlight,
                    isPlaceholder && styles.versePlaceholder,
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          }}
        />
      </View>
    );
  }

  return null;
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    intro: { marginBottom: 16, padding: 14, backgroundColor: c.card, borderRadius: 12 },
    introTitle: { fontSize: fs(18), fontWeight: 'bold', color: c.primary },
    introSub: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(19), marginTop: 6 },
    groupHeader: {
      fontSize: fs(13),
      fontWeight: 'bold',
      color: c.textSubtle,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 16,
      marginBottom: 8,
    },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 6,
      gap: 12,
    },
    bookAbbrev: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookAbbrevText: { color: '#fff', fontWeight: 'bold', fontSize: fs(13) },
    bookName: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    bookMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      gap: 6,
    },
    backText: { fontSize: fs(15), color: c.primary },
    bookHeader: {
      fontSize: fs(22),
      fontWeight: 'bold',
      color: c.primary,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    chapterGrid: { padding: 12 },
    chapterCell: {
      flex: 1,
      aspectRatio: 1,
      margin: 4,
      borderRadius: 8,
      backgroundColor: c.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.divider,
    },
    chapterCellDisabled: { backgroundColor: c.bg, opacity: 0.4 },
    chapterCellText: { color: c.primary, fontWeight: 'bold', fontSize: fs(15) },
    chapterCellTextDisabled: { color: c.textSubtle },
    verseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    verseHeaderTitle: { fontSize: fs(20), fontWeight: 'bold', color: c.primary },
    externalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
    },
    externalBtnText: { color: c.accent, fontSize: fs(12), fontWeight: 'bold' },
    verseList: { padding: 16, paddingBottom: 40 },
    verseRow: {
      flexDirection: 'row',
      marginBottom: 10,
      padding: 8,
      borderRadius: 8,
    },
    verseRowHighlight: { backgroundColor: c.badgeBg },
    verseNum: {
      fontSize: fs(11),
      color: c.accent,
      fontWeight: 'bold',
      marginRight: 8,
      minWidth: 24,
      paddingTop: 3,
    },
    verseNumHighlight: { color: c.primary },
    verseText: { flex: 1, fontSize: fs(15), color: c.text, lineHeight: fs(23) },
    verseTextHighlight: { fontWeight: '600' },
    versePlaceholder: { color: c.textSubtle, fontStyle: 'italic' },
  });
