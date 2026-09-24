import { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { watchNotebook } from '../services/userData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState, GateNotice } from '../components/ui';
import UserDataRow from '../components/UserDataRow';
import HeaderButton from '../components/HeaderButton';

// Remove tokens de referência da prévia: @[Mt 16,18](v:..) -> Mt 16,18
const stripRefs = (s) => String(s || '').replace(/@\[([^\]]+)\]\((?:v|a|r):[^)]+\)/g, '$1');

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
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { user, exitGuest } = useAuth();
  const { space, radius } = tokens;
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
        <EmptyState
          icon="journal-outline"
          title={t('notebook.empty')}
          message={t('notebook.emptyHint')}
          action={{ label: t('notebook.newPage'), onPress: () => navigation.navigate('NotebookPage', {}) }}
        />
      </View>
    );
  }

  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      data={items}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ margin: space.md, backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' }}
      ItemSeparatorComponent={() => <View style={separator} />}
      renderItem={({ item }) => (
        <UserDataRow
          title={item.title?.trim() || (isEn ? 'Untitled' : 'Sem título')}
          subtitle={stripRefs(item.text)}
          subtitleLines={2}
          caption={editedAt(item, isEn)}
          onPress={() => navigation.navigate('NotebookPage', { pageId: item.id })}
        />
      )}
    />
  );
}
