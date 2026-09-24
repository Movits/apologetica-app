import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRequireAccount } from '../components/GuestGate';
import { Group, LargeTitleScreen, Row, SectionTitle, enterStagger } from '../components/ui';

// Hub "Praticar": agrupa as telas secundárias que antes lotavam a Home, em
// listas agrupadas (SectionTitle + Group com Rows), sob o large title próprio.
// Espiritualidade e Treino são livres. Em Meu Estudo, marcações, notas e caderno
// vivem no Firestore e exigem conta; favoritos ficam no aparelho (`local: true`)
// e abrem sem conta.
function buildSpirituality(t) {
  return [
    { icon: 'today-outline', label: t('home.card.today'), sub: t('home.card.todaySub'), screen: 'Today' },
    { icon: 'calendar-outline', label: t('home.card.readingPlan'), sub: t('home.card.readingPlanSub'), screen: 'ReadingPlan' },
    { icon: 'flower-outline', label: t('home.card.rosary'), sub: t('home.card.rosarySub'), screen: 'Rosary' },
    { icon: 'shield-checkmark-outline', label: t('home.card.exam'), sub: t('home.card.examSub'), screen: 'ExamConscience' },
    { icon: 'school-outline', label: t('home.card.glossary'), sub: t('home.card.glossarySub'), screen: 'Glossary' },
    { icon: 'map-outline', label: t('home.card.map'), sub: t('home.card.mapSub'), screen: 'BibleMap' },
  ];
}

function buildTraining(t) {
  return [
    { icon: 'help-circle-outline', label: t('home.card.quiz'), sub: t('home.card.quizSub'), screen: 'Quiz' },
    { icon: 'chatbubbles-outline', label: t('home.card.dialogue'), sub: t('home.card.dialogueSub'), screen: 'Dialogue' },
    { icon: 'shield-half-outline', label: t('home.card.debate'), sub: t('home.card.debateSub'), screen: 'DebateStrategies' },
  ];
}

function buildStudy(t) {
  return [
    { icon: 'journal-outline', label: t('home.card.notebook'), sub: t('home.card.notebookSub'), screen: 'Notebook' },
    { icon: 'star-outline', label: t('home.card.favorites'), screen: 'Favorites', local: true },
    { icon: 'color-fill-outline', label: t('home.card.highlights'), screen: 'Highlights' },
    { icon: 'document-text-outline', label: t('home.card.notes'), screen: 'Notes' },
  ];
}

export default function ToolsScreen() {
  const navigation = useNavigation();
  const { colors, tokens } = useTheme();
  const { user } = useAuth();
  const { t, isEn } = useLanguage();
  const requireAccount = useRequireAccount();
  const { icon } = tokens;

  const SPIRITUALITY = buildSpirituality(t);
  const TRAINING = buildTraining(t);
  const STUDY = buildStudy(t);

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

  const openStudy = (item) => {
    if (item.local) {
      navigation.navigate(item.screen);
      return;
    }
    requireAccount(
      () => navigation.navigate(item.screen),
      {
        title: item.label,
        message: isEn
          ? `To use ${item.label.toLowerCase()}, create a free account. Highlights, notes and notebook stay saved in your account and synced across devices.`
          : `Para usar ${item.label.toLowerCase()}, crie uma conta gratuita. Marcações, notas e caderno ficam salvos na sua conta e sincronizados entre aparelhos.`,
        icon: item.icon,
      }
    );
  };

  // Cadeado pequeno antes do chevron (prop `chevron` da Row) nos itens que
  // exigem conta, só para o visitante. O toque continua passando pelo
  // requireAccount.
  const lock = <Ionicons name="lock-closed-outline" size={icon.sm} color={colors.textTertiary} />;

  const renderStudyRow = (item) => {
    const gated = !user && !item.local;
    return (
      <Row
        key={item.screen}
        icon={item.icon}
        title={item.label}
        subtitle={item.sub}
        trailing={gated ? lock : null}
        chevron
        accessibilityLabel={gated ? `${item.label}, ${t('tools.requiresAccount')}` : undefined}
        onPress={() => openStudy(item)}
      />
    );
  };

  return (
    <LargeTitleScreen title={t('tab.tools')}>
      <Animated.View entering={enterStagger(0, tokens)}>
        {/* O large title já dá o respiro de baixo, então a primeira seção não
            repete a margem de cima. */}
        <SectionTitle title={t('home.section.spirituality')} style={{ marginTop: 0 }} />
        <Group>{SPIRITUALITY.map(renderRow)}</Group>
      </Animated.View>

      <Animated.View entering={enterStagger(1, tokens)}>
        <SectionTitle title={t('home.section.training')} />
        <Group>{TRAINING.map(renderRow)}</Group>
      </Animated.View>

      <Animated.View entering={enterStagger(2, tokens)}>
        <SectionTitle title={t('home.section.study')} />
        <Group>{STUDY.map(renderStudyRow)}</Group>
      </Animated.View>
    </LargeTitleScreen>
  );
}
