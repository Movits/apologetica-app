import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { watchHighlights, removeHighlight } from '../services/userData';
import { confirmAction } from '../utils/dialog';
import { getBook, bookName } from '../data/bible';
import { getVerse } from '../services/bibleApi';
import { useBibleReady } from '../hooks/useBibleReady';
import BibleLoadingState from '../components/BibleLoadingState';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { shareVerse } from '../utils/share';
import { verseLabel } from '../utils/refLabel';
import { openBible } from '../navigation/links';
import { EmptyState, Row } from '../components/ui';
import RowIconButton from '../components/RowIconButton';
import UserDataList from '../components/UserDataList';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Marcações do usuário em tempo real (Firestore). O visitante vê o convite
// para criar conta; com conta, a lista agrupada mostra cada marcação com o
// ponto da cor, a referência e o texto do versículo. Toque abre na Bíblia; o
// botão de mais ações (ou o toque longo) abre a folha com ler, compartilhar
// e remover. A cor da marcação é dado do documento, não do tema.
export default function HighlightsScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn, lang } = useLanguage();
  const { user } = useAuth();
  const { space, radius } = tokens;
  // Cada linha mostra o texto do versículo marcado. Sem a tradução carregada
  // as marcações apareceriam com o texto vazio, o que parece dado perdido.
  const biblia = useBibleReady(lang);
  // null enquanto o primeiro snapshot não chega.
  const [items, setItems] = useState(null);
  // A marcação da folha de ações; null fecha a folha.
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    return watchHighlights(setItems);
  }, [user]);

  const verseText = (h) => getVerse(h.bookId, h.chapter, h.verse, lang) || '';

  const open = (h) => openBible(navigation, { bookId: h.bookId, chapter: h.chapter, verse: h.verse });

  const share = (h) => {
    shareVerse({ bookName: bookName(getBook(h.bookId), isEn), chapter: h.chapter, verse: h.verse, text: verseText(h), isEn });
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

  if (user && !biblia.pronta) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <BibleLoadingState erro={biblia.erro} onTentarDeNovo={biblia.tentarDeNovo} />
      </View>
    );
  }

  const actions = active
    ? [
      { icon: 'book-outline', label: t('today.readInBible'), onPress: () => open(active) },
      { icon: 'share-outline', label: t('common.share'), onPress: () => share(active) },
      { icon: 'trash-outline', label: t('bible.removeHighlight'), danger: true, onPress: () => confirmRemove(active) },
    ]
    : [];

  return (
    <>
      <UserDataList
        user={user}
        items={items}
        empty={<EmptyState icon="color-fill-outline" title={t('empty.highlights')} message={t('highlights.emptyHint')} />}
        keyExtractor={(h) => h.id}
        renderItem={({ item }) => {
          const verse = verseText(item);
          return (
            <Row
              leading={<View style={{ width: space.sm, height: space.sm, borderRadius: radius.full, backgroundColor: item.color }} />}
              titleRole="headline"
              title={verseLabel(item, isEn)}
              trailing={<RowIconButton icon="ellipsis-horizontal" label={t('common.moreActions')} onPress={() => setActive(item)} />}
              chevron
              onPress={() => open(item)}
              onLongPress={() => setActive(item)}
            >
              {verse ? (
                <Text style={[text('bodySerif'), { color: colors.text }]} numberOfLines={3}>{verse}</Text>
              ) : null}
            </Row>
          );
        }}
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
