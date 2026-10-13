import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getQuizOfDay, getRandomQuestions, getRandomTrueFalse } from '../data/quiz';
import { openArticle } from '../navigation/links';
import { pick } from '../utils/i18nData';
import { addDays, todayKey } from '../utils/daily';
import { alreadyAnswered, recordDailyAnswer } from '../utils/quizHistory';
import { shuffledOrder } from '../utils/review';
import { haptics } from '../utils/haptics';
import { Button, Group, ProgressBar, Row, SectionTitle } from '../components/ui';
import { OptionButton } from '../components/lesson';
import { dispatchJourney } from '../utils/journeyStore';
import { centeredColumn } from '../components/ReadingColumn';

const STREAK_KEY = 'quiz:streak';
// { AAAA-MM-DD: { id, correct } }, chave em hora local (todayKey). As chaves
// antigas foram gravadas em UTC, no mesmo formato, e à noite no Brasil isso
// podia pôr a resposta de ontem sob a data de hoje: recordDailyAnswer
// (src/utils/quizHistory.js) devolve essa entrada para ontem ao gravar a de
// hoje, e o streak segue contando de onde estava.
const HISTORY_KEY = 'quiz:history';
const PRACTICE_SIZE = 10;

// Quiz Apologético em três modos: pergunta diária (com streak em AsyncStorage),
// prática livre de 10 perguntas e verdadeiro ou falso. O header opaco do stack
// traz o título e o recuo da tab bar vem do próprio stack. Em janela larga o
// conteúdo fica na coluna central (centeredColumn).
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingVertical: space.md, ...centeredColumn(undefined, space.md) }}>
      <SectionTitle title={t('quiz.chooseGame')} style={{ marginTop: 0, marginHorizontal: space.md }} />
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

