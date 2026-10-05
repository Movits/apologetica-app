import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// A hairline entre duas linhas de uma lista agrupada: meia linha na cor
// `separator`, recuada à esquerda por `inset` (default `space.md`, o mesmo
// recuo do conteúdo da Row). É o separador do Group e serve de
// `ItemSeparatorComponent` numa FlatList (GroupList), que o chama sem props.
export default function ListSeparator({ inset, style }) {
  const { colors, tokens } = useTheme();
  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: inset ?? tokens.space.md },
        style,
      ]}
    />
  );
}
