import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getQuizOfDay, getRandomQuestions, getRandomTrueFalse } from '../data/quiz';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { addDays, todayKey } from '../utils/daily';
import { haptics } from '../utils/haptics';
import { Button, Group, PressScale, ProgressBar, Row, SectionTitle } from '../components/ui';

const STREAK_KEY = 'quiz:streak';
// { AAAA-MM-DD: { id, correct } }. As chaves antigas foram gravadas em UTC
// e as novas em hora local (todayKey), no mesmo formato: o histórico continua
// legível e o streak segue contando de onde estava.
const HISTORY_KEY = 'quiz:history';
const PRACTICE_SIZE = 10;

// Quiz Apologético em três modos: pergunta diária (com streak em AsyncStorage),
// prática livre de 10 perguntas e verdadeiro ou falso. O header opaco do stack
// traz o título e o recuo da tab bar vem do próprio stack.
export default function QuizScreen({ navigation, route }) {
  const mode = route?.params?.mode || 'menu'; // 'menu' | 'daily' | 'practice' | 'truefalse'

  if (mode === 'menu') return <QuizMenu navigation={navigation} />;
  if (mode === 'truefalse') return <TrueFalseGame navigation={navigation} />;
  return <MultipleChoiceGame mode={mode} navigation={navigation} />;
}

// ============== MENU DE MODOS ==============
// Escolher um modo é navegação (push da mesma tela com outro `mode`), por isso
// a lista é um Group de Rows com chevron, e não Chips (que são filtro).
function QuizMenu({ navigation }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;

  const MODES = [
    { key: 'daily', icon: 'today-outline', label: t('quiz.mode.daily'), sub: t('quiz.mode.dailySub') },
    { key: 'practice', icon: 'trophy-outline', label: t('quiz.mode.practice'), sub: t('quiz.mode.practiceSub') },
    { key: 'truefalse', icon: 'checkmark-circle-outline', label: t('quiz.mode.trueFalse'), sub: t('quiz.mode.trueFalseSub') },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingVertical: space.md }}>
      <SectionTitle title={t('quiz.chooseGame')} style={{ marginTop: 0 }} />
      <Text style={[text('subhead'), { color: colors.textSubtle, marginHorizontal: space.md, marginBottom: space.sm }]}>
        {t('quiz.chooseGameSub')}
      </Text>
      <Group style={{ marginHorizontal: space.md }}>
        {MODES.map((m) => (
          <Row
            key={m.key}
            icon={m.icon}
            title={m.label}
            subtitle={m.sub}
            trailing="chevron"
            onPress={() => navigation.push('Quiz', { mode: m.key })}
          />
        ))}
      </Group>
    </ScrollView>
  );
}

// ============== PEÇAS COMPARTILHADAS PELOS DOIS JOGOS ==============

// Bloco da pergunta: categoria e um dado à direita (streak ou "Pergunta 2 de
// 10") em footnote, e o enunciado em display (title).
function QuestionCard({ category, meta, question }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius } = tokens;
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm }}>
      {category || meta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
          {category ? (
            <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]} numberOfLines={1}>{category}</Text>
          ) : <View style={{ flex: 1 }} />}
          {meta}
        </View>
      ) : null}
      <Text role="heading" style={[text('title'), { color: colors.text }]}>{question}</Text>
    </View>
  );
}

// Texto pequeno à direita do bloco da pergunta, com ícone opcional.
function Meta({ icon, iconColor, children }) {
  const { colors, tokens, text } = useTheme();
  const { space, icon: iconSize } = tokens;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
      {icon ? <Ionicons name={icon} size={iconSize.sm} color={iconColor ?? colors.textSubtle} /> : null}
      <Text style={[text('footnote'), { color: colors.textSubtle }]}>{children}</Text>
    </View>
  );
}

// Alternativa de resposta. `state`: 'idle' | 'correct' | 'wrong'. Certo e
// errado aparecem só no ícone e na hairline (success/danger), o fundo continua
// `card`. É um rádio: `aria-checked` marca a escolhida.
function OptionButton({ label, state = 'idle', checked, disabled, onPress, centered, style }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon } = tokens;
  const tone = state === 'correct' ? colors.success : state === 'wrong' ? colors.danger : null;
  const iconName = state === 'correct' ? 'checkmark-circle' : state === 'wrong' ? 'close-circle' : null;

  return (
    <PressScale
      role="radio"
      aria-checked={Boolean(checked)}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          gap: space.sm,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          borderRadius: radius.md,
          backgroundColor: pressed ? colors.separator : colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: tone ?? colors.separator,
        },
        style,
      ]}
    >
      <Text
        style={[
          centered ? text('headline') : text('body'),
          { color: colors.text, textAlign: centered ? 'center' : 'left' },
          centered ? null : { flex: 1 },
        ]}
      >
        {label}
      </Text>
      {iconName ? <Ionicons name={iconName} size={icon.md} color={tone} /> : null}
    </PressScale>
  );
}

