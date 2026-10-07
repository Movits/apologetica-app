import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { pick } from '../../utils/i18nData';
import { haptics } from '../../utils/haptics';
import { levelFor, lessonOf, isLessonComplete } from '../../utils/journey';
import { dispatchJourney, getJourney } from '../../utils/journeyStore';
import { Button, ProgressBar, SectionTitle } from '../ui';
import OptionButton from './OptionButton';
import XpChip from './XpChip';
import XpRing from './XpRing';
import BadgeUnlockSheet from './BadgeUnlockSheet';

// "Teste rápido": as três perguntas da lição, no fim do artigo. Uma pergunta
// por vez, com o porquê logo depois da escolha; no fim, o placar num anel
// animado, o XP ganho, o progresso do nível e, se for o caso, a folha de
// conquista. Terminar o teste conta o artigo como lido (quem respondeu leu),
// e o motor cuida de não pagar XP duas vezes.
//
// Quem já fez o teste vê o resumo (melhor resultado) com a opção de refazer:
// reabrir o artigo não obriga a responder de novo.
//
// `questions` vem de src/data/lessons; `lessonState` é a entrada da jornada
// para este artigo (null = ainda carregando, então nada é desenhado, para não
// mostrar "não feito" e logo trocar).
export default function LessonCheck({ articleId, questions, journey, onOpenJourney, style }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  if (!questions || !questions.length || !journey) return null;
  const lessonState = lessonOf(journey, articleId);
  const done = Boolean(lessonState?.check?.attempts);

  return (
    <View style={style}>
      <SectionTitle title={t('lesson.check.title')} />
      <Text style={[text('subhead'), { color: colors.textSubtle, marginBottom: space.sm }]}>{t('lesson.check.sub')}</Text>
      {/* A chave é só o artigo: o "já feito" vale para a montagem inicial
          (useState), senão terminar o teste remontaria o bloco e trocaria o
          resultado pelo resumo antes de a pessoa ver o placar e a conquista. */}
      <CheckBody
        key={articleId}
        articleId={articleId}
        questions={questions}
        initialDone={done}
        best={lessonState?.check?.best ?? 0}
        onOpenJourney={onOpenJourney}
      />
    </View>
  );
}

