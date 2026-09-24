import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BrandMark from './BrandMark';

// Coluna de leitura (Artigo e Dia de hoje). No desktop (web) o conteúdo vira
// uma coluna central de largura limitada e, quando sobra espaço dos dois
// lados, cada gutter recebe a cruz do app como marca d'água (decorativa: o
// leitor de tela pula). No celular a coluna ocupa 100% e nada disso aparece.
//
// Uso: o ReadingColumn é o contêiner da tela (flex 1, fundo `bg`, cruzes por
// baixo); a ScrollView da tela recebe `columnContentStyle` no
// contentContainerStyle e envolve o conteúdo numa View com `columnStyle`.
//
//   <ReadingColumn>
//     <ScrollView contentContainerStyle={[columnContentStyle, { padding }]}>
//       <View style={columnStyle}>...</View>
//     </ScrollView>
//   </ReadingColumn>

// Largura da coluna central no desktop e o gutter mínimo, de cada lado, para
// a marca d'água aparecer (proporções da página, não medidas de interface).
const COLUMN_MAX = 720;
const MIN_GUTTER = 150;
// Largura do BrandMark "lg" (a cruz das laterais) e a opacidade da marca d'água.
// A cruz fica centrada no gutter.
const CROSS_W = 44;
const CROSS_OPACITY = 0.16;

const WEB = Platform.OS === 'web';

// A coluna: 100% no celular; no desktop limita a largura.
export const columnStyle = { width: '100%', maxWidth: WEB ? COLUMN_MAX : undefined };
// contentContainerStyle da ScrollView que envolve a coluna: centra a coluna
// quando sobra espaço (com a coluna a 100%, não muda nada no celular).
export const columnContentStyle = { alignItems: 'center' };

export default function ReadingColumn({ children, style }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const gutter = (width - COLUMN_MAX) / 2;
  const showSideCrosses = WEB && gutter >= MIN_GUTTER;
  const crossLeft = Math.max(0, gutter / 2 - CROSS_W / 2);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }, style]}>
      {showSideCrosses ? (
        <>
          <View pointerEvents="none" style={[styles.sideCross, { left: crossLeft }]}>
            <BrandMark size="lg" decorative />
          </View>
          <View pointerEvents="none" style={[styles.sideCross, { right: crossLeft }]}>
            <BrandMark size="lg" decorative />
          </View>
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sideCross: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', opacity: CROSS_OPACITY },
});
