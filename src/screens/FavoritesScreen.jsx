import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { articles } from '../data/articles';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { categoryLabel, pick } from '../utils/i18nData';
import { haptics } from '../utils/haptics';
import { openArticle } from '../navigation/links';
import { EmptyState } from '../components/ui';
import UserDataRow, { RowIconButton } from '../components/UserDataRow';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Ids guardados -> artigos, na ordem em que foram guardados (o mais novo
// primeiro), ignorando ids que não existem mais.
const fromIds = (ids) => ids.map((id) => articles.find((a) => a.id === id)).filter(Boolean);

// Favoritos ficam no aparelho (AsyncStorage) e valem no modo visitante. A
// lista recarrega a cada foco, porque o artigo guarda e remove por conta
// própria. A FlatList é o card da lista agrupada (padrão do Glossário):
// título em headline, categoria em subhead, o chevron abre o artigo e o
// marcador de 44 remove. O toque longo abre a folha de ações (abrir, remover),
// como nas outras listas do usuário, em vez de remover na hora.
export default function FavoritesScreen({ navigation }) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius } = tokens;
  // null enquanto carrega, para não piscar o estado vazio antes da leitura.
  const [items, setItems] = useState(null);
  // O artigo da folha de ações fica guardado mesmo depois de fechar, para o
  // título não sumir durante a animação de saída.
  const [active, setActive] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getFavorites().then((ids) => { if (active) setItems(fromIds(ids)); });
      return () => { active = false; };
    }, [])
  );

  const remove = async (article) => {
    haptics.impact('light');
    const ids = await toggleFavorite(article.id);
    setItems(fromIds(ids));
  };

  const showActions = (article) => {
    setActive(article);
    setSheetOpen(true);
  };

  if (items === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState
          icon="bookmark-outline"
          title={t('empty.favorites')}
          message={t('favorites.emptyHint')}
          action={{ label: t('favorites.explore'), onPress: () => navigation.navigate('Artigos') }}
        />
      </View>
    );
  }

  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };
  const actions = active
    ? [
      { icon: 'reader-outline', label: t('common.open'), onPress: () => openArticle(navigation, active.id) },
      { icon: 'bookmark-outline', label: t('articles.unsave'), danger: true, onPress: () => remove(active) },
    ]
    : [];

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: colors.bg }}
        data={items}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ margin: space.md, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' }}
        ItemSeparatorComponent={() => <View style={separator} />}
        renderItem={({ item }) => (
          <UserDataRow
            title={pick(item, 'title', isEn)}
            titleLines={2}
            subtitle={categoryLabel(item.category, t)}
            subtitleLines={1}
            onPress={() => openArticle(navigation, item.id)}
            onLongPress={() => showActions(item)}
            trailing={<RowIconButton icon="bookmark" label={t('articles.unsave')} onPress={() => remove(item)} />}
          />
        )}
      />
      <ItemActionsSheet
        visible={sheetOpen}
        title={active ? pick(active, 'title', isEn) : ''}
        actions={actions}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
