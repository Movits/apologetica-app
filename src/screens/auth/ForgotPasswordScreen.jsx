import { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import BrandMark from '../../components/BrandMark';
import BackChevron from '../../components/auth/BackChevron';
import FormScreen from '../../components/auth/FormScreen';
import { Button, Field, Group } from '../../components/ui';

// Recuperar senha com a mesma pele do Login (Onda 7). Fluxo e mensagens
// inalterados: um campo de e-mail, "Enviar link", e a confirmação de envio.
export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { space, icon } = tokens;

  const handleSend = async () => {
    setError('');
    if (!email.trim()) return setError(t('auth.needEmail'));
    setBusy(true);
    const res = await resetPassword(email.trim().toLowerCase());
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  };

  const lead = [text('body'), { color: colors.textSubtle }];

  return (
    <FormScreen>
      <BackChevron onPress={() => navigation.goBack()} />

      <BrandMark size="md" color={colors.accent} decorative style={{ marginBottom: space.md }} />
      <Text style={[text('title'), { color: colors.text, marginBottom: space.xs }]}>{t('auth.recoverTitle')}</Text>

      {sent ? (
        <View style={{ gap: space.md, marginTop: space.md }}>
          <Ionicons name="mail-outline" size={icon.lg} color={colors.tint} />
          <Text style={[text('headline'), { color: colors.text }]}>{isEn ? 'Email sent!' : 'E-mail enviado!'}</Text>
          <Text style={lead}>
            {isEn
              ? 'Check your inbox and follow the link to set a new password.'
              : 'Verifique sua caixa de entrada e siga o link para definir uma nova senha.'}
          </Text>
          <Button label={t('auth.backToLogin')} onPress={() => navigation.goBack()} />
        </View>
      ) : (
        <>
          <Text style={[lead, { marginBottom: space.lg }]}>
            {isEn
              ? 'Enter your email and we will send a link to set a new password.'
              : 'Digite seu e-mail e enviaremos um link para você criar uma nova senha.'}
          </Text>

          <Group>
            <Field
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </Group>

          {error ? (
            <Text style={[text('footnote'), { color: colors.danger, marginTop: space.sm }]}>{error}</Text>
          ) : null}

          <Button label={t('auth.sendLink')} onPress={handleSend} loading={busy} style={{ marginTop: space.md }} />
        </>
      )}
    </FormScreen>
  );
}
