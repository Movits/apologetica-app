import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { articles } from '../data/articles';
import { useLanguage } from '../context/LanguageContext';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { categoryLabel, pick } from '../utils/i18nData';
import { haptics } from '../utils/haptics';
import { openArticle } from '../navigation/links';
import { View } from 'react-native';
import { EmptyState, Row, useColumnCount } from '../components/ui';
import { PAGE_MAX } from '../components/ReadingColumn';
import RowIconButton from '../components/RowIconButton';
import UserDataList from '../components/UserDataList';
import ItemActionsSheet from '../components/ItemActionsSheet';

// Ids guardados -> artigos, na ordem em que foram guardados (o mais novo
// primeiro), ignorando ids que não existem mais.
const fromIds = (ids) => ids.map((id) => articles.find((a) => a.id === id)).filter(Boolean);

// Favoritos ficam no aparelho (AsyncStorage) e valem no modo visitante. A
// lista recarrega a cada foco, porque o artigo guarda e remove por conta
// própria. A lista é o card da lista agrupada (padrão do Glossário): título
// em headline, categoria em subhead, o chevron abre o artigo e o marcador de
// 44 remove. O toque longo abre a folha de ações (abrir, remover), como nas
// outras listas do usuário, em vez de remover na hora.
export default function FavoritesScreen({ navigation }) {
  // Desktop: a lista vira uma grade de `cols` colunas dentro do card, na
  // largura da página (cada célula com a sua fração, para a última linha não
  // esticar). No celular cabe uma coluna e nada muda.
  const cols = useColumnCount(3);
  const gridCell = (render) => (info) => <View style={{ width: `${100 / cols}%` }}>{render(info)}</View>;
  const { t, isEn } = useLanguage();
  // null enquanto carrega, para não piscar o estado vazio antes da leitura.
  const [items, setItems] = useState(null);
  // O artigo da folha de ações; null fecha a folha.
  const [active, setActive] = useState(null);

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

  const actions = active
    ? [
      { icon: 'reader-outline', label: t('common.open'), onPress: () => openArticle(navigation, active.id) },
      { icon: 'bookmark-outline', label: t('articles.unsave'), danger: true, onPress: () => remove(active) },
    ]
    : [];

  return (
    <>
      <UserDataList
        key={cols}
        numColumns={cols}
        maxWidth={PAGE_MAX}
        items={items}
        empty={(
          <EmptyState
            icon="bookmark-outline"
            title={t('empty.favorites')}
            message={t('favorites.emptyHint')}
            action={{ label: t('favorites.explore'), onPress: () => navigation.navigate('Artigos') }}
          />
        )}
        keyExtractor={(a) => String(a.id)}
        renderItem={gridCell(({ item }) => (
          <Row
            titleRole="headline"
            title={pick(item, 'title', isEn)}
            titleLines={2}
            subtitle={categoryLabel(item.category, t)}
            subtitleLines={1}
            trailing={<RowIconButton icon="bookmark" label={t('articles.unsave')} onPress={() => remove(item)} />}
            chevron
            onPress={() => openArticle(navigation, item.id)}
            onLongPress={() => setActive(item)}
          />
        ))}
      />
      <ItemActionsSheet
        item={active}
        title={active ? pick(active, 'title', isEn) : ''}
        actions={actions}
        onClose={() => setActive(null)}
      />
    </>
  );
}
