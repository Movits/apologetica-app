import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DIALOGUES } from '../data/dialogues';
import { articles } from '../data/articles';
import { consumeStartIntent } from '../utils/onboarding';
import { getLiturgicalSeason } from '../utils/liturgicalSeason';
import { subscribeProgressSync } from '../services/progressSync';
import { getLastRead } from '../utils/lastRead';
import { getLiveStreak } from '../utils/readingProgress';
import { useJourney } from '../hooks/useJourney';
import JourneyCard from '../components/JourneyCard';
import { dailyIndex, todayKey, todayLabel } from '../utils/daily';
import { dueItems } from '../utils/reviewItems';
import { getSaintToday } from '../data/saints';
import { pick } from '../utils/i18nData';
import { openArticle as openArticleScreen, openBible } from '../navigation/links';
import { Button, Columns, ContinueRow, Group, LargeTitleScreen, Row, SearchField, enterStagger } from '../components/ui';
import { PAGE_MAX } from '../components/ReadingColumn';
import VerseOfDayCard from '../components/VerseOfDayCard';
import SaintTodayCard from '../components/SaintTodayCard';
import LiturgyCard from '../components/LiturgyCard';
import NewsCard from '../components/NewsCard';

// Miniatura da estação litúrgica por chave de getLiturgicalSeason(). O mapa é
// estático porque o Metro só empacota o que está escrito literalmente num
// require().
const SEASON_IMAGES = {
  advento: require('../../assets/design/estacao-advento.jpg'),
  natal: require('../../assets/design/estacao-natal.jpg'),
  quaresma: require('../../assets/design/estacao-quaresma.jpg'),
  pascoa: require('../../assets/design/estacao-pascoa.jpg'),
  comum: require('../../assets/design/estacao-comum.jpg'),
};

