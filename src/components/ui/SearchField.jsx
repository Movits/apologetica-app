import { forwardRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import PressScale from './PressScale';

// Campo de busca: caixa `card` com lupa à esquerda, TextInput preenchendo a
// caixa inteira e botão de limpar (44x44) quando há valor. O TextInput é o
// único filho em fluxo, então o anel de foco desenhado nele (só na web, com
// outline* no estado focado) contorna a caixa toda e substitui o anel do
// navegador sem nunca escondê-lo. Com `asButton` vira um PressScale com a
// mesma cara, para abrir a tela de busca a partir de outra tela.
const SearchField = forwardRef(function SearchField(
  {
    value,
    onChangeText,
    onSubmitEditing,
    placeholder,
    autoFocus,
    returnKeyType = 'search',
    asButton,
    onPress,
    clearLabel,
    style,
    ...rest
  },
  ref,
) {
  const { colors, tokens, text } = useTheme();
  const { t } = useLanguage();
  const { space, radius, icon } = tokens;
  const [focused, setFocused] = useState(false);
  // Rótulo do botão de limpar no idioma do app, salvo se a tela passar outro.
  const clearText = clearLabel ?? t('common.clear');

  const box = {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  };
  const iconLeft = space.sm;
  const textInset = iconLeft + icon.sm + space.xs;

  if (asButton) {
    return (
      <PressScale
        role="button"
        aria-label={placeholder}
        onPress={onPress}
        style={[box, { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: iconLeft }, style]}
      >
        <Ionicons name="search-outline" size={icon.sm} color={colors.textSubtle} />
        <Text style={[text('body'), { color: colors.textSubtle, flex: 1 }]} numberOfLines={1}>
          {placeholder}
        </Text>
      </PressScale>
    );
  }

  const focusRing = Platform.OS === 'web' && focused
    ? { outlineWidth: 2, outlineColor: colors.tint, outlineStyle: 'solid', outlineOffset: 2 }
    : null;
  const hasValue = Boolean(value);

  return (
    <View style={[box, style]}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          text('body'),
          {
            color: colors.text,
            minHeight: 44,
            paddingVertical: space.xs,
            paddingLeft: textInset,
            paddingRight: hasValue ? 44 : space.sm,
            borderRadius: radius.md,
            backgroundColor: 'transparent',
            textAlignVertical: 'center',
          },
          focusRing,
        ]}
        {...rest}
      />
      <View
        style={{
          position: 'absolute',
          left: iconLeft,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Ionicons name="search-outline" size={icon.sm} color={colors.textSubtle} />
      </View>
      {hasValue ? (
        <Pressable
          role="button"
          aria-label={clearText}
          onPress={() => onChangeText?.('')}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="close-circle" size={icon.sm} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
});

export default SearchField;
