import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Barra fina com a fração lida (progress de 0 a 1). É decorativa: não tem
// role nem aria-value, porque a posição já está visível no próprio scroll e
// o leitor de tela não precisa ouvir a porcentagem a cada rolagem.
//
// Dois modos:
// - com `top`: flutua logo abaixo do header translúcido (position absolute,
//   trilha transparente) e o preenchimento dourado corre sobre o conteúdo.
//   É o modo do Artigo (Onda 5).
// - sem `top`: em linha no fluxo, com a trilha em `separator` (Bíblia).
//
// Os 2 px são a única medida solta permitida aqui (plano da Fase 5, Onda 5).
const BAR_HEIGHT = 2;

export default function ReadingProgressBar({ progress, top }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, Number(progress) || 0));
  const floating = top != null;

  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={[
        { height: BAR_HEIGHT, width: '100%', backgroundColor: floating ? 'transparent' : colors.separator },
        floating ? { position: 'absolute', top, left: 0, right: 0 } : null,
      ]}
    >
      <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: colors.accent }} />
    </View>
  );
}
