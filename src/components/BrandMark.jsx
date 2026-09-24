import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Marca do app: cruz latina desenhada com duas Views (haste vertical e
// travessa), sem imagem nem texto. Nítida em qualquer densidade, pinta com a
// cor do tema e custa zero. Substitui o CrossMark nos blocos de marca (header,
// Início, Login e Onboarding) na Onda 1.
//
// `size`: 'sm' | 'md' | 'lg' (caixa 18x24, 28x36, 44x56).
// `color`: cor das barras (default colors.tint).
// `withName`: mostra "APPologética" ao lado, em text('headline').
// `decorative`: esconde a cruz do leitor de tela. Para quando o nome do app já
//   está escrito ao lado (o bloco de marca) ou a cruz é só enfeite (marca
//   d'água nas laterais do desktop), senão "APPologética" é anunciado duas vezes.
// `style`: aplicado ao elemento externo (a cruz, ou a linha cruz + nome).

const APP_NAME = 'APPologética';

// Caixa da cruz por tamanho: largura, altura e espessura das barras.
const SIZES = {
  sm: { width: 18, height: 24, bar: 2 },
  md: { width: 28, height: 36, bar: 3 },
  lg: { width: 44, height: 56, bar: 4 },
};

// A travessa começa a 30% do topo (proporção da cruz latina).
const CROSSBAR_TOP = 0.3;

export default function BrandMark({ size = 'md', color, withName = false, decorative = false, style }) {
  const { colors, tokens, text } = useTheme();
  const box = SIZES[size] || SIZES.md;
  const tint = color || colors.tint;
  const bar = { position: 'absolute', backgroundColor: tint, borderRadius: tokens.radius.xs };

  // Sozinha, a cruz é uma imagem com o nome do app como rótulo. Ao lado do nome
  // (ou marcada como decorativa) o leitor de tela pula a cruz (aria-hidden na
  // web, accessibilityElementsHidden no iOS, importantForAccessibility no Android).
  const a11y = withName || decorative
    ? {
        'aria-hidden': true,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      }
    : { accessibilityRole: 'image', accessibilityLabel: APP_NAME };

  const cross = (
    <View style={[{ width: box.width, height: box.height }, withName ? null : style]} {...a11y}>
      <View style={[bar, { left: (box.width - box.bar) / 2, top: 0, width: box.bar, height: box.height }]} />
      <View style={[bar, { left: 0, top: Math.round(box.height * CROSSBAR_TOP), width: box.width, height: box.bar }]} />
    </View>
  );

  if (!withName) return cross;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm }, style]}>
      {cross}
      <Text style={[text('headline'), { color: colors.text }]}>{APP_NAME}</Text>
    </View>
  );
}
