import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ArticlesScreen from './src/screens/ArticlesScreen';
import ReferencesScreen from './src/screens/ReferencesScreen';
import RefDetailScreen from './src/screens/RefDetailScreen';
// RefDetailScreen mostra uma unica referencia de forma fluida (sem lista, sem scroll-to).
// Usado a partir de Search e a partir do ArticleDetail para evitar o pulo da lista.
import BibleScreen from './src/screens/BibleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HighlightsScreen from './src/screens/HighlightsScreen';
import NotesScreen from './src/screens/NotesScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import SearchScreen from './src/screens/SearchScreen';
import LiturgyScreen from './src/screens/LiturgyScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import GlossaryScreen from './src/screens/GlossaryScreen';
import ReadingPlanScreen from './src/screens/ReadingPlanScreen';
import ExamConscienceScreen from './src/screens/ExamConscienceScreen';
import RosaryScreen from './src/screens/RosaryScreen';
import QuizScreen from './src/screens/QuizScreen';
import DialogueScreen from './src/screens/DialogueScreen';
import BibleMapScreen from './src/screens/BibleMapScreen';
import LegalScreen from './src/screens/LegalScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AccountPromptProvider } from './src/components/AccountPrompt';
import { useEffect, useState } from 'react';
import { hasSeenOnboarding } from './src/utils/onboarding';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Sentry tem módulos nativos que não existem no Expo Go.
// Só inicializa em standalone (preview/production build).
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo) {
  try {
    Sentry.init({
      dsn: 'https://787cc318d8fe8083c42accd0e7866cc2@o4511423581650945.ingest.us.sentry.io/4511423587876864',
      sendDefaultPii: true,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
    });
  } catch (e) {
    // Ignora: Sentry não está disponível neste ambiente
  }
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ArticlesNav = createNativeStackNavigator();
const HomeNav = createNativeStackNavigator();
const SettingsNav = createNativeStackNavigator();

// Stack interno do tab Inicio: contem HomeScreen e as telas secundarias
// (Favoritos, Glossario, Plano, Rosario, Exame, Highlights, Notes, Search, Liturgia).
// Como esta DENTRO do Tab navigator, a tab bar continua visivel em todas elas.
function HomeStackScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <HomeNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeNav.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeNav.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('header.favorites') }} />
      <HomeNav.Screen name="Glossary" component={GlossaryScreen} options={{ title: t('header.glossary') }} />
      <HomeNav.Screen name="ReadingPlan" component={ReadingPlanScreen} options={{ title: t('header.readingPlan') }} />
      <HomeNav.Screen name="Rosary" component={RosaryScreen} options={{ title: t('header.rosary') }} />
      <HomeNav.Screen name="ExamConscience" component={ExamConscienceScreen} options={{ title: t('header.exam') }} />
      <HomeNav.Screen name="Highlights" component={HighlightsScreen} options={{ title: t('header.highlights') }} />
      <HomeNav.Screen name="Notes" component={NotesScreen} options={{ title: t('header.notes') }} />
      <HomeNav.Screen name="Search" component={SearchScreen} options={{ title: t('header.search') }} />
      <HomeNav.Screen name="Liturgy" component={LiturgyScreen} options={{ title: t('header.liturgy') }} />
      <HomeNav.Screen name="ArticleFromSearch" component={ArticleDetailScreen} options={{ title: t('header.article') }} />
      <HomeNav.Screen name="RefDetail" component={RefDetailScreen} options={{ title: t('header.reference') }} />
      <HomeNav.Screen name="Quiz" component={QuizScreen} options={{ title: t('header.quiz') }} />
      <HomeNav.Screen name="Dialogue" component={DialogueScreen} options={{ title: t('header.dialogue') }} />
      <HomeNav.Screen name="BibleMap" component={BibleMapScreen} options={{ title: t('header.bibleMap') }} />
      <HomeNav.Screen name="Legal" component={LegalScreen} options={({ route }) => ({ title: route.params?.kind === 'terms' ? t('settings.terms') : t('settings.privacy') })} />
    </HomeNav.Navigator>
  );
}

