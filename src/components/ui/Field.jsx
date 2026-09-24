import { forwardRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Campo rotulado de formulário, feito para viver dentro de um Group (que dá o
// card e os separadores). Rótulo em footnote secundário acima do TextInput em
// body; `error` aparece em footnote na cor `danger` abaixo; `trailing` é um nó
// à direita do input (um botão de 44x44, por exemplo).
//
// Senha: com `onToggleSecure` o campo desenha sozinho o botão de olho (alvo de
// 44, `aria-label` de `toggleSecureLabel`), sem cada tela repetir o botão. O
// `secureTextEntry` continua controlado pela tela, para dois campos (senha e
// confirmação) poderem seguir o mesmo interruptor.
//
// Foco na web: o anel (`outlineWidth: 2` na cor `tint`) vai no próprio input,
// como no SearchField, então ele substitui o anel do navegador sem escondê-lo.
// O recuo horizontal fica repartido entre o invólucro e o input (xs + xs = md)
// para o anel, com `outlineOffset: 2`, caber dentro do `overflow: 'hidden'`
// do Group em vez de ser cortado na borda do card.
//
// A `ref` vai para o TextInput, para um campo focar o próximo no Enter.
const Field = forwardRef(function Field(
  {
    label,
    error,
    trailing,
    secureTextEntry,
    onToggleSecure,
    toggleSecureLabel,
    onFocus,
    onBlur,
    style,
    ...rest
  },
  ref,
) {
  const { colors, tokens, text } = useTheme();
  const { space, radius, icon } = tokens;
  const [focused, setFocused] = useState(false);

  const focusRing = Platform.OS === 'web' && focused
    ? { outlineWidth: 2, outlineColor: colors.tint, outlineStyle: 'solid', outlineOffset: 2 }
    : null;

  let trail = trailing ?? null;
  if (!trail && onToggleSecure) {
    trail = (
      <Pressable
        role="button"
        aria-label={toggleSecureLabel}
        aria-pressed={!secureTextEntry}
        onPress={onToggleSecure}
        style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'} size={icon.md} color={colors.tint} />
      </Pressable>
    );
  }

  return (
    <View style={[{ paddingHorizontal: space.xs, paddingVertical: space.xs }, style]}>
      {label ? (
        <Text style={[text('footnote'), { color: colors.textSubtle, marginHorizontal: space.xs }]}>{label}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          ref={ref}
          aria-label={label}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureTextEntry}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[
            text('body'),
            {
              color: colors.text,
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              paddingHorizontal: space.xs,
              paddingVertical: space.xs,
              borderRadius: radius.sm,
              backgroundColor: 'transparent',
              textAlignVertical: 'center',
            },
            focusRing,
          ]}
          {...rest}
        />
        {trail}
      </View>
      {error ? (
        <Text style={[text('footnote'), { color: colors.danger, marginHorizontal: space.xs, marginTop: space.xxs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default Field;
