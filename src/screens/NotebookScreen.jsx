import { useEffect, useLayoutEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { watchNotebook } from '../services/userData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Row, useColumnCount } from '../components/ui';
import { PAGE_MAX } from '../components/ReadingColumn';
import { stripRefs } from '../components/NotebookText';
import UserDataList from '../components/UserDataList';
import HeaderButton from '../components/HeaderButton';

// Data curta da última edição. O campo é um Timestamp do Firestore e fica
// nulo enquanto a escrita local ainda espera o servidor.
function editedAt(page, isEn) {
  const d = page.updatedAt?.toDate?.() ?? page.createdAt?.toDate?.();
  if (!d) return '';
  return d.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Páginas do caderno em tempo real (Firestore). O visitante vê o convite
// para criar conta; com conta, a lista agrupada mostra título, prévia e data
// de cada página, e o "+" do header cria uma página nova.
export default function NotebookScreen({ navigation }) {
  // Desktop: a lista vira uma grade de `cols` colunas dentro do card, na
  // largura da página (cada célula com a sua fração, para a última linha não
  // esticar). No celular cabe uma coluna e nada muda.
  const cols = useColumnCount(3);
  const gridCell = (render) => (info) => <View style={{ width: `${100 / cols}%` }}>{render(info)}</View>;
  const { colors, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: user
        ? () => <HeaderButton icon="add" label={t('notebook.newPage')} onPress={() => navigation.navigate('NotebookPage', {})} />
        : undefined,
    });
  }, [navigation, user, t]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return undefined;
    }
    return watchNotebook(setItems);
  }, [user]);

  return (
    <UserDataList
      key={cols}
      numColumns={cols}
      maxWidth={PAGE_MAX}
      user={user}
      items={items}
      empty={(
        <EmptyState
          icon="journal-outline"
          title={t('notebook.empty')}
          message={t('notebook.emptyHint')}
          action={{ label: t('notebook.newPage'), onPress: () => navigation.navigate('NotebookPage', {}) }}
        />
      )}
      keyExtractor={(p) => p.id}
      renderItem={gridCell(({ item }) => {
        const date = editedAt(item, isEn);
        return (
          <Row
            titleRole="headline"
            title={item.title?.trim() || (isEn ? 'Untitled' : 'Sem título')}
            subtitle={stripRefs(item.text)}
            subtitleLines={2}
            trailing="chevron"
            onPress={() => navigation.navigate('NotebookPage', { pageId: item.id })}
          >
            {date ? (
              <Text style={[text('footnote'), { color: colors.textSubtle }]} numberOfLines={1}>{date}</Text>
            ) : null}
          </Row>
        );
      })}
    />
  );
}
