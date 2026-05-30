import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  addNotebookPage, updateNotebookPage, removeNotebookPage, getNotebookPage,
} from '../services/userData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotebookText from '../components/NotebookText';
import ReferencePickerModal from '../components/ReferencePickerModal';

export default function NotebookPageScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, fs);

  const [pageId, setPageId] = useState(route.params?.pageId || null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState(pageId ? 'read' : 'edit'); // página nova começa em edição
  const [loading, setLoading] = useState(!!pageId);
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState({ open: false, pos: 0, replace: false });
  const selRef = useRef({ start: 0, end: 0 });

  // Carrega página existente.
  useEffect(() => {
    if (!pageId) return;
    (async () => {
      const page = await getNotebookPage(pageId);
      if (page) { setTitle(page.title || ''); setText(page.text || ''); }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!title.trim() && !text.trim()) {
      // nada a salvar: volta sem criar página vazia
      navigation.goBack();
      return;
    }
    setBusy(true);
    try {
      if (pageId) {
        await updateNotebookPage(pageId, { title: title.trim(), text });
      } else {
        const ref = await addNotebookPage({ title: title.trim(), text });
        setPageId(ref.id);
      }
      setMode('read');
    } catch (e) {
      Alert.alert(isEn ? 'Error' : 'Erro', e.message || (isEn ? 'Could not save.' : 'Não foi possível salvar.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!pageId) return navigation.goBack();
    Alert.alert(
      isEn ? 'Delete page?' : 'Excluir página?',
      isEn ? 'This page will be permanently removed.' : 'Esta página será removida permanentemente.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'), style: 'destructive', onPress: async () => {
            await removeNotebookPage(pageId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('header.notebook'),
      headerRight: () =>
        mode === 'edit' ? (
          <TouchableOpacity onPress={save} disabled={busy} hitSlop={10} style={{ paddingRight: 4 }}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.headerBtn}>{t('common.save')}</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setMode('edit')} hitSlop={10} style={{ paddingRight: 4 }}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        ),
    });
  }, [navigation, mode, busy, title, text, isEn]);

  // Detecta '@' digitado para abrir o seletor de referência.
  const onChangeText = (next) => {
    if (next.length === text.length + 1) {
      const pos = selRef.current.start; // cursor antes da inserção
      if (next[pos] === '@') {
        setPicker({ open: true, pos, replace: true });
      }
    }
    setText(next);
  };

  const insertReference = (token) => {
    setText((prev) => {
      const pos = Math.min(picker.pos, prev.length);
      const before = prev.slice(0, pos);
      const after = prev.slice(pos + (picker.replace ? 1 : 0)); // remove o '@' se for o caso
      return `${before}${token} ${after}`;
    });
  };

  const openVerse = (bookId, chapter, verse) =>
    navigation.navigate('Bíblia', { bookId, chapter, highlightVerse: verse });
  const openArticle = (articleId) =>
    navigation.navigate('ArticleFromSearch', { articleId });
  const openRef = (refId) =>
    navigation.navigate('RefDetail', { highlightId: refId });

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {mode === 'edit' ? (
        <>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={isEn ? 'Title' : 'Título'}
            placeholderTextColor={colors.textSubtle}
          />
          <View style={styles.toolbar}>
            <TouchableOpacity
              style={styles.atBtn}
              onPress={() => setPicker({ open: true, pos: selRef.current.start, replace: false })}
            >
              <Ionicons name="at" size={18} color={colors.accent} />
              <Text style={styles.atText}>{isEn ? 'Add reference' : 'Inserir referência'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.bodyInput}
            value={text}
            onChangeText={onChangeText}
            onSelectionChange={(e) => { selRef.current = e.nativeEvent.selection; }}
            placeholder={isEn ? 'Write freely. Type @ to link a verse or article…' : 'Escreva à vontade. Digite @ para citar um versículo ou artigo…'}
            placeholderTextColor={colors.textSubtle}
            multiline
            autoFocus={!pageId}
            textAlignVertical="top"
          />
          {pageId && (
            <TouchableOpacity
              style={[styles.deleteBtn, { paddingBottom: 14 + Math.max(insets.bottom, 8) }]}
              onPress={confirmDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#c0392b" />
              <Text style={styles.deleteText}>{isEn ? 'Delete page' : 'Excluir página'}</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {title.trim() ? <Text style={styles.readTitle}>{title}</Text> : null}
          <NotebookText text={text} onOpenVerse={openVerse} onOpenArticle={openArticle} onOpenRef={openRef} />
        </ScrollView>
      )}

      <ReferencePickerModal
        visible={picker.open}
        onClose={() => setPicker((p) => ({ ...p, open: false }))}
        onPick={insertReference}
      />
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    headerBtn: { fontSize: fs(15), color: '#fff', fontWeight: 'bold' },
    titleInput: {
      fontSize: fs(20), fontWeight: 'bold', color: c.primaryText,
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
      outlineStyle: 'none', outlineWidth: 0,
    },
    toolbar: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 8 },
    atBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      borderWidth: 1, borderColor: c.accent, borderRadius: 18,
      paddingVertical: 6, paddingHorizontal: 12,
    },
    atText: { color: c.accent, fontSize: fs(13), fontWeight: '600' },
    bodyInput: {
      flex: 1, paddingHorizontal: 20, paddingTop: 4,
      fontSize: fs(16), color: c.text, lineHeight: fs(24),
      outlineStyle: 'none', outlineWidth: 0,
    },
    readTitle: { fontSize: fs(22), fontWeight: 'bold', color: c.primaryText, marginBottom: 14 },
    deleteBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: 14, borderTopWidth: 1, borderTopColor: c.divider,
    },
    deleteText: { fontSize: fs(14), color: '#c0392b', fontWeight: '600' },
  });
