import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES } from '../data/dialogues';
import { getSaintToday } from '../data/saints';
import { dailyIndex, todayLabel } from '../utils/daily';
import { pick } from '../utils/i18nData';
import { openBible } from '../navigation/links';
import { Group, Row } from '../components/ui';
import ReadingColumn, { columnStyle, columnContentStyle } from '../components/ReadingColumn';
import VerseOfDayCard from '../components/VerseOfDayCard';
import SaintTodayCard from '../components/SaintTodayCard';
import LiturgyCard from '../components/LiturgyCard';
import NewsCard from '../components/NewsCard';

// Conteúdo do dia (Onda 9): header do stack mantido, conteúdo em Groups na
// ordem versículo, liturgia (santo + leituras), objeção do dia e notícias.
// Acessível por Praticar → Dia de Hoje. O recuo da tab bar vem do stack.
export default function TodayScreen() {
  const navigation = useNavigation();
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const { space } = tokens;

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

  return (
    <ReadingColumn>
      <ScrollView contentContainerStyle={[columnContentStyle, { padding: space.md, paddingBottom: space.xl }]}>
        {/* No desktop a página vira uma coluna central; no celular ocupa 100%. */}
        <View style={columnStyle}>
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
    </ReadingColumn>
  );
}
