import { memo, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES } from '../data/dialogues';
import { pick } from '../utils/i18nData';
import { Group, Row, SectionTitle } from './ui';

// "Objeções respondidas": objeções do Modo Diálogo que respondem ao artigo
// aberto, como lista agrupada (SectionTitle + Group + Row). A lista é derivada
// do campo relatedArticle dos próprios diálogos, então não existe dado novo a
// manter em sincronia: criar um diálogo apontando para um artigo já o faz
// aparecer aqui. O subtítulo diz quantos passos o roteiro tem. memo: o artigo
// re-renderiza ao narrar ou guardar, e a lista aqui só depende do id.
function RelatedDialogues({ currentId, onOpen }) {
  const { t, isEn } = useLanguage();

  const related = useMemo(() => DIALOGUES.filter((d) => d.relatedArticle === currentId), [currentId]);
  if (related.length === 0) return null;

  return (
    <>
      <SectionTitle title={t('articles.objectionsTitle')} style={{ marginHorizontal: 0 }} />
      <Group>
        {related.map((d) => (
          <Row
            key={d.id}
            icon="chatbubbles-outline"
            title={pick(d, 'objection', isEn)}
            titleLines={3}
            subtitle={d.steps?.length ? t('articles.dialogueSteps', { n: d.steps.length }) : undefined}
            trailing="chevron"
            onPress={() => onOpen(d.id)}
          />
        ))}
      </Group>
    </>
  );
}

export default memo(RelatedDialogues);