// Stack interno do tab Ajustes: permite voltar para Ajustes a partir de sub-telas
// (Legal, Glossary, etc.) sem saltar para o tab Início.
function SettingsStackScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <SettingsNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <SettingsNav.Screen name="SettingsMain" component={SettingsScreen} options={{ title: t('tab.settings') }} />
      <SettingsNav.Screen name="Legal" component={LegalScreen} options={({ route }) => ({ title: route.params?.kind === 'terms' ? t('settings.terms') : t('settings.privacy') })} />
      <SettingsNav.Screen name="Glossary" component={GlossaryScreen} options={{ title: t('header.glossary') }} />
      <SettingsNav.Screen name="ReadingPlan" component={ReadingPlanScreen} options={{ title: t('header.readingPlan') }} />
      <SettingsNav.Screen name="Rosary" component={RosaryScreen} options={{ title: t('header.rosary') }} />
      <SettingsNav.Screen name="ExamConscience" component={ExamConscienceScreen} options={{ title: t('header.exam') }} />
      <SettingsNav.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('header.favorites') }} />
    </SettingsNav.Navigator>
  );
}

// Stack interno do tab Artigos: lista -> detalhe. Mantém a tab bar visível
// porque está DENTRO do tab navigator.
function ArticlesStackScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <ArticlesNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ArticlesNav.Screen
        name="ArticlesList"
        component={ArticlesScreen}
        options={{ title: t('header.articles') }}
      />
      <ArticlesNav.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: t('header.article') }}
      />
      <ArticlesNav.Screen
        name="RefDetail"
        component={RefDetailScreen}
        options={{ title: t('header.reference') }}
      />
      <ArticlesNav.Screen
        name="Glossary"
        component={GlossaryScreen}
        options={{ title: t('header.glossary') }}
      />
    </ArticlesNav.Navigator>
  );
}

// Splash branded — usado durante hidratação do auth + tema.
// Cores fixas (não dependem do ThemeContext) pra dar identidade visual consistente.
function BrandedSplash() {
  return (
    <View style={splashStyles.container}>
      <Text style={splashStyles.cross}>✝</Text>
      <Text style={splashStyles.title}>APPologética</Text>
      <Text style={splashStyles.verse}>1 Pedro 3,15</Text>
      <ActivityIndicator size="small" color="#c9a84c" style={splashStyles.spinner} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 32,
  },
  cross: { fontSize: 72, color: '#c9a84c', marginBottom: 24 },
  title: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  verse: {
    fontSize: 13,
    color: '#c9a84c',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  spinner: { marginTop: 48 },
});

const ICONS = {
  'Início': { on: 'home', off: 'home-outline' },
  'Artigos': { on: 'book', off: 'book-outline' },
  'Referências': { on: 'library', off: 'library-outline' },
  'Bíblia': { on: 'bookmark', off: 'bookmark-outline' },
  'Ajustes': { on: 'settings', off: 'settings-outline' },
};

function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  // Mapeia o route.name (PT fixo, usado pra navegação) ao label traduzido.
  const LABELS = {
    'Início': t('tab.home'),
    'Artigos': t('tab.articles'),
    'Referências': t('tab.references'),
    'Bíblia': t('tab.bible'),
    'Ajustes': t('tab.settings'),
  };

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.divider,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 56 + Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarLabel: LABELS[route.name] || route.name,
        tabBarIcon: ({ focused, color, size }) => {
          const cfg = ICONS[route.name];
          return <Ionicons name={focused ? cfg.on : cfg.off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Início"
        component={HomeStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Artigos"
        component={ArticlesStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Referências" component={ReferencesScreen} />
      <Tab.Screen name="Bíblia" component={BibleScreen} />
      <Tab.Screen name="Ajustes" component={SettingsStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      {/* NoteEditor permanece em MainStack pq e modal full-screen sem tab bar */}
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigation() {
  const { colors, darkMode } = useTheme();
  const { signedInOrGuest, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(null);

  useEffect(() => {
    hasSeenOnboarding().then((seen) => setOnboardingDone(seen));
  }, []);

  const navTheme = {
    ...(darkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(darkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.primary,
      text: '#fff',
      border: colors.divider,
      primary: colors.accent,
    },
  };

  if (loading || onboardingDone === null) {
    return <BrandedSplash />;
  }

  if (!onboardingDone) {
    return <OnboardingScreen onDone={() => setOnboardingDone(true)} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      {signedInOrGuest ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <AccountPromptProvider>
                <RootNavigation />
              </AccountPromptProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap só em standalone (Sentry.wrap no Expo Go quebra porque o módulo nativo não existe).
export default isExpoGo ? App : Sentry.wrap(App);
