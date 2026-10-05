import bodasDeCana from './bodas-de-cana';
import ceiaEmEmaus from './ceia-em-emaus';
import criacaoDeAdao from './criacao-de-adao';
import noiteEstrelada from './noite-estrelada';
import oAngelus from './o-angelus';
import torreDeBabel from './torre-de-babel';
import ultimaCeia from './ultima-ceia';

// Lições de obras de arte (placa, aula e lupas) mostradas no visualizador de
// obras quando o leitor toca na imagem de um artigo. Cada lição diz em
// `articles` quais artigos a usam. As que têm `museum` vieram do Museu Virtual
// e trazem a pirâmide Deep Zoom (`dzi`) do acervo; as demais usam a pirâmide
// de miniaturas da Commons (src/data/artImages.js), e as coordenadas das lupas
// valem sobre o arquivo da Commons.
export const ARTWORKS = [
  criacaoDeAdao,
  noiteEstrelada,
  ceiaEmEmaus,
  oAngelus,
  ultimaCeia,
  bodasDeCana,
  torreDeBabel,
];

const BY_ARTICLE = new Map();
for (const art of ARTWORKS) {
  for (const id of art.articles) BY_ARTICLE.set(id, art);
}

export function artworkForArticle(articleId) {
  return BY_ARTICLE.get(articleId) ?? null;
}

export const MUSEUM_URL = 'https://movits.github.io/museu-virtual/';

// Página da obra no Museu Virtual (HashRouter), com a lupa aberta se houver.
export function museumUrl(art, lupaId) {
  if (!art?.museum) return null;
  return `${MUSEUM_URL}#/obra/${art.museum}${lupaId ? `?lupa=${lupaId}` : ''}`;
}
