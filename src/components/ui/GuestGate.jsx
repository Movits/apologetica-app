import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import GateNotice from './GateNotice';

// GateNotice com os defaults do modo visitante: a mensagem
// `settings.guest.message`, "Criar conta" em primary e "Entrar" em plain, os
// dois saindo do modo visitante (`exitGuest`, que leva à AuthStack). Cada
// prop pode ser trocada. Por padrão vem dentro da View de página (flex 1,
// fundo `bg`, padding `space.md`) que as telas de Marcações, Notas e Caderno
// desenham em volta; `inline` devolve só o aviso, para viver no meio de uma
// tela (Ajustes).
export default function GuestGate({
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  inline,
  style,
}) {
  const { colors, tokens } = useTheme();
  const { t } = useLanguage();
  const { exitGuest } = useAuth();

  const notice = (
    <GateNotice
      message={message ?? t('settings.guest.message')}
      primaryLabel={primaryLabel ?? t('auth.signup')}
      onPrimary={onPrimary ?? exitGuest}
      secondaryLabel={secondaryLabel ?? t('auth.login')}
      onSecondary={onSecondary ?? exitGuest}
      style={inline ? style : undefined}
    />
  );
  if (inline) return notice;
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg, padding: tokens.space.md }, style]}>
      {notice}
    </View>
  );
}
