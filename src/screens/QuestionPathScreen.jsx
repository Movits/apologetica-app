import { useLayoutEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { questionPathById } from '../data/questionPaths';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { progressOf, toggleStep } from '../utils/questionPaths';
import { Button, EmptyState, Group, ProgressBar, Row, SectionTitle } from '../components/ui';
import { centeredColumn } from '../components/ReadingColumn';

// Um roteiro de perguntas: a crença testada, como usar, os passos marcáveis
// (cada um com o que a pergunta expõe e, quando há, o que fazer com a resposta
// mais comum) e aonde o roteiro chega, com o artigo de apoio. As marcações
// vivem só no estado da tela, como no Exame de Consciência: nada é gravado.
export default function QuestionPathScreen({ navigation, route }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, icon } = tokens;
  const path = questionPathById(route?.params?.pathId);
  const [checked, setChecked] = useState(() => new Set());

  const title = path ? pick(path, 'title', isEn) : null;
  useLayoutEffect(() => {
    if (title) navigation.setOptions({ title });
  }, [navigation, title]);

  if (!path) {
    return <EmptyState icon="help-circle-outline" title={t('qp.notFound')} />;
  }

  const { done, total, ratio } = progressOf(path, checked);
  const label = [text('footnote'), { color: colors.textSubtle }];

  return (
    <ScrollView contentContainerStyle={[{ padding: space.md, paddingBottom: space.xl, gap: space.sm }, centeredColumn(undefined, space.md)]}>
      <Text style={label}>{t('qp.belief')}</Text>
      <Text style={[text('bodySerif'), { color: colors.text, fontStyle: 'italic' }]}>{pick(path, 'belief', isEn)}</Text>
      <Text style={[label, { marginTop: space.xs }]}>{t('qp.howTo')}</Text>
      <Text style={[text('body'), { color: colors.text }]}>{pick(path, 'intro', isEn)}</Text>

      <View style={{ marginTop: space.sm, gap: space.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={label}>{t('qp.progress', { done, total })}</Text>
          {done > 0 ? (
            <Button variant="plain" full={false} label={t('qp.reset')} onPress={() => setChecked(new Set())} />
          ) : null}
        </View>
        <ProgressBar value={ratio} accessibilityLabel={t('qp.progress', { done, total })} />
        <Text style={label}>{t('qp.notSaved')}</Text>
      </View>

      {path.steps.map((s, i) => {
        const isChecked = checked.has(i);
        const q = pick(s, 'q', isEn);
        const follow = pick(s, 'follow', isEn);
        return (
          <Group key={i} header={t('qp.step', { n: i + 1 })}>
            <Row
              role="checkbox"
              aria-checked={isChecked}
              accessibilityLabel={q}
              haptic="selection"
              title={q}
              titleRole="headline"
              titleLines={0}
              trailing={(
                <Ionicons
                  name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                  size={icon.md}
                  color={isChecked ? colors.success : colors.textTertiary}
                />
              )}
              onPress={() => setChecked((prev) => toggleStep(prev, i))}
            />
            <View style={{ padding: space.md, gap: space.xxs }}>
              <Text style={label}>{t('qp.aim')}</Text>
              <Text style={[text('body'), { color: colors.text }]}>{pick(s, 'aim', isEn)}</Text>
              {follow ? (
                <>
                  <Text style={[label, { marginTop: space.xs }]}>{t('qp.follow')}</Text>
                  <Text style={[text('body'), { color: colors.text }]}>{follow}</Text>
                </>
              ) : null}
            </View>
          </Group>
        );
      })}

      <SectionTitle title={t('qp.conclusion')} />
      <Text style={[text('reading'), { color: colors.text }]}>{pick(path, 'conclusion', isEn)}</Text>
      {path.articleId != null ? (
        <Group style={{ marginTop: space.sm }}>
          <Row
            icon="book-outline"
            title={t('qp.article')}
            trailing="chevron"
            onPress={() => openArticle(navigation, path.articleId)}
          />
        </Group>
      ) : null}
    </ScrollView>
  );
}
