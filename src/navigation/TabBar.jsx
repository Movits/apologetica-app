import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import ChromeBackdrop from './ChromeBackdrop';
import { TAB_ICONS } from './tabs';

// Tab bar translúcida do app, para <Tab.Navigator tabBar={(p) => <TabBar {...p} />}>.
// Recebe { state, descriptors, navigation, insets } do bottom-tabs 6.6.
//
// Regras copiadas da BottomTabBar padrão (node_modules/@react-navigation/
// bottom-tabs/src/views/BottomTabBar.tsx):
// - Reportar a altura pelo BottomTabBarHeightCallbackContext no onLayout
//   (:157 e :218-221), senão useBottomTabBarHeight() nas telas fica na
//   estimativa inicial. O contexto é exportado em src/index.tsx:15.
// - Toque: emitir 'tabPress' cancelável e só então navegar com merge (:301-311);
//   toque longo emite 'tabLongPress' (:316).
// - Fica absoluta no rodapé para o conteúdo passar por baixo; as telas
//   compensam com paddingBottom: useBottomTabBarHeight().
//
// Acessibilidade portável (RN 0.81 e react-native-web 0.21): role="tablist"
// no contêiner, role="tab" + aria-selected + aria-label em cada item. Nada do
// objeto accessibility*State antigo (a web não converte).
// Sem haptics na troca de aba (decisão da Onda 3) e sem useNavigation() aqui:
// a navegação vem das props.

// Faixa de itens da HIG (49 pt) e ícone de 24 pt; o inset inferior do
// aparelho entra como padding abaixo da faixa.
const ITEM_HEIGHT = 49;
const ICON_SIZE = 24;

function tabLabel(options, route) {
  const label = options.tabBarLabel ?? options.title ?? route.name;
  return typeof label === 'string' ? label : (options.title ?? route.name);
}

export default function TabBar({ state, descriptors, navigation, insets }) {
  const { colors, tokens, text } = useTheme();
  const setHeight = useContext(BottomTabBarHeightCallbackContext);

  // Respeita tabBarStyle: { display: 'none' } da tela ativa, como a padrão.
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (StyleSheet.flatten(focusedOptions.tabBarStyle)?.display === 'none') return null;

  const onLayout = (e) => setHeight?.(e.nativeEvent.layout.height);
  const labelStyle = text('tabLabel');

  return (
    <View
      role="tablist"
      onLayout={onLayout}
      style={[styles.bar, { paddingBottom: insets?.bottom ?? 0 }]}
    >
      {/* Vem depois das telas na árvore do BottomTabView, então desfoca o
          conteúdo que passa por baixo; os itens abaixo ficam por cima dele. */}
      <ChromeBackdrop edge="top" />
      <View style={styles.items}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = tabLabel(options, route);
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS['Início'];
          const color = focused ? colors.tint : colors.textSubtle;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              // merge mantém os params da aba (o navigate sem merge os apaga:
              // node_modules/@react-navigation/routers/lib/module/TabRouter.js:208-211).
              navigation.navigate({ name: route.name, merge: true });
            }
          };
          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              role="tab"
              aria-selected={focused}
              aria-label={label}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <Ionicons name={focused ? icons.on : icons.off} size={ICON_SIZE} color={color} />
              <Text
                numberOfLines={1}
                style={[labelStyle, { color, marginTop: tokens.space.xxs / 2 }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  items: {
    flexDirection: 'row',
    height: ITEM_HEIGHT,
  },
  item: {
    flex: 1,
    minHeight: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
