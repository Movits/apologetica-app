import 'react-native-gesture-handler';
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
import BibleScreen from './src/screens/BibleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HighlightsScreen from './src/screens/HighlightsScreen';
import NotesScreen from './src/screens/NotesScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import SearchScreen from './src/screens/SearchScreen';
import LiturgyScreen from './src/screens/LiturgyScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

  return (
    <Tab.Navigator
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
        tabBarIcon: ({ focused, color, size }) => {
          const cfg = ICONS[route.name];
          return <Ionicons name={focused ? cfg.on : cfg.off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Artigos" component={ArticlesScreen} />
      <Tab.Screen name="Referências" component={ReferencesScreen} />
      <Tab.Screen name="Bíblia" component={BibleScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
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
      <Stack.Screen name="Highlights" component={HighlightsScreen} options={{ title: 'Minhas Marcações' }} />
      <Stack.Screen name="Notes" component={NotesScreen} options={{ title: 'Minhas Notas' }} />
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <Stack.Screen name="Liturgy" component={LiturgyScreen} options={{ title: 'Liturgia Diária' }} />
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
  const { user, loading } = useAuth();

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

  if (loading) {
    return <BrandedSplash />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
