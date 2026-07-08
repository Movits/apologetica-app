import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { confirmAction, notify } from '../utils/dialog';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addNote, updateNote, removeNote } from '../services/userData';
import { getBook, bookName } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareNote } from '../utils/share';

// route.params:
//   - noteId (edição) OU
//   - bookId/chapter/verseStart/verseEnd (criação)
export default function NoteEditorScreen({ route, navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { noteId, bookId, chapter, verseStart, verseEnd } = route.params || {};
  const [text, setText] = useState('');
  const [meta, setMeta] = useState({ bookId, chapter, verseStart, verseEnd });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!noteId);

  useEffect(() => {
    if (!noteId) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', uid, 'notes', noteId));
      if (snap.exists()) {
        const data = snap.data();
        setText(data.text || '');
        setMeta({
          bookId: data.bookId,
          chapter: data.chapter,
          verseStart: data.verseStart,
          verseEnd: data.verseEnd,
        });
      }
      setLoading(false);
    })();
  }, [noteId]);

  const book = getBook(meta.bookId);
  const bn = bookName(book, isEn);
  const sep = isEn ? ':' : ',';
  const refLabel = book
    ? `${bn} ${meta.chapter}${sep}${meta.verseStart === meta.verseEnd ? meta.verseStart : `${meta.verseStart}-${meta.verseEnd}`}`
    : '';

  const handleSave = async () => {
    if (!text.trim()) {
      return notify(
        isEn ? 'Empty note' : 'Nota vazia',
        isEn ? 'Write something before saving.' : 'Escreva alguma coisa antes de salvar.'
      );
    }
    setBusy(true);
    try {
      if (noteId) {
        await updateNote(noteId, text.trim());
      } else {
        await addNote({ ...meta, text: text.trim() });
      }
      navigation.goBack();
    } catch (e) {
      notify(
        isEn ? 'Error' : 'Erro',
        e.message || (isEn ? 'Could not save the note.' : 'Não foi possível salvar a nota.')
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (!noteId) return navigation.goBack();
    confirmAction({
      title: isEn ? 'Delete note?' : 'Excluir nota?',
      message: isEn ? 'The note will be permanently removed.' : 'A nota será removida permanentemente.',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: async () => {
        await removeNote(noteId);
        navigation.goBack();
      },
    });
  };

  const styles = makeStyles(colors, fs);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={isEn ? 'Close' : 'Fechar'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={26} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>{noteId ? (isEn ? 'Edit note' : 'Editar nota') : (isEn ? 'New note' : 'Nova nota')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {noteId && text.trim() ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isEn ? 'Share note' : 'Compartilhar nota'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => {
                const ch = getChapter(meta.bookId, meta.chapter, isEn ? 'en' : 'pt');
                const verseText = ch?.verses?.find((v) => v.n === meta.verseStart)?.t || '';
                shareNote({
                  bookName: bn,
                  chapter: meta.chapter,
                  verseStart: meta.verseStart,
                  verseEnd: meta.verseEnd,
                  verseText,
                  noteText: text.trim(),
                });
              }}
            >
              <Ionicons name="share-social-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleSave} disabled={busy}>
            {busy ? <ActivityIndicator color={colors.accent} /> : (
              <Text style={styles.saveText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.refBox}>
        <Ionicons name="bookmark-outline" size={16} color={colors.accent} />
        <Text style={styles.refText}>{refLabel}</Text>
      </View>

      <TextInput
        style={styles.editor}
        value={text}
        onChangeText={setText}
        placeholder={isEn ? 'Write your note...' : 'Escreva sua anotação...'}
        placeholderTextColor={colors.textSubtle}
        multiline
        autoFocus={!noteId}
        textAlignVertical="top"
      />

      {noteId && (
        <TouchableOpacity
          style={[styles.deleteBtn, { paddingBottom: 14 + Math.max(insets.bottom, 8) }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={18} color="#c0392b" />
          <Text style={styles.deleteText}>{t('note.delete')}</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingTop: 50,
      backgroundColor: c.card,
    },
    title: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    saveText: { fontSize: fs(15), color: c.accentText, fontWeight: 'bold' },
    refBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 12,
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: c.badgeBg,
      borderRadius: 8,
    },
    refText: { fontSize: fs(13), color: c.accentText, fontWeight: '600' },
    editor: {
      flex: 1,
      padding: 16,
      fontSize: fs(15),
      color: c.text,
      lineHeight: fs(22),
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    deleteText: { fontSize: fs(14), color: '#c0392b', fontWeight: '600' },
  });
