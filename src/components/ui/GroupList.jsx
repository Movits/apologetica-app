import { forwardRef } from 'react';
import { FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ListSeparator from './ListSeparator';

// FlatList com o visual do Group: o contentContainer é o card (fundo `card`,
// cantos `radius.md`, `overflow: 'hidden'`) e o separador entre itens é o
// ListSeparator. Para listas longas de Rows, onde o Group (que monta todos os
// filhos de uma vez) pesaria. `marginHorizontal` (default `space.md`) é a
// margem lateral do card; `contentContainerStyle` extra entra depois do card
// (use para paddingBottom). O resto das props vai para a FlatList, e a `ref`
// também (scrollToIndex, etc.).
const GroupList = forwardRef(function GroupList({ marginHorizontal, contentContainerStyle, ...rest }, ref) {
  const { colors, tokens } = useTheme();
  const { space, radius } = tokens;
  return (
    <FlatList
      ref={ref}
      ItemSeparatorComponent={ListSeparator}
      contentContainerStyle={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          overflow: 'hidden',
          marginHorizontal: marginHorizontal ?? space.md,
        },
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
});

export default GroupList;
