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

  useImperativeHandle(ref, () => ({
    // Mesma assinatura usada pelas telas (tab-press volta ao topo).
    scrollToLocation: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
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
              <View style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                {renderSectionHeader?.({ section })}
              </View>
              {section.data.map((item, index) => (
                <View key={keyExtractor ? keyExtractor(item, index) : index}>
                  {renderItem?.({ item, index, section })}
                </View>
              ))}
            </View>
          ))}
    </ScrollView>
  );
});

export default StickySectionList;
