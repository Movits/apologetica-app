import { Children, cloneElement, isValidElement, useCallback, useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Linha de Chips. Por padrão quebra linha (`flexWrap`, gap `space.xs`), para
// segmentos curtos dentro de uma Row (tema, tamanho da letra em Ajustes). Com
// `scroll` vira um trilho horizontal sem barra de rolagem: é o padrão dos
// FILTROS de tela (Artigos, Busca, Referências, Plano de Leitura, Rosário,
// Estratégias de Debate), porque quebrar linha deixava um chip órfão sozinho
// embaixo. O trilho tem a altura do alvo de toque (44) e
// `flexGrow: 0, flexShrink: 0`, porque sem isso a web encolhe o ScrollView
// horizontal a quase nada; os chips ficam com o recuo lateral `space.md` (numa
// tela com padding próprio, passe `style={{ marginHorizontal: -space.md }}`
// para o trilho ir de borda a borda e o primeiro chip alinhar com os cards) e
// `keyboardShouldPersistTaps="handled"` para um toque no chip não só fechar o
// teclado. `style` vai no contêiner (margens); em modo scroll, `contentStyle`
// entra no contentContainerStyle e o resto vai ao ScrollView.
//
// No trilho, o chip `selected` nunca fica cortado na borda: na montagem o
// trilho já abre com ele à vista (sem animação) e, quando a seleção muda para
// um chip meio escondido, rola até ele (o Rosário de domingo abre em
// "Gloriosos", o último).
export default function ChipRow({ scroll, children, style, contentStyle, onLayout, onScroll, ...rest }) {
  const { tokens } = useTheme();
  const { space } = tokens;
  const ref = useRef(null);
  const chips = useRef([]);
  const viewW = useRef(0);
  const scrollX = useRef(0);
  const revealed = useRef(false);

  const items = Children.toArray(children);
  const selectedIndex = items.findIndex((c) => isValidElement(c) && c.props.selected);

  // Rola o mínimo para o chip `i` caber inteiro, com o recuo `space.md` de
  // folga. As medidas chegam pelo onLayout de cada chip e do trilho; a posição
  // de rolagem pelo onScroll (e já anotada aqui, para não depender dele).
  const reveal = useCallback((i, animated) => {
    const box = chips.current[i];
    const w = viewW.current;
    if (!box || !w) return;
    const x = scrollX.current;
    let target = null;
    if (box.x + box.width > x + w - space.md) target = box.x + box.width - w + space.md;
    else if (box.x < x + space.md) target = box.x - space.md;
    if (target !== null) {
      scrollX.current = Math.max(0, target);
      ref.current?.scrollTo({ x: scrollX.current, animated });
    }
    revealed.current = true;
  }, [space.md]);

  // Seleção nova: anima só depois da primeira revelação (na montagem as
  // medidas ainda não chegaram e quem revela é o onLayout, sem animação).
  useEffect(() => {
    if (scroll && selectedIndex >= 0) reveal(selectedIndex, revealed.current);
  }, [scroll, selectedIndex, reveal]);

  if (scroll) {
    const tryFirstReveal = () => {
      if (!revealed.current && selectedIndex >= 0) reveal(selectedIndex, false);
    };
    return (
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onLayout={(e) => {
          viewW.current = e.nativeEvent.layout.width;
          tryFirstReveal();
          onLayout?.(e);
        }}
        onScroll={(e) => {
          scrollX.current = e.nativeEvent.contentOffset.x;
          onScroll?.(e);
        }}
        contentContainerStyle={[{ paddingHorizontal: space.md, gap: space.xs, alignItems: 'center' }, contentStyle]}
        style={[{ flexGrow: 0, flexShrink: 0, height: 44 }, style]}
        {...rest}
      >
        {items.map((child, i) => (isValidElement(child)
          ? cloneElement(child, {
            onLayout: (e) => {
              chips.current[i] = e.nativeEvent.layout;
              if (i === selectedIndex) tryFirstReveal();
              child.props.onLayout?.(e);
            },
          })
          : child))}
      </ScrollView>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }, style]} onLayout={onLayout} {...rest}>
      {children}
    </View>
  );
}
