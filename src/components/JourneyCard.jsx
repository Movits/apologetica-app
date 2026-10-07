import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick } from '../utils/i18nData';
import { journeyStats } from '../utils/journey';
import { ARTICLES_BY_CATEGORY } from '../utils/journeyStore';
import { PressScale, ProgressBar } from './ui';
import XpRing from './lesson/XpRing';

// Cartão da Jornada na Início: anel com o número do nível, nome do nível,
// lições concluídas e XP, barra até o próximo nível e, quando há, a chama da
// sequência. Toque abre Minha Jornada. `journey` é o estado (useJourney);
// `streak` vem de readingProgress.getStreak e é opcional.
export default function JourneyCard({ journey, streak = 0, onPress, style }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon, seal } = tokens;
  if (!journey) return null;
  const st = journeyStats(journey, { articlesByCategory: ARTICLES_BY_CATEGORY });
  const levelName = pick(st.level, 'name', isEn);
  const label = `${t('home.card.journey')}, ${t('journey.level')} ${st.index + 1} ${levelName}, ${t('journey.lessons', { n: st.completed, total: st.total })}`;

  return (
    <PressScale
      role="button"
      aria-label={label}
      onPress={onPress}
      haptic="selection"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? colors.separator : colors.card,
          borderRadius: radius.lg,
          padding: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          minHeight: 44,
        },
        style,
      ]}
    >
      <XpRing size={seal.md} value={st.progress} accessibilityLabel={levelName}>
        <Text style={[text('headline'), { color: colors.text }]}>{st.index + 1}</Text>
      </XpRing>
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Text style={[text('headline'), { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>{levelName}</Text>
          {streak > 1 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
              <Ionicons name="flame" size={icon.sm} color={colors.accentText} />
              <Text style={[text('footnote'), { color: colors.accentText, fontWeight: '600' }]}>{streak}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[text('footnote'), { color: colors.textSubtle }]} numberOfLines={1}>
          {`${t('journey.lessons', { n: st.completed, total: st.total })} · ${t('journey.xp', { n: st.xp })}`}
        </Text>
        <ProgressBar value={st.progress} accessibilityLabel={levelName} style={{ marginTop: space.xxs }} />
      </View>
      <Ionicons name="chevron-forward" size={icon.sm} color={colors.textTertiary} />
    </PressScale>
  );
}
