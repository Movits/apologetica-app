import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import ArticlesScreen from './src/screens/ArticlesScreen';
import ReferencesScreen from './src/screens/ReferencesScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#1a3a5c',
  accent: '#c9a84c',
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { borderTopColor: '#ddd' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Início: focused ? 'home' : 'home-outline',
              Artigos: focused ? 'book' : 'book-outline',
              Referências: focused ? 'library' : 'library-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Artigos" component={ArticlesScreen} />
        <Tab.Screen name="Referências" component={ReferencesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