// Veredito e explicação depois de responder, mais o artigo relacionado.
function Verdict({ ok, title, explanation, onReadArticle }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, icon } = tokens;
  return (
    <Group>
      <View style={{ padding: space.md, gap: space.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Ionicons
            name={ok ? 'checkmark-circle' : 'close-circle'}
            size={icon.md}
            color={ok ? colors.success : colors.danger}
          />
          <Text style={[text('headline'), { color: colors.text, flex: 1 }]}>{title}</Text>
        </View>
        {explanation ? <Text style={[text('subhead'), { color: colors.text }]}>{explanation}</Text> : null}
      </View>
      {onReadArticle ? (
        <Row icon="book-outline" title={t('quiz.readArticle')} trailing="chevron" onPress={onReadArticle} />
      ) : null}
    </Group>
  );
}

// Placar do fim da rodada.
function ScoreGroup({ score, total }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const pct = total ? Math.round((score / total) * 100) : 0;
  return (
    <Group header={t('quiz.result')}>
      <Row icon="trophy-outline" title={t('quiz.hits')} trailing={t('quiz.scoreText', { score, total })} />
      <Row icon="stats-chart-outline" iconColor={colors.accent} title={t('quiz.rate')} trailing={`${pct}%`} />
    </Group>
  );
}

// ============== MÚLTIPLA ESCOLHA (daily + practice) ==============
function MultipleChoiceGame({ mode, navigation }) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (mode === 'daily') {
      setQuestions([getQuizOfDay()]);
    } else {
      setQuestions(getRandomQuestions(PRACTICE_SIZE));
    }
    AsyncStorage.getItem(STREAK_KEY).then((v) => setStreak(parseInt(v) || 0));
  }, [mode]);

  const current = questions[index];

  const choose = async (i) => {
    if (showResult) return;
    const ok = i === current.correct;
    setSelected(i);
    setShowResult(true);
    if (ok) {
      setScore((s) => s + 1);
      haptics.success();
    } else {
      haptics.error();
    }

    if (mode === 'daily') {
      // Chave em hora local: a conversão para UTC, à noite no Brasil, já dava
      // o dia seguinte e quebrava o "ontem" do streak.
      const today = todayKey();
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const hist = raw ? JSON.parse(raw) : {};
        hist[today] = { id: current.id, correct: ok };
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
        if (ok) {
          const yesterday = todayKey(addDays(new Date(), -1));
          const had = hist[yesterday];
          const newStreak = had && had.correct ? streak + 1 : 1;
          setStreak(newStreak);
          await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
        }
      } catch {}
    }
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const restart = () => {
    setQuestions(getRandomQuestions(PRACTICE_SIZE));
    setIndex(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
  };

  if (!current) return null;

  const qText = pick(current, 'question', isEn);
  const opts = pick(current, 'options', isEn);
  const whyText = pick(current, 'why', isEn);
  const catText = pick(current, 'category', isEn);
  const total = questions.length;
  const isLast = index + 1 >= total;
  const ok = selected === current.correct;

  let meta = null;
  if (mode === 'daily' && streak > 0) {
    meta = <Meta icon="flame" iconColor={colors.accent}>{t('quiz.streakDays', { n: streak })}</Meta>;
  } else if (mode === 'practice') {
    meta = <Meta>{t('quiz.questionOf', { n: index + 1, total })}</Meta>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.md, gap: space.sm }}>
      {mode === 'practice' ? (
        <ProgressBar
          value={(index + (showResult ? 1 : 0)) / total}
          accessibilityLabel={t('quiz.questionOf', { n: index + 1, total })}
        />
      ) : null}

      <QuestionCard category={catText} meta={meta} question={qText} />

      <View role="radiogroup" aria-label={t('quiz.options')} style={{ gap: space.xs }}>
        {opts.map((opt, i) => {
          const isCorrect = i === current.correct;
          const isPicked = i === selected;
          const state = showResult && isCorrect ? 'correct' : showResult && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton
              key={i}
              label={opt}
              state={state}
              checked={isPicked}
              disabled={showResult}
              onPress={() => choose(i)}
            />
          );
        })}
      </View>

      {showResult ? (
        <Verdict
          ok={ok}
          title={ok ? t('quiz.correct') : `${t('quiz.correctAnswer')}: ${opts[current.correct]}`}
          explanation={whyText}
          onReadArticle={current.relatedArticle ? () => openArticle(navigation, current.relatedArticle) : null}
        />
      ) : null}

      {showResult && mode === 'daily' && streak > 0 ? (
        <Group>
          <Row icon="flame" iconColor={colors.accent} title={t('quiz.streak')} trailing={t('quiz.streakDays', { n: streak })} />
        </Group>
      ) : null}

      {showResult && !isLast ? (
        <Button label={t('quiz.next')} icon="arrow-forward" onPress={next} haptic="impact" style={{ marginTop: space.xs }} />
      ) : null}

      {showResult && isLast && mode === 'practice' ? (
        <>
          <ScoreGroup score={score} total={total} />
          <Button label={t('quiz.practiceAgain')} icon="refresh" onPress={restart} haptic="impact" style={{ marginTop: space.xs }} />
          <Button variant="secondary" icon="grid-outline" label={t('quiz.otherModes')} onPress={() => navigation.goBack()} />
        </>
      ) : null}

      {showResult && mode === 'daily' ? (
        <Button variant="secondary" icon="grid-outline" label={t('quiz.otherModes')} onPress={() => navigation.goBack()} style={{ marginTop: space.xs }} />
      ) : null}
    </ScrollView>
  );
}

