import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ARTICLE_CATEGORIES, ARTICLE_COUNT_BY_CATEGORY } from '../data/articleCategories';
import { DIALOGUES } from '../data/dialogues';
import { articles } from '../data/articles';
import { consumeStartIntent } from '../utils/onboarding';
import { getLiturgicalSeason } from '../utils/liturgicalSeason';
import { getLastRead } from '../utils/lastRead';
import { dailyIndex, todayLabel } from '../utils/daily';
import { categoryLabel, pick } from '../utils/i18nData';
import { openArticle as openArticleScreen } from '../navigation/links';
import { Button, ContinueRow, Group, LargeTitleScreen, Row, SearchField, SectionTitle, enterStagger } from '../components/ui';

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
  const scrollRef = useRef(null);

  // Toque de novo na aba Início já focada: volta ao topo (o hook escuta o
  // tabPress do Tab.Navigator pai e chama scrollTo na ref).
  useScrollToTop(scrollRef);

  // Último artigo aberto (AsyncStorage), relido a cada foco da aba. O registro
  // de lastRead.js hoje só tem articleId e data; `progress` (0 a 1) é opcional
  // e, quando a tela do artigo passar a gravá-lo, a barra da linha aparece.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getLastRead().then((data) => {
        if (!alive) return;
        const article = data?.articleId ? articles.find((a) => a.id === data.articleId) : null;
        setLast(article ? { article, progress: data.progress } : null);
      });
      return () => { alive = false; };
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
  const openCategory = (category) => navigation.navigate('CategoryArticles', { category });

  // Objeção do dia: rotação determinística (a mesma para todos no dia), com o
  // ano na semente para variar entre anos, igual ao versículo do dia.
  const now = new Date();
  const dailyObjection = DIALOGUES[dailyIndex(DIALOGUES.length, now)];
  const season = getLiturgicalSeason(now);
  const openObjection = () => navigation.navigate('Dialogue', { dialogueId: dailyObjection.id });

  // Entrada discreta dos blocos, em cascata (enterStagger). Só na montagem.
  const block = { marginBottom: space.md };
  const continueSubtitle = typeof last?.progress === 'number'
    ? `${t('home.continueReading')} (${Math.round(last.progress * 100)}%)`
    : t('home.continueReading');

  return (
    <LargeTitleScreen
      title={t('tab.home')}
      subtitle={todayLabel(isEn, now)}
      // A ref vai ao Animated.ScrollView do componente, para o useScrollToTop.
      scrollProps={{ ref: scrollRef, keyboardShouldPersistTaps: 'handled' }}
    >
      <Animated.View entering={enterStagger(0, tokens)} style={block}>
        <SearchField asButton placeholder={t('home.search')} onPress={openSearch} />
      </Animated.View>

      {/* Objeção do dia: o único bloco que fala alto na tela. Uma pergunta
          difícil e o roteiro de resposta em passos (tela Diálogo). */}
      <Animated.View
        entering={enterStagger(1, tokens)}
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

      {/* Estação litúrgica (calculada localmente, offline) e o último
          artigo aberto, quando há. */}
      <Animated.View entering={enterStagger(2, tokens)}>
        <Group style={block}>
          <SeasonRow season={season} isEn={isEn} />
          {last ? (
            <ContinueRow
              title={pick(last.article, 'title', isEn)}
              subtitle={continueSubtitle}
              progress={last.progress}
              progressLabel={t('home.continueReading')}
              onPress={() => openArticle(last.article.id)}
            />
          ) : null}
        </Group>
      </Animated.View>

      {/* Centro da Início: os temas dos artigos de apologética. */}
      <Animated.View entering={enterStagger(3, tokens)}>
        <SectionTitle title={t('home.section.topics')} />
      </Animated.View>
      <Animated.View entering={enterStagger(4, tokens)}>
        <Group style={block}>
          {ARTICLE_CATEGORIES.map((cat) => {
            const count = ARTICLE_COUNT_BY_CATEGORY.get(cat.id) || 0;
            const label = categoryLabel(cat.id, t);
            const countLabel = count === 1 ? t('articles.count.one') : t('articles.count', { n: count });
            return (
              <Row
                key={cat.id}
                icon={cat.icon}
                title={label}
                trailing={count}
                chevron
                accessibilityLabel={`${label}, ${countLabel}`}
                onPress={() => openCategory(cat.id)}
              />
            );
          })}
        </Group>
      </Animated.View>

      {/* Fontes: referências (versículos, Catecismo, documentos) e a
          Bíblia completa. */}
      <Animated.View entering={enterStagger(5, tokens)}>
        <SectionTitle title={t('home.section.sources')} />
      </Animated.View>
      <Animated.View entering={enterStagger(6, tokens)}>
        <Group style={block}>
          <Row
            icon="library-outline"
            title={t('tab.references')}
            subtitle={t('home.card.referencesSub')}
            trailing="chevron"
            onPress={() => navigation.navigate('References')}
          />
          <Row
            icon="book-outline"
            title={t('tab.bible')}
            subtitle={t('home.card.bibleSub')}
            trailing="chevron"
            onPress={() => navigation.navigate('Bíblia')}
          />
        </Group>
      </Animated.View>
    </LargeTitleScreen>
  );
}
