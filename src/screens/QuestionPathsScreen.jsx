import { ScrollView, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { QUESTION_PATHS } from '../data/questionPaths';
import { pick } from '../utils/i18nData';
import { Group, Row } from '../components/ui';
import { centeredColumn } from '../components/ReadingColumn';

// Perguntas que expõem: a lista dos roteiros (src/data/questionPaths.js).
// Cada linha mostra o título e a crença testada, e abre o roteiro marcável.
export default function QuestionPathsScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;

  return (
    <ScrollView contentContainerStyle={[{ padding: space.md, paddingBottom: space.xl, gap: space.sm }, centeredColumn(undefined, space.md)]}>
      <Text style={[text('body'), { color: colors.text }]}>{t('qp.intro')}</Text>
      <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('qp.tip')}</Text>
      <Group style={{ marginTop: space.sm }}>
        {QUESTION_PATHS.map((p) => (
          <Row
            key={p.id}
            icon={p.icon}
            title={pick(p, 'title', isEn)}
            titleRole="headline"
            subtitle={pick(p, 'belief', isEn)}
            trailing="chevron"
            onPress={() => navigation.navigate('QuestionPath', { pathId: p.id })}
          />
        ))}
      </Group>
    </ScrollView>
  );
}
