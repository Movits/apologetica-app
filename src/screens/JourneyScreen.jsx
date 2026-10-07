import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { ARTICLE_CATEGORIES, sortByRank } from '../data/articleCategories';
import { useJourney } from '../hooks/useJourney';
import { BADGES, LEVELS, categoryProgress, isLessonComplete, journeyStats, lessonOf } from '../utils/journey';
import { ARTICLES_BY_CATEGORY, resetJourney } from '../utils/journeyStore';
import { getLiveStreak } from '../utils/readingProgress';
import { openArticle } from '../navigation/links';
import { categoryLabel, pick } from '../utils/i18nData';
import { confirmAction } from '../utils/dialog';
import { Button, ContinueRow, Group, PressScale, ProgressBar, Row, SectionTitle, Sheet } from '../components/ui';
import { BadgeEmblem, XpRing } from '../components/lesson';
import { centeredColumn, columnInnerWidth, COLUMN_MAX } from '../components/ReadingColumn';

// Minha Jornada: o selo do nível com o anel até o próximo, os números
// (lições, testes sem erro, sequência, conquistas), a próxima lição, o
// progresso por tema (anel pequeno por categoria) e a grade de conquistas,
// cada uma com a própria folha. Tudo vem do estado local da jornada
// (useJourney) mais a sequência de leitura (readingProgress).
const BADGE_COLUMNS = 3;

