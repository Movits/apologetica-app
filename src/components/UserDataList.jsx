import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { GroupList, GuestGate } from './ui';

// Esqueleto das listas de dados do usuário (marcações, notas, favoritos e
// caderno). `user` é o `user` do useAuth(): nulo (sem conta) mostra o
// GuestGate, e uma lista que vale no modo visitante (Favoritos) não passa a
// prop. `items` em null (o primeiro snapshot ainda não chegou) é uma página
// vazia, para não piscar o estado vazio antes da leitura; lista vazia
// centraliza `empty` (um EmptyState); senão é uma GroupList com o card
// afastado das bordas, e o resto das props (`keyExtractor`, `renderItem`...)
// segue para ela.
export default function UserDataList({ user, items, empty, ...rest }) {
  const { colors, tokens } = useTheme();
  const page = { flex: 1, backgroundColor: colors.bg };

  if (user === null) return <GuestGate />;
  if (items === null) return <View style={page} />;
  if (items.length === 0) return <View style={[page, { justifyContent: 'center' }]}>{empty}</View>;
  return <GroupList style={page} data={items} contentContainerStyle={{ marginVertical: tokens.space.md }} {...rest} />;
}
