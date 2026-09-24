import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getLiturgy, getLiturgicalColorHex, getLiturgicalColorMeaning, getLiturgicalColorName } from '../services/liturgyApi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ReadingText from '../components/ReadingText';
import { BIBLE_BOOKS } from '../data/bible';
import { verseEndFromRef } from '../utils/verseRange';
import { openBible } from '../navigation/links';
import { shareText } from '../utils/share';
import { todayKey } from '../utils/daily';
import { Button, EmptyState, Group, Row } from '../components/ui';

// Liturgia do dia: cabeçalho com a cor litúrgica, leituras em grupos (título
// em headline, referência em footnote, texto em serifa de leitura) e
// compartilhar por leitura. Rede só em liturgyApi (cache e fallback offline) e
// na lista de referências em inglês (USCCB), que falha em silêncio.

// Nome do livro em inglês -> id, derivado de bible.js. A API americana usa
// alguns nomes fora do Douay-Rheims-Challoner: os apelidos entram por cima.
const EN_BOOK_ID = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.nameEn, b.id]));
Object.assign(EN_BOOK_ID, { Psalm: 'sl', 'Song of Songs': 'ct', Sirach: 'eclo', Acts: 'at' });

const parseReadingRef = (ref) => {
  if (!ref) return null;
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;
  const name = match[1].trim();
  // Só chaves próprias: um nome vindo da API igual a 'constructor' não pode cair no protótipo.
  const bookId = Object.hasOwn(EN_BOOK_ID, name) ? EN_BOOK_ID[name] : undefined;
  if (!bookId) return null;
  return { bookId, chapter: parseInt(match[2]), verse: parseInt(match[3]), verseEnd: verseEndFromRef(ref) };
};

// Só "Livro capítulo" (ex.: "Psalm 147"), sem o intervalo de versículos.
const getChipLabel = (ref) => {
  if (!ref) return '';
  const m = ref.match(/^(.+?)\s+(\d+)/);
  return m ? `${m[1]} ${m[2]}` : ref;
};

// A API devolve primeiraLeitura/salmo/segundaLeitura/evangelho como arrays
// (leituras alternativas). Fica com a primeira.
const first = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : arr);

// Data e hora da última atualização no formato do idioma da interface.
function formatTime(ts, isEn) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString(isEn ? 'en-US' : 'pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Enquanto carrega: três cards com barras na forma do conteúdo, sem spinner.
function LoadingPlaceholder({ label }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius } = tokens;
  const bar = (width, key) => (
    <View
      key={key}
      style={{ height: text('subhead').lineHeight, width, borderRadius: radius.sm, backgroundColor: colors.separator }}
    />
  );
  return (
    <View aria-busy aria-label={label} style={{ padding: space.md, gap: space.md }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: space.md, gap: space.sm }}>
          {bar('40%', 'a')}
          {bar('100%', 'b')}
          {bar('90%', 'c')}
          {bar('65%', 'd')}
        </View>
      ))}
    </View>
  );
}

// Card de uma leitura ou oração: linha de título (com compartilhar quando há
// `onShare`) e corpo, separados pela hairline do Group.
function ReadingGroup({ title, reading, onShare, isPsalm }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;
  if (!reading) return null;
  return (
    <Group style={{ marginTop: space.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          paddingLeft: space.md,
          paddingRight: onShare ? space.xxs : space.md,
          gap: space.xs,
        }}
      >
        <Text role="heading" style={[text('headline'), { color: colors.text, flex: 1 }]}>{title}</Text>
        {onShare ? (
          <Button variant="plain" full={false} icon="share-outline" label={t('common.share')} onPress={onShare} />
        ) : null}
      </View>
      <View style={{ padding: space.md, gap: space.xs }}>
        {reading.referencia ? (
          <Text style={[text('footnote'), { color: colors.accentText }]}>{reading.referencia}</Text>
        ) : null}
        {reading.titulo ? (
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{reading.titulo}</Text>
        ) : null}
        {reading.texto ? (
          <ReadingText
            text={reading.texto}
            style={[text('reading'), { color: colors.text }, isPsalm ? { fontStyle: 'italic' } : null]}
            numberStyle={[text('caption1'), { color: colors.accentText }]}
          />
        ) : null}
        {reading.refrao ? (
          <Text style={[text('headline'), { color: colors.text, marginTop: space.xs }]}>R/. {reading.refrao}</Text>
        ) : null}
      </View>
    </Group>
  );
}

