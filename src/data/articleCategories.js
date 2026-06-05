// Metadados das categorias de artigos: ordem de exibição + ícone (Ionicons/MCI).
// Fonte única de verdade da ordem/ícone. Nome e descrição vêm do i18n
// (category.<id> e category.<id>.desc). A contagem é calculada do array articles.

import { articles } from './articles';

// Ordem das categorias por interesse de busca no Brasil (mais procuradas primeiro).
export const ARTICLE_CATEGORIES = [
  { id: 'Igreja Católica', icon: 'church', iconSet: 'mci' },
  { id: 'Existência de Deus', icon: 'planet-outline', iconSet: 'ion' },
  { id: 'Moral', icon: 'compass-outline', iconSet: 'ion' },
  { id: 'Sagrada Escritura', icon: 'book-outline', iconSet: 'ion' },
  { id: 'História da Igreja', icon: 'time-outline', iconSet: 'ion' },
  { id: 'Outras Religiões', icon: 'globe-outline', iconSet: 'ion' },
];

// Relevância: ordem global de ids por volume de busca (mais buscado primeiro).
// Define como os artigos sobem dentro de cada categoria e quais entram em
// "Mais buscados". Ids fora desta lista mantêm a ordem original (vão para o fim).
export const RANKED_IDS = [
  56, 11, 1, 57, 67, 7, 4, 60, 63, 5,
  2, 25, 64, 62, 23, 61, 3, 68, 21, 66, 59,
  8, 35, 58, 28, 30, 19, 9, 72, 10, 18, 71, 26,
  24, 17, 37, 65, 15, 16, 29, 31, 69, 46, 70, 6,
  20, 12, 13, 14, 22, 49, 50, 55, 47, 48,
  34, 32, 33, 45, 51, 54, 52, 53, 44, 27,
  42, 43, 36, 38, 39, 40, 41,
  73, 74, 78, 79, 75, 76, 81, 80, 77, 82,
];

// Seção "Mais buscados" no topo da aba Artigos (ids curados, em ordem).
export const POPULAR_IDS = [56, 11, 57, 67, 7, 4, 60, 63, 25, 5];

export const POPULAR_META = { id: 'popular', icon: 'star', iconSet: 'ion' };

const rankIndex = new Map(RANKED_IDS.map((id, i) => [id, i]));
export const rankOf = (id) => (rankIndex.has(id) ? rankIndex.get(id) : Number.MAX_SAFE_INTEGER);

// Ordena uma lista de artigos por relevância, estável para empates.
export const sortByRank = (list) =>
  list
    .map((a, i) => [a, i])
    .sort(([a, ia], [b, ib]) => rankOf(a.id) - rankOf(b.id) || ia - ib)
    .map(([a]) => a);

export const countByCategory = (cat) =>
  articles.filter((a) => a.category === cat).length;
