import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ChromeBackdrop from './ChromeBackdrop';
import BrandMark from '../components/BrandMark';
import useLayout from '../hooks/useLayout';
import { TAB_ICONS, TAB_LABEL_KEYS } from './tabs';

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

// Janela média (tablet, janela estreita no desktop): em vez da faixa de ponta a ponta, com
// os cinco itens a 256 px um do outro numa janela de 1280, a barra vira uma
// cápsula flutuante centrada, no mesmo material translúcido, com hairline em
// volta e a sombra `floating`. FLOATING_MAX é a largura da cápsula.
// A altura reportada inclui a folga embaixo, então as telas que compensam
// com useBottomTabBarHeight() continuam terminando acima da barra.
// As faixas (barra, cápsula, lateral) vêm de src/utils/layout.js.
const FLOATING_MAX = 560;

// Rótulo da aba: a chave de tabs.js traduzida; só uma rota fora da lista cai
// nas opções do navigator (tabBarLabel, title) e por fim no nome da rota.
function tabLabel(options, route, t) {
  const key = TAB_LABEL_KEYS[route.name];
  if (key) return t(key);
  const label = options.tabBarLabel ?? options.title ?? route.name;
  return typeof label === 'string' ? label : (options.title ?? route.name);
}

// Toque numa aba, igual à BottomTabBar padrão: 'tabPress' cancelável e só
// então navegar com merge (o navigate sem merge apaga os params da aba:
// node_modules/@react-navigation/routers/lib/module/TabRouter.js:208-211).
function pressTab(navigation, route, focused) {
  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
  if (!focused && !event.defaultPrevented) {
    navigation.navigate({ name: route.name, merge: true });
  }
}

export default function TabBar({ state, descriptors, navigation, insets }) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { navMode, sidebarWidth } = useLayout();
  const setHeight = useContext(BottomTabBarHeightCallbackContext);

  // Respeita tabBarStyle: { display: 'none' } da tela ativa, como a padrão.
  // Escondida, reporta altura zero para as telas que compensam com
  // useBottomTabBarHeight() não guardarem o recuo de uma barra que não está
  // lá (ao voltar, o onLayout reporta a altura real de novo). O efeito fica
  // antes do return para a ordem dos hooks não mudar entre renders.
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const hidden = StyleSheet.flatten(focusedOptions.tabBarStyle)?.display === 'none';
  // A lateral não ocupa o rodapé: altura zero, as telas não guardam recuo
  // embaixo (o conteúdo começa depois dela pelo sceneContainerStyle em App.js).
  const sidebar = navMode === 'sidebar';
  useEffect(() => {
    if (hidden || sidebar) setHeight?.(0);
  }, [hidden, sidebar, setHeight]);
  if (hidden) return null;

  if (sidebar) {
    return (
      <SideBar state={state} descriptors={descriptors} navigation={navigation} width={sidebarWidth} />
    );
  }

  const onLayout = (e) => setHeight?.(e.nativeEvent.layout.height);
  const labelStyle = text('tabLabel');
  const floating = navMode === 'capsule';
  const { space, radius, shadow } = tokens;
  const bottomInset = insets?.bottom ?? 0;

  const items = (
    <View style={styles.items}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = tabLabel(options, route, t);
        const icons = TAB_ICONS[route.name] ?? TAB_ICONS['Início'];
        const color = focused ? colors.tint : colors.textSubtle;

        const onPress = () => pressTab(navigation, route, focused);
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
  );

  if (floating) {
    // A faixa invisível de ponta a ponta só posiciona e mede (box-none: os
    // toques fora da cápsula seguem para o conteúdo); a cápsula é o tablist.
    return (
      <View
        onLayout={onLayout}
        style={[styles.bar, styles.passThrough, { alignItems: 'center', paddingBottom: bottomInset + space.md }]}
      >
        <View
          role="tablist"
          style={[
            styles.capsule,
            { maxWidth: FLOATING_MAX, borderRadius: radius.lg, paddingHorizontal: space.xs },
            shadow.floating,
          ]}
        >
          <ChromeBackdrop edge="all" radius={radius.lg} />
          {items}
        </View>
      </View>
    );
  }

  return (
    <View
      role="tablist"
      onLayout={onLayout}
      style={[styles.bar, { paddingBottom: bottomInset }]}
    >
      {/* Vem depois das telas na árvore do BottomTabView, então desfoca o
          conteúdo que passa por baixo; os itens abaixo ficam por cima dele. */}
      <ChromeBackdrop edge="top" />
      {items}
    </View>
  );
}

// Barra lateral do desktop: a marca no topo, as cinco seções (ícone e rótulo)
// e dois atalhos que no celular ficam na Início (Buscar e Minha Jornada).
// Item ativo com fundo `badgeBg` e texto na cor de destaque; hover com o
// mesmo fundo mais leve (só web, onHoverIn do Pressable).
function SideBar({ state, descriptors, navigation, width }) {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { space } = tokens;

  const shortcuts = [
    { key: 'search', icon: 'search-outline', label: t('header.search'), screen: 'Search' },
    { key: 'journey', icon: 'trophy-outline', label: t('header.journey'), screen: 'Journey' },
  ];

  return (
    <View
      style={[
        styles.side,
        { width, backgroundColor: colors.bg, borderRightColor: colors.separator, paddingHorizontal: space.sm, paddingVertical: space.xl },
      ]}
    >
      <View style={[styles.sideBrand, { paddingHorizontal: space.sm, marginBottom: space.xl }]}>
        <BrandMark size="sm" withName />
      </View>
      <View role="tablist" aria-orientation="vertical" style={{ gap: space.xxs }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS['Início'];
          return (
            <SideItem
              key={route.key}
              role="tab"
              selected={focused}
              icon={focused ? icons.on : icons.off}
              label={tabLabel(options, route, t)}
              onPress={() => pressTab(navigation, route, focused)}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
      <View style={[styles.sideRule, { backgroundColor: colors.separator, marginVertical: space.md, marginHorizontal: space.sm }]} />
      <View style={{ gap: space.xxs }}>
        {shortcuts.map((s) => (
          <SideItem
            key={s.key}
            role="link"
            icon={s.icon}
            label={s.label}
            onPress={() => navigation.navigate('Início', { screen: s.screen })}
          />
        ))}
      </View>
    </View>
  );
}

function SideItem({ role, selected = false, icon, label, onPress, onLongPress }) {
  const { colors, tokens, text } = useTheme();
  const [hovered, setHovered] = useState(false);
  const { space, radius } = tokens;
  const color = selected ? colors.tint : colors.text;
  return (
    <Pressable
      role={role}
      aria-selected={role === 'tab' ? selected : undefined}
      aria-label={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.sideItem,
        {
          gap: space.sm,
          paddingHorizontal: space.sm,
          borderRadius: radius.sm,
          backgroundColor: selected || hovered ? colors.badgeBg : 'transparent',
        },
      ]}
    >
      <Ionicons name={icon} size={tokens.icon.md} color={selected ? colors.tint : colors.textSubtle} />
      <Text numberOfLines={1} style={[text('callout'), { color, fontWeight: selected ? '600' : '400' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  side: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  sideBrand: { minHeight: 44, justifyContent: 'center' },
  sideRule: { height: StyleSheet.hairlineWidth },
  sideItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  passThrough: { pointerEvents: 'box-none' },
  capsule: { width: '100%' },
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
