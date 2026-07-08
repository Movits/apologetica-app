import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { examConscience } from '../data/examConscience';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function ExamConscienceScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const styles = makeStyles(colors, fs);
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            {isEn ? 'Examination of Conscience' : 'Exame de Consciência'}
          </Text>
          <Text style={styles.introBody}>
            {isEn
              ? 'Preparation for the Sacrament of Reconciliation. Use these questions to examine your life before God.'
              : 'Preparação para o Sacramento da Reconciliação. Use estas perguntas para examinar sua vida diante de Deus.'}
          </Text>
          <Text style={styles.introHint}>
            {isEn
              ? '"If we confess our sins, he is faithful and just to forgive us." (1 John 1,9)'
              : '"Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar." (1 João 1,9)'}
          </Text>
          <TouchableOpacity
            style={styles.learnBtn}
            onPress={() => navigation?.navigate('ArticleFromSearch', { articleId: 83 })}
          >
            <Ionicons name="book-outline" size={16} color={colors.accent} />
            <Text style={styles.learnText}>
              {isEn ? 'Understand and defend the Commandments' : 'Entenda e defenda os Mandamentos'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {examConscience.map((section) => {
          const isOpen = expanded === section.id;
          return (
            <View key={section.id} style={[styles.card, isOpen && styles.cardOpen]}>
              <TouchableOpacity
                onPress={() => setExpanded(isOpen ? null : section.id)}
                style={styles.cardHead}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>{isEn ? (section.mandamentoEn || section.mandamento) : section.mandamento}</Text>
                  <Text style={styles.cardTitle}>{isEn ? (section.tituloEn || section.titulo) : section.titulo}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSubtle} />
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.body}>
                  {(isEn && section.questoesEn ? section.questoesEn : section.questoes).map((q, i) => (
                    <View key={i} style={styles.questionRow}>
                      <Ionicons name="help-circle-outline" size={16} color={colors.accent} style={{ marginTop: 2 }} />
                      <Text style={styles.question}>{q}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    intro: { padding: 16, backgroundColor: c.card, borderRadius: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: c.accent },
    introTitle: { fontSize: fs(18), fontWeight: 'bold', color: c.primaryText, marginBottom: 8 },
    introBody: { fontSize: fs(13), color: c.text, lineHeight: fs(20), marginBottom: 10 },
    introHint: { fontSize: fs(12), color: c.textMuted, fontStyle: 'italic', lineHeight: fs(18) },
    learnBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.divider },
    learnText: { flex: 1, fontSize: fs(13), color: c.accentText, fontWeight: '600' },
    card: { backgroundColor: c.card, borderRadius: 12, marginBottom: 8 },
    cardOpen: { borderWidth: 1, borderColor: c.accent },
    cardHead: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    cardLabel: { fontSize: fs(11), color: c.accentText, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    cardTitle: { fontSize: fs(14), color: c.primaryText, fontWeight: '600' },
    body: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 10, gap: 10 },
    questionRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
    question: { flex: 1, fontSize: fs(13), color: c.text, lineHeight: fs(19) },
  });
