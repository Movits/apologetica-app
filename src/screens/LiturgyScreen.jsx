import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getLiturgy, getLiturgicalColorHex, getLiturgicalColorMeaning, getLiturgicalColorName } from '../services/liturgyApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Share } from 'react-native';
import ReadingText from '../components/ReadingText';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import { verseEndFromRef } from '../utils/verseRange';

const EN_BOOK_ID = {
  'Genesis': 'gn', 'Exodus': 'ex', 'Leviticus': 'lv', 'Numbers': 'nm',
  'Deuteronomy': 'dt', 'Joshua': 'js', 'Judges': 'jz', 'Ruth': 'rt',
  '1 Samuel': '1sm', '2 Samuel': '2sm', '1 Kings': '1rs', '2 Kings': '2rs',
  '1 Chronicles': '1cr', '2 Chronicles': '2cr', 'Ezra': 'esd', 'Nehemiah': 'ne',
  'Tobit': 'tb', 'Judith': 'jt', 'Esther': 'est',
  '1 Maccabees': '1mc', '2 Maccabees': '2mc',
  'Job': 'jo_at', 'Psalms': 'sl', 'Psalm': 'sl',
  'Proverbs': 'pr', 'Ecclesiastes': 'ecl',
  'Song of Solomon': 'ct', 'Song of Songs': 'ct',
  'Wisdom': 'sb', 'Sirach': 'eclo',
  'Isaiah': 'is', 'Jeremiah': 'jr', 'Lamentations': 'lm', 'Baruch': 'br',
  'Ezekiel': 'ez', 'Daniel': 'dn', 'Hosea': 'os', 'Joel': 'jl', 'Amos': 'am',
  'Obadiah': 'ab', 'Jonah': 'jn_at', 'Micah': 'mq', 'Nahum': 'na',
  'Habakkuk': 'hab', 'Zephaniah': 'sf', 'Haggai': 'ag', 'Zechariah': 'zc',
  'Malachi': 'ml', 'Matthew': 'mt', 'Mark': 'mc', 'Luke': 'lc', 'John': 'jo',
  'Acts': 'at', 'Romans': 'rm',
  '1 Corinthians': '1cor', '2 Corinthians': '2cor',
  'Galatians': 'gl', 'Ephesians': 'ef', 'Philippians': 'fl', 'Colossians': 'cl',
  '1 Thessalonians': '1ts', '2 Thessalonians': '2ts',
  '1 Timothy': '1tm', '2 Timothy': '2tm',
  'Titus': 'tt', 'Philemon': 'fm', 'Hebrews': 'hb',
  'James': 'tg', '1 Peter': '1pd', '2 Peter': '2pd',
  '1 John': '1jo', '2 John': '2jo', '3 John': '3jo',
  'Jude': 'jd', 'Revelation': 'ap',
};

const parseReadingRef = (ref) => {
  if (!ref) return null;
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;
  const bookId = EN_BOOK_ID[match[1].trim()];
  if (!bookId) return null;
  return { bookId, chapter: parseInt(match[2]), verse: parseInt(match[3]), verseEnd: verseEndFromRef(ref) };
};

// Returns only "Book Chapter" (e.g. "Psalm 147") stripping verse ranges.
const getChipLabel = (ref) => {
  if (!ref) return '';
  const m = ref.match(/^(.+?)\s+(\d+)/);
  return m ? `${m[1]} ${m[2]}` : ref;
};

const APP_PROMO_PT = '\n\nEnviado pelo APPologética ✝';
const APP_PROMO_EN = '\n\nShared from APPologética ✝';

