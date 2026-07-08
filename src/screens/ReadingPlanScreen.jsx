import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { confirmAction, notify } from '../utils/dialog';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { READING_TRACKS, getTrack } from '../data/readingPlan';
import { articles } from '../data/articles';
import { getPlanProgress, resetPlanProgress } from '../utils/readingProgress';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

export default function ReadingPlanScreen({ navigation }) {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const [trackId, setTrackId] = useState('fundamentos');
  const [progress, setProgress] = useState({ completed: [], lastDay: 0 });

  const track = getTrack(trackId);
  const days = track.days;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const p = await getPlanProgress(trackId);
        if (active) setProgress(p);
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

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  const totalDone = progress.completed.length;
  const pct = days.length ? Math.round((totalDone / days.length) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <View style={styles.segment}>
          {READING_TRACKS.map((tr) => {
            const activeTrack = tr.id === trackId;
            return (
              <TouchableOpacity
                key={tr.id}
                style={[styles.segmentBtn, activeTrack && styles.segmentBtnActive]}
                onPress={() => setTrackId(tr.id)}
              >
                <Text style={[styles.segmentText, activeTrack && styles.segmentTextActive]}>
                  {t(`plan.track.${tr.id}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.title}>{isEn ? track.titleEn : track.titlePt}</Text>
        <Text style={styles.sub}>{isEn ? track.descEn : track.descPt}</Text>
        <View style={styles.progressRow}>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.pctText}>{totalDone}/{days.length}</Text>
        </View>
        {totalDone > 0 && (
          <TouchableOpacity onPress={onReset} style={styles.resetBtn}>
            <Ionicons name="refresh-outline" size={14} color={colors.accent} />
            <Text style={styles.resetText}>{t('plan.reset')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          key={trackId}
          data={days}
          extraData={progress}
          keyExtractor={(d) => `${trackId}-${d.day}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          scrollEventThrottle={32}
          renderItem={({ item }) => {
            const done = progress.completed.includes(item.day);
            const article = articles.find((a) => a.id === item.articleId);
            return (
              <TouchableOpacity
                style={[styles.card, done && styles.cardDone]}
                onPress={() => {
                  if (article) {
                    navigation.navigate('ArticleFromSearch', { articleId: article.id, fromPlanDay: item.day, fromPlanTrack: trackId });
                  } else {
                    notify(
                      isEn ? 'In preparation' : 'Em preparação',
                      isEn ? 'This article will be added in a future update.' : 'Este artigo ainda será adicionado em uma próxima atualização.'
                    );
                  }
                }}
              >
                <View style={[styles.dayBubble, done && styles.dayBubbleDone]}>
                  {done ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Text style={styles.dayNum}>{item.day}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, done && styles.cardLabelDone]}>{isEn ? 'Day' : 'Dia'} {item.day}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {article
                      ? (isEn ? (article.titleEn || article.title) : article.title)
                      : (isEn ? (item.themeEn || item.theme) : item.theme)}
                  </Text>
                  {!article && (
                    <Text style={styles.pending}>{isEn ? '(in preparation)' : '(em preparação)'}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
              </TouchableOpacity>
            );
          }}
        />
        <ScrollHint direction="up" visible={showTop} />
        <ScrollHint direction="down" visible={showBottom} />
      </View>
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: c.divider, backgroundColor: c.card },
    segment: { flexDirection: 'row', backgroundColor: c.badgeBg, borderRadius: 10, padding: 3, marginBottom: 12 },
    segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    segmentBtnActive: { backgroundColor: c.accent },
    segmentText: { fontSize: fs(13), fontWeight: '600', color: c.textMuted },
    segmentTextActive: { color: '#fff' },
    title: { fontSize: fs(18), color: c.primaryText, fontWeight: 'bold', marginBottom: 6 },
    sub: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18), marginBottom: 12 },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    bar: { flex: 1, height: 6, backgroundColor: c.divider, borderRadius: 3, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: c.accent },
    pctText: { fontSize: fs(12), color: c.textMuted, fontWeight: '600' },
    resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
    resetText: { fontSize: fs(11), color: c.accentText, fontWeight: '600' },
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 12, padding: 13, marginBottom: 8 },
    cardDone: { opacity: 0.7 },
    dayBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.badgeBg, justifyContent: 'center', alignItems: 'center' },
    dayBubbleDone: { backgroundColor: c.accent },
    dayNum: { fontSize: fs(14), color: c.primaryText, fontWeight: 'bold' },
    cardLabel: { fontSize: fs(11), color: c.accentText, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    cardLabelDone: { color: c.textSubtle },
    cardTitle: { fontSize: fs(14), color: c.primaryText, fontWeight: '600', lineHeight: fs(18) },
    pending: { fontSize: fs(11), color: c.textSubtle, fontStyle: 'italic', marginTop: 2 },
  });
