import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Columns, useColumns, Group, LargeTitleScreen, Row, SectionTitle, enterStagger } from '../components/ui';
import { PAGE_MAX } from '../components/ReadingColumn';

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
  const wide = useColumns(2);

  const renderRow = (item) => (
    <Row
      key={item.screen}
      icon={item.icon}
      title={item.label}
      subtitle={item.sub}
      trailing="chevron"
      onPress={() => navigation.navigate(item.screen)}
    />
  );

  return (
    <LargeTitleScreen title={t('tab.tools')} maxWidth={PAGE_MAX}>
      {/* Desktop: Treino e Espiritualidade à esquerda, Estudo e Consulta à direita. */}
      <Columns>
        <View>
          <Animated.View entering={enterStagger(0, tokens)}>
            {/* O large title já dá o respiro de baixo, então a primeira seção
                não repete a margem de cima. */}
            <SectionTitle title={t('home.section.training')} style={{ marginTop: 0 }} />
            <Group>{buildTraining(t).map(renderRow)}</Group>
          </Animated.View>
          <Animated.View entering={enterStagger(1, tokens)}>
            <SectionTitle title={t('home.section.spirituality')} />
            <Group>{buildSpirituality(t).map(renderRow)}</Group>
          </Animated.View>
        </View>
        <View>
          <Animated.View entering={enterStagger(2, tokens)}>
            <SectionTitle title={t('home.section.study')} style={wide ? { marginTop: 0 } : undefined} />
            <Group>
              <Row
                icon="bookmarks-outline"
                title={t('home.card.studySub')}
                trailing="chevron"
                onPress={() => navigation.navigate('Study')}
              />
            </Group>
          </Animated.View>
          <Animated.View entering={enterStagger(3, tokens)}>
            <SectionTitle title={t('home.section.reference')} />
            <Group>{buildReference(t).map(renderRow)}</Group>
          </Animated.View>
        </View>
      </Columns>
    </LargeTitleScreen>
  );
}
