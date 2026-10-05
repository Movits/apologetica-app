import { forwardRef } from 'react';
import { FlatList, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ListSeparator from './ListSeparator';
import { COLUMN_MAX } from '../ReadingColumn';

// FlatList com o visual do Group: o contentContainer é o card (fundo `card`,
// cantos `radius.md`, `overflow: 'hidden'`) e o separador entre itens é o
// ListSeparator. Para listas longas de Rows, onde o Group (que monta todos os
// filhos de uma vez) pesaria. `marginHorizontal` é a margem lateral do card
// (default `space.md` no celular; em janela larga, o que sobrar da coluna de
// COLUMN_MAX, para o card ficar centrado como o resto do app); o
// `contentContainerStyle` extra entra depois do card
// (use para paddingBottom). O resto das props vai para a FlatList, e a `ref`
// também (scrollToIndex, etc.).
const GroupList = forwardRef(function GroupList({ marginHorizontal, contentContainerStyle, ...rest }, ref) {
  const { colors, tokens } = useTheme();
  const { space, radius } = tokens;
  const { width } = useWindowDimensions();
  return (
    <FlatList
      ref={ref}
      ItemSeparatorComponent={ListSeparator}
      contentContainerStyle={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          overflow: 'hidden',
          marginHorizontal: marginHorizontal ?? Math.max(space.md, (width - COLUMN_MAX) / 2),
        },
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
});

export default GroupList;
