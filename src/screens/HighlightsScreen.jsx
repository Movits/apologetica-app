import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { watchHighlights, removeHighlight } from '../services/userData';
import { confirmAction } from '../utils/dialog';
import { getBook, bookName } from '../data/bible';
import { getChapter } from '../services/bibleApi';
import { useBibleReady } from '../hooks/useBibleReady';
import BibleLoadingState from '../components/BibleLoadingState';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shareHighlight } from '../utils/share';
import { formatVerseRef } from '../utils/verseRef';
import { openBible } from '../navigation/links';
import { EmptyState, GateNotice } from '../components/ui';
import UserDataRow, { RowIconButton } from '../components/UserDataRow';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Marcações do usuário em tempo real (Firestore). O visitante vê o convite
// para criar conta; com conta, a lista agrupada mostra cada marcação com o
// ponto da cor, a referência e o texto do versículo. Toque abre na Bíblia; o
// botão de mais ações (ou o toque longo) abre a folha com ler, compartilhar
// e remover. A cor da marcação é dado do documento, não do tema.
export default function HighlightsScreen({ navigation }) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { user, exitGuest } = useAuth();
  const { space, radius } = tokens;
  const lang = isEn ? 'en' : 'pt';
  // Cada linha mostra o texto do versículo marcado. Sem a tradução carregada
  // as marcações apareceriam com o texto vazio, o que parece dado perdido.
  const biblia = useBibleReady(lang);
  // null enquanto o primeiro snapshot não chega.
  const [items, setItems] = useState(null);
  // A marcação da folha de ações fica guardada mesmo depois de fechar, para
  // o conteúdo não sumir durante a animação de saída.
  const [active, setActive] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    return watchHighlights(setItems);
  }, [user]);

  const describe = (h) => {
    const bn = bookName(getBook(h.bookId), isEn);
    const verseText = getChapter(h.bookId, h.chapter, lang)?.verses?.find((v) => v.n === h.verse)?.t || '';
    return { bn, verseText, ref: formatVerseRef({ bookName: bn, chapter: h.chapter, verse: h.verse }, isEn) };
  };

  const open = (h) => openBible(navigation, { bookId: h.bookId, chapter: h.chapter, verse: h.verse });

  const share = (h) => {
    const { bn, verseText } = describe(h);
    shareHighlight({ bookName: bn, chapter: h.chapter, verse: h.verse, text: verseText, isEn });
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

  const showActions = (h) => {
    setActive(h);
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

  if (!biblia.pronta) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BibleLoadingState erro={biblia.erro} onTentarDeNovo={biblia.tentarDeNovo} />
      </View>
    );
  }

  if (items === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="color-fill-outline" title={t('empty.highlights')} message={t('highlights.emptyHint')} />
      </View>
    );
  }

  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };
  const actions = active
    ? [
      { icon: 'book-outline', label: t('today.readInBible'), onPress: () => open(active) },
      { icon: 'share-outline', label: t('common.share'), onPress: () => share(active) },
      { icon: 'trash-outline', label: t('bible.removeHighlight'), danger: true, onPress: () => confirmRemove(active) },
    ]
    : [];

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        data={items}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ margin: space.md, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' }}
        ItemSeparatorComponent={() => <View style={separator} />}
        renderItem={({ item }) => {
          const { ref, verseText } = describe(item);
          return (
            <UserDataRow
              leading={<View style={{ width: space.sm, height: space.sm, borderRadius: radius.full, backgroundColor: item.color }} />}
              title={ref}
              subtitle={verseText}
              subtitleSerif
              subtitleLines={3}
              onPress={() => open(item)}
              onLongPress={() => showActions(item)}
              trailing={<RowIconButton icon="ellipsis-horizontal" label={t('common.moreActions')} onPress={() => showActions(item)} />}
            />
          );
        }}
      />
      <ItemActionsSheet
        visible={sheetOpen}
        title={active ? describe(active).ref : ''}
        actions={actions}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
