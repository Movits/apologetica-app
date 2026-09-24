import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { confirmAction, notify } from '../utils/dialog';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { READING_TRACKS, getTrack } from '../data/readingPlan';
import { articles } from '../data/articles';
import { getPlanProgress, resetPlanProgress, getStreak } from '../utils/readingProgress';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { Button, Chip, Group, ProgressBar, Row, SectionTitle } from '../components/ui';

// Plano de leitura: trilhos (Fundamentos, Aprofundamento e a trilha temática)
// como chips, resumo com barra de progresso e streak num Group, e os dias em
// linhas agrupadas. O artigo abre por openArticle com fromPlanDay/fromPlanTrack,
// que é o que o ArticleDetailScreen usa para marcar o dia como lido.
export default function ReadingPlanScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, icon } = tokens;
  const [trackId, setTrackId] = useState('fundamentos');
  const [progress, setProgress] = useState({ completed: [], lastDay: 0 });
  const [streak, setStreak] = useState(0);

  const track = getTrack(trackId);
  const days = track.days;
  // readingPlan.js guarda o PT com sufixo "Pt" (titlePt/descPt), fora da
  // convenção campo/campoEn que o `pick` lê, então a escolha é direta aqui.
  const trackTitle = isEn ? track.titleEn : track.titlePt;
  const trackDesc = isEn ? track.descEn : track.descPt;

  // Artigo por id, montado uma vez em vez de um find por dia a cada render.
  const articleById = useMemo(() => new Map(articles.map((a) => [a.id, a])), []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const p = await getPlanProgress(trackId);
        const s = await getStreak();
        if (active) { setProgress(p); setStreak(s?.count || 0); }
      })();
      return () => { active = false; };
    }, [trackId])
  );

  const onReset = () => {
    confirmAction({
      title: isEn ? 'Reset progress?' : 'Reiniciar progresso?',
      message: isEn
        ? 'Progress for this track will be erased. Read articles remain available.'
        : 'O progresso deste trilho será apagado. Os artigos lidos continuam disponíveis.',
      confirmText: isEn ? 'Reset' : 'Reiniciar',
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: async () => {
        await resetPlanProgress(trackId);
        setProgress({ completed: [], lastDay: 0 });
      },
    });
  };

  const openDay = (item, article) => {
    if (article) {
      openArticle(navigation, article.id, { fromPlanDay: item.day, fromPlanTrack: trackId });
      return;
    }
    notify(
      isEn ? 'In preparation' : 'Em preparação',
      isEn ? 'This article will be added in a future update.' : 'Este artigo ainda será adicionado em uma próxima atualização.'
    );
  };

  const totalDone = progress.completed.length;
  const readLabel = isEn ? 'read' : 'lido';

  // Dia concluído: marca de sucesso antes do chevron.
  const doneTrailing = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
      <Ionicons name="checkmark-circle" size={icon.md} color={colors.success} />
      <Ionicons name="chevron-forward" size={icon.sm} color={colors.textTertiary} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {READING_TRACKS.map((tr) => (
          <Chip
            key={tr.id}
            label={t(`plan.track.${tr.id}`)}
            selected={tr.id === trackId}
            onPress={() => setTrackId(tr.id)}
            haptic
          />
        ))}
      </View>

      {/* Resumo do trilho: título, descrição, progresso e streak. */}
      <Group style={{ marginTop: space.md }}>
        <View style={{ padding: space.md, gap: space.xs }}>
          <Text style={[text('headline'), { color: colors.text }]}>{trackTitle}</Text>
          <Text style={[text('subhead'), { color: colors.textSubtle }]}>{trackDesc}</Text>
          <ProgressBar
            value={days.length ? totalDone / days.length : 0}
            accessibilityLabel={t('plan.daysRead', { done: totalDone, total: days.length })}
            style={{ marginTop: space.xs }}
          />
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>
            {t('plan.daysRead', { done: totalDone, total: days.length })}
          </Text>
        </View>
        {streak > 0 ? (
          <Row icon="flame-outline" iconColor={colors.accentText} title={`${streak} ${t('plan.streak')}`} />
        ) : null}
      </Group>

      {totalDone > 0 ? (
        <Button
          variant="plain"
          label={t('plan.reset')}
          onPress={onReset}
          textStyle={{ color: colors.danger }}
          style={{ marginTop: space.xs }}
        />
      ) : null}

      <SectionTitle title={isEn ? 'Days' : 'Dias'} />
      <Group>
        {days.map((item) => {
          const done = progress.completed.includes(item.day);
          const article = articleById.get(item.articleId);
          const title = article ? pick(article, 'title', isEn) : pick(item, 'theme', isEn);
          const dayLabel = `${t('plan.day')} ${item.day}`;
          return (
            <Row
              key={`${trackId}-${item.day}`}
              trailing={done ? doneTrailing : 'chevron'}
              accessibilityLabel={`${dayLabel}, ${title}${done ? `, ${readLabel}` : ''}`}
              onPress={() => openDay(item, article)}
            >
              <Text style={[text('caption1'), { color: colors.accentText }]}>{dayLabel}</Text>
              <Text style={[text('headline'), { color: colors.text }]} numberOfLines={2}>{title}</Text>
              {!article ? (
                <Text style={[text('footnote'), { color: colors.textSubtle }]}>
                  {isEn ? '(in preparation)' : '(em preparação)'}
                </Text>
              ) : null}
            </Row>
          );
        })}
      </Group>
    </ScrollView>
  );
}
