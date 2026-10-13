import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { articles } from '../data/articles';
import { useJourney } from '../hooks/useJourney';
import { XP } from '../utils/journey';
import { dispatchJourney } from '../utils/journeyStore';
import { REVIEW_SESSION_SIZE, daysBetween, reviewSummary, shuffledOrder } from '../utils/review';
import { dueItems } from '../utils/reviewItems';
import { todayKey } from '../utils/daily';
import { pick } from '../utils/i18nData';
import { haptics } from '../utils/haptics';
import { openArticle } from '../navigation/links';
import { Button, EmptyState, Group, ProgressBar, Row } from '../components/ui';
import { OptionButton, XpChip, XpRing } from '../components/lesson';
import { centeredColumn } from '../components/ReadingColumn';

// Revisão espaçada: as perguntas que voltaram hoje (src/utils/review.js diz
// quando cada uma volta). Uma sessão tem até REVIEW_SESSION_SIZE perguntas,
// tiradas na abertura e fixas até o fim, para a lista não mudar enquanto as
// respostas reagendam os cartões. Cada resposta é gravada na hora (sair no
// meio não perde nada) e o acerto vale XP.review. As opções aparecem
// embaralhadas, com uma ordem que muda de um dia para o outro.
const KIND_ICON = { check: 'school-outline', hook: 'bulb-outline', quiz: 'today-outline' };
const TITLE_BY_ID = new Map(articles.map((a) => [a.id, a]));

