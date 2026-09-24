import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ARTICLE_CATEGORIES, countByCategory } from '../data/articleCategories';
import { DIALOGUES } from '../data/dialogues';
import { articles } from '../data/articles';
import { consumeStartIntent } from '../utils/onboarding';
import { getLiturgicalSeason } from '../utils/liturgicalSeason';
import { getLastRead } from '../utils/lastRead';
import { dailyIndex } from '../utils/daily';
import { categoryLabel, pick } from '../utils/i18nData';
import { fullBleedContentOptions } from '../navigation/chrome';
import { openArticle as openArticleScreen } from '../navigation/links';
import { Button, ContinueRow, Group, Row, SearchField, SectionTitle } from '../components/ui';
import LargeTitleScreen from '../components/ui/LargeTitleScreen';

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

// Data por extenso na língua da interface ("Quarta-feira, 24 de setembro"),
// com a inicial maiúscula (o pt-BR devolve o dia da semana em minúsculas).
function todayLabel(isEn, date) {
  const s = date.toLocaleDateString(isEn ? 'en-US' : 'pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

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

// Cauda das linhas de tema: contagem de artigos em texto secundário e o
// chevron, como no mock ("23 >").
function CountTrail({ count }) {
  const { colors, tokens, text } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.xxs }}>
      <Text style={[text('subhead'), { color: colors.textSubtle }]}>{count}</Text>
      <Ionicons name="chevron-forward" size={tokens.icon.sm} color={colors.textTertiary} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, tokens, text, darkMode } = useTheme();
  const { t, isEn } = useLanguage();
  const { space, radius, motion } = tokens;
  const [refreshKey, setRefreshKey] = useState(0);
  const [last, setLast] = useState(null);
  const scrollRef = useRef(null);

  // O LargeTitleScreen já compensa a tab bar translúcida por dentro (padding
  // no fim do conteúdo), então o recuo que o stack põe em toda tela sai daqui.
  useLayoutEffect(() => {
    navigation.setOptions(fullBleedContentOptions(colors));
  }, [navigation, colors]);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
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

  // Toque de novo na aba Início já focada: volta ao topo.
  useEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav) return;
    const unsub = tabNav.addListener('tabPress', () => {
      if (navigation.isFocused()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  // Último artigo aberto (AsyncStorage), relido a cada foco da aba. O registro
  // de lastRead.js hoje só tem articleId e data; `progress` (0 a 1) é opcional
  // e, quando a tela do artigo passar a gravá-lo, a barra da linha aparece.
  useEffect(() => {
    let alive = true;
    getLastRead().then((data) => {
      if (!alive) return;
      const article = data?.articleId ? articles.find((a) => a.id === data.articleId) : null;
      setLast(article ? { article, progress: data.progress } : null);
    });
    return () => { alive = false; };
  }, [refreshKey]);

  const openArticle = (articleId) => openArticleScreen(navigation, articleId);
  const openSearch = () => navigation.navigate('Search');
  const openCategory = (category) => navigation.navigate('CategoryArticles', { category });

  // Objeção do dia: rotação determinística (a mesma para todos no dia), com o
  // ano na semente para variar entre anos, igual ao versículo do dia.
  const now = new Date();
  const dailyObjection = DIALOGUES[dailyIndex(DIALOGUES.length, now)];
  const season = getLiturgicalSeason(now);
  const openObjection = () => navigation.navigate('Dialogue', { dialogueId: dailyObjection.id });

  // Entrada discreta dos blocos, em cascata (o reanimated respeita o "reduzir
  // movimento" do sistema por padrão). Só na montagem, nada em loop.
  const enter = (i) => FadeInDown.duration(motion.layout).delay(Math.min(i, 8) * motion.stagger);
  const block = { marginBottom: space.md };

  const articleCount = (n) => (isEn ? (n === 1 ? 'article' : 'articles') : (n === 1 ? 'artigo' : 'artigos'));
  const continueSubtitle = typeof last?.progress === 'number'
    ? `${t('home.continueReading')} (${Math.round(last.progress * 100)}%)`
    : t('home.continueReading');

  return (
    <LargeTitleScreen
      title={t('tab.home')}
      subtitle={todayLabel(isEn, now)}
      // O ScrollView fica aqui (e não em children) para a tela guardar a ref
      // que o toque na aba usa para voltar ao topo.
      renderList={({ header, ...listProps }) => (
        <Animated.ScrollView ref={scrollRef} {...listProps}>
          {header}

          <Animated.View entering={enter(0)} style={block}>
            <SearchField asButton placeholder={t('home.search')} onPress={openSearch} />
          </Animated.View>

          {/* Objeção do dia: o único bloco que fala alto na tela. Uma pergunta
              difícil e o roteiro de resposta em passos (tela Diálogo). */}
          <Animated.View
            entering={enter(1)}
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
          <Animated.View entering={enter(2)}>
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
          <Animated.View entering={enter(3)}>
            <SectionTitle title={t('home.section.topics')} />
          </Animated.View>
          <Animated.View entering={enter(4)}>
            <Group style={block}>
              {ARTICLE_CATEGORIES.map((cat) => {
                const count = countByCategory(cat.id);
                const label = categoryLabel(cat.id, t);
                return (
                  <Row
                    key={cat.id}
                    icon={cat.icon}
                    title={label}
                    trailing={<CountTrail count={count} />}
                    accessibilityLabel={`${label}, ${count} ${articleCount(count)}`}
                    onPress={() => openCategory(cat.id)}
                  />
                );
              })}
            </Group>
          </Animated.View>

          {/* Fontes: referências (versículos, Catecismo, documentos) e a
              Bíblia completa. */}
          <Animated.View entering={enter(5)}>
            <SectionTitle title={t('home.section.sources')} />
          </Animated.View>
          <Animated.View entering={enter(6)}>
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
        </Animated.ScrollView>
      )}
    />
  );
}
