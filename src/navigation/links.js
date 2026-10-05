// Links internos do app: um lugar só que conhece o nome das rotas e a forma dos
// params que as telas de destino leem. Módulo puro (sem react-native) para
// rodar em tests/links.test.mjs.
//
// Contratos de destino:
// - Aba 'Bíblia' (src/screens/BibleScreen.jsx:125-142) lê bookId, chapter,
//   highlightVerse e highlightVerseEnd e limpa os quatro depois de consumir.
// - 'ArticleFromSearch' (src/screens/ArticleDetailScreen.jsx:30 e :60) lê
//   articleId e, opcionalmente, fromPlanDay/fromPlanTrack.

// Converte { bookId, chapter, verse?, verseEnd? } (formato do `bibleNav` das
// referências) nos params da aba Bíblia. Chaves de destaque só entram quando
// existem, para a tela não receber `highlightVerse: undefined`.
export function bibleParams(nav) {
  if (!nav) return null;
  const { bookId, chapter, verse, verseEnd } = nav;
  const params = { bookId, chapter };
  if (verse != null) params.highlightVerse = verse;
  if (verseEnd != null) params.highlightVerseEnd = verseEnd;
  return params;
}

// Abre a aba Bíblia a partir de uma referência (usa o `bibleNav` dela) ou de um
// objeto de navegação já resolvido ({ bookId, chapter, verse, verseEnd }).
// Referência sem bibleNav (Catecismo, documentos) não navega. Quem precisa do
// `bibleNavEn` no idioma inglês resolve antes e passa o objeto pronto.
export function openBible(navigation, ref) {
  if (!ref) return;
  const params = bibleParams(ref.bibleNav ?? ref);
  if (!params?.bookId) return;
  navigation.navigate('Bíblia', params);
}

// Abre o detalhe de um artigo dentro da aba ativa. `extra` cobre os params
// opcionais (hoje só o plano de leitura: fromPlanDay, fromPlanTrack).
export function openArticle(navigation, articleId, extra) {
  navigation.navigate('ArticleFromSearch', { articleId, ...extra });
}