export default function ReviewScreen({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon, motion, seal } = tokens;
  const journey = useJourney();
  const [today] = useState(() => todayKey());
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gained, setGained] = useState(0);
  const [returnsIn, setReturnsIn] = useState(null);
  const [finished, setFinished] = useState(false);

  // A sessão nasce quando o estado carrega (e de novo em "Revisar mais").
  useEffect(() => {
    if (journey && !session) setSession(dueItems(journey.review, today, REVIEW_SESSION_SIZE));
  }, [journey, session, today]);

  const item = session && session[index];
  const optionCount = item?.options?.length || 0;
  const order = useMemo(() => shuffledOrder(optionCount, `review:${item?.key}:${today}`), [optionCount, item?.key, today]);

  if (!journey || !session) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const summary = reviewSummary(journey.review, today);
  const remaining = dueItems(journey.review, today).length;
  const scroll = { padding: space.md, paddingBottom: space.xl, gap: space.md, ...centeredColumn(undefined, space.md) };

  const nextLabel = () => {
    const n = daysBetween(today, summary.nextDue);
    if (n == null) return null;
    return n <= 1 ? t('journey.review.nextTomorrow') : t('journey.review.nextIn', { n });
  };

  const howItWorks = (
    <Group header={t('review.how.title')}>
      <View style={{ padding: space.md }}>
        <Text style={[text('subhead'), { color: colors.text }]}>{t('review.how.body', { n: XP.review })}</Text>
      </View>
    </Group>
  );

  // Nada vencido hoje.
  if (!session.length) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={scroll}>
        <EmptyState
          icon="checkmark-done-outline"
          title={summary.total ? t('journey.review.clear') : t('review.empty.title')}
          message={summary.total ? nextLabel() : t('review.empty.none')}
        />
        {howItWorks}
      </ScrollView>
    );
  }

  const restartSession = () => {
    setSession(null);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setGained(0);
    setReturnsIn(null);
    setFinished(false);
  };

  if (finished) {
    const total = session.length;
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={scroll}>
        <Animated.View
          entering={FadeInDown.duration(motion.layout)}
          style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, alignItems: 'center', gap: space.sm }}
        >
          <XpRing size={seal.lg} value={total ? score / total : 0} accessibilityLabel={t('lesson.check.result', { score, total })}>
            <Text style={[text('title'), { color: colors.text }]}>{`${score}/${total}`}</Text>
          </XpRing>
          <Text role="heading" aria-level={2} style={[text('section'), { color: colors.text, textAlign: 'center' }]}>{t('review.done.title')}</Text>
          <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>{t('lesson.check.result', { score, total })}</Text>
          {gained > 0 ? <XpChip n={gained} animated style={{ alignSelf: 'center' }} /> : null}
          <Text style={[text('footnote'), { color: colors.textSubtle, textAlign: 'center' }]}>{t('review.done.note')}</Text>
          <View style={{ alignSelf: 'stretch', gap: space.xs, marginTop: space.xs }}>
            {remaining > 0 ? (
              <Button icon="repeat-outline" label={t('review.more', { n: Math.min(remaining, REVIEW_SESSION_SIZE) })} onPress={restartSession} haptic="impact" />
            ) : null}
            <Button variant="secondary" icon="trophy-outline" label={t('review.back')} onPress={() => navigation.goBack()} />
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  const total = session.length;
  const answered = selected !== null;
  const ok = answered && selected === item.correct;
  const isLast = index + 1 >= total;
  const qText = pick(item, 'question', isEn);
  const opts = pick(item, 'options', isEn) || [];
  const why = pick(item, 'why', isEn);
  const article = item.articleId != null ? TITLE_BY_ID.get(item.articleId) : null;
  const context = article ? `${t(`review.kind.${item.kind}`)} · ${pick(article, 'title', isEn)}` : t(`review.kind.${item.kind}`);

  const choose = async (i) => {
    if (answered) return;
    setSelected(i);
    const right = i === item.correct;
    if (right) { setScore((s) => s + 1); haptics.success(); } else { haptics.error(); }
    try {
      const r = await dispatchJourney({ type: 'review', key: item.key, correct: right, today });
      setGained((g) => g + r.gained);
      const card = r.state.review[item.key];
      setReturnsIn(card?.mastered ? 'mastered' : daysBetween(today, card?.due));
    } catch {}
  };

  const next = () => {
    if (isLast) { setFinished(true); return; }
    setIndex((x) => x + 1);
    setSelected(null);
    setReturnsIn(null);
  };

  const returnsLabel = returnsIn === 'mastered'
    ? t('review.returns.mastered')
    : returnsIn == null ? null : returnsIn <= 1 ? t('review.returns.tomorrow') : t('review.returns.in', { n: returnsIn });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={scroll}>
      <View style={{ gap: space.xs }}>
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('review.questionOf', { n: index + 1, total })}</Text>
        <ProgressBar value={(index + (answered ? 1 : 0)) / total} accessibilityLabel={t('review.questionOf', { n: index + 1, total })} />
      </View>

      <View key={item.key} style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
          <Ionicons name={KIND_ICON[item.kind]} size={icon.sm} color={colors.tint} />
          <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]} numberOfLines={2}>{context}</Text>
        </View>
        <Text role="heading" aria-level={2} style={[text('title3'), { color: colors.text }]}>{qText}</Text>
        <View role="radiogroup" aria-label={qText} style={{ gap: space.xs, marginTop: space.xxs }}>
          {order.map((i) => {
            const isCorrect = i === item.correct;
            const isPicked = i === selected;
            const state = answered && isCorrect ? 'correct' : answered && isPicked ? 'wrong' : 'idle';
            return <OptionButton key={i} label={opts[i]} state={state} checked={isPicked} disabled={answered} onPress={() => choose(i)} />;
          })}
        </View>
        {answered ? (
          <Animated.View entering={FadeInDown.duration(motion.layout)} style={{ gap: space.sm, marginTop: space.xxs }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.xs }}>
              <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={icon.md} color={ok ? colors.success : colors.danger} />
              <View style={{ flex: 1, gap: space.xxs }}>
                <Text style={[text('headline'), { color: colors.text }]}>
                  {ok ? t('quiz.correct') : `${t('quiz.correctAnswer')}: ${opts[item.correct]}`}
                </Text>
                {why ? <Text style={[text('subhead'), { color: colors.text }]}>{why}</Text> : null}
                {returnsLabel ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs, marginTop: space.xxs }}>
                    <Ionicons name={returnsIn === 'mastered' ? 'ribbon-outline' : 'repeat-outline'} size={icon.sm} color={colors.textSubtle} />
                    <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]}>{returnsLabel}</Text>
                    {ok ? <XpChip n={XP.review} /> : null}
                  </View>
                ) : null}
              </View>
            </View>
            {!ok && article ? (
              <Group>
                <Row icon="book-outline" title={t('review.readArticle')} trailing="chevron" onPress={() => openArticle(navigation, article.id)} />
              </Group>
            ) : null}
            <Button label={isLast ? t('lesson.check.finish') : t('lesson.check.next')} icon="arrow-forward" onPress={next} haptic="impact" />
          </Animated.View>
        ) : null}
      </View>
    </ScrollView>
  );
}
