import { ScrollView, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Linha de Chips. Por padrão quebra linha (`flexWrap`, gap `space.xs`), para
// segmentos curtos (tema, tamanho da letra em Ajustes). Com `scroll` vira um
// trilho horizontal sem barra de rolagem, para filtros que não cabem numa
// linha (Busca, Referências): o trilho tem a altura do alvo de toque (44) e
// `flexGrow: 0, flexShrink: 0`, porque sem isso a web encolhe o ScrollView
// horizontal a quase nada; os chips ficam com o recuo lateral `space.md` e
// `keyboardShouldPersistTaps="handled"` para um toque no chip não só fechar
// o teclado. `style` vai no contêiner (margens); em modo scroll,
// `contentStyle` entra no contentContainerStyle e o resto vai ao ScrollView.
export default function ChipRow({ scroll, children, style, contentStyle, ...rest }) {
  const { tokens } = useTheme();
  const { space } = tokens;

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ paddingHorizontal: space.md, gap: space.xs, alignItems: 'center' }, contentStyle]}
        style={[{ flexGrow: 0, flexShrink: 0, height: 44 }, style]}
        {...rest}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }, style]} {...rest}>
      {children}
    </View>
  );
}
