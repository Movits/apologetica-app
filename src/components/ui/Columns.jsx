import { Fragment } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import useLayout from '../../hooks/useLayout';
import { PAGE_MAX } from '../ReadingColumn';

// Colunas lado a lado quando a área das telas é larga (desktop), empilhadas
// no celular. Cada filho é uma coluna inteira (um ou mais blocos), na ordem
// em que aparece empilhado. Use dentro de um LargeTitleScreen com
// maxWidth={PAGE_MAX}.
//
// `minColumn` é a largura mínima de cada coluna: abaixo de
// `n * minColumn + gaps`, tudo volta a empilhar.
export const COLUMNS_MIN = 360;

export function useColumns(count, minColumn = COLUMNS_MIN) {
  const { tokens } = useTheme();
  const { width } = useLayout();
  const gap = tokens.space.xl;
  const inner = Math.min(width, PAGE_MAX) - tokens.space.md * 2;
  return inner >= count * minColumn + (count - 1) * gap;
}

export default function Columns({ children, minColumn = COLUMNS_MIN, style }) {
  const { tokens } = useTheme();
  const cols = (Array.isArray(children) ? children : [children]).filter(Boolean);
  const side = useColumns(cols.length, minColumn);
  if (!side) return <View style={style}>{cols.map((col, i) => <Fragment key={i}>{col}</Fragment>)}</View>;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space.xl }, style]}>
      {cols.map((col, i) => (
        <View key={i} style={{ flex: 1, minWidth: 0 }}>{col}</View>
      ))}
    </View>
  );
}