// Linha da estação litúrgica: mesma grade da Row (44 de altura mínima, recuos
// e vão da lista), com a foto da estação no lugar do ícone. Informativa, sem
// toque.
function SeasonRow({ season, isEn }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, thumb } = tokens;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        gap: space.sm,
      }}
    >
      {/* Decorativa: o nome da estação vem escrito ao lado. Miniatura 7:5
          (tokens.thumb) no lugar da caixa de ícone da Row. */}
      <Image
        source={SEASON_IMAGES[season.key]}
        aria-hidden
        accessible={false}
        style={{ width: thumb.seasonW, height: thumb.seasonH, borderRadius: radius.sm, backgroundColor: colors.separator }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[text('body'), { color: colors.text }]}>{isEn ? season.en : season.pt}</Text>
        <Text style={[text('subhead'), { color: colors.textSubtle }]}>
          {isEn ? season.noteEn : season.notePt}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, tokens, text, darkMode } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius } = tokens;
  const [last, setLast] = useState(null);
  const [streak, setStreak] = useState(0);
  const journey = useJourney();
  const scrollRef = useRef(null);

  // Toque de novo na aba Início já focada: volta ao topo (o hook escuta o
  // tabPress do Tab.Navigator pai e chama scrollTo na ref).
  useScrollToTop(scrollRef);

  // Último artigo aberto (AsyncStorage), relido a cada foco da aba. O registro
  // de lastRead.js hoje só tem articleId e data; `progress` (0 a 1) é opcional
  // e, quando a tela do artigo passar a gravá-lo, a barra da linha aparece.
  // Também relido quando a sincronização com a conta traz algo de outro
  // aparelho com a Início já aberta.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const load = () => {
        getLastRead().then((data) => {
          if (!alive) return;
          const article = data?.articleId ? articles.find((a) => a.id === data.articleId) : null;
          setLast(article ? { article, progress: data.progress } : null);
        });
        getLiveStreak().then((n) => { if (alive) setStreak(n); });
      };
      load();
      const unsub = subscribeProgressSync(load);
      return () => { alive = false; unsub(); };
    }, [])
  );

  // Ativação do onboarding: abre o diálogo que o usuário escolheu, uma vez.
  useEffect(() => {
    let alive = true;
    consumeStartIntent().then((dialogueId) => {
      if (alive && dialogueId) navigation.navigate('Dialogue', { dialogueId });
    });
    return () => { alive = false; };
  }, [navigation]);

  const openArticle = (articleId) => openArticleScreen(navigation, articleId);
  const openSearch = () => navigation.navigate('Search');

  // Objeção do dia: rotação determinística (a mesma para todos no dia), com o
  // ano na semente para variar entre anos, igual ao versículo do dia.
  const now = new Date();
  const dailyObjection = DIALOGUES[dailyIndex(DIALOGUES.length, now)];
  const season = getLiturgicalSeason(now);
  // Santo do dia resolvido aqui (e não dentro do card) porque o Group conta os
  // filhos: um card que devolvesse null deixaria uma hairline órfã no topo.
  const saint = useMemo(() => getSaintToday(new Date()), []);
  // Revisão espaçada: só aparece na Início quando há perguntas vencidas hoje.
  const reviewDue = journey ? dueItems(journey.review, todayKey()).length : 0;
  const openObjection = () => navigation.navigate('Dialogue', { dialogueId: dailyObjection.id });

  // Entrada discreta dos blocos, em cascata (enterStagger). Só na montagem.
  const block = { marginBottom: space.md };
  const continueSubtitle = typeof last?.progress === 'number'
    ? `${t('home.continueReading')} (${Math.round(last.progress * 100)}%)`
    : t('home.continueReading');

  // A Início reúne o que antes ficava espalhado em Início e Dia de Hoje. No
  // desktop vira duas colunas: à esquerda o que é seu (busca, Jornada, revisão,
  // objeção, continuar lendo); à direita o dia (versículo, liturgia, fontes e
  // notícias). No celular as colunas empilham nessa mesma ordem.
  return (
    <LargeTitleScreen
      title={t('tab.home')}
      subtitle={todayLabel(isEn, now)}
      maxWidth={PAGE_MAX}
      // A ref vai ao Animated.ScrollView do componente, para o useScrollToTop.
      scrollProps={{ ref: scrollRef, keyboardShouldPersistTaps: 'handled' }}
    >
      <Columns>
        <View>
          <Animated.View entering={enterStagger(0, tokens)} style={block}>
            <SearchField asButton placeholder={t('home.search')} onPress={openSearch} />
          </Animated.View>

          {/* Jornada: nível, lições concluídas e sequência, num cartão que
              abre Minha Jornada. Só aparece depois de o estado carregar. Com
              perguntas vencidas, a Revisão aparece logo embaixo. */}
          {journey ? (
            <Animated.View entering={enterStagger(1, tokens)} style={block}>
              <JourneyCard journey={journey} streak={streak} onPress={() => navigation.navigate('Journey')} />
              {reviewDue > 0 ? (
                <Group style={{ marginTop: space.sm }}>
                  <Row
                    icon="repeat-outline"
                    iconColor={colors.accentText}
                    title={t(reviewDue === 1 ? 'journey.review.due.one' : 'journey.review.due', { n: reviewDue })}
                    trailing={String(reviewDue)}
                    chevron
                    onPress={() => navigation.navigate('Review')}
                  />
                </Group>
              ) : null}
            </Animated.View>
          ) : null}

          {/* Objeção do dia: o único bloco que fala alto na tela. Uma pergunta
              difícil e o roteiro de resposta em passos (tela Diálogo). */}
          <Animated.View
            entering={enterStagger(2, tokens)}
            style={[
              { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
              block,
            ]}
          >
            <Text style={[text('footnote'), { color: colors.textSubtle }]}>{t('home.objection.title')}</Text>
            {/* No escuro a objeção fica na cor do texto (o dourado do tint é
                para ações), como no mock aprovado. */}
            <Text style={[text('title'), { color: darkMode ? colors.text : colors.tint }]}>
              {pick(dailyObjection, 'objection', isEn)}
            </Text>
            <Text style={[text('footnote'), { color: colors.textSubtle, marginBottom: space.xs }]}>
              {t('home.objection.steps', { n: dailyObjection.steps.length })}
            </Text>
            <Button variant="primary" label={t('home.objection.cta')} onPress={openObjection} haptic="impact" />
          </Animated.View>

          {/* O último artigo aberto, quando há. */}
          {last ? (
            <Animated.View entering={enterStagger(3, tokens)}>
              <Group style={block}>
                <ContinueRow
                  title={pick(last.article, 'title', isEn)}
                  subtitle={continueSubtitle}
                  progress={last.progress}
                  progressLabel={t('home.continueReading')}
                  onPress={() => openArticle(last.article.id)}
                />
              </Group>
            </Animated.View>
          ) : null}
        </View>

        <View>
          {/* O dia: versículo, estação, santo e leituras da missa. */}
          <Animated.View entering={enterStagger(4, tokens)}>
            <VerseOfDayCard onOpen={(nav) => openBible(navigation, nav)} style={block} />
          </Animated.View>
          <Animated.View entering={enterStagger(5, tokens)}>
            <Group header={t('home.todayLiturgy')} style={block}>
              <SeasonRow season={season} isEn={isEn} />
              {saint ? <SaintTodayCard saint={saint} /> : null}
              <LiturgyCard onOpen={() => navigation.navigate('Liturgy')} />
            </Group>
          </Animated.View>

          {/* Fontes: versículos, Catecismo e documentos citados nos artigos. */}
          <Animated.View entering={enterStagger(6, tokens)}>
            <Group style={block}>
              <Row
                icon="library-outline"
                title={t('tab.references')}
                subtitle={t('home.card.referencesSub')}
                trailing="chevron"
                onPress={() => navigation.navigate('References')}
              />
            </Group>
          </Animated.View>

          <NewsCard style={block} />
        </View>
      </Columns>
    </LargeTitleScreen>
  );
}
