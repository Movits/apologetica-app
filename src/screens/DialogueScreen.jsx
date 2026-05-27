import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES, getDialogueById } from '../data/dialogues';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Tela mestre: lista de objeções. Ao escolher uma, vira modo "conversa guiada".
export default function DialogueScreen({ navigation, route }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const styles = makeStyles(colors, fs);
  const initialId = route?.params?.dialogueId;
  const [activeId, setActiveId] = useState(initialId || null);
  const [stepIndex, setStepIndex] = useState(0);

  const dialogue = activeId ? getDialogueById(activeId) : null;

  // Intercepta o botão de voltar (hardware) quando dentro de um diálogo:
  // volta para a lista em vez de sair da tela.
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeId !== null) {
        setActiveId(null);
        setStepIndex(0);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [activeId]));

  // Intercepta o botão de voltar do header quando dentro de um diálogo.
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (activeId !== null) {
        e.preventDefault();
        setActiveId(null);
        setStepIndex(0);
      }
    });
    return unsub;
  }, [navigation, activeId]);

  if (!dialogue) {
    return <DialogueList navigation={navigation} isEn={isEn} onChoose={(id) => { setActiveId(id); setStepIndex(0); }} />;
  }

  const step = dialogue.steps[stepIndex];
  const isLast = stepIndex + 1 >= dialogue.steps.length;
  const objection = isEn ? (dialogue.objectionEn || dialogue.objection) : dialogue.objection;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.objBox}>
          <View style={styles.objHeader}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.accent} />
            <Text style={styles.objLabel}>{t('dialogue.someoneSays')}</Text>
          </View>
          <Text style={styles.objText}>{objection}</Text>
        </View>

        <View style={styles.stepsCol}>
          {dialogue.steps.slice(0, stepIndex + 1).map((s, i) => (
            <View key={i} style={[styles.stepBox, i === stepIndex && styles.stepBoxActive]}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                  <Text style={styles.stepIconText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepLabel}>{isEn ? (s.labelEn || s.label) : s.label}</Text>
              </View>
              <Text style={styles.stepText}>{isEn ? (s.textEn || s.text) : s.text}</Text>
            </View>
          ))}
        </View>

        {!isLast && (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStepIndex(stepIndex + 1)}>
            <Text style={styles.nextBtnText}>{t('dialogue.nextStep')}</Text>
            <Ionicons name="arrow-down" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {isLast && dialogue.relatedArticle && (
          <TouchableOpacity
            style={styles.readBtn}
            onPress={() => navigation.navigate('ArticleFromSearch', { articleId: dialogue.relatedArticle })}
          >
            <Ionicons name="book-outline" size={18} color={colors.accent} />
            <Text style={styles.readText}>{t('quiz.readArticle')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => { setActiveId(null); setStepIndex(0); }}>
          <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
          <Text style={styles.backText}>{t('dialogue.chooseOther')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DialogueList({ navigation, onChoose, isEn }) {
  const { colors, fs } = useTheme();
  const styles = makeStyles(colors, fs);
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  const grouped = useMemo(() => {
    const out = {};
    DIALOGUES.forEach((d) => {
      const catKey = isEn ? (d.categoryEn || d.category) : d.category;
      if (!out[catKey]) out[catKey] = [];
      out[catKey].push(d);
    });
    return out;
  }, [isEn]);

  const sections = Object.keys(grouped);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{isEn ? 'Dialogue Mode' : 'Modo Diálogo'}</Text>
          <Text style={styles.introBody}>
            {isEn
              ? 'Practice answers to the most common objections. Each scenario has 4 steps: agree with what makes sense, reframe, present the argument, close. You move at your own pace.'
              : 'Treine respostas para as objeções mais comuns. Cada cenário tem 4 passos: concordar com o que faz sentido, reformular, apresentar o argumento, fechar. Você avança no seu ritmo.'}
          </Text>
        </View>

        {sections.map((cat) => (
          <View key={cat} style={{ marginBottom: 16 }}>
            <Text style={styles.section}>{cat}</Text>
            {grouped[cat].map((d) => (
              <TouchableOpacity key={d.id} style={styles.card} onPress={() => onChoose(d.id)}>
                <Text style={styles.cardText}>{isEn ? (d.objectionEn || d.objection) : d.objection}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    listContent: { padding: 16, paddingBottom: 40 },
    intro: { marginBottom: 18 },
    introTitle: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText, marginBottom: 8 },
    introBody: { fontSize: fs(14), color: c.textMuted, lineHeight: fs(20) },
    section: { fontSize: fs(12), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', marginBottom: 8, marginTop: 4 },
    card: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      backgroundColor: c.card, padding: 14, borderRadius: 10, marginBottom: 8,
    },
    cardText: { color: c.text, fontSize: fs(14), flex: 1, fontStyle: 'italic' },

    objBox: {
      backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 16,
      borderLeftWidth: 3, borderLeftColor: c.accent,
    },
    objHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    objLabel: { fontSize: fs(11), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
    objText: { fontSize: fs(16), color: c.primaryText, fontStyle: 'italic', lineHeight: fs(24) },

    stepsCol: { gap: 10 },
    stepBox: { backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 10, opacity: 0.8 },
    stepBoxActive: { opacity: 1, borderWidth: 1, borderColor: c.accent },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    stepIcon: {
      width: 24, height: 24, borderRadius: 12, backgroundColor: c.accent,
      justifyContent: 'center', alignItems: 'center',
    },
    stepIconText: { color: '#1a3a5c', fontWeight: 'bold', fontSize: fs(13) },
    stepLabel: { color: c.textMuted, fontSize: fs(12), textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
    stepText: { color: c.text, fontSize: fs(15), lineHeight: fs(22) },

    nextBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: c.primary, paddingVertical: 14, borderRadius: 10, marginTop: 8,
    },
    nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: fs(15) },

    readBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: c.accent,
    },
    readText: { color: c.accent, fontWeight: '600', fontSize: fs(14) },

    backBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      paddingVertical: 12, marginTop: 8,
    },
    backText: { color: c.textMuted, fontSize: fs(13) },
  });
