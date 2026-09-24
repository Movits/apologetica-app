import { Children, Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Lista agrupada (inset grouped): card com fundo `card`, cantos `radius.md` e
// um separador de meia linha entre cada par de filhos, recuado à esquerda.
// `header` e `footer` ficam fora do card, em footnote secundário. `style` vai
// no invólucro externo (use para margens), o visual do card é fixo.
export default function Group({ children, header, footer, insetLeft, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius } = tokens;
  const items = Children.toArray(children);

  const caption = [text('footnote'), { color: colors.textSubtle, marginHorizontal: space.md }];
  const separator = {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: insetLeft ?? space.md,
  };

  return (
    <View style={style}>
      {header ? (
        typeof header === 'string'
          ? <Text style={[caption, { marginBottom: space.xs }]}>{header}</Text>
          : header
      ) : null}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden' }}>
        {items.map((child, i) => (
          <Fragment key={child.key ?? i}>
            {i > 0 ? <View style={separator} /> : null}
            {child}
          </Fragment>
        ))}
      </View>
      {footer ? (
        typeof footer === 'string'
          ? <Text style={[caption, { marginTop: space.xs }]}>{footer}</Text>
          : footer
      ) : null}
    </View>
  );
}
