import { forwardRef } from 'react';
import { SectionList } from 'react-native';

// Nativo: SectionList com cabeçalhos fixos (sticky) funciona de fábrica,
// um banner "empurra" o anterior ao rolar de uma seção para outra.
// A versão web (StickySectionList.web.jsx) recria esse comportamento, que o
// react-native-web não reproduz (lá os cabeçalhos sticky se sobrepõem).
const StickySectionList = forwardRef(function StickySectionList(props, ref) {
  return <SectionList ref={ref} stickySectionHeadersEnabled {...props} />;
});

export default StickySectionList;
