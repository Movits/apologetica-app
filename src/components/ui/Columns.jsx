import { Fragment } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import useLayout from '../../hooks/useLayout';
import { PAGE_MAX, columnInnerWidth } from '../ReadingColumn';
import { gridColumns, spreadColumns } from '../../utils/layout';

// Colunas lado a lado quando a área das telas é larga (desktop), empilhadas
// no celular. Use dentro de um LargeTitleScreen com maxWidth={PAGE_MAX}.
//
// Cada filho é um bloco (um Group, um cartão, uma coluna inteira). Cabem
// quantas colunas de `minColumn` a largura deixar, até `max` (padrão: uma por
// filho); os blocos são repartidos em rodízio (spreadColumns), então três
// blocos em duas colunas ficam 1 e 3 à esquerda, 2 à direita. No celular cabe
// uma só e tudo empilha na ordem em que foi escrito.
export const COLUMNS_MIN = 360;

// Quantas colunas de `minColumn` cabem na página, até `max`.
export function useColumnCount(max, minColumn = COLUMNS_MIN) {
  const { tokens } = useTheme();
  const { width } = useLayout();
  return gridColumns(columnInnerWidth(width, PAGE_MAX, tokens.space.md), minColumn, tokens.space.xl, max);
}

// Cabem `count` colunas lado a lado?
export function useColumns(count, minColumn = COLUMNS_MIN) {
  return useColumnCount(count, minColumn) >= count;
}

export default function Columns({ children, max, minColumn = COLUMNS_MIN, style }) {
  const { tokens } = useTheme();
  const blocks = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const k = useColumnCount(max ?? blocks.length, minColumn);
  if (k <= 1) return <View style={style}>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</View>;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space.xl }, style]}>
      {spreadColumns(blocks, k).map((col, i) => (
        <View key={i} style={{ flex: 1, minWidth: 0 }}>
          {col.map((b, j) => <Fragment key={j}>{b}</Fragment>)}
        </View>
      ))}
    </View>
  );
}
