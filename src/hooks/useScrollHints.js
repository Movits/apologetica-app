import { useState, useCallback, useRef } from 'react';

// Detecta se há conteúdo fora da área visível (acima ou abaixo) de uma lista ou ScrollView.
// Use junto com <ScrollHint /> para mostrar setinhas discretas indicando que dá pra scrollar.
//
// Uso:
//   const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
//   <FlatList
//     onScroll={onScroll}
//     onContentSizeChange={onContentSizeChange}
//     onLayout={onLayout}
//     scrollEventThrottle={32}
//   />
//   <ScrollHint direction="up" visible={showTop} />
//   <ScrollHint direction="down" visible={showBottom} />
//
// EDGE_THRESHOLD: quão perto da borda a setinha some (em px de scroll).
const EDGE_THRESHOLD = 24;

export function useScrollHints() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const state = useRef({ offset: 0, content: 0, layout: 0 });

  const update = useCallback(() => {
    const { offset, content, layout } = state.current;
    if (content === 0 || layout === 0) return;
    const overflows = content > layout + 4;
    if (!overflows) {
      setShowTop(false);
      setShowBottom(false);
      return;
    }
    setShowTop(offset > EDGE_THRESHOLD);
    setShowBottom(offset + layout < content - EDGE_THRESHOLD);
  }, []);

  const onScroll = useCallback(
    (e) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      state.current.offset = contentOffset.y;
      state.current.content = contentSize.height;
      state.current.layout = layoutMeasurement.height;
      update();
    },
    [update]
  );

  const onContentSizeChange = useCallback(
    (_w, h) => {
      state.current.content = h;
      update();
    },
    [update]
  );

  const onLayout = useCallback(
    (e) => {
      state.current.layout = e.nativeEvent.layout.height;
      update();
    },
    [update]
  );

  return { showTop, showBottom, onScroll, onContentSizeChange, onLayout };
}