// Veredito e explicação depois de responder, mais o artigo relacionado.
// `note` é uma linha de rodapé (a pergunta volta na Revisão, já respondida hoje).
function Verdict({ ok, title, explanation, note, noteIcon = 'repeat-outline', onReadArticle }) {
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
        {note ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
            <Ionicons name={noteIcon} size={icon.sm} color={colors.textSubtle} />
            <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]}>{note}</Text>
          </View>
        ) : null}
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
  // Pergunta do dia já respondida hoje (abriu de novo): mostra a resposta dada
  // e não deixa responder outra vez. Antes dava para errar, voltar e acertar,
  // e o acerto repetido somava XP e sequência.
  const [locked, setLocked] = useState(false);
  // Semente da ordem das opções na prática: nova a cada rodada.
  const [round, setRound] = useState(() => String(Date.now()));

  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  // Pergunta do dia de hoje e, se já respondida, a resposta dada (travada).
  // Chamada ao abrir e sempre que o dia muda com a tela aberta: ao voltar para
  // ela, quando o app volta do segundo plano e antes de gravar uma resposta.
  const loadDaily = useCallback(() => {
    const q = getQuizOfDay();
    const key = todayKey();
    setQuestions([q]);
    setIndex(0);
    setSelected(null);
    setShowResult(false);
    setLocked(false);
    setScore(0);
    AsyncStorage.getItem(HISTORY_KEY)
      .then((raw) => {
        const prev = alreadyAnswered(raw ? JSON.parse(raw) : {}, key, q.id);
        if (!alive.current || !prev) return;
        setSelected(typeof prev.choice === 'number' ? prev.choice : null);
        setShowResult(true);
        setLocked(true);
        if (prev.correct) setScore(1);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mode === 'daily') loadDaily();
    else setQuestions(getRandomQuestions(PRACTICE_SIZE));
    AsyncStorage.getItem(STREAK_KEY).then((v) => { if (alive.current) setStreak(parseInt(v) || 0); });
  }, [mode, loadDaily]);

  const current = questions[index];
  // A pergunta na tela ainda é a de hoje? (Tela aberta de um dia para o outro.)
  const currentId = useRef(null);
  currentId.current = current ? current.id : null;
  const reloadIfNewDay = useCallback(() => {
    if (mode === 'daily' && currentId.current && currentId.current !== getQuizOfDay().id) loadDaily();
  }, [mode, loadDaily]);
  useFocusEffect(reloadIfNewDay);
  useEffect(() => {
    if (mode !== 'daily') return undefined;
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') reloadIfNewDay(); });
    return () => sub.remove();
  }, [mode, reloadIfNewDay]);
  // As opções aparecem embaralhadas: no banco a certa cai quase sempre na
  // segunda posição. A pergunta do dia tem a mesma ordem o dia todo.
  const optionCount = current?.options?.length || 0;
  const seed = mode === 'daily' ? `daily:${current?.id}:${todayKey()}` : `practice:${current?.id}:${round}`;
  const order = useMemo(() => shuffledOrder(optionCount, seed), [optionCount, seed]);

  const choose = async (i) => {
    if (showResult || locked) return;
    // Tela aberta desde ontem: a pergunta mudou à meia-noite. Troca pela de
    // hoje em vez de gravar a de ontem sob a data de hoje.
    if (mode === 'daily' && getQuizOfDay().id !== current.id) {
      loadDaily();
      return;
    }
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
      const yesterday = todayKey(addDays(new Date(), -1));
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const before = raw ? JSON.parse(raw) : {};
        const hist = recordDailyAnswer(before, {
          today, yesterday, id: current.id, correct: ok, choice: i,
        });
        // Mesmo objeto = já havia resposta de hoje (outra aba, outro toque):
        // a primeira fica e nada mais conta.
        if (hist === before) return;
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
        if (ok) {
          const had = hist[yesterday];
          const newStreak = had && had.correct ? streak + 1 : 1;
          setStreak(newStreak);
          await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
        }
      } catch {}
      // A pergunta do dia também rende XP na Jornada (só a primeira resposta
      // do dia) e, se errada, volta na Revisão amanhã.
      dispatchJourney({ type: 'dailyQuiz', dateKey: today, correct: ok, quizId: current.id }).catch(() => {});
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
    setRound(String(Date.now()));
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
  // Entrada antiga do histórico (sem a opção escolhida): o acerto vem do placar.
  const ok = locked && selected === null ? score > 0 : selected === current.correct;

  let meta = null;
  if (mode === 'daily' && streak > 0) {
    meta = <Meta icon="flame" iconColor={colors.accent}>{t(streak === 1 ? 'quiz.streakDays.one' : 'quiz.streakDays', { n: streak })}</Meta>;
  } else if (mode === 'practice') {
    meta = <Meta>{t('quiz.questionOf', { n: index + 1, total })}</Meta>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.md, gap: space.sm, ...centeredColumn(undefined, space.md) }}>
      {mode === 'practice' ? (
        <ProgressBar
          value={(index + (showResult ? 1 : 0)) / total}
          accessibilityLabel={t('quiz.questionOf', { n: index + 1, total })}
        />
      ) : null}

      <QuestionCard category={catText} meta={meta} question={qText} />

      <View role="radiogroup" aria-label={t('quiz.options')} style={{ gap: space.xs }}>
        {order.map((i) => {
          const isCorrect = i === current.correct;
          const isPicked = i === selected;
          const state = showResult && isCorrect ? 'correct' : showResult && isPicked ? 'wrong' : 'idle';
          return (
            <OptionButton
              key={i}
              label={opts[i]}
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
          note={mode !== 'daily' ? null : locked ? t('quiz.daily.answered') : ok ? null : t('quiz.daily.reviewNote')}
          noteIcon={locked ? 'calendar-outline' : 'repeat-outline'}
          onReadArticle={current.relatedArticle ? () => openArticle(navigation, current.relatedArticle) : null}
        />
      ) : null}

      {showResult && mode === 'daily' && streak > 0 ? (
        <Group>
          <Row icon="flame" iconColor={colors.accent} title={t('quiz.streak')} trailing={t(streak === 1 ? 'quiz.streakDays.one' : 'quiz.streakDays', { n: streak })} />
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.md, gap: space.sm, ...centeredColumn(undefined, space.md) }}>
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
