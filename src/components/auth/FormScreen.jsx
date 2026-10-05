import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthTopToggles, { TOGGLES_HEIGHT } from '../AuthTopToggles';
import { FORM_MAX, centeredColumn } from '../ReadingColumn';

// Moldura das telas de entrada (Login, Cadastro, Recuperar senha):
// KeyboardAvoidingView (padding só no iOS), ScrollView com o recuo das insets
// e `keyboardShouldPersistTaps="handled"`, para um toque no botão não só
// fechar o teclado. `toggles` desenha as pílulas de tema e idioma
// (TopToggles, absolutas, irmãs da rolagem para não rolarem junto).
// `topInset` é o espaço extra acima do conteúdo: o Login passa TOGGLES_HEIGHT
// mais uma folga, para o título começar abaixo das pílulas; Cadastro e
// Recuperar põem o botão voltar na linha delas e não passam nada.
//
// Janela larga: o formulário fica numa coluna centrada de FORM_MAX (440) e as
// pílulas no canto dessa coluna, não no canto da janela. No celular a coluna
// é a tela inteira.
export default function FormScreen({ toggles, topInset = 0, children }) {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { space } = tokens;
  const top = insets.top + space.xs + topGap(insets.top, space);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {toggles ? <TopToggles max={FORM_MAX} /> : null}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: top + topInset,
          paddingBottom: insets.bottom + space.xl,
          ...centeredColumn(FORM_MAX, space.lg),
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Folga extra no topo quando o aparelho não tem inset (web, Android sem barra
// translúcida): o AuthTopToggles se posiciona a `insets.top + space.xs`, o que
// na web deixava as pílulas a 8 px da borda. Aqui a borda superior delas
// nunca fica a menos de `space.md`. Com notch ou barra de status, nada muda.
export function topGap(insetTop, space) {
  return Math.max(0, space.md - (insetTop + space.xs));
}

// As pílulas de tema e idioma (AuthTopToggles) posicionadas no canto da
// coluna central de `max`, e com a folga de topGap. O AuthTopToggles se
// encosta a `space.md` da direita da caixa, então a caixa é a coluna com
// recuo `space.md`: em janela larga a borda direita das pílulas coincide com
// a do conteúdo. A caixa tem a altura das pílulas para elas ficarem DENTRO
// dela (no Android, um filho fora dos limites do pai não recebe toque) e é
// box-none para não roubar toques do que está por baixo. Usado também no
// Onboarding.
export function TopToggles({ max }) {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { space } = tokens;
  return (
    <View
      style={{
        position: 'absolute',
        top: topGap(insets.top, space),
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        pointerEvents: 'box-none',
      }}
    >
      <View
        style={{
          ...centeredColumn(max, space.md),
          height: insets.top + space.xs + TOGGLES_HEIGHT,
          pointerEvents: 'box-none',
        }}
      >
        <AuthTopToggles />
      </View>
    </View>
  );
}
