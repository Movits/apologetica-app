import { useEffect, useState } from 'react';
import { watchNotes, removeNote } from '../services/userData';
import { confirmAction } from '../utils/dialog';
import { getBook, bookName } from '../data/bible';
import { getVerse, ensureBible } from '../services/bibleApi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shareNote } from '../utils/share';
import { verseLabel } from '../utils/refLabel';
import { openBible } from '../navigation/links';
import { EmptyState, Row } from '../components/ui';
import RowIconButton from '../components/RowIconButton';
import UserDataList from '../components/UserDataList';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Notas do usuário em tempo real (Firestore). O visitante vê o convite para
// criar conta; com conta, a lista agrupada mostra a referência e o começo da
// nota. Toque abre o editor; o botão de mais ações (ou o toque longo) abre a
// folha com editar, ler na Bíblia, compartilhar e excluir.
export default function NotesScreen({ navigation }) {
  const { t, isEn, lang } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  // A nota da folha de ações; null fecha a folha.
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    return watchNotes(setItems);
  }, [user]);

  const edit = (n) => navigation.navigate('NoteEditor', { noteId: n.id });
  const open = (n) => openBible(navigation, { bookId: n.bookId, chapter: n.chapter, verse: n.verseStart, verseEnd: n.verseEnd });

  const share = (n) => {
    shareNote({
      bookName: bookName(getBook(n.bookId), isEn),
      chapter: n.chapter,
      verseStart: n.verseStart,
      verseEnd: n.verseEnd,
      verseText: getVerse(n.bookId, n.chapter, n.verseStart, lang) || '',
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

  // A lista não mostra texto bíblico, só o compartilhar monta o versículo, e
  // ele roda dentro do gesto do usuário (o navigator.share exige isso): a
  // tradução é pedida ao abrir a folha de ações, sem bloquear, para já estar
  // em memória quando a pessoa tocar em Compartilhar.
  const showActions = (n) => {
    ensureBible(lang).catch(() => {});
    setActive(n);
  };

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
      <UserDataList
        user={user}
        items={items}
        empty={<EmptyState icon="document-text-outline" title={t('empty.notes')} message={t('notes.emptyHint')} />}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <Row
            titleRole="headline"
            title={verseLabel(item, isEn)}
            subtitle={item.text}
            subtitleLines={3}
            trailing={<RowIconButton icon="ellipsis-horizontal" label={t('common.moreActions')} onPress={() => showActions(item)} />}
            chevron
            onPress={() => edit(item)}
            onLongPress={() => showActions(item)}
          />
        )}
      />
      <ItemActionsSheet
        item={active}
        title={active ? verseLabel(active, isEn) : ''}
        actions={actions}
        onClose={() => setActive(null)}
      />
    </>
  );
}
