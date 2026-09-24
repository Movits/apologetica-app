import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Bloco de carregamento com a forma do conteúdo que vai chegar (uma barra de
// texto, uma miniatura), na cor do separador e sem spinner. Decorativo: o
// contêiner que o usa anuncia o carregamento por aria-busy/aria-label.
//
// `width` aceita número ou porcentagem; `height` default é a altura de uma
// linha de footnote; `radius` é uma chave de tokens.radius (default 'xs').
export default function Skeleton({ width = '100%', height, radius = 'xs', style }) {
  const { colors, tokens, text } = useTheme();
  return (
    <View
      aria-hidden
      style={[
        {
          width,
          height: height ?? text('footnote').lineHeight,
          borderRadius: tokens.radius[radius],
          backgroundColor: colors.separator,
        },
        style,
      ]}
    />
  );
}
