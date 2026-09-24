import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirmAction, notify } from '../utils/dialog';
import { addNote, updateNote, removeNote, getNote } from '../services/userData';
import { getBook, bookName } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useBibleReady } from '../hooks/useBibleReady';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareNote } from '../utils/share';
import { formatVerseRef } from '../utils/verseRef';
import HeaderButton from '../components/HeaderButton';
import ReferencePickerModal from '../components/ReferencePickerModal';
import { Button, Field, Group, Row } from '../components/ui';

// Editor de nota. É modal na raiz (MainStack, sem header do stack e sem tab
// bar), por isso desenha a própria barra: fechar, título e compartilhar.
// route.params:
//   - noteId (edição) OU
//   - bookId/chapter/verseStart/verseEnd (criação)
// O versículo da nota aparece como uma linha com "Trocar", que abre o
// seletor só no modo versículo. Salvar é o botão primário no fim do texto.
export default function NoteEditorScreen({ route, navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { space } = tokens;
  const lang = isEn ? 'en' : 'pt';
  // O editor em si não precisa da Bíblia: só a prévia do versículo e o
  // compartilhar, que monta o texto. O compartilhar roda dentro do gesto do
  // usuário (o navigator.share exige isso), então a tradução é pedida ao
  // abrir a nota e a prévia aparece quando ela chega.
  const biblia = useBibleReady(lang);

  const { noteId, bookId, chapter, verseStart, verseEnd } = route.params || {};
  const [body, setBody] = useState('');
  const [meta, setMeta] = useState({ bookId, chapter, verseStart, verseEnd });
  const [refChanged, setRefChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(noteId));
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!noteId) return undefined;
    let alive = true;
    getNote(noteId)
      .then((note) => {
        if (!alive) return;
        if (note) {
          setBody(note.text || '');
          setMeta({ bookId: note.bookId, chapter: note.chapter, verseStart: note.verseStart, verseEnd: note.verseEnd });
        }
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [noteId]);

  const book = getBook(meta.bookId);
  const bn = bookName(book, isEn);
  const refLabel = book ? formatVerseRef({ bookName: bn, ...meta }, isEn) : '';
  const versePreview = book && biblia.pronta
    ? getChapter(meta.bookId, meta.chapter, lang)?.verses?.find((v) => v.n === meta.verseStart)?.t || ''
    : '';

  const handleSave = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      notify(
        isEn ? 'Empty note' : 'Nota vazia',
        isEn ? 'Write something before saving.' : 'Escreva alguma coisa antes de salvar.'
      );
      return;
    }
    setBusy(true);
    try {
      if (noteId) {
        await updateNote(noteId, trimmed, refChanged ? meta : undefined);
      } else {
        await addNote({ ...meta, text: trimmed });
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

  const handleShare = () => {
    shareNote({
      bookName: bn,
      chapter: meta.chapter,
      verseStart: meta.verseStart,
      verseEnd: meta.verseEnd,
      verseText: versePreview,
      noteText: body.trim(),
      isEn,
    });
  };

  const pickVerse = ({ bookId: b, chapter: c, verse: v }) => {
    setMeta({ bookId: b, chapter: c, verseStart: v, verseEnd: v });
    setRefChanged(true);
  };

  const canShare = Boolean(noteId && body.trim());
  const heading = noteId ? (isEn ? 'Edit note' : 'Editar nota') : (isEn ? 'New note' : 'Nova nota');

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra própria: fechar à esquerda, título no meio, compartilhar à direita
          (ou um espaço do mesmo tamanho, para o título ficar centrado). */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: space.xs,
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
        }}
      >
        <HeaderButton icon="close" label={t('common.close')} onPress={() => navigation.goBack()} />
        <Text role="heading" style={[text('headline'), { color: colors.text, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          {heading}
        </Text>
        {canShare ? (
          <HeaderButton icon="share-outline" label={isEn ? 'Share note' : 'Compartilhar nota'} onPress={handleShare} />
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.md, paddingBottom: insets.bottom + space.xxl, gap: space.md }}
      >
        <Group>
          <Row
            icon="book-outline"
            title={refLabel}
            trailing={<Text style={[text('body'), { color: colors.tint }]}>{t('note.change')}</Text>}
            accessibilityLabel={`${refLabel}, ${t('note.change')}`}
            onPress={() => setPickerOpen(true)}
          >
            {versePreview ? (
              <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={2}>{versePreview}</Text>
            ) : null}
          </Row>
        </Group>

        <Group>
          <Field
            aria-label={heading}
            value={body}
            onChangeText={setBody}
            placeholder={isEn ? 'Write your note' : 'Escreva sua anotação'}
            multiline
            autoFocus={!noteId}
            inputStyle={[text('reading'), { minHeight: text('reading').lineHeight * 8 }]}
          />
        </Group>

        <Button label={t('common.save')} onPress={handleSave} loading={busy} haptic="impact" />
        {noteId ? (
          <Button
            variant="plain"
            label={t('note.delete')}
            textStyle={{ color: colors.danger }}
            onPress={handleDelete}
            disabled={busy}
          />
        ) : (
          <Button variant="plain" label={t('common.cancel')} onPress={() => navigation.goBack()} disabled={busy} />
        )}
      </ScrollView>

      <ReferencePickerModal
        mode="verse"
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPickVerse={pickVerse}
      />
    </KeyboardAvoidingView>
  );
}
