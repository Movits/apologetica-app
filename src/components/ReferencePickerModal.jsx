import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { references, translateRef } from '../data/references';
import { referencesEn } from '../data/references-en';
import { BIBLE_BOOKS, bookName, bookShort } from '../data/bible';
import { getChapter } from '../services/bibleApi';

// Modal para inserir uma referência no caderno. Retorna o token via onPick:
//   versículo  -> @[Mt 16,18](v:mt/16/18)
//   referência -> @[Mt 16,18](r:refId)   (referências curadas do app)
//   artigo     -> @[Título](a:articleId)
export default function ReferencePickerModal({ visible, onClose, onPick }) {
  const { colors, fs } = useTheme();
  const { isEn, t } = useLanguage();
  const styles = makeStyles(colors, fs);

  const [tab, setTab] = useState('verse');
  const [articleQuery, setArticleQuery] = useState('');
  const [refQuery, setRefQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');

  const reset = () => {
    setTab('verse'); setArticleQuery(''); setRefQuery(''); setBookQuery('');
    setBook(null); setChapter(''); setVerse('');
  };
  const close = () => { reset(); onClose?.(); };

  const refLabel = (item) => {
    if (isEn) {
      const en = referencesEn[item.id];
      return en?.refEn || translateRef(item.ref, true);
    }
    return item.ref;
  };

  const filteredArticles = useMemo(() => {
    const q = articleQuery.trim().toLowerCase();
    return articles.filter((a) => {
      const title = isEn ? (a.titleEn || a.title) : a.title;
      return !q || title.toLowerCase().includes(q);
    });
  }, [articleQuery, isEn]);

  const filteredRefs = useMemo(() => {
    const q = refQuery.trim().toLowerCase();
    if (!q) return references;
    return references.filter((r) => {
      const hay = `${r.ref} ${r.topic || ''} ${r.fullSource || ''} ${r.source || ''} ${refLabel(r)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [refQuery, isEn]);

  const filteredBooks = useMemo(() => {
    const q = bookQuery.trim().toLowerCase();
    return BIBLE_BOOKS.filter((b) => {
      const n = bookName(b, isEn).toLowerCase();
      return !q || n.includes(q) || b.id.includes(q);
    });
  }, [bookQuery, isEn]);

  const pickArticle = (a) => {
    const title = isEn ? (a.titleEn || a.title) : a.title;
    onPick?.(`@[${title}](a:${a.id})`);
    close();
  };

  const pickRef = (r) => {
    onPick?.(`@[${refLabel(r)}](r:${r.id})`);
    close();
  };

  const confirmVerse = () => {
    if (!book) return;
    const ch = parseInt(chapter, 10);
    const vs = parseInt(verse, 10);
    if (!ch || ch < 1 || ch > book.totalChapters) return;
    // valida o verso pela contagem do capítulo (cai pra >=1 se não conseguir ler)
    let maxVerse = Infinity;
    try {
      const data = getChapter(book.id, ch, isEn ? 'en' : 'pt');
      if (data?.verses?.length) maxVerse = data.verses.length;
    } catch {}
    if (!vs || vs < 1 || vs > maxVerse) return;
    const sep = isEn ? ':' : ',';
    const label = `${bookShort(book, isEn)} ${ch}${sep}${vs}`;
    onPick?.(`@[${label}](v:${book.id}/${ch}/${vs})`);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEn ? 'Insert reference' : 'Inserir referência'}</Text>
            <TouchableOpacity onPress={close} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segBtn, tab === 'verse' && styles.segBtnActive]}
              onPress={() => setTab('verse')}
            >
              <Text style={[styles.segText, tab === 'verse' && styles.segTextActive]}>{isEn ? 'Verse' : 'Versículo'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, tab === 'ref' && styles.segBtnActive]}
              onPress={() => setTab('ref')}
            >
              <Text style={[styles.segText, tab === 'ref' && styles.segTextActive]}>{isEn ? 'Reference' : 'Referência'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, tab === 'article' && styles.segBtnActive]}
              onPress={() => setTab('article')}
            >
              <Text style={[styles.segText, tab === 'article' && styles.segTextActive]}>{isEn ? 'Article' : 'Artigo'}</Text>
            </TouchableOpacity>
          </View>

          {tab === 'article' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder={isEn ? 'Search article...' : 'Buscar artigo...'}
                placeholderTextColor={colors.textSubtle}
                value={articleQuery}
                onChangeText={setArticleQuery}
              />
              <FlatList
                data={filteredArticles}
                keyExtractor={(a) => String(a.id)}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listRow} onPress={() => pickArticle(item)}>
                    <Ionicons name="document-text-outline" size={18} color={colors.accent} />
                    <Text style={styles.listText} numberOfLines={1}>{isEn ? (item.titleEn || item.title) : item.title}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : tab === 'ref' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder={isEn ? 'Search reference (verse, Catechism, document...)' : 'Buscar referência (versículo, Catecismo, documento...)'}
                placeholderTextColor={colors.textSubtle}
                value={refQuery}
                onChangeText={setRefQuery}
              />
              <FlatList
                data={filteredRefs}
                keyExtractor={(r) => r.id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listRow} onPress={() => pickRef(item)}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listText} numberOfLines={1}>{refLabel(item)}</Text>
                      <Text style={styles.listSub} numberOfLines={1}>{isEn ? (referencesEn[item.id]?.topicEn || item.topic) : item.topic}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : !book ? (
            <>
              <TextInput
                style={styles.input}
                placeholder={isEn ? 'Search book...' : 'Buscar livro...'}
                placeholderTextColor={colors.textSubtle}
                value={bookQuery}
                onChangeText={setBookQuery}
              />
              <FlatList
                data={filteredBooks}
                keyExtractor={(b) => b.id}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listRow} onPress={() => setBook(item)}>
                    <Ionicons name="book-outline" size={18} color={colors.accent} />
                    <Text style={styles.listText}>{bookName(item, isEn)}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <View style={{ paddingTop: 4 }}>
              <TouchableOpacity style={styles.backRow} onPress={() => setBook(null)}>
                <Ionicons name="chevron-back" size={18} color={colors.accent} />
                <Text style={styles.backText}>{bookName(book, isEn)}</Text>
              </TouchableOpacity>
              <View style={styles.numRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.numLabel}>{isEn ? 'Chapter' : 'Capítulo'}</Text>
                  <TextInput
                    style={styles.numInput}
                    keyboardType="number-pad"
                    value={chapter}
                    onChangeText={setChapter}
                    placeholder={`1-${book.totalChapters}`}
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.numLabel}>{isEn ? 'Verse' : 'Versículo'}</Text>
                  <TextInput
                    style={styles.numInput}
                    keyboardType="number-pad"
                    value={verse}
                    onChangeText={setVerse}
                    placeholder="1"
                    placeholderTextColor={colors.textSubtle}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmVerse}>
                <Text style={styles.confirmText}>{isEn ? 'Insert' : 'Inserir'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(13, 23, 34, 0.7)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingBottom: 28, maxHeight: '85%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    segment: { flexDirection: 'row', backgroundColor: c.card, borderRadius: 10, padding: 4, marginBottom: 12 },
    segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    segBtnActive: { backgroundColor: c.primary },
    segText: { fontSize: fs(13), color: c.textMuted, fontWeight: '600' },
    segTextActive: { color: '#fff' },
    input: {
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 14, height: 46,
      fontSize: fs(15), color: c.text, marginBottom: 8,
      ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : null),
    },
    listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.divider },
    listText: { flex: 1, fontSize: fs(14), color: c.text },
    listSub: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, marginBottom: 4 },
    backText: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText },
    numRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    numLabel: { fontSize: fs(11), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    numInput: {
      backgroundColor: c.card, borderRadius: 10, paddingHorizontal: 14, height: 46,
      fontSize: fs(16), color: c.text,
      ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : null),
    },
    confirmBtn: { backgroundColor: c.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    confirmText: { color: '#fff', fontSize: fs(15), fontWeight: 'bold' },
  });
