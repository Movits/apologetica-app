import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

// Marca do app: a cruz latina, com a travessa a 30% do topo. O desenho é o
// mesmo de assets/brand/mark-classica.svg (caixa 64 x 64), aqui em
// react-native-svg para pintar com a cor do tema em qualquer densidade.
//
// `size`: 'sm' | 'md' | 'lg' (24, 36 e 56 de altura).
// `color`: cor do traço (default colors.tint).
// `withName`: mostra "APPologética" ao lado, em text('headline').
// `decorative`: esconde a marca do leitor de tela. Para quando o nome do app já
//   está escrito ao lado (o bloco de marca) ou a marca é só enfeite, senão
//   "APPologética" é anunciado duas vezes.
// `style`: aplicado ao elemento externo (a marca, ou a linha marca + nome).

const APP_NAME = 'APPologética';

const SIZES = { sm: 24, md: 36, lg: 56 };

// A cruz é estreita: a caixa é recortada ao desenho (40 x 58 do viewBox de
// 64) para manter a altura e a largura que ela sempre teve.
const VIEW_BOX = '12 3 40 58';

export default function BrandMark({ size = 'md', color, withName = false, decorative = false, style }) {
  const { colors, tokens, text } = useTheme();
  const side = SIZES[size] || SIZES.md;
  const width = Math.round((side * 40) / 58);
  const tint = color || colors.tint;

  // Sozinha, a marca é uma imagem com o nome do app como rótulo. Ao lado do
  // nome (ou decorativa) o leitor de tela a pula (aria-hidden na web,
  // accessibilityElementsHidden no iOS, importantForAccessibility no Android).
  const a11y = withName || decorative
    ? {
        'aria-hidden': true,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      }
    : { role: 'img', 'aria-label': APP_NAME };

  const mark = (
    <View style={[{ width, height: side }, withName ? null : style]} {...a11y}>
      <Svg width={width} height={side} viewBox={VIEW_BOX}>
        <Rect x="29" y="5" width="6" height="54" rx="1.5" fill={tint} />
        <Rect x="14" y="19" width="36" height="6" rx="1.5" fill={tint} />
      </Svg>
    </View>
  );

  if (!withName) return mark;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm }, style]}>
      {mark}
      <Text style={[text('headline'), { color: colors.text }]}>{APP_NAME}</Text>
    </View>
  );
}
