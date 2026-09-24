import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas raiz das abas e as que só um stack registra. As telas secundárias
// compartilhadas (Today, Rosário, RefDetail, Diálogo...) vivem em
// src/navigation/sharedScreens.js e entram em cada stack via sharedScreens().
import HomeScreen from './src/screens/HomeScreen';
import ArticlesScreen from './src/screens/ArticlesScreen';
import ReferencesScreen from './src/screens/ReferencesScreen';
import BibleScreen from './src/screens/BibleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import SearchScreen from './src/screens/SearchScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ReadingPlanScreen from './src/screens/ReadingPlanScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import CategoryArticlesScreen from './src/screens/CategoryArticlesScreen';

import { createAppStack, stackScreenOptionsForPlatform, tabHeaderOptions } from './src/navigation/chrome';
import TabBar from './src/navigation/TabBar';
import { TAB_LABEL_KEYS } from './src/navigation/tabs';
import { sharedScreens } from './src/navigation/sharedScreens';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import BrandMark from './src/components/BrandMark';
import { AccountPromptProvider } from './src/components/AccountPrompt';
import { useEffect, useState } from 'react';
import { initSentry, wrap } from './src/sentry';
import { checkForWebUpdate } from './src/utils/webUpdate';
import { hasSeenOnboarding } from './src/utils/onboarding';

// Inicializa o Sentry (no-op na web e no Expo Go, ver src/sentry.js / sentry.web.js).
initSentry();

// No app web, confere logo na abertura se o Safari serviu uma versao velha do
// cache (comum no atalho da tela de inicio do iPhone). No nativo e no-op.
checkForWebUpdate();

// createAppStack() devolve o native-stack no nativo e o stack JS na web (que
// anima o push); as opções de header/conteúdo vêm de src/navigation/chrome.js.
const Tab = createBottomTabNavigator();
const Stack = createAppStack();
const ArticlesNav = createAppStack();
const HomeNav = createAppStack();
const SettingsNav = createAppStack();
const ToolsNav = createAppStack();

// Deep links (apenas nativo). Espelha a arvore: MainTabs -> Inicio (HomeStack).
// articleId/chapter viram numero (as telas comparam com ===). Ex.:
//   appologetica://artigo/11  ·  .../dialogo/d-deus-criou  ·  .../biblia/jo/3
const LINKING = Platform.OS === 'web' ? undefined : {
  prefixes: ['appologetica://', 'https://movits.github.io/apologetica-app'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          'Início': {
            screens: {
              ArticleFromSearch: { path: 'artigo/:articleId', parse: { articleId: Number } },
              RefDetail: 'referencia/:highlightId',
              Dialogue: 'dialogo/:dialogueId',
            },
          },
          'Bíblia': { path: 'biblia/:bookId/:chapter', parse: { chapter: Number } },
        },
      },
    },
  },
};

// Os quatro stacks de aba ficam DENTRO do Tab navigator, então a tab bar
// continua visível em todas as telas secundárias. Cada um registra a própria
// raiz, as telas que só ele abre e, por sharedScreens(), as telas que existem
// em mais de uma aba (o tap resolve dentro da aba ativa).
//
// A tab bar (src/navigation/TabBar.jsx) é absoluta e translúcida: o conteúdo
// passa por baixo dela, e cada stack compensa com paddingBottom igual à altura
// que ela reporta (useBottomTabBarHeight funciona aqui porque estes
// componentes são telas do Tab.Navigator). As telas que migrarem para
// LargeTitleScreen zeram esse padding nas próprias options.

// Stack interno do tab Início: HomeScreen, Referências, Busca e a lista por
// categoria (só a Início chama 'CategoryArticles').
function HomeStackScreen() {
  const { colors, tokens } = useTheme();
  const { t, isEn } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <HomeNav.Navigator screenOptions={stackScreenOptionsForPlatform(colors, tokens, { paddingBottom: tabBarHeight })}>
      <HomeNav.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeNav.Screen name="References" component={ReferencesScreen} options={{ title: t('tab.references') }} />
      <HomeNav.Screen name="Search" component={SearchScreen} options={{ title: t('header.search') }} />
      <HomeNav.Screen
        name="CategoryArticles"
        component={CategoryArticlesScreen}
        options={({ route }) => ({ title: isEn ? t(`category.${route.params?.category}`) : route.params?.category })}
      />
      {sharedScreens(HomeNav, t)}
    </HomeNav.Navigator>
  );
}

// Stack interno do tab Ferramentas: raiz ToolsScreen + Favoritos e Plano de
// Leitura (só o ToolsScreen os abre) + as compartilhadas.
function ToolsStackScreen() {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <ToolsNav.Navigator screenOptions={stackScreenOptionsForPlatform(colors, tokens, { paddingBottom: tabBarHeight })}>
      <ToolsNav.Screen name="ToolsMain" component={ToolsScreen} options={{ title: t('header.tools') }} />
      <ToolsNav.Screen name="Favorites" component={FavoritesScreen} options={{ title: t('header.favorites') }} />
      <ToolsNav.Screen name="ReadingPlan" component={ReadingPlanScreen} options={{ title: t('header.readingPlan') }} />
      {sharedScreens(ToolsNav, t)}
    </ToolsNav.Navigator>
  );
}

// Stack interno do tab Ajustes: permite voltar para Ajustes a partir de
// sub-telas (Legal etc.) sem saltar para o tab Início.
function SettingsStackScreen() {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <SettingsNav.Navigator screenOptions={stackScreenOptionsForPlatform(colors, tokens, { paddingBottom: tabBarHeight })}>
      <SettingsNav.Screen name="SettingsMain" component={SettingsScreen} options={{ title: t('tab.settings') }} />
      {sharedScreens(SettingsNav, t)}
    </SettingsNav.Navigator>
  );
}

