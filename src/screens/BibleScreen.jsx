import { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView,
  Linking, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIBLE_BOOKS } from '../data/bible';
import { fetchChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';

export default function BibleScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const [view, setView] = useState('books');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [highlightVerse, setHighlightVerse] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const verseListRef = useRef(null);

  // Deep link a partir de uma referência clicada
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

  // Busca capítulo quando entra na tela de versículos
  useEffect(() => {
    if (view !== 'verses' || !book || !chapter) return;
    let active = true;
    setLoading(true);
    setError(null);
    setChapterData(null);
    fetchChapter(book.id, chapter)
      .then((data) => {
        if (!active) return;
        setChapterData(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Erro ao carregar capítulo');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [view, book?.id, chapter]);

  // Scroll até o versículo destacado
  useEffect(() => {
    if (view !== 'verses' || !highlightVerse || !chapterData?.verses?.length) return;
    const idx = chapterData.verses.findIndex((v) => v.n === highlightVerse);
    if (idx >= 0 && verseListRef.current) {
      setTimeout(() => {
        verseListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
      }, 350);
    }
  }, [view, highlightVerse, chapterData]);

  const styles = makeStyles(colors, fs);

  // ===== LIVROS =====
  if (view === 'books') {
    const q = filterText.trim().toLowerCase();
    const filtered = q
      ? BIBLE_BOOKS.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.short.toLowerCase().includes(q)
        )
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
            73 livros do cânon católico. Capítulos canônicos vêm da tradução Almeida (online, com cache). Deuterocanônicos têm conteúdo curado no app.
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
                  onPress={() => {
                    setBook(b);
                    setView('chapters');
                  }}
                >
                  <View style={[styles.bookAbbrev, b.deutero && styles.bookAbbrevDeutero]}>
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
        <Text style={styles.chaptersHint}>
          {book.deutero
            ? 'Livro deuterocanônico. Alguns capítulos têm conteúdo no app, outros virão.'
            : 'Toque em um capítulo para abrir. Carrega online na primeira vez (e fica salvo para uso offline depois).'}
        </Text>

        <FlatList
          key="chapters-grid"
          data={allChapters}
          keyExtractor={(c) => String(c)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chapterCell}
              onPress={() => {
                setChapter(item);
                setHighlightVerse(null);
                setView('verses');
              }}
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
    const externalUrl = `https://www.bibliacatolica.com.br/biblia-ave-maria/${book.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íì]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/[ç]/g, 'c')}/${chapter}/`;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            setChapter(null);
            setHighlightVerse(null);
            setChapterData(null);
            setError(null);
            setView('chapters');
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
          <Text style={styles.backText}>{book.name}</Text>
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
            <Text style={styles.externalBtnText}>Ave Maria</Text>
          </TouchableOpacity>
        </View>

        {chapterData?.source === 'cache' && (
          <View style={styles.sourceBanner}>
            <Ionicons name="cloud-done-outline" size={14} color={colors.textMuted} />
            <Text style={styles.sourceText}>Salvo offline</Text>
          </View>
        )}
        {chapterData?.source === 'local' && (
          <View style={styles.sourceBanner}>
            <Ionicons name="bookmark-outline" size={14} color={colors.textMuted} />
            <Text style={styles.sourceText}>Conteúdo do app</Text>
          </View>
        )}

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Carregando capítulo...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textSubtle} />
            <Text style={styles.errorText}>Não foi possível carregar.</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <Text style={styles.errorSub}>Verifique sua conexão e tente de novo.</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setChapter(null);
                setTimeout(() => setChapter(chapter), 10);
              }}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && chapterData?.source === 'unavailable' && (
          <View style={styles.center}>
            <Ionicons name="time-outline" size={48} color={colors.textSubtle} />
            <Text style={styles.errorText}>Capítulo em preparação</Text>
            <Text style={styles.errorSub}>{chapterData.message}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => Linking.openURL(externalUrl).catch(() => {})}
            >
              <Text style={styles.retryText}>Ler na Bíblia Católica online</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && chapterData?.verses?.length > 0 && (
          <FlatList
            key="verses-list"
            ref={verseListRef}
            data={chapterData.verses}
            keyExtractor={(v) => String(v.n)}
            contentContainerStyle={styles.verseList}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isHighlight = highlightVerse && item.n === highlightVerse;
              return (
                <View style={[styles.verseRow, isHighlight && styles.verseRowHighlight]}>
                  <Text style={[styles.verseNum, isHighlight && styles.verseNumHighlight]}>
                    {item.n}
                  </Text>
                  <Text style={[styles.verseText, isHighlight && styles.verseTextHighlight]}>
                    {item.t}
                  </Text>
                </View>
              );
            }}
          />
        )}
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
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: c.card,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    searchInput: { flex: 1, height: 42, fontSize: fs(15), color: c.text },
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
    bookAbbrevDeutero: { backgroundColor: c.accent },
    bookAbbrevText: { color: '#fff', fontWeight: 'bold', fontSize: fs(13) },
    bookName: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    bookMeta: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    backRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 6 },
    backText: { fontSize: fs(15), color: c.primaryText },
    bookHeader: {
      fontSize: fs(22),
      fontWeight: 'bold',
      color: c.primaryText,
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    chaptersHint: {
      fontSize: fs(12),
      color: c.textMuted,
      paddingHorizontal: 16,
      marginBottom: 12,
      fontStyle: 'italic',
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
      borderColor: c.accent,
    },
    chapterCellText: { color: c.primaryText, fontWeight: 'bold', fontSize: fs(15) },
    verseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    verseHeaderTitle: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText },
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
    sourceBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    sourceText: { fontSize: fs(11), color: c.textMuted },
    verseList: { padding: 16, paddingBottom: 40 },
    verseRow: { flexDirection: 'row', marginBottom: 10, padding: 8, borderRadius: 8 },
    verseRowHighlight: { backgroundColor: c.badgeBg },
    verseNum: {
      fontSize: fs(11),
      color: c.accent,
      fontWeight: 'bold',
      marginRight: 8,
      minWidth: 24,
      paddingTop: 3,
    },
    verseNumHighlight: { color: c.primaryText },
    verseText: { flex: 1, fontSize: fs(15), color: c.text, lineHeight: fs(23) },
    verseTextHighlight: { fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
    loadingText: { fontSize: fs(14), color: c.textMuted, marginTop: 12 },
    errorText: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 12 },
    errorSub: { fontSize: fs(13), color: c.textMuted, textAlign: 'center' },
    retryBtn: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: c.accent,
    },
    retryText: { color: '#fff', fontWeight: 'bold', fontSize: fs(14) },
  });
