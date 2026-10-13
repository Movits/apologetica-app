import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Group, SectionTitle } from '../ui';

// "Em resumo": os três pontos da lição, numerados, logo depois do corpo do
// artigo. Quem só ler isto sai com o essencial; quem leu tudo fixa. Os
// números ficam num disco `tint` com texto `onTint` (o dourado é
// preenchimento, nunca texto).
export default function LessonSummary({ points, style }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, radius, seal } = tokens;
  if (!points || !points.length) return null;

  return (
    <View style={style}>
      <SectionTitle title={t('lesson.summary.title')} />
      <Group>
        {points.map((p, i) => (
          <View
            key={i}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, minHeight: 44 }}
          >
            <View
              style={{
                width: seal.xs,
                height: seal.xs,
                borderRadius: radius.full,
                backgroundColor: colors.tint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[text('footnote'), { color: colors.onTint, fontWeight: '700' }]}>{i + 1}</Text>
            </View>
            <Text style={[text('callout'), { color: colors.text, flex: 1 }]}>{p}</Text>
          </View>
        ))}
      </Group>
    </View>
  );
}
