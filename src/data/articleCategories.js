// Metadados das categorias de artigos: ordem de exibição + ícone (Ionicons).
// Fonte única de verdade da ordem/ícone. Nome e descrição vêm do i18n
// (category.<id> e category.<id>.desc). A contagem é calculada do array articles.

import { articles } from './articles';

export const ARTICLE_CATEGORIES = [
  { id: 'Existência de Deus', icon: 'planet-outline', iconSet: 'ion' },
  { id: 'Igreja Católica', icon: 'church', iconSet: 'mci' },
  { id: 'Sagrada Escritura', icon: 'book-outline', iconSet: 'ion' },
  { id: 'Moral', icon: 'compass-outline', iconSet: 'ion' },
  { id: 'Outras Religiões', icon: 'globe-outline', iconSet: 'ion' },
  { id: 'História da Igreja', icon: 'time-outline', iconSet: 'ion' },
];

export const countByCategory = (cat) =>
  articles.filter((a) => a.category === cat).length;
