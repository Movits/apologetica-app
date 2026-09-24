import { useMemo } from 'react';
import { Platform, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES } from '../data/dialogues';
import { getSaintToday } from '../data/saints';
import { dailyIndex } from '../utils/daily';
import { pick } from '../utils/i18nData';
import { openBible } from '../navigation/links';
import { Group, Row } from '../components/ui';
import VerseOfDayCard from '../components/VerseOfDayCard';
import SaintTodayCard from '../components/SaintTodayCard';
import LiturgyCard from '../components/LiturgyCard';
import NewsCard from '../components/NewsCard';
import BrandMark from '../components/BrandMark';

// Largura da coluna central no desktop e o gutter mínimo, de cada lado, para
// a marca d'água aparecer (proporções da página, não medidas de interface).
const COLUMN_MAX = 720;
const MIN_GUTTER = 150;
// Largura do BrandMark "lg" (a cruz das laterais) e a opacidade da marca d'água.
const CROSS_W = 44;
const CROSS_OPACITY = 0.16;

// Data por extenso na língua da interface ("Quarta-feira, 24 de setembro"),
// com a inicial maiúscula (o pt-BR devolve o dia da semana em minúsculas).
function todayLabel(isEn, date) {
  const s = date.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Conteúdo do dia (Onda 9): header do stack mantido, conteúdo em Groups na
// ordem versículo, liturgia (santo + leituras), objeção do dia e notícias.
// Acessível por Praticar → Dia de Hoje. O recuo da tab bar vem do stack.
export default function TodayScreen() {
  const navigation = useNavigation();
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;
  const { width } = useWindowDimensions();

  // No desktop sobra espaço dos dois lados da coluna central: enche cada gutter
  // com a cruz do app (marca d'água, decorativa: o leitor de tela pula). Só na
  // web e se o gutter for largo o bastante.
  const gutter = (width - COLUMN_MAX) / 2;
  const showSideCrosses = Platform.OS === 'web' && gutter >= MIN_GUTTER;
  const crossLeft = Math.max(0, gutter / 2 - CROSS_W / 2);

  const now = useMemo(() => new Date(), []);
  const dateLabel = todayLabel(isEn, now);
  // Santo do dia resolvido aqui (e não dentro do card) porque o Group conta os
  // filhos: um card que devolvesse null deixaria uma hairline órfã no topo.
  const saint = useMemo(() => getSaintToday(now), [now]);

  // Objeção do dia: a mesma rotação determinística da Início (semente do dia
  // com o ano), com o roteiro de resposta na tela Diálogo.
  const objection = DIALOGUES[dailyIndex(DIALOGUES.length, now)];
  const openObjection = () => navigation.navigate('Dialogue', { dialogueId: objection.id });
  const openVerse = ({ bookId, chapter, verse }) => openBible(navigation, { bookId, chapter, verse });
  const openLiturgy = () => navigation.navigate('Liturgy');

  const block = { marginBottom: space.md };
  const sideCross = { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', opacity: CROSS_OPACITY };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {showSideCrosses ? (
        <>
          <View pointerEvents="none" style={[sideCross, { left: crossLeft }]}>
            <BrandMark size="lg" decorative />
          </View>
          <View pointerEvents="none" style={[sideCross, { right: crossLeft }]}>
            <BrandMark size="lg" decorative />
          </View>
        </>
      ) : null}
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl, alignItems: 'center' }}>
        {/* No desktop a página vira uma coluna central; no celular ocupa 100%. */}
        <View style={{ width: '100%', maxWidth: Platform.OS === 'web' ? COLUMN_MAX : undefined }}>
          <Text style={[text('subhead'), { color: colors.textSubtle, marginBottom: space.md }]}>{dateLabel}</Text>

          <VerseOfDayCard onOpen={openVerse} style={block} />

          {/* Santo e leituras do dia no mesmo Group: o santo é a memória da
              liturgia de hoje. Em dia sem santo (féria) o Group fica só com a
              liturgia, sem filho vazio nem separador sobrando. */}
          <Group header={t('home.todayLiturgy')} style={block}>
            {saint ? <SaintTodayCard saint={saint} /> : null}
            <LiturgyCard onOpen={openLiturgy} />
          </Group>

          <Group header={t('home.objection.title')} style={block}>
            <View style={{ padding: space.md, gap: space.xxs }}>
              <Text style={[text('title3'), { color: colors.text }]}>{pick(objection, 'objection', isEn)}</Text>
              <Text style={[text('footnote'), { color: colors.textSubtle }]}>
                {t('home.objection.steps', { n: objection.steps.length })}
              </Text>
            </View>
            <Row icon="chatbubbles-outline" title={t('home.objection.cta')} trailing="chevron" onPress={openObjection} />
          </Group>

          <NewsCard style={block} />
        </View>
      </ScrollView>
    </View>
  );
}
