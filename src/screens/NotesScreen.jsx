import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { watchNotes, removeNote } from '../services/userData';
import { confirmAction } from '../utils/dialog';
import { getBook, bookName } from '../data/bible';
import { getChapter, ensureBible } from '../services/bibleApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shareNote } from '../utils/share';
import { formatVerseRef } from '../utils/verseRef';
import { openBible } from '../navigation/links';
import { EmptyState, GateNotice } from '../components/ui';
import UserDataRow, { RowIconButton } from '../components/UserDataRow';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Notas do usuário em tempo real (Firestore). O visitante vê o convite para
// criar conta; com conta, a lista agrupada mostra a referência e o começo da
// nota. Toque abre o editor; o botão de mais ações (ou o toque longo) abre a
// folha com editar, ler na Bíblia, compartilhar e excluir.
export default function NotesScreen({ navigation }) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { user, exitGuest } = useAuth();
  const { space, radius } = tokens;
  const lang = isEn ? 'en' : 'pt';
  const [items, setItems] = useState(null);
  const [active, setActive] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // A lista não mostra texto bíblico, só o compartilhar monta o versículo, e
  // ele roda dentro do gesto do usuário: carregamos antes, sem bloquear.
  useEffect(() => { ensureBible(lang).catch(() => {}); }, [lang]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    return watchNotes(setItems);
  }, [user]);

  const refOf = (n) =>
    formatVerseRef({ bookName: bookName(getBook(n.bookId), isEn), chapter: n.chapter, verseStart: n.verseStart, verseEnd: n.verseEnd }, isEn);

  const edit = (n) => navigation.navigate('NoteEditor', { noteId: n.id });
  const open = (n) => openBible(navigation, { bookId: n.bookId, chapter: n.chapter, verse: n.verseStart, verseEnd: n.verseEnd });

  const share = (n) => {
    const verseText = getChapter(n.bookId, n.chapter, lang)?.verses?.find((v) => v.n === n.verseStart)?.t || '';
    shareNote({
      bookName: bookName(getBook(n.bookId), isEn),
      chapter: n.chapter,
      verseStart: n.verseStart,
      verseEnd: n.verseEnd,
      verseText,
      noteText: n.text,
      isEn,
    });
  };

  const confirmRemove = (n) => {
    confirmAction({
      title: isEn ? 'Delete note?' : 'Excluir nota?',
      message: isEn ? 'The note will be permanently removed.' : 'A nota será removida permanentemente.',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: () => removeNote(n.id),
    });
  };

  const showActions = (n) => {
    setActive(n);
    setSheetOpen(true);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: space.md }}>
        <GateNotice
          message={t('settings.guest.message')}
          primaryLabel={t('auth.signup')}
          onPrimary={exitGuest}
          secondaryLabel={t('auth.login')}
          onSecondary={exitGuest}
        />
      </View>
    );
  }

  if (items === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="document-text-outline" title={t('empty.notes')} message={t('notes.emptyHint')} />
      </View>
    );
  }

  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };
  const actions = active
    ? [
      { icon: 'create-outline', label: t('common.edit'), onPress: () => edit(active) },
      { icon: 'book-outline', label: t('today.readInBible'), onPress: () => open(active) },
      { icon: 'share-outline', label: t('common.share'), onPress: () => share(active) },
      { icon: 'trash-outline', label: t('note.delete'), danger: true, onPress: () => confirmRemove(active) },
    ]
    : [];

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ margin: space.md, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' }}
        ItemSeparatorComponent={() => <View style={separator} />}
        renderItem={({ item }) => (
          <UserDataRow
            title={refOf(item)}
            subtitle={item.text}
            subtitleLines={3}
            onPress={() => edit(item)}
            onLongPress={() => showActions(item)}
            trailing={<RowIconButton icon="ellipsis-horizontal" label={t('common.moreActions')} onPress={() => showActions(item)} />}
          />
        )}
      />
      <ItemActionsSheet
        visible={sheetOpen}
        title={active ? refOf(active) : ''}
        actions={actions}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
