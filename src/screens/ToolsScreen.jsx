import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRequireAccount } from '../components/GuestGate';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';

// Hub de ferramentas: agrupa as telas secundárias que antes lotavam a Home.
// Espiritualidade e Treino são livres; Meu Estudo exige conta (sincroniza dados).
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
  ];
}

function buildStudy(t) {
  return [
    { icon: 'star-outline', label: t('home.card.favorites'), screen: 'Favorites' },
    { icon: 'color-fill-outline', label: t('home.card.highlights'), screen: 'Highlights' },
    { icon: 'document-text-outline', label: t('home.card.notes'), screen: 'Notes' },
  ];
}

export default function ToolsScreen() {
  const navigation = useNavigation();
  const { colors, fs } = useTheme();
  const { user } = useAuth();
  const { t, isEn } = useLanguage();
  const requireAccount = useRequireAccount();
  const insets = useSafeAreaInsets();
  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const styles = makeStyles(colors, fs);

  const SPIRITUALITY = buildSpirituality(t);
  const TRAINING = buildTraining(t);
  const STUDY = buildStudy(t);

  const renderCard = (item) => (
    <TouchableOpacity
      key={item.screen}
      style={styles.card}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={item.icon} size={22} color={colors.primaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardLabel}>{item.label}</Text>
        {item.sub && <Text style={styles.cardSub}>{item.sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </TouchableOpacity>
  );

  const renderStudyCard = (item) => (
    <TouchableOpacity
      key={item.screen}
      style={styles.card}
      onPress={() =>
        requireAccount(
          () => navigation.navigate(item.screen),
          {
            title: item.label,
            message: isEn
              ? `To use ${item.label.toLowerCase()}, create a free account. Your data stays saved and synced across devices.`
              : `Para usar ${item.label.toLowerCase()}, crie uma conta gratuita. Seus dados ficam salvos e sincronizados entre dispositivos.`,
            icon: item.icon,
          }
        )
      }
    >
      <View style={styles.cardIcon}>
        <Ionicons name={item.icon} size={22} color={colors.primaryText} />
      </View>
      <Text style={[styles.cardLabel, { flex: 1 }]}>{item.label}</Text>
      {!user && (
        <Ionicons name="lock-closed" size={14} color={colors.textSubtle} style={{ marginRight: 6 }} />
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
        onScroll={onScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        scrollEventThrottle={32}
      >
        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>{t('home.section.spirituality')}</Text>
        {SPIRITUALITY.map(renderCard)}

        <Text style={styles.sectionTitle}>{t('home.section.training')}</Text>
        {TRAINING.map(renderCard)}

        <Text style={styles.sectionTitle}>{t('home.section.study')}</Text>
        {STUDY.map(renderStudyCard)}
      </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />
    </View>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16 },
    sectionTitle: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText, marginBottom: 10, marginTop: 18 },
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.card, borderRadius: 10, padding: 13, marginBottom: 9, gap: 12,
    },
    cardIcon: {
      width: 40, height: 40, borderRadius: 9, backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
    },
    cardLabel: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    cardSub: { fontSize: fs(12), color: c.textMuted, marginTop: 2 },
  });
