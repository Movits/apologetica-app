import { Children, cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

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
//
// Na web o trilho também anda com o mouse (useWebRailMouse) e mostra setas
// nas bordas do lado em que ainda há chips escondidos (RailArrow).
export default function ChipRow({ scroll, children, style, contentStyle, onLayout, onScroll, ...rest }) {
  const { tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  const ref = useRef(null);
  const chips = useRef([]);
  const viewW = useRef(0);
  const contentW = useRef(0);
  const scrollX = useRef(0);
  const revealed = useRef(false);
  const [edges, setEdges] = useState({ left: false, right: false });
  useWebRailMouse(ref, scroll);

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
    // Setas só na web: no toque o arrasto basta.
    const updateEdges = () => {
      if (Platform.OS !== 'web') return;
      const x = scrollX.current;
      const left = x > 1;
      const right = contentW.current - viewW.current - x > 1;
      setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    };
    const page = (dir) => {
      const max = Math.max(0, contentW.current - viewW.current);
      scrollX.current = Math.max(0, Math.min(max, scrollX.current + dir * viewW.current * 0.7));
      ref.current?.scrollTo({ x: scrollX.current, animated: true });
    };
    return (
      <View style={[styles.rail, style]}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onLayout={(e) => {
            viewW.current = e.nativeEvent.layout.width;
            tryFirstReveal();
            updateEdges();
            onLayout?.(e);
          }}
          onContentSizeChange={(w) => {
            contentW.current = w;
            updateEdges();
          }}
          onScroll={(e) => {
            scrollX.current = e.nativeEvent.contentOffset.x;
            updateEdges();
            onScroll?.(e);
          }}
          contentContainerStyle={[{ paddingHorizontal: space.md, gap: space.xxs, alignItems: 'center' }, contentStyle]}
          style={styles.rail}
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
        {edges.left ? <RailArrow side="left" label={t('common.scrollLeft')} onPress={() => page(-1)} /> : null}
        {edges.right ? <RailArrow side="right" label={t('common.scrollRight')} onPress={() => page(1)} /> : null}
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }, style]} onLayout={onLayout} {...rest}>
      {children}
    </View>
  );
}

// Rolagem do trilho com mouse (só web). O navegador não rola na horizontal
// com a roda comum e a barra fica escondida, então sem isto o trilho só
// andava clicando no último chip visível. Aqui:
// - a roda vertical vira rolagem horizontal enquanto o trilho ainda pode
//   andar naquele sentido (no fim, a roda volta a rolar a página);
// - arrastar com o mouse rola o trilho, e o clique que encerra um arrasto não
//   aciona o chip embaixo do cursor.
// Toque (celular, tablet) continua com o arrasto nativo do navegador.
function useWebRailMouse(ref, enabled) {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'web') return undefined;
    const node = ref.current?.getScrollableNode?.();
    if (!node) return undefined;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max <= 0) return;
      if ((e.deltaY < 0 && node.scrollLeft <= 0) || (e.deltaY > 0 && node.scrollLeft >= max)) return;
      node.scrollLeft = Math.max(0, Math.min(max, node.scrollLeft + e.deltaY));
      e.preventDefault();
    };

    let drag = null;
    let dragged = false;
    const onDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: node.scrollLeft };
      dragged = false;
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!dragged && Math.abs(dx) < 5) return;
      dragged = true;
      node.scrollLeft = drag.left - dx;
    };
    const onUp = () => { drag = null; };
    const onClick = (e) => {
      if (!dragged) return;
      e.stopPropagation();
      e.preventDefault();
      dragged = false;
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    node.addEventListener('click', onClick, true);
    return () => {
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      node.removeEventListener('click', onClick, true);
    };
  }, [ref, enabled]);
}

// Seta de rolagem do trilho: disco de 32 num alvo de 44, sobre a borda.
function RailArrow({ side, onPress, label }) {
  const { colors, tokens } = useTheme();
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={[styles.arrow, side === 'left' ? { left: 0 } : { right: 0 }]}
    >
      <View
        style={[
          styles.arrowDisc,
          { backgroundColor: colors.elevated, borderColor: colors.separator, borderRadius: tokens.radius.full },
          tokens.shadow.floating,
        ]}
      >
        <Ionicons name={side === 'left' ? 'chevron-back' : 'chevron-forward'} size={tokens.icon.sm} color={colors.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: { flexGrow: 0, flexShrink: 0, height: 44 },
  arrow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  arrowDisc: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