export default function LiturgyScreen() {
  const { colors, fs } = useTheme();
  const { t, isEn } = useLanguage();
  const navigation = useNavigation();
  const [liturgy, setLiturgy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [enReadings, setEnReadings] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getLiturgy();
      setLiturgy(data);
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, []);

  const isOffline = error?.code === 'OFFLINE_NO_CACHE' || error?.message === 'OFFLINE_NO_CACHE';

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  useEffect(() => {
    if (!isEn) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    fetch(`https://cpbjr.github.io/catholic-readings-api/readings/${yyyy}/${mm}-${dd}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.readings) setEnReadings(data.readings); })
      .catch(() => {});
  }, [isEn]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const shareReading = (label, reading) => {
    if (!reading) return;
    let msg = `${label}\n\n`;
    if (reading.referencia) msg += `${reading.referencia}\n\n`;
    if (reading.titulo) msg += `${reading.titulo}\n\n`;
    if (reading.texto) msg += reading.texto;
    msg += isEn ? APP_PROMO_EN : APP_PROMO_PT;
    Share.share({ message: msg }).catch(() => {});
  };

  const L = isEn ? {
    entrance: 'Entrance Antiphon',
    collect: 'Collect',
    first: 'First Reading',
    psalm: 'Responsorial Psalm',
    second: 'Second Reading',
    gospel: 'Gospel',
    offer: 'Prayer over the Offerings',
    communionAnt: 'Communion Antiphon',
    afterCommunion: 'Prayer After Communion',
    color: 'Liturgical color',
    stale: 'Showing saved data. No connection?',
    footer: 'Liturgy provided by CNBB (in Portuguese). Last update',
    error: 'Error loading liturgy',
  } : {
    entrance: 'Antífona de entrada',
    collect: 'Oração da coleta',
    first: 'Primeira Leitura',
    psalm: 'Salmo Responsorial',
    second: 'Segunda Leitura',
    gospel: 'Evangelho',
    offer: 'Oração sobre as oferendas',
    communionAnt: 'Antífona de comunhão',
    afterCommunion: 'Oração após a comunhão',
    color: 'Cor litúrgica',
    stale: 'Mostrando dados salvos. Sem conexão?',
    footer: 'Liturgia fornecida pela CNBB. Última atualização',
    error: 'Erro ao carregar liturgia',
  };

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>{isEn ? 'Loading liturgy...' : 'Carregando liturgia...'}</Text>
      </View>
    );
  }

  if (error && !liturgy) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textSubtle} />
        <Text style={styles.errorTitle}>
          {isOffline
            ? (isEn ? 'Liturgy needs internet' : 'Liturgia precisa de internet')
            : t('liturgy.errorTitle')}
        </Text>
        <Text style={styles.muted}>
          {isOffline
            ? (isEn
                ? 'The daily readings come from the CNBB online and are not yet cached on your device. Connect to Wi-Fi or mobile data, then tap Try again.'
                : 'As leituras do dia vêm da CNBB online e ainda não estão guardadas no aparelho. Conecte ao Wi-Fi ou dados móveis e toque em Tentar novamente.')
            : (error?.message || (isEn ? 'Error loading liturgy' : 'Erro ao carregar liturgia'))}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!liturgy) return null;

  const cor = liturgy.cor;
  const corHex = getLiturgicalColorHex(cor);

  // A API retorna primeiraLeitura/salmo/segundaLeitura/evangelho como arrays
  // (suporta leituras alternativas). Pega o primeiro item de cada.
  const pick = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : arr);
  const primeira = pick(liturgy.leituras?.primeiraLeitura);
  const salmo = pick(liturgy.leituras?.salmo);
  const segunda = pick(liturgy.leituras?.segundaLeitura);
  const evangelho = pick(liturgy.leituras?.evangelho);

  return (
    <View style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      scrollEventThrottle={32}
    >
      <View style={[styles.headerCard, { borderLeftColor: corHex }]}>
        <Text style={styles.date}>{liturgy.data}</Text>
        <Text style={styles.title}>{(() => {
          if (!isEn) return liturgy.liturgia;
          const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const weekMatch = liturgy.liturgia?.match(/(\d+)[aª°]?\s*semana/i);
          const weekNum = weekMatch ? weekMatch[1] : null;
          const season = enReadings?.season;
          if (season && weekNum) return `${dayName} – Week ${weekNum} of ${season}`;
          if (season) return `${dayName} – ${season}`;
          return dayName;
        })()}</Text>
        {cor && (
          <>
            <View style={styles.colorRow}>
              <View style={[styles.colorDot, { backgroundColor: corHex }]} />
              <Text style={styles.colorLabel}>{L.color}: {getLiturgicalColorName(cor, isEn ? 'en' : 'pt')}</Text>
            </View>
            {getLiturgicalColorMeaning(cor, isEn ? 'en' : 'pt') ? (
              <Text style={styles.colorMeaning}>{getLiturgicalColorMeaning(cor, isEn ? 'en' : 'pt')}</Text>
            ) : null}
          </>
        )}
        {liturgy.source === 'stale' && (
          <View style={styles.stalebanner}>
            <Ionicons name="warning-outline" size={14} color={colors.accent} />
            <Text style={styles.staleText}>{L.stale}</Text>
          </View>
        )}
      </View>

      {isEn && (
        <View style={styles.enBanner}>
          <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.enBannerText}>
            Full liturgy text is in Portuguese (CNBB). Tap a reading below to open it in English (Douay-Rheims).
          </Text>
        </View>
      )}

      {isEn && enReadings && (
        <View style={styles.enReadings}>
          <Text style={styles.enReadingsTitle}>Today's Readings (USCCB)</Text>
          {[
            { label: 'First Reading', ref: enReadings.firstReading },
            { label: 'Psalm', ref: enReadings.psalm },
            { label: 'Second Reading', ref: enReadings.secondReading },
            { label: 'Gospel', ref: enReadings.gospel },
          ].filter((r) => r.ref).map((r) => {
            const nav = parseReadingRef(r.ref);
            return (
              <TouchableOpacity
                key={r.label}
                style={[styles.enChip, !nav && styles.enChipDisabled]}
                onPress={() => nav && navigation.navigate('Bíblia', {
                  bookId: nav.bookId, chapter: nav.chapter, highlightVerse: nav.verse, highlightVerseEnd: nav.verseEnd,
                })}
                disabled={!nav}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.enChipLabel}>{r.label}</Text>
                  <Text style={styles.enChipRef}>{getChipLabel(r.ref)}</Text>
                </View>
                {nav && <Ionicons name="chevron-forward" size={16} color={colors.accent} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {liturgy.antifonas?.entrada && (
        <Section title={L.entrance} theme={{ colors, fs }}>
          <Text style={styles.body}>{liturgy.antifonas.entrada}</Text>
        </Section>
      )}

      {liturgy.oracoes?.coleta && (
        <Section title={L.collect} theme={{ colors, fs }}>
          <Text style={styles.body}>{liturgy.oracoes.coleta}</Text>
        </Section>
      )}

      <ReadingSection
        title={L.first}
        reading={primeira}
        onShare={() => shareReading(L.first, primeira)}
        theme={{ colors, fs }}
      />

      <ReadingSection
        title={L.psalm}
        reading={salmo}
        onShare={() => shareReading(L.psalm, salmo)}
        isPsalm
        theme={{ colors, fs }}
      />

      {segunda && (
        <ReadingSection
          title={L.second}
          reading={segunda}
          onShare={() => shareReading(L.second, segunda)}
          theme={{ colors, fs }}
        />
      )}

      <ReadingSection
        title={L.gospel}
        reading={evangelho}
        onShare={() => shareReading(L.gospel, evangelho)}
        emphasize
        theme={{ colors, fs }}
      />

      {liturgy.oracoes?.oferendas && (
        <Section title={L.offer} theme={{ colors, fs }}>
          <Text style={styles.body}>{liturgy.oracoes.oferendas}</Text>
        </Section>
      )}

      {liturgy.antifonas?.comunhao && (
        <Section title={L.communionAnt} theme={{ colors, fs }}>
          <Text style={styles.body}>{liturgy.antifonas.comunhao}</Text>
        </Section>
      )}

      {liturgy.oracoes?.comunhao && (
        <Section title={L.afterCommunion} theme={{ colors, fs }}>
          <Text style={styles.body}>{liturgy.oracoes.comunhao}</Text>
        </Section>
      )}

      <Text style={styles.footer}>
        {L.footer}: {formatTime(liturgy.fetchedAt)}.
      </Text>
    </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

function Section({ title, children, theme }) {
  const styles = makeStyles(theme.colors, theme.fs);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ReadingSection({ title, reading, onShare, emphasize, isPsalm, theme }) {
  const styles = makeStyles(theme.colors, theme.fs);
  if (!reading) return null;
  return (
    <View style={[styles.section, emphasize && styles.sectionEmphasized]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, emphasize && styles.sectionTitleEmphasized]}>{title}</Text>
        <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={18} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionBody}>
        {reading.referencia ? <Text style={styles.reading_ref}>{reading.referencia}</Text> : null}
        {reading.titulo ? <Text style={styles.reading_title}>{reading.titulo}</Text> : null}
        {reading.texto ? (
          <ReadingText
            text={reading.texto}
            style={[styles.body, isPsalm && styles.bodyPsalm]}
            numberStyle={styles.verseNumberInline}
          />
        ) : null}
        {reading.refrao ? (
          <Text style={styles.refrao}>R/. {reading.refrao}</Text>
        ) : null}
      </View>
    </View>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12, backgroundColor: c.bg },
    muted: { fontSize: fs(13), color: c.textMuted, textAlign: 'center' },
    errorTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText, marginTop: 8 },
    retryBtn: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: c.accent },
    retryText: { color: '#fff', fontWeight: 'bold', fontSize: fs(14) },
    headerCard: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 18,
      marginBottom: 16,
      borderLeftWidth: 6,
    },
    date: { fontSize: fs(13), color: c.textSubtle, fontWeight: 'bold', marginBottom: 4 },
    title: { fontSize: fs(20), color: c.primaryText, fontWeight: 'bold', marginBottom: 10, lineHeight: fs(26) },
    colorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: c.divider },
    colorLabel: { fontSize: fs(12), color: c.textMuted },
    colorMeaning: { fontSize: fs(12), color: c.textMuted, marginTop: 6, lineHeight: fs(17), fontStyle: 'italic' },
    stalebanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, padding: 8, backgroundColor: c.badgeBg, borderRadius: 6 },
    staleText: { fontSize: fs(11), color: c.textMuted, flex: 1 },
    section: { backgroundColor: c.card, borderRadius: 12, padding: 16, marginBottom: 12 },
    sectionEmphasized: { borderWidth: 1, borderColor: c.accent },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { fontSize: fs(12), fontWeight: 'bold', color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1 },
    sectionTitleEmphasized: { color: c.accentText },
    shareBtn: { padding: 4 },
    sectionBody: { gap: 8 },
    reading_ref: { fontSize: fs(13), color: c.accentText, fontWeight: 'bold' },
    reading_title: { fontSize: fs(13), color: c.textMuted, fontStyle: 'italic' },
    body: { fontSize: fs(15), color: c.text, lineHeight: fs(24) },
    bodyPsalm: { fontStyle: 'italic' },
    verseNumberInline: {
      fontSize: fs(10),
      color: c.accentText,
      fontWeight: 'bold',
    },
    refrao: { fontSize: fs(14), color: c.primaryText, fontWeight: 'bold', fontStyle: 'italic', marginTop: 8 },
    footer: { fontSize: fs(11), color: c.textSubtle, textAlign: 'center', marginTop: 12, marginBottom: 8 },
    enBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12,
      backgroundColor: c.badgeBg, borderRadius: 10, padding: 12,
    },
    enBannerText: { flex: 1, fontSize: fs(12), color: c.textMuted, lineHeight: fs(17) },
    enReadings: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 12, gap: 8 },
    enReadingsTitle: { fontSize: fs(11), fontWeight: 'bold', color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    enChip: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderWidth: 1, borderColor: c.accent, borderRadius: 10, padding: 10,
    },
    enChipDisabled: { borderColor: c.divider },
    enChipLabel: { fontSize: fs(11), color: c.textSubtle, fontWeight: '600', marginBottom: 2 },
    enChipRef: { fontSize: fs(14), color: c.primaryText, fontWeight: 'bold' },
  });
