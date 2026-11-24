import { ScrollView, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { QUESTION_PATHS } from '../data/questionPaths';
import { pick } from '../utils/i18nData';
import { Columns, Group, Row, useColumnCount } from '../components/ui';
import { COLUMN_MAX, PAGE_MAX, centeredColumn } from '../components/ReadingColumn';

// Perguntas que expõem: a lista dos roteiros (src/data/questionPaths.js).
// Cada linha mostra o título e a crença testada, e abre o roteiro marcável.
export default function QuestionPathsScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  // Desktop: os roteiros viram cartões em colunas (Columns); no celular, a
  // lista agrupada de sempre.
  const wide = useColumnCount(3) > 1;

  const renderPath = (p) => (
    <Row
      key={p.id}
      icon={p.icon}
      title={pick(p, 'title', isEn)}
      titleRole="headline"
      subtitle={pick(p, 'belief', isEn)}
      trailing="chevron"
      onPress={() => navigation.navigate('QuestionPath', { pathId: p.id })}
    />
  );

  return (
    <ScrollView contentContainerStyle={[{ padding: space.md, paddingBottom: space.xl, gap: space.sm }, centeredColumn(PAGE_MAX, space.md)]}>
      <Text style={[text('body'), { color: colors.text, maxWidth: COLUMN_MAX }]}>{t('qp.intro')}</Text>
      <Text style={[text('footnote'), { color: colors.textSubtle, maxWidth: COLUMN_MAX }]}>{t('qp.tip')}</Text>
      {wide ? (
        <Columns max={3} style={{ marginTop: space.sm }}>
          {QUESTION_PATHS.map((p) => <Group key={p.id} style={{ marginBottom: space.md }}>{renderPath(p)}</Group>)}
        </Columns>
      ) : (
        <Group style={{ marginTop: space.sm }}>{QUESTION_PATHS.map(renderPath)}</Group>
      )}
    </ScrollView>
  );
}