function CheckBody({ articleId, questions, initialDone, best, onOpenJourney }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon, motion, seal } = tokens;
  const total = questions.length;
  const [phase, setPhase] = useState(initialDone ? 'summary' : 'quiz');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = questions[index];
  const answered = selected !== null;
  const isLast = index + 1 >= total;

  // A jornada foi reiniciada (Minha Jornada > Reiniciar) com este artigo
  // montado: o "já feito" caiu, então o resumo dá lugar ao teste de novo.
  useEffect(() => {
    if (!initialDone && phase === 'summary') {
      setPhase('quiz');
      setIndex(0);
      setSelected(null);
      setScore(0);
      setResult(null);
    }
  }, [initialDone, phase]);

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    if (i === current.correct) {
      setScore((s) => s + 1);
      haptics.success();
    } else {
      haptics.error();
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
  };

  const finish = async () => {
    if (busy) return;
    setBusy(true);
    const finalScore = score;
    try {
      const prev = await getJourney();
      const prevLevel = levelFor(prev.xp);
      const r1 = await dispatchJourney({ type: 'read', articleId });
      const r2 = await dispatchJourney({ type: 'check', articleId, score: finalScore, total });
      const after = levelFor(r2.state.xp);
      const unlocked = [...r1.unlocked, ...r2.unlocked];
      const levelUp = after.index > prevLevel.index ? after.level : null;
      setResult({
        score: finalScore,
        gained: r1.gained + r2.gained,
        unlocked,
        levelUp,
        level: after,
        xp: r2.state.xp,
        complete: isLessonComplete(lessonOf(r2.state, articleId)),
      });
      setPhase('result');
      if (finalScore >= total) haptics.success();
      if (unlocked.length || levelUp) setSheetOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setPhase('quiz');
    setIndex(0);
    setSelected(null);
    setScore(0);
    setResult(null);
  };

  const card = { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm };

  if (phase === 'summary') {
    return (
      <View style={card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Ionicons name="checkmark-circle" size={icon.md} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[text('headline'), { color: colors.text }]}>{t('lesson.check.done')}</Text>
            <Text style={[text('subhead'), { color: colors.textSubtle }]}>{t('lesson.check.best', { score: best, total })}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.xxs }}>
          <Button variant="secondary" icon="refresh" label={t('lesson.check.retry')} onPress={restart} style={{ flex: 1 }} />
          {onOpenJourney ? <Button variant="plain" icon="trophy-outline" label={t('lesson.complete.journey')} onPress={onOpenJourney} style={{ flex: 1 }} /> : null}
        </View>
      </View>
    );
  }

  if (phase === 'result' && result) {
    const perfect = result.score >= total;
    const title = perfect ? t('lesson.check.perfect') : result.score >= Math.ceil(total / 2) ? t('lesson.check.good') : t('lesson.check.again');
    const lv = result.level;
    return (
      <Animated.View entering={FadeInDown.duration(motion.layout)} style={[card, { alignItems: 'center' }]}>
        <XpRing size={seal.lg} value={result.score / total} accessibilityLabel={t('lesson.check.result', { score: result.score, total })}>
          <Text style={[text('title'), { color: colors.text }]}>{`${result.score}/${total}`}</Text>
        </XpRing>
        <Text role="heading" aria-level={2} style={[text('section'), { color: colors.text, textAlign: 'center' }]}>{title}</Text>
        <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>{t('lesson.check.result', { score: result.score, total })}</Text>
        {result.gained > 0 ? <XpChip n={result.gained} animated /> : null}
        {result.complete ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            <Ionicons name="ribbon-outline" size={icon.sm} color={colors.accentText} />
            <Text style={[text('footnote'), { color: colors.accentText, fontWeight: '600' }]}>{t('lesson.complete.title')}</Text>
          </View>
        ) : null}
        <View style={{ alignSelf: 'stretch', gap: space.xxs, marginTop: space.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
            <Text style={[text('footnote'), { color: colors.text, fontWeight: '600' }]}>{`${t('journey.level')} ${lv.index + 1} · ${pick(lv.level, 'name', isEn)}`}</Text>
            <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('journey.xp', { n: result.xp })}</Text>
          </View>
          <ProgressBar value={lv.progress} accessibilityLabel={pick(lv.level, 'name', isEn)} />
          <Text style={[text('caption1'), { color: colors.textSubtle }]}>
            {lv.next ? t('journey.toNext', { n: lv.toNext, level: pick(lv.next, 'name', isEn) }) : t('journey.maxLevel')}
          </Text>
        </View>
        <View style={{ alignSelf: 'stretch', gap: space.xs, marginTop: space.xs }}>
          {onOpenJourney ? <Button variant="secondary" icon="trophy-outline" label={t('lesson.complete.journey')} onPress={onOpenJourney} /> : null}
          <Button variant="plain" icon="refresh" label={t('lesson.check.retry')} onPress={restart} />
        </View>
        <BadgeUnlockSheet visible={sheetOpen} badgeIds={result.unlocked} levelUp={result.levelUp} onClose={() => setSheetOpen(false)} />
      </Animated.View>
    );
  }

  const qText = pick(current, 'question', isEn);
  const opts = pick(current, 'options', isEn) || [];
  const why = pick(current, 'why', isEn);
  const ok = answered && selected === current.correct;

  return (
    <View style={card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('lesson.check.questionOf', { n: index + 1, total })}</Text>
        <View aria-hidden style={{ flexDirection: 'row', gap: space.xxs }}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={{
                width: space.xs,
                height: space.xs,
                borderRadius: radius.full,
                backgroundColor: i < index ? colors.accent : i === index ? colors.tint : colors.separator,
              }}
            />
          ))}
        </View>
      </View>
      <Text role="heading" aria-level={2} style={[text('title3'), { color: colors.text }]}>{qText}</Text>
      <View role="radiogroup" aria-label={qText} style={{ gap: space.xs, marginTop: space.xxs }}>
        {opts.map((label, i) => {
          const isCorrect = i === current.correct;
          const isPicked = i === selected;
          const state = answered && isCorrect ? 'correct' : answered && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton key={i} label={label} state={state} checked={isPicked} disabled={answered} onPress={() => choose(i)} />
          );
        })}
      </View>
      {answered ? (
        <Animated.View entering={FadeInDown.duration(motion.layout)} style={{ gap: space.sm, marginTop: space.xxs }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.xs }}>
            <Ionicons name={ok ? 'checkmark-circle' : 'close-circle'} size={icon.md} color={ok ? colors.success : colors.danger} />
            <View style={{ flex: 1, gap: space.xxs }}>
              <Text style={[text('headline'), { color: colors.text }]}>
                {ok ? t('quiz.correct') : `${t('quiz.correctAnswer')}: ${opts[current.correct]}`}
              </Text>
              {why ? <Text style={[text('subhead'), { color: colors.text }]}>{why}</Text> : null}
            </View>
          </View>
          <Button
            label={isLast ? t('lesson.check.finish') : t('lesson.check.next')}
            icon="arrow-forward"
            onPress={isLast ? finish : next}
            loading={busy}
            haptic="impact"
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
