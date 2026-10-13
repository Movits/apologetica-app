import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { pick } from '../../utils/i18nData';
import { haptics } from '../../utils/haptics';
import { levelFor, lessonOf, isLessonComplete } from '../../utils/journey';
import { dispatchJourney, getJourney } from '../../utils/journeyStore';
import { shuffledOrder } from '../../utils/review';
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
// Só a primeira tentativa vale XP e cria os cartões da revisão espaçada (as
// erradas voltam amanhã, as certas em uma semana). Cada resposta da primeira
// tentativa é gravada na hora (evento checkAnswer): quem erra, sai do artigo e
// volta retoma de onde parou, com as respostas dadas, e não recomeça valendo. Depois dela a pessoa já viu
// as respostas certas, então refazer é "Treinar de novo": não paga XP e diz
// isso na tela. As opções aparecem embaralhadas, com uma ordem nova a cada
// tentativa (nos dados a certa cai muito na mesma posição).
//
// Quem já fez o teste vê o resumo (resultado da primeira tentativa) com a
// opção de treinar: reabrir o artigo não obriga a responder de novo.
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
        first={lessonState?.check?.first ?? lessonState?.check?.best ?? 0}
        attempts={lessonState?.check?.attempts ?? 0}
        draft={lessonState?.draft}
        onOpenJourney={onOpenJourney}
      />
    </View>
  );
}

function CheckBody({ articleId, questions, initialDone, first, attempts, draft, onOpenJourney }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, icon, motion, seal } = tokens;
  const total = questions.length;
  // Primeira tentativa começada e interrompida: retoma na primeira pergunta
  // sem resposta gravada, com o placar do que já foi respondido.
  const [resume] = useState(() => {
    const given = [];
    if (!initialDone && draft) for (let i = 0; i < total && i in draft; i++) given.push(Boolean(draft[i]));
    return given;
  });
  const [phase, setPhase] = useState(initialDone ? 'summary' : resume.length >= total ? 'ready' : 'quiz');
  const [index, setIndex] = useState(Math.min(resume.length, total - 1));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(resume.filter(Boolean).length);
  const [result, setResult] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // Respostas desta tentativa (acertou?), na ordem das perguntas: vão para o
  // motor, que cria os cartões da revisão se for a primeira tentativa.
  const [answers, setAnswers] = useState(resume);
  // Tentativas já gravadas (estado vivo da jornada): 0 = valendo, mais que
  // isso = treino. Vem do motor, não de uma cópia local, para o aviso de
  // treino nunca discordar do que o motor paga.
  const practice = attempts > 0;

  const current = questions[index];
  const answered = selected !== null;
  const isLast = index + 1 >= total;
  const optionCount = current?.options?.length || 0;
  const order = useMemo(
    () => shuffledOrder(optionCount, `check:${articleId}:${index}:${attempts}`),
    [optionCount, articleId, index, attempts]
  );

  // A jornada foi reiniciada (Minha Jornada > Reiniciar) com este artigo
  // montado: o "já feito" caiu, então o resumo dá lugar ao teste de novo.
  useEffect(() => {
    if (!initialDone && phase === 'summary') {
      setPhase('quiz');
      setIndex(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      setResult(null);
    }
  }, [initialDone, phase]);

  const choose = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswers((a) => [...a, i === current.correct]);
    // Valendo: grava a resposta já, antes do fim (a primeira fica).
    if (!practice) dispatchJourney({ type: 'checkAnswer', articleId, index, correct: i === current.correct }).catch(() => {});
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
      // Treino ou valendo, segundo o motor no momento de fechar.
      const wasPractice = Boolean(lessonOf(prev, articleId)?.check?.attempts);
      const r1 = await dispatchJourney({ type: 'read', articleId });
      const r2 = await dispatchJourney({ type: 'check', articleId, score: finalScore, total, answers });
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
        practice: wasPractice,
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
    setAnswers([]);
    setResult(null);
  };

  const card = { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm };

  // As três respondidas, mas a pessoa saiu antes de ver o resultado.
  if (phase === 'ready') {
    return (
      <View style={card}>
        <Text style={[text('subhead'), { color: colors.text }]}>{t('lesson.check.resume', { total })}</Text>
        <Button label={t('lesson.check.finish')} icon="arrow-forward" onPress={finish} loading={busy} haptic="impact" />
      </View>
    );
  }

  if (phase === 'summary') {
    return (
      <View style={card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Ionicons name="checkmark-circle" size={icon.md} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[text('headline'), { color: colors.text }]}>{t('lesson.check.done')}</Text>
            <Text style={[text('subhead'), { color: colors.textSubtle }]}>{t('lesson.check.first', { score: first, total })}</Text>
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
        {result.gained > 0 ? <XpChip n={result.gained} animated style={{ alignSelf: 'center' }} /> : null}
        {/* Ícone dentro do texto: com o texto centralizado em várias linhas, um
            ícone ao lado ficaria solto na margem. */}
        <Text style={[text('footnote'), { color: colors.textSubtle, textAlign: 'center' }]}>
          <Ionicons name={result.practice ? 'barbell-outline' : 'repeat-outline'} size={icon.sm} color={colors.textSubtle} />
          {` ${result.practice ? t('lesson.check.practiceNote') : t('lesson.check.reviewNote')}`}
        </Text>
        {result.complete && !result.practice ? (
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
        <Text style={[text('footnote'), { color: colors.textSubtle, flexShrink: 1 }]}>
          {practice ? `${t('lesson.check.questionOf', { n: index + 1, total })} · ${t('lesson.check.practice')}` : t('lesson.check.questionOf', { n: index + 1, total })}
        </Text>
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
        {order.map((i) => {
          const isCorrect = i === current.correct;
          const isPicked = i === selected;
          const state = answered && isCorrect ? 'correct' : answered && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton key={i} label={opts[i]} state={state} checked={isPicked} disabled={answered} onPress={() => choose(i)} />
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