// Stack interno do tab Artigos: lista -> detalhe. 'ArticleDetail' é o mesmo
// componente de 'ArticleFromSearch' (compartilhada); ele faz push(route.name)
// para funcionar sob os dois nomes.
function ArticlesStackScreen() {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <ArticlesNav.Navigator screenOptions={stackScreenOptionsForPlatform(colors, tokens, { paddingBottom: tabBarHeight })}>
      <ArticlesNav.Screen name="ArticlesList" component={ArticlesScreen} options={{ title: t('header.articles') }} />
      <ArticlesNav.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: t('header.article') }} />
      {sharedScreens(ArticlesNav, t)}
    </ArticlesNav.Navigator>
  );
}

// Splash branded: usado durante hidratação do auth + tema e o carregamento da
// fonte de títulos. Fundo e textos em cores fixas (navy e dourado) pra dar
// identidade visual consistente antes de o tema hidratar; a cruz é o BrandMark,
// decorativa porque o nome do app já vem escrito logo abaixo.
function BrandedSplash() {
  const { colors } = useTheme();
  return (
    <View style={splashStyles.container}>
      <BrandMark size="lg" color={colors.accent} decorative style={splashStyles.mark} />
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
  mark: { marginBottom: 24 },
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

function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Os nomes de rota são PT fixo (API de navegação); o rótulo visível e os
  // ícones vêm de src/navigation/tabs.js, desenhados pela TabBar própria.
  // O header do Tab só aparece na aba Bíblia (tela direta, sem stack); os
  // stacks desligam o header do Tab e usam o próprio.
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      backBehavior="history"
      screenOptions={({ route }) => ({
        ...tabHeaderOptions(colors),
        title: t(TAB_LABEL_KEYS[route.name]),
        tabBarLabel: t(TAB_LABEL_KEYS[route.name]),
      })}
    >
      <Tab.Screen name="Início" component={HomeStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Artigos" component={ArticlesStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bíblia" component={BibleScreen} />
      <Tab.Screen name="Ferramentas" component={ToolsStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ajustes" component={SettingsStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { colors, tokens } = useTheme();
  return (
    <Stack.Navigator screenOptions={stackScreenOptionsForPlatform(colors, tokens)}>
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
  const { user, signedInOrGuest, loading, continueAsGuest } = useAuth();
  // Primeiro uso: o onboarding aparece uma vez só, enquanto não há conta logada.
  // `null` = ainda lendo o AsyncStorage (segura o splash para não piscar a tela).
  const [onboardingSeen, setOnboardingSeen] = useState(null);

  // Fonte de títulos (Cormorant Garamond SemiBold, único peso empacotado). A
  // chave precisa ser exatamente a de FONT_FAMILY_BY_PLATFORM.*.display em
  // src/theme/tokens.js, que é o que text('largeTitle') etc. põem no fontFamily.
  // O splash segura até ela carregar; se o carregamento falhar (fontsError), o
  // app segue com a fonte do sistema em vez de ficar preso no splash.
  const [fontsLoaded, fontsError] = useFonts({
    'CormorantGaramond-SemiBold': require('./assets/fonts/CormorantGaramond-SemiBold.ttf'),
  });

  useEffect(() => {
    let alive = true;
    hasSeenOnboarding().then((seen) => { if (alive) setOnboardingSeen(seen); });
    return () => { alive = false; };
  }, []);

  // "Pular" e "Ver a resposta" caem direto no app como visitante; o Login
  // continua acessível em Ajustes. O OnboardingScreen já gravou onboarding:done.
  const onOnboardingDone = async () => {
    if (!user && !signedInOrGuest) await continueAsGuest();
    setOnboardingSeen(true);
  };

  // Só cobre o que não recebe estilo explícito (o fundo do container e os
  // padrões de header/tab bar, que hoje src/navigation/chrome.js e TabBar.jsx
  // sobrescrevem). card/text seguem o par navy + texto sobre navy.
  const navTheme = {
    ...(darkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(darkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.primary,
      text: colors.onPrimary,
      border: colors.divider,
      primary: colors.tint,
    },
  };

  if (loading || onboardingSeen === null || (!fontsLoaded && !fontsError)) {
    return <BrandedSplash />;
  }

  if (!user && onboardingSeen === false) {
    return <OnboardingScreen onDone={onOnboardingDone} />;
  }

  return (
    <NavigationContainer
      theme={navTheme}
      // Deep links: abrir um artigo/referencia/dialogo/versiculo a partir de um
      // link compartilhado (appologetica://... no app instalado). So no nativo,
      // para nao interferir no roteamento por URL da versao web servida em /app.
      linking={LINKING}
      // Título da aba do navegador (web): marca + seção, nunca o nome interno
      // da rota (ex.: "HomeMain"). No nativo é ignorado.
      documentTitle={{
        formatter: (options) =>
          options?.title ? `APPologética · ${options.title}` : 'APPologética',
      }}
    >
      {/* O chrome agora é na cor do fundo (claro no tema claro), então os
          ícones da barra de status seguem o tema em vez de ficar sempre
          brancos. A Início ainda tem o hero navy até a Onda 4. */}
      <StatusBar style={darkMode ? 'light' : 'dark'} />
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

// wrap() aplica Sentry.wrap só em standalone; no Expo Go e na web passa direto.
export default wrap(App);
