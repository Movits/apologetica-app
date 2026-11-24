import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Group, LargeTitleScreen, PressScale, Row, SectionTitle, enterStagger, useColumnCount } from '../components/ui';
import { PAGE_MAX, columnInnerWidth } from '../components/ReadingColumn';
import useLayout from '../hooks/useLayout';

// Desktop: cada seção vira uma linha de blocos de pelo menos TILE_MIN de
// largura (proporção da página), até TILE_COLS por linha (o tamanho das
// maiores seções, para a linha fechar sem sobra).
const TILE_MIN = 260;
const TILE_COLS = 3;

// Hub "Praticar": as telas secundárias em listas agrupadas (SectionTitle +
// Group com Rows), sob o large title próprio. Cada destino aparece uma vez só:
// o conteúdo do dia está na Início, Minha Jornada no cartão da Início (e na
// barra lateral do desktop), "Perguntas que expõem" dentro do Modo Diálogo e
// favoritos, marcações, notas e caderno numa tela só (Meu Estudo, que mostra
// o convite de conta nos segmentos que exigem login).
function buildTraining(t) {
  return [
    { icon: 'help-circle-outline', label: t('home.card.quiz'), sub: t('home.card.quizSub'), screen: 'Quiz' },
    { icon: 'chatbubbles-outline', label: t('home.card.dialogue'), sub: t('home.card.dialogueSub'), screen: 'Dialogue' },
    { icon: 'shield-half-outline', label: t('home.card.debate'), sub: t('home.card.debateSub'), screen: 'DebateStrategies' },
  ];
}

function buildSpirituality(t) {
  return [
    { icon: 'calendar-outline', label: t('home.card.readingPlan'), sub: t('home.card.readingPlanSub'), screen: 'ReadingPlan' },
    { icon: 'flower-outline', label: t('home.card.rosary'), sub: t('home.card.rosarySub'), screen: 'Rosary' },
    { icon: 'shield-checkmark-outline', label: t('home.card.exam'), sub: t('home.card.examSub'), screen: 'ExamConscience' },
  ];
}

function buildReference(t) {
  return [
    { icon: 'school-outline', label: t('home.card.glossary'), sub: t('home.card.glossarySub'), screen: 'Glossary' },
    { icon: 'map-outline', label: t('home.card.map'), sub: t('home.card.mapSub'), screen: 'BibleMap' },
  ];
}

export default function ToolsScreen() {
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const { t } = useLanguage();
  // Uma coluna só (celular, janela estreita): listas agrupadas. Mais que isso:
  // blocos lado a lado, para a página não virar quatro listinhas soltas.
  const tileCols = useColumnCount(TILE_COLS, TILE_MIN);
  const { width } = useLayout();
  const gap = tokens.space.md;
  const tileW = Math.floor((columnInnerWidth(width, PAGE_MAX, tokens.space.md) - gap * (tileCols - 1)) / tileCols);

  const sections = [
    { key: 'training', title: t('home.section.training'), items: buildTraining(t) },
    { key: 'spirituality', title: t('home.section.spirituality'), items: buildSpirituality(t) },
    {
      key: 'study',
      title: t('home.section.study'),
      items: [{ icon: 'bookmarks-outline', label: t('home.card.studySub'), screen: 'Study' }],
    },
    { key: 'reference', title: t('home.section.reference'), items: buildReference(t) },
  ];
  const open = (screen) => navigation.navigate(screen);

  return (
    <LargeTitleScreen title={t('tab.tools')} maxWidth={PAGE_MAX}>
      {sections.map((section, i) => (
        <Animated.View key={section.key} entering={enterStagger(i, tokens)}>
          {/* O large title já dá o respiro de baixo, então a primeira seção
              não repete a margem de cima. */}
          <SectionTitle title={section.title} style={i === 0 ? { marginTop: 0 } : undefined} />
          {tileCols > 1 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
              {section.items.map((item) => (
                <ToolTile key={item.screen} item={item} width={tileW} onPress={() => open(item.screen)} />
              ))}
            </View>
          ) : (
            <Group>
              {section.items.map((item) => (
                <Row
                  key={item.screen}
                  icon={item.icon}
                  title={item.label}
                  subtitle={item.sub}
                  trailing="chevron"
                  onPress={() => open(item.screen)}
                />
              ))}
            </Group>
          )}
        </Animated.View>
      ))}
    </LargeTitleScreen>
  );
}

// Bloco do desktop: ícone, título e a linha de apoio num cartão, com o fundo
// aceso sob o mouse (como a Row). `width` já desconta os vãos da linha.
function ToolTile({ item, width, onPress }) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon } = tokens;
  return (
    <PressScale
      onPress={onPress}
      aria-label={item.sub ? `${item.label}, ${item.sub}` : item.label}
      style={({ hovered }) => ({
        width,
        minHeight: 44,
        padding: space.md,
        gap: space.sm,
        borderRadius: radius.md,
        backgroundColor: hovered ? colors.badgeBg : colors.card,
      })}
    >
      <Ionicons name={item.icon} size={icon.lg} color={colors.tint} />
      <View style={{ gap: space.xxs }}>
        <Text style={[text('headline'), { color: colors.text }]}>{item.label}</Text>
        {item.sub ? <Text style={[text('subhead'), { color: colors.textSubtle }]}>{item.sub}</Text> : null}
      </View>
    </PressScale>
  );
}
