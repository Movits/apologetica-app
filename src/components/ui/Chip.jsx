import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import PressScale from './PressScale';

// Segmento selecionável (filtro de tela, opção em Ajustes). O alvo de toque é
// o PressScale externo de 44; a parte visível tem 32 de altura.
//
// Visual discreto, de controle segmentado: sem selo colorido nem ícone em
// cada opção (o trilho de pílulas douradas com ícone parecia gerado). Fora de
// seleção é só o texto em `textSubtle`, sem fundo nem borda; selecionado, o
// texto ganha a cor de destaque e peso, sobre o fundo `card` com hairline (o
// "polegar" do segmentado). Na web o mouse por cima acende o texto e um fundo
// leve (`badgeBg`). `icon` continua aceito para casos pontuais.
//
// Estado selecionado por plataforma: na web, um botão de alternância é
// `aria-pressed` (o react-native-web converte para o DOM); o RN 0.81 não aceita
// `aria-pressed` (Libraries/Components/View/ViewAccessibility.d.ts só lista
// aria-busy/checked/disabled/expanded/selected), então no nativo vai
// `aria-selected`, que vira o estado "selecionado" do leitor de tela.
export default function Chip({ label, selected = false, icon, onPress, haptic, disabled, style, ...rest }) {
  const { colors, tokens, text } = useTheme();
  const [hovered, setHovered] = useState(false);
  const { space, radius, icon: iconSize } = tokens;
  const fg = selected ? colors.tint : hovered ? colors.text : colors.textSubtle;
  const selectedProps = Platform.OS === 'web' ? { 'aria-pressed': selected } : { 'aria-selected': selected };

  return (
    <PressScale
      role="button"
      {...selectedProps}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      haptic={haptic ? 'selection' : undefined}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.target, disabled ? { opacity: 0.4 } : null, style]}
      {...rest}
    >
      <View
        style={[
          styles.face,
          {
            paddingHorizontal: space.sm,
            borderRadius: radius.full,
            gap: space.xxs,
            backgroundColor: selected ? colors.card : hovered ? colors.badgeBg : 'transparent',
            borderColor: selected ? colors.separator : 'transparent',
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={iconSize.sm} color={fg} /> : null}
        <Text style={[text('subhead'), { fontWeight: selected ? '600' : '500', color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  target: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', cursor: 'pointer' },
  face: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