export default function JourneyScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { width } = useWindowDimensions();
  const { space, radius, icon, seal } = tokens;
  const journey = useJourney();
  const [streak, setStreak] = useState(0);
  const [badge, setBadge] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getLiveStreak().then((n) => { if (alive) setStreak(n); });
      return () => { alive = false; };
    }, [])
  );

  const stats = useMemo(
    () => (journey ? journeyStats(journey, { articlesByCategory: ARTICLES_BY_CATEGORY }) : null),
    [journey]
  );

  // Próxima lição: o primeiro artigo por relevância ainda não concluído.
  const nextArticle = useMemo(() => {
    if (!journey) return null;
    return sortByRank(articles).find((a) => !isLessonComplete(lessonOf(journey, a.id))) || null;
  }, [journey]);

  const onReset = () => {
    confirmAction({
      title: t('journey.resetTitle'),
      message: t('journey.resetMessage'),
      confirmText: t('journey.resetConfirm'),
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: () => { resetJourney(); },
    });
  };

  if (!journey || !stats) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const levelName = pick(stats.level, 'name', isEn);
  const inner = columnInnerWidth(width, COLUMN_MAX, space.md);
  const badgeSide = Math.floor((inner - space.xs * (BADGE_COLUMNS - 1)) / BADGE_COLUMNS);
  const streakLabel = t(streak === 1 ? 'journey.days.one' : 'journey.days', { n: streak });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ padding: space.md, paddingBottom: space.xl }, centeredColumn(undefined, space.md)]}
    >
      {/* Selo do nível. */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, alignItems: 'center', gap: space.xs }}>
        <XpRing size={seal.xl} value={stats.progress} accessibilityLabel={levelName}>
          <BadgeEmblem id={stats.level.id} icon="star" size="lg" />
        </XpRing>
        <Text style={[text('footnote'), { color: colors.textSubtle, marginTop: space.xs }]}>{t('journey.levelOf', { n: stats.index + 1, total: LEVELS.length })}</Text>
        <Text role="heading" aria-level={1} style={[text('title'), { color: colors.text, textAlign: 'center' }]}>{levelName}</Text>
        <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>
          {stats.next
            ? `${t('journey.xp', { n: stats.xp })} · ${t('journey.toNext', { n: stats.toNext, level: pick(stats.next, 'name', isEn) })}`
            : `${t('journey.xp', { n: stats.xp })} · ${t('journey.maxLevel')}`}
        </Text>
        <ProgressBar value={stats.progress} accessibilityLabel={levelName} style={{ alignSelf: 'stretch', marginTop: space.xxs }} />
        {stats.completed === 0 ? (
          <Text style={[text('footnote'), { color: colors.textSubtle, textAlign: 'center', marginTop: space.xxs }]}>{t('journey.intro')}</Text>
        ) : null}
      </View>

      <Group style={{ marginTop: space.md }}>
        <Row icon="library-outline" title={t('journey.stats.completed')} trailing={t('journey.ofTotal', { n: stats.completed, total: stats.total })} />
        <Row icon="ribbon-outline" title={t('journey.stats.perfect')} trailing={String(stats.perfect)} />
        <Row icon="flame-outline" iconColor={streak > 0 ? colors.accentText : undefined} title={t('journey.stats.streak')} trailing={streakLabel} />
        <Row icon="trophy-outline" title={t('journey.stats.badges')} trailing={t('journey.ofTotal', { n: stats.badges, total: stats.badgesTotal })} />
      </Group>

      <SectionTitle title={t('journey.section.next')} />
      <Group>
        {nextArticle ? (
          <ContinueRow
            icon="play-circle-outline"
            title={pick(nextArticle, 'title', isEn)}
            subtitle={t('journey.nextSub')}
            onPress={() => openArticle(navigation, nextArticle.id)}
          />
        ) : (
          <Row icon="checkmark-done-outline" iconColor={colors.success} title={t('journey.allDone')} titleLines={0} />
        )}
      </Group>

      <SectionTitle title={t('journey.section.topics')} />
      <Group>
        {ARTICLE_CATEGORIES.map((cat) => {
          const prog = categoryProgress(journey, ARTICLES_BY_CATEGORY[cat.id] || []);
          const label = categoryLabel(cat.id, t);
          const sub = t('journey.categoryProgress', { n: prog.completed, total: prog.total });
          return (
            <Row
              key={cat.id}
              icon={cat.icon}
              title={label}
              subtitle={sub}
              accessibilityLabel={`${label}, ${sub}`}
              trailing={
                <XpRing size={seal.xs} value={prog.total ? prog.completed / prog.total : 0} accessibilityLabel={sub} />
              }
              chevron
              onPress={() => navigation.navigate('CategoryArticles', { category: cat.id })}
            />
          );
        })}
      </Group>

      <SectionTitle title={t('journey.section.badges')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {BADGES.map((b) => {
          const at = journey.badges[b.id];
          const name = pick(b, 'name', isEn);
          return (
            <PressScale
              key={b.id}
              role="button"
              aria-label={`${name}, ${at ? t('journey.unlockedOn', { date: formatDate(at, isEn) }) : t('journey.locked')}`}
              onPress={() => setBadge(b)}
              haptic="selection"
              style={({ pressed }) => ({
                width: badgeSide,
                minHeight: 44,
                padding: space.sm,
                borderRadius: radius.md,
                backgroundColor: pressed ? colors.separator : colors.card,
                alignItems: 'center',
                gap: space.xs,
              })}
            >
              <BadgeEmblem id={b.id} icon={b.icon} size="md" locked={!at} />
              <Text style={[text('caption1'), { color: at ? colors.text : colors.textSubtle, textAlign: 'center', fontWeight: '600' }]} numberOfLines={2}>
                {name}
              </Text>
            </PressScale>
          );
        })}
      </View>

      {stats.xp > 0 ? (
        <Button variant="plain" label={t('journey.reset')} onPress={onReset} textStyle={{ color: colors.danger }} style={{ marginTop: space.lg }} />
      ) : null}

      <Sheet visible={Boolean(badge)} onClose={() => setBadge(null)} title={badge ? pick(badge, 'name', isEn) : undefined}>
        {badge ? (
          <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.sm }}>
            <BadgeEmblem id={badge.id} icon={badge.icon} size="lg" locked={!journey.badges[badge.id]} />
            <Text style={[text('subhead'), { color: colors.text, textAlign: 'center' }]}>{pick(badge, 'desc', isEn)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
              <Ionicons
                name={journey.badges[badge.id] ? 'checkmark-circle' : 'lock-closed-outline'}
                size={icon.sm}
                color={journey.badges[badge.id] ? colors.success : colors.textTertiary}
              />
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>
                {journey.badges[badge.id] ? t('journey.unlockedOn', { date: formatDate(journey.badges[badge.id], isEn) }) : t('journey.locked')}
              </Text>
            </View>
            <Button label={t('common.close')} variant="secondary" onPress={() => setBadge(null)} style={{ alignSelf: 'stretch', marginTop: space.xs }} />
          </View>
        ) : null}
      </Sheet>
    </ScrollView>
  );
}

function formatDate(ts, isEn) {
  try {
    return new Date(ts).toLocaleDateString(isEn ? 'en-US' : 'pt-BR');
  } catch {
    return new Date(ts).toISOString().slice(0, 10);
  }
}
