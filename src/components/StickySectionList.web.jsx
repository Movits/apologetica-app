import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ScrollView, View } from 'react-native';

// Web: o sticky nativo do SectionList vira vários `position: sticky; top: 0`
// soltos que se empilham e se sobrepõem. Aqui recriamos o comportamento do
// nativo com o padrão CSS de cabeçalho de tabela: um container por seção, com
// o cabeçalho `position: sticky`. Assim o banner gruda no topo enquanto a
// seção está visível e é empurrado para fora pela seção seguinte, sem sobrepor.
//
// As listas aqui são pequenas (dezenas de itens), então renderizamos tudo de
// uma vez (sem virtualização) e ignoramos as props de performance do
// SectionList (initialNumToRender, windowSize, etc.).
const StickySectionList = forwardRef(function StickySectionList(
  {
    sections = [],
    keyExtractor,
    renderItem,
    renderSectionHeader,
    ListEmptyComponent,
    contentContainerStyle,
    onScroll,
    onContentSizeChange,
    onLayout,
    scrollEventThrottle,
    style,
    // props exclusivas do SectionList nativo: descartadas de propósito
    ...rest // eslint-disable-line no-unused-vars
  },
  ref
) {
  const scrollRef = useRef(null);
  // Nós DOM dos itens e cabeçalhos (na web o ref de View é o próprio elemento),
  // para o scrollToLocation conseguir ir até o alvo como no SectionList nativo.
  const itemNodes = useRef(new Map());
  const headerNodes = useRef(new Map());

  const registerNode = (map, key) => (el) => {
    if (el) map.current.set(key, el);
    else map.current.delete(key);
  };

  useImperativeHandle(ref, () => ({
    // Mesma assinatura usada pelas telas (deep link e tab-press volta ao topo).
    scrollToLocation: ({ sectionIndex = 0, itemIndex = 0, viewPosition = 0, animated = true } = {}) => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;
      try {
        if (sectionIndex === 0 && itemIndex === 0 && viewPosition === 0) {
          scrollEl.scrollTo({ y: 0, animated });
          return;
        }
        const target = itemNodes.current.get(`${sectionIndex}:${itemIndex}`);
        const scroller = scrollEl.getScrollableNode ? scrollEl.getScrollableNode() : scrollEl;
        if (!target?.getBoundingClientRect || !scroller?.getBoundingClientRect) {
          scrollEl.scrollTo({ y: 0, animated });
          return;
        }
        const headerEl = headerNodes.current.get(sectionIndex);
        const headerH = headerEl?.getBoundingClientRect ? headerEl.getBoundingClientRect().height : 0;
        const targetRect = target.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const y = targetRect.top - scrollerRect.top + scroller.scrollTop
          - viewPosition * scroller.clientHeight - headerH;
        scrollEl.scrollTo({ y: Math.max(0, y), animated });
      } catch {
        scrollEl.scrollTo({ y: 0, animated: true });
      }
    },
    scrollToOffset: ({ offset = 0 } = {}) => scrollRef.current?.scrollTo({ y: offset, animated: true }),
  }));

  const isEmpty = sections.every((s) => !s?.data || s.data.length === 0);

  return (
    <ScrollView
      ref={scrollRef}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={contentContainerStyle}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      scrollEventThrottle={scrollEventThrottle}
    >
      {isEmpty
        ? ListEmptyComponent || null
        : sections.map((section, sectionIndex) => (
            <View key={section.key ?? section.meta?.id ?? sectionIndex}>
              {/* O wrapper sticky precisa ser opaco; o SectionBanner já tem fundo. */}
              <View
                ref={registerNode(headerNodes, sectionIndex)}
                style={{ position: 'sticky', top: 0, zIndex: 2 }}
              >
                {renderSectionHeader?.({ section })}
              </View>
              {section.data.map((item, index) => (
                <View
                  key={keyExtractor ? keyExtractor(item, index) : index}
                  ref={registerNode(itemNodes, `${sectionIndex}:${index}`)}
                >
                  {renderItem?.({ item, index, section })}
                </View>
              ))}
            </View>
          ))}
    </ScrollView>
  );
});

export default StickySectionList;
