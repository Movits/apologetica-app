import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

// Marca do app, desenhada pela identidade visual ativa (src/theme/identities.js):
// - cross: cruz latina (Clássica).
// - anchor: cruz-âncora das catacumbas (Âncora).
// - chirho: Chi-Rho num ladrilho (Basílica).
// - bubble: balão de fala com a cruz recortada, "a resposta" (Lumen).
// Os desenhos são os mesmos de assets/brand/mark-*.svg (caixa 64 x 64), aqui
// em react-native-svg para pintar com a cor do tema em qualquer densidade.
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

function Mark({ kind, color }) {
  if (kind === 'anchor') {
    return (
      <>
        <Circle cx="32" cy="10.5" r="5" fill="none" stroke={color} strokeWidth="4.5" />
        <Path
          d="M32 15.5V57 M19 25H45 M11 39c1.5 11 9.5 18 21 18s19.5-7 21-18 M6.5 43.5L11 39l5 3.5 M57.5 43.5L53 39l-5 3.5"
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    );
  }
  if (kind === 'chirho') {
    return (
      <>
        <Rect x="3" y="3" width="58" height="58" rx="14" fill="none" stroke={color} strokeWidth="3" />
        <Path
          d="M30 12V54 M30 13h7a7.5 7.5 0 0 1 0 15h-7 M19 32L41 52 M41 32L19 52"
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="square"
        />
      </>
    );
  }
  if (kind === 'bubble') {
    return (
      <Path
        fill={color}
        fillRule="evenodd"
        d="M15 46L8.5 59L22 50.8A24 24 0 1 0 15 46Z M29 13H35V22H44V28H35V45H29V28H20V22H29Z"
      />
    );
  }
  // cross: haste e travessa a 30% do topo (proporção da cruz latina).
  return (
    <>
      <Rect x="29" y="5" width="6" height="54" rx="1.5" fill={color} />
      <Rect x="14" y="19" width="36" height="6" rx="1.5" fill={color} />
    </>
  );
}

// Glifo solto de qualquer identidade (prévia no seletor de Ajustes).
export function MarkGlyph({ kind, color, size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Mark kind={kind} color={color} />
    </Svg>
  );
}

export default function BrandMark({ size = 'md', color, withName = false, decorative = false, style }) {
  const { colors, tokens, text, identity } = useTheme();
  const side = SIZES[size] || SIZES.md;
  // A cruz é estreita: a caixa é recortada ao desenho (40 x 58 do viewBox)
  // para manter a altura e a largura que ela sempre teve.
  const box = identity?.mark === 'cross' || !identity
    ? { width: Math.round((side * 40) / 58), height: side, viewBox: '12 3 40 58' }
    : { width: side, height: side, viewBox: '0 0 64 64' };
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
    <View style={[{ width: box.width, height: box.height }, withName ? null : style]} {...a11y}>
      <Svg width={box.width} height={box.height} viewBox={box.viewBox}>
        <Mark kind={identity?.mark} color={tint} />
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
