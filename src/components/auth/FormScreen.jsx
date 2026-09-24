import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthTopToggles from '../AuthTopToggles';

// Moldura das telas de entrada (Login, Cadastro, Recuperar senha):
// KeyboardAvoidingView (padding só no iOS), ScrollView com o recuo das insets
// e `keyboardShouldPersistTaps="handled"`, para um toque no botão não só
// fechar o teclado. `toggles` desenha as pílulas de tema e idioma
// (AuthTopToggles, absolutas, irmãs da rolagem para não rolarem junto).
// `topInset` é o espaço extra acima do conteúdo: o Login passa TOGGLES_HEIGHT
// mais uma folga, para o título começar abaixo das pílulas; Cadastro e
// Recuperar põem o botão voltar na linha delas e não passam nada.
export default function FormScreen({ toggles, topInset = 0, children }) {
  const { colors, tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { space } = tokens;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {toggles ? <AuthTopToggles /> : null}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: insets.top + space.xs + topInset,
          paddingBottom: insets.bottom + space.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
