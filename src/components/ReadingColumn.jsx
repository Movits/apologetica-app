import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Coluna central das telas em janela larga (desktop na web, iPad). No celular
// a coluna ocupa 100% e nada muda: as larguras abaixo só entram em ação
// quando a janela passa delas.
//
// Duas formas de usar:
//
// 1. Coluna de leitura (Artigo e Dia de hoje): o ReadingColumn é o contêiner
//    da tela (flex 1, fundo `bg`); a ScrollView recebe `columnContentStyle` no
//    contentContainerStyle e envolve o conteúdo numa View com `columnStyle`.
//
//      <ReadingColumn>
//        <ScrollView contentContainerStyle={[columnContentStyle, { padding }]}>
//          <View style={columnStyle}>...</View>
//        </ScrollView>
//      </ReadingColumn>
//
// 2. Listas e formulários: `centeredColumn(max, gutter)` vai direto no
//    contentContainerStyle (ou numa View) que já tem o recuo lateral `gutter`.
//    A caixa cresce até `max + 2 * gutter` e fica centrada, então o conteúdo
//    útil tem no máximo `max` e o large title, os títulos de seção e os cards
//    continuam na mesma borda esquerda. A barra de rolagem segue na borda da
//    janela (a ScrollView continua com a largura toda).

// Larguras máximas do conteúdo útil (proporções da página, não medidas de
// interface): leitura e listas a 720 (cerca de 75 caracteres por linha na
// serifa de leitura), formulários de entrada a 440.
export const COLUMN_MAX = 720;
export const FORM_MAX = 440;

// A coluna: 100% no celular, limitada em janela larga.
export const columnStyle = { width: '100%', maxWidth: COLUMN_MAX };
// contentContainerStyle da ScrollView que envolve a coluna: centra a coluna
// quando sobra espaço (com a coluna a 100%, não muda nada no celular).
export const columnContentStyle = { alignItems: 'center' };

// Caixa centrada com o recuo lateral por dentro (ver o uso 2 acima).
export function centeredColumn(max = COLUMN_MAX, gutter = 0) {
  return { width: '100%', maxWidth: max + gutter * 2, alignSelf: 'center' };
}

// Largura útil dentro de uma `centeredColumn` numa janela de `windowWidth`
// (para grades que calculam colunas, como a de capítulos da Bíblia).
export function columnInnerWidth(windowWidth, max = COLUMN_MAX, gutter = 0) {
  return Math.min(windowWidth, max + gutter * 2) - gutter * 2;
}

export default function ReadingColumn({ children, style }) {
  const { colors } = useTheme();
  return <View style={[styles.screen, { backgroundColor: colors.bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