// ============== VERDADEIRO / FALSO ==============
function TrueFalseGame({ navigation }) {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => { setItems(getRandomTrueFalse(PRACTICE_SIZE)); }, []);
  const current = items[idx];

  if (!current) return null;

  const statement = pick(current, 'statement', isEn);
  const explain = pick(current, 'explanation', isEn);
  const total = items.length;
  const isLast = idx + 1 >= total;
  const answered = picked !== null;
  const ok = picked === current.answer;
  const labelOf = (val) => (val ? t('quiz.true') : t('quiz.false'));

  const choose = (val) => {
    if (answered) return;
    setPicked(val);
    if (val === current.answer) {
      setScore((s) => s + 1);
      haptics.success();
    } else {
      haptics.error();
    }
  };

  const next = () => {
    if (isLast) return;
    setIdx(idx + 1);
    setPicked(null);
  };

  const restart = () => {
    setItems(getRandomTrueFalse(PRACTICE_SIZE));
    setIdx(0);
    setPicked(null);
    setScore(0);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.md, gap: space.sm }}>
      <ProgressBar
        value={(idx + (answered ? 1 : 0)) / total}
        accessibilityLabel={t('quiz.questionOf', { n: idx + 1, total })}
      />

      <QuestionCard meta={<Meta>{t('quiz.questionOf', { n: idx + 1, total })}</Meta>} question={statement} />

      <View role="radiogroup" aria-label={t('quiz.options')} style={{ flexDirection: 'row', gap: space.xs }}>
        {[true, false].map((val) => {
          const isCorrect = val === current.answer;
          const isPicked = val === picked;
          const state = answered && isCorrect ? 'correct' : answered && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton
              key={String(val)}
              label={labelOf(val)}
              state={state}
              checked={isPicked}
              disabled={answered}
              onPress={() => choose(val)}
              centered
              style={{ flex: 1 }}
            />
          );
        })}
      </View>

      {answered ? (
        <Verdict
          ok={ok}
          title={ok ? t('quiz.correct') : `${t('quiz.wrong')}. ${t('quiz.correctAnswer')}: ${labelOf(current.answer)}`}
          explanation={explain}
        />
      ) : null}

      {answered && !isLast ? (
        <Button label={t('quiz.next')} icon="arrow-forward" onPress={next} haptic="impact" style={{ marginTop: space.xs }} />
      ) : null}

      {answered && isLast ? (
        <>
          <ScoreGroup score={score} total={total} />
          <Button label={t('quiz.playAgain')} icon="refresh" onPress={restart} haptic="impact" style={{ marginTop: space.xs }} />
          <Button variant="secondary" icon="grid-outline" label={t('quiz.otherModes')} onPress={() => navigation.goBack()} />
        </>
      ) : null}
    </ScrollView>
  );
}