export default function LiturgyScreen() {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const navigation = useNavigation();
  const { space, radius, icon } = tokens;
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

  const loadWithSpinner = useCallback(async () => {
    setLoading(true);
    await load();
    setLoading(false);
  }, [load]);

  useEffect(() => {
    loadWithSpinner();
  }, [loadWithSpinner]);

  // Lista de referências em inglês (USCCB) do dia. A flag `alive` descarta a
  // resposta se a tela desmontou ou o idioma mudou antes de ela chegar.
  useEffect(() => {
    if (!isEn) return undefined;
    let alive = true;
    const [yyyy, mm, dd] = todayKey().split('-');
    fetch(`https://cpbjr.github.io/catholic-readings-api/readings/${yyyy}/${mm}-${dd}.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (alive && data?.readings) setEnReadings(data.readings); })
      .catch(() => {});
    return () => { alive = false; };
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
    shareText(msg);
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
  };

  if (loading) {
    return <LoadingPlaceholder label={isEn ? 'Loading liturgy' : 'Carregando liturgia'} />;
  }

  if (error && !liturgy) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyState
          icon="cloud-offline-outline"
          title={isOffline
            ? (isEn ? 'Liturgy needs internet' : 'A liturgia precisa de internet')
            : t('liturgy.errorTitle')}
          message={isOffline
            ? (isEn
              ? 'The daily readings come from the CNBB online and are not yet saved on this device. Connect and try again.'
              : 'As leituras do dia vêm da CNBB online e ainda não estão guardadas neste aparelho. Conecte e tente de novo.')
            : (error?.message || (isEn ? 'Error loading liturgy' : 'Erro ao carregar a liturgia'))}
          action={{ label: t('common.tryAgain'), onPress: loadWithSpinner }}
        />
      </View>
    );
  }

  if (!liturgy) return null;

  const cor = liturgy.cor;
  const corHex = getLiturgicalColorHex(cor);
  const langKey = isEn ? 'en' : 'pt';
  const colorMeaning = cor ? getLiturgicalColorMeaning(cor, langKey) : '';

  const primeira = first(liturgy.leituras?.primeiraLeitura);
  const salmo = first(liturgy.leituras?.salmo);
  const segunda = first(liturgy.leituras?.segundaLeitura);
  const evangelho = first(liturgy.leituras?.evangelho);

  // Em inglês o título vem do dia da semana mais a semana e o tempo da USCCB,
  // quando a lista em inglês chegou; o texto da CNBB continua em português.
  const title = (() => {
    if (!isEn) return liturgy.liturgia;
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const weekMatch = liturgy.liturgia?.match(/(\d+)[aª°]?\s*semana/i);
    const weekNum = weekMatch ? weekMatch[1] : null;
    const season = enReadings?.season;
    if (season && weekNum) return `${dayName}, Week ${weekNum} of ${season}`;
    if (season) return `${dayName}, ${season}`;
    return dayName;
  })();

  const enList = isEn && enReadings
    ? [
      { label: 'First Reading', ref: enReadings.firstReading },
      { label: 'Psalm', ref: enReadings.psalm },
      { label: 'Second Reading', ref: enReadings.secondReading },
      { label: 'Gospel', ref: enReadings.gospel },
    ].filter((r) => r.ref)
    : [];

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
    >
      {/* Cabeçalho do dia: data, título e cor litúrgica. */}
      <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space.md, gap: space.xs }}>
        <Text style={[text('footnote'), { color: colors.textSubtle }]}>{liturgy.data}</Text>
        <Text role="heading" style={[text('title'), { color: colors.text }]}>{title}</Text>
        {cor ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xxs }}>
            <View
              style={{
                width: space.md,
                height: space.md,
                borderRadius: radius.full,
                backgroundColor: corHex,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.separator,
              }}
            />
            <Text style={[text('subhead'), { color: colors.text }]}>
              {L.color}: {getLiturgicalColorName(cor, langKey)}
            </Text>
          </View>
        ) : null}
        {colorMeaning ? (
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{colorMeaning}</Text>
        ) : null}
        {liturgy.source === 'stale' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xxs }}>
            <Ionicons name="warning-outline" size={icon.sm} color={colors.accentText} />
            <Text style={[text('footnote'), { color: colors.textSubtle, flex: 1 }]}>{L.stale}</Text>
          </View>
        ) : null}
      </View>

      {isEn ? (
        <Text style={[text('footnote'), { color: colors.textSubtle, marginTop: space.md, marginHorizontal: space.md }]}>
          Full liturgy text is in Portuguese (CNBB). Tap a reading below to open it in English (Douay-Rheims).
        </Text>
      ) : null}

      {enList.length > 0 ? (
        <Group header="Today's Readings (USCCB)" style={{ marginTop: space.md }}>
          {enList.map((r) => {
            const nav = parseReadingRef(r.ref);
            return (
              <Row
                key={r.label}
                title={r.label}
                subtitle={getChipLabel(r.ref)}
                trailing={nav ? 'chevron' : undefined}
                disabled={!nav}
                onPress={nav ? () => openBible(navigation, nav) : undefined}
              />
            );
          })}
        </Group>
      ) : null}

      {liturgy.antifonas?.entrada ? (
        <ReadingGroup title={L.entrance} reading={{ texto: liturgy.antifonas.entrada }} />
      ) : null}
      {liturgy.oracoes?.coleta ? (
        <ReadingGroup title={L.collect} reading={{ texto: liturgy.oracoes.coleta }} />
      ) : null}

      <ReadingGroup title={L.first} reading={primeira} onShare={() => shareReading(L.first, primeira)} />
      <ReadingGroup title={L.psalm} reading={salmo} onShare={() => shareReading(L.psalm, salmo)} isPsalm />
      {segunda ? (
        <ReadingGroup title={L.second} reading={segunda} onShare={() => shareReading(L.second, segunda)} />
      ) : null}
      <ReadingGroup title={L.gospel} reading={evangelho} onShare={() => shareReading(L.gospel, evangelho)} />

      {liturgy.oracoes?.oferendas ? (
        <ReadingGroup title={L.offer} reading={{ texto: liturgy.oracoes.oferendas }} />
      ) : null}
      {liturgy.antifonas?.comunhao ? (
        <ReadingGroup title={L.communionAnt} reading={{ texto: liturgy.antifonas.comunhao }} />
      ) : null}
      {liturgy.oracoes?.comunhao ? (
        <ReadingGroup title={L.afterCommunion} reading={{ texto: liturgy.oracoes.comunhao }} />
      ) : null}

      <Text style={[text('footnote'), { color: colors.textTertiary, textAlign: 'center', marginTop: space.lg }]}>
        {L.footer}: {formatTime(liturgy.fetchedAt, isEn)}.
      </Text>
    </ScrollView>
  );
}
