import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

// Fundo do chrome (header, tab bar, barra do LargeTitleScreen e a pílula de
// capítulo) no nativo. O material é a cor de fundo do tema por cima do
// conteúdo, numa opacidade alta o bastante para o texto que passa por baixo
// NÃO ser legível (a auditoria mostrou versículos lidos através da tab bar com
// o material antigo a 72%): fica a impressão de profundidade, não a leitura.
//
// - iOS: BlurView do expo-blur 57 (props tint e intensity em node_modules/
//   expo-blur/build/BlurView.types.d.ts) com o véu do tema a 82% por cima. O
//   desfoque ainda aparece nas bordas das formas que passam por baixo.
// - Android: só o véu, a 94%, SEM BlurView. É a decisão da Fase 0
//   (docs/design/pesquisa-apple.md, "BlurView no Android"): o único blur de
//   verdade lá é o `dimezisBlurView`, experimental, que re-desfoca a tela
//   inteira a cada pre-draw, e aqui haveria até três instâncias vivas ao
//   mesmo tempo sobre listas rolando. Sem blur, o véu precisa ser quase sólido.
//
// Props:
// - `edge`: onde fica a hairline. 'bottom' no header, 'top' na tab bar, 'all'
//   contorna a forma inteira (pílula, tab bar flutuante), 'none' sem linha.
// - `tone`: 'bg' (padrão, a cor do fundo da tela) ou 'elevated' (a superfície
//   elevada do tema, para controles que flutuam sobre texto: no escuro ela é
//   um navy mais claro que o fundo, e a forma não some).
// - `radius`: raio da forma, para o desfoque, o véu e a hairline seguirem os
//   cantos (o contêiner continua responsável por posicionar).
//
// Regras de uso:
// - Renderizar DEPOIS do conteúdo que ele desfoca na árvore (irmão seguinte
//   do ScrollView, ou dentro de uma barra que vem depois dele), para os itens
//   da barra ficarem por cima e o conteúdo passar por baixo.
// - Preenche o pai (absoluteFill); quem posiciona é a barra que o contém.
// Variante web em ChromeBackdrop.web.jsx (backdrop-filter).
const VEIL = Platform.OS === 'android' ? 0.94 : 0.82;

function backdropParts(colors, { edge, tone, radius }) {
  const base = tone === 'elevated' ? colors.elevated : colors.bg;
  const round = radius != null ? { borderRadius: radius, overflow: 'hidden' } : null;
  const veil = [StyleSheet.absoluteFill, { backgroundColor: base, opacity: VEIL }, round];
  let line = null;
  if (edge === 'all') {
    line = [StyleSheet.absoluteFill, styles.outline, { borderColor: colors.hairline }, round];
  } else if (edge === 'top' || edge === 'bottom') {
    line = [styles.hairline, edge === 'top' ? styles.top : styles.bottom, { backgroundColor: colors.hairline }];
  }
  return { round, veil, line };
}

export default function ChromeBackdrop({ edge = 'bottom', tone = 'bg', radius, style }) {
  const { colors, darkMode } = useTheme();
  const { round, veil, line } = backdropParts(colors, { edge, tone, radius });
  const fill = [StyleSheet.absoluteFill, styles.fill, round, style];
  const layers = (
    <>
      <View style={veil} />
      {line ? <View style={line} /> : null}
    </>
  );
  if (Platform.OS === 'android') {
    return <View style={fill}>{layers}</View>;
  }
  return (
    <BlurView tint={darkMode ? 'dark' : 'light'} intensity={darkMode ? 60 : 80} style={fill}>
      {layers}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // O fundo nunca captura toques: eles seguem para os botões da barra.
  fill: { pointerEvents: 'none' },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  outline: { borderWidth: StyleSheet.hairlineWidth },
  top: { top: 0 },
  bottom: { bottom: 0 },
});
