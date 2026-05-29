import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getQuizOfDay, getRandomQuestions, getRandomTrueFalse } from '../data/quiz';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

const STREAK_KEY = 'quiz:streak';
const HISTORY_KEY = 'quiz:history'; // { YYYY-MM-DD: { id, correct } }

export default function QuizScreen({ navigation, route }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const mode = route?.params?.mode || 'menu'; // 'menu' | 'daily' | 'practice' | 'truefalse'

  // Tela inicial do Quiz com os modos disponíveis.
  if (mode === 'menu') return <QuizMenu navigation={navigation} colors={colors} fs={fs} isEn={isEn} t={t} />;
  if (mode === 'truefalse') return <TrueFalseGame navigation={navigation} colors={colors} fs={fs} isEn={isEn} t={t} />;

  return <MultipleChoiceGame mode={mode} navigation={navigation} colors={colors} fs={fs} isEn={isEn} t={t} />;
}

// ============== MENU DE MODOS ==============
function QuizMenu({ navigation, colors, fs, isEn, t }) {
  const styles = menuStyles(colors, fs);
  const MODES = [
    {
      key: 'daily', icon: 'today-outline',
      label: isEn ? 'Daily Question' : 'Pergunta Diária',
      sub: isEn ? 'A new question every day. Build a streak.' : 'Uma pergunta nova todo dia. Construa uma sequência.',
    },
    {
      key: 'practice', icon: 'trophy-outline',
      label: isEn ? 'Practice' : 'Praticar',
      sub: isEn ? 'Mixed questions across all topics.' : 'Perguntas misturadas de todos os temas.',
    },
    {
      key: 'truefalse', icon: 'checkmark-circle-outline',
      label: isEn ? 'True or False' : 'Verdadeiro ou Falso',
      sub: isEn ? 'Quick statements about Catholic teaching.' : 'Afirmações rápidas sobre a doutrina católica.',
    },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={styles.title}>{isEn ? 'Choose a game' : 'Escolha um jogo'}</Text>
      <Text style={styles.sub}>
        {isEn ? 'Learn apologetics by playing. Each mode focuses on a different skill.' : 'Aprenda apologética jogando. Cada modo trabalha uma habilidade diferente.'}
      </Text>
      {MODES.map((m) => (
        <TouchableOpacity
          key={m.key}
          style={styles.card}
          onPress={() => navigation.push('Quiz', { mode: m.key })}
        >
          <View style={styles.iconBox}>
            <Ionicons name={m.icon} size={26} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{m.label}</Text>
            <Text style={styles.cardSub}>{m.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============== MÚLTIPLA ESCOLHA (daily + practice) ==============
function MultipleChoiceGame({ mode, navigation, colors, fs, isEn, t }) {
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
      setQuestions(getRandomQuestions(10));
    }
    AsyncStorage.getItem(STREAK_KEY).then((v) => setStreak(parseInt(v) || 0));
  }, [mode]);

  const current = questions[index];

  const choose = async (i) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === current.correct) setScore((s) => s + 1);

    if (mode === 'daily') {
      const today = new Date().toISOString().slice(0, 10);
      const ok = i === current.correct;
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const hist = raw ? JSON.parse(raw) : {};
        hist[today] = { id: current.id, correct: ok };
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
        if (ok) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
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

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (!current) return null;

  const qText = isEn ? (current.questionEn || current.question) : current.question;
  const opts = isEn ? (current.optionsEn || current.options) : current.options;
  const whyText = isEn ? (current.whyEn || current.why) : current.why;
  const catText = isEn ? (current.categoryEn || current.category) : current.category;
  const isLast = index + 1 >= questions.length;
  const total = questions.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {catText ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{catText}</Text>
              </View>
            ) : <View />}
            {mode === 'daily' && streak > 0 && (
              <View style={styles.streakRow}>
                <Ionicons name="flame" size={16} color={colors.accent} />
                <Text style={styles.streakText}>{streak} {isEn ? 'days' : 'dias'}</Text>
              </View>
            )}
            {mode === 'practice' && (
              <Text style={styles.streakText}>{index + 1} / {total}</Text>
            )}
          </View>
          <Text style={styles.question}>{qText}</Text>
        </View>

        {opts.map((opt, i) => {
          const isCorrect = i === current.correct;
          const isPicked = i === selected;
          let bg = colors.card;
          let border = colors.divider;
          let icon = null;
          if (showResult) {
            if (isCorrect) {
              bg = colors.mode === 'dark' ? '#1f3a28' : '#e6f4ea';
              border = '#3a7d4b';
              icon = 'checkmark-circle';
            } else if (isPicked) {
              bg = colors.mode === 'dark' ? '#3a1f1f' : '#f8d7da';
              border = '#a02020';
              icon = 'close-circle';
            }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => choose(i)}
              activeOpacity={0.7}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{opt}</Text>
              {icon && <Ionicons name={icon} size={20} color={icon === 'checkmark-circle' ? '#3a7d4b' : '#a02020'} />}
            </TouchableOpacity>
          );
        })}

        {showResult && (
          <View style={styles.explainBox}>
            <Text style={styles.explainTitle}>
              {selected === current.correct
                ? (isEn ? 'Correct' : 'Acertou')
                : (isEn ? 'Correct answer:' : 'Resposta correta:')}
            </Text>
            <Text style={styles.explainText}>
              {selected !== current.correct && (
                <Text style={{ fontWeight: 'bold' }}>{opts[current.correct]}{'. '}</Text>
              )}
              {whyText}
            </Text>
            {current.relatedArticle && (
              <TouchableOpacity
                style={styles.relatedBtn}
                onPress={() => navigation.navigate('ArticleFromSearch', { articleId: current.relatedArticle })}
              >
                <Ionicons name="book-outline" size={16} color={colors.accent} />
                <Text style={styles.relatedText}>{t('quiz.readArticle')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showResult && !isLast && (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>{t('quiz.next')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {showResult && isLast && mode === 'practice' && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreTitle}>{t('quiz.result')}</Text>
            <Text style={styles.scoreText}>
              {t('quiz.scoreText', { score, total })} ({Math.round((score / total) * 100)}%)
            </Text>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                setQuestions(getRandomQuestions(10));
                setIndex(0);
                setSelected(null);
                setShowResult(false);
                setScore(0);
              }}
            >
              <Text style={styles.nextBtnText}>{t('quiz.practiceAgain')}</Text>
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.practiceBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="grid-outline" size={18} color={colors.accent} />
              <Text style={styles.practiceText}>{isEn ? 'Other game modes' : 'Outros modos'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'daily' && showResult && (
          <TouchableOpacity
            style={styles.practiceBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="grid-outline" size={18} color={colors.accent} />
            <Text style={styles.practiceText}>{isEn ? 'See other game modes' : 'Ver outros modos de jogo'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

// ============== VERDADEIRO / FALSO ==============
function TrueFalseGame({ navigation, colors, fs, isEn, t }) {
  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => { setItems(getRandomTrueFalse(10)); }, []);
  const current = items[idx];
  const styles = makeStyles(colors, fs);

  if (!current) return null;
  const text = isEn ? (current.statementEn || current.statement) : current.statement;
  const explain = isEn ? (current.explanationEn || current.explanation) : current.explanation;
  const total = items.length;
  const isLast = idx + 1 >= total;

  const choose = (val) => {
    if (picked !== null) return;
    setPicked(val);
    if (val === current.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) return;
    setIdx(idx + 1);
    setPicked(null);
  };

  const restart = () => {
    setItems(getRandomTrueFalse(10));
    setIdx(0);
    setPicked(null);
    setScore(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.streakText}>{idx + 1} / {total}</Text>
          <Text style={styles.question}>{text}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[true, false].map((val) => {
            const isCorrect = val === current.answer;
            const isPicked = val === picked;
            let bg = colors.card; let border = colors.divider;
            if (picked !== null) {
              if (isCorrect) { bg = colors.mode === 'dark' ? '#1f3a28' : '#e6f4ea'; border = '#3a7d4b'; }
              else if (isPicked) { bg = colors.mode === 'dark' ? '#3a1f1f' : '#f8d7da'; border = '#a02020'; }
            }
            return (
              <TouchableOpacity
                key={String(val)}
                style={[styles.option, { backgroundColor: bg, borderColor: border, flex: 1, justifyContent: 'center' }]}
                onPress={() => choose(val)}
                disabled={picked !== null}
              >
                <Text style={[styles.optionText, { textAlign: 'center', fontWeight: 'bold' }]}>
                  {val ? (isEn ? 'TRUE' : 'VERDADEIRO') : (isEn ? 'FALSE' : 'FALSO')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {picked !== null && (
          <View style={styles.explainBox}>
            <Text style={styles.explainTitle}>
              {picked === current.answer
                ? (isEn ? 'Correct' : 'Acertou')
                : (isEn ? 'Wrong — correct answer:' : 'Errou. Correto:')}
              {picked !== current.answer && (
                <Text>{' '}{current.answer ? (isEn ? 'TRUE' : 'VERDADEIRO') : (isEn ? 'FALSE' : 'FALSO')}</Text>
              )}
            </Text>
            <Text style={styles.explainText}>{explain}</Text>
          </View>
        )}

        {picked !== null && !isLast && (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>{isEn ? 'Next' : 'Próximo'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {picked !== null && isLast && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreTitle}>{t('quiz.result')}</Text>
            <Text style={styles.scoreText}>
              {t('quiz.scoreText', { score, total })} ({Math.round((score / total) * 100)}%)
            </Text>
            <TouchableOpacity style={styles.nextBtn} onPress={restart}>
              <Text style={styles.nextBtnText}>{isEn ? 'Play again' : 'Jogar de novo'}</Text>
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.practiceBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="grid-outline" size={18} color={colors.accent} />
              <Text style={styles.practiceText}>{isEn ? 'Other game modes' : 'Outros modos'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const menuStyles = (c, fs) =>
  StyleSheet.create({
    title: { fontSize: fs(20), color: c.primaryText, fontWeight: 'bold', marginBottom: 6 },
    sub: { fontSize: fs(13), color: c.textMuted, marginBottom: 16, lineHeight: fs(19) },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 10,
    },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: c.badgeBg, justifyContent: 'center', alignItems: 'center' },
    cardLabel: { fontSize: fs(15), color: c.primaryText, fontWeight: '600' },
    cardSub: { fontSize: fs(12), color: c.textMuted, marginTop: 3, lineHeight: fs(16) },
  });

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    header: { marginBottom: 18 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    badge: { backgroundColor: c.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { color: c.accent, fontSize: fs(11), fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    streakText: { color: c.textMuted, fontSize: fs(13), fontWeight: '600' },
    question: { fontSize: fs(18), fontWeight: '600', color: c.primaryText, lineHeight: fs(26), marginTop: 6 },
    option: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10,
    },
    optionText: { color: c.text, fontSize: fs(15), flex: 1, marginRight: 8 },
    explainBox: {
      backgroundColor: c.card, borderRadius: 10, padding: 14, marginTop: 8, marginBottom: 12,
      borderLeftWidth: 3, borderLeftColor: c.accent,
    },
    explainTitle: { fontWeight: 'bold', color: c.primaryText, fontSize: fs(14), marginBottom: 6 },
    explainText: { color: c.text, fontSize: fs(14), lineHeight: fs(21) },
    relatedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    relatedText: { color: c.accent, fontSize: fs(13), fontWeight: '600' },
    nextBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: c.primary, paddingVertical: 14, borderRadius: 10, marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: fs(15) },
    scoreBox: {
      backgroundColor: c.card, borderRadius: 12, padding: 18, marginTop: 16, alignItems: 'center',
    },
    scoreTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginBottom: 6 },
    scoreText: { fontSize: fs(15), color: c.text, marginBottom: 14 },
    practiceBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 16, paddingHorizontal: 20, minHeight: 54,
      borderRadius: 10, marginTop: 12, borderWidth: 1.5, borderColor: c.accent,
    },
    practiceText: { color: c.accent, fontSize: fs(15), fontWeight: '600' },
  });
