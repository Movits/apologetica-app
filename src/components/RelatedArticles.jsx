import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { getRelatedArticles } from '../data/articleRelations';
import { pick, categoryLabel } from '../utils/i18nData';
import { Group, Row, SectionTitle } from './ui';

// Seção "Ver também" no fim do artigo: artigos tematicamente relacionados (de
// qualquer categoria), como lista agrupada (SectionTitle + Group + Row), no
// mesmo desenho das fontes citadas. O título fica alinhado à coluna do artigo,
// por isso zera a margem lateral padrão do SectionTitle.
export default function RelatedArticles({ currentId, onOpen }) {
  const { t, isEn } = useLanguage();

  const related = getRelatedArticles(currentId, articles);
  if (!related || related.length === 0) return null;

  return (
    <>
      <SectionTitle title={t('articles.relatedTitle')} style={{ marginHorizontal: 0 }} />
      <Group>
        {related.map((a) => (
          <Row
            key={a.id}
            title={pick(a, 'title', isEn)}
            titleLines={2}
            subtitle={categoryLabel(a.category, t)}
            trailing="chevron"
            onPress={() => onOpen(a.id)}
          />
        ))}
      </Group>
    </>
  );
}
