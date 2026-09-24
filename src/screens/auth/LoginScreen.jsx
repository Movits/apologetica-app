import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import AuthTopToggles from '../../components/AuthTopToggles';
import BrandMark from '../../components/BrandMark';
import { Button, Field, Group } from '../../components/ui';

// Login com a pele da Onda 7 (mock aprovado): fundo do tema, cruz à esquerda,
// título "Entrar", lista agrupada de campos rotulados com anel de foco, um só
// divisor "ou" e "Continuar sem conta" com o mesmo peso das outras opções.
export default function LoginScreen({ navigation }) {
  const { signIn, continueAsGuest, linkGoogleToEmail } = useAuth();
  const { colors, tokens, text } = useTheme();
  const { t, lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const google = useGoogleSignIn();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { space, radius } = tokens;
  const isEn = lang === 'en';

  const linkInfo = google.needsLink;
  // Quando o Google detecta conta existente, prefixa o email para o usuário só
  // precisar digitar a senha e vincular.
  useEffect(() => {
    if (linkInfo?.email) setEmail(linkInfo.email);
  }, [linkInfo?.email]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(isEn ? 'Fill in email and password.' : 'Preencha e-mail e senha.');
      return;
    }
    setBusy(true);
    const res = await signIn(email.trim().toLowerCase(), password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const handleLink = async () => {
    setError('');
    if (!password) {
      setError(isEn ? 'Enter your password.' : 'Digite sua senha.');
      return;
    }
    setBusy(true);
    const res = await linkGoogleToEmail({ email: linkInfo.email, password, pendingCred: linkInfo.pendingCred });
    setBusy(false);
    if (!res.ok) setError(res.error);
    else google.clearLink?.();
  };

  const shownError = error || google.error;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthTopToggles />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          // Abaixo das pílulas do topo (44 de alvo), com folga.
          paddingTop: insets.top + space.xs + 44 + space.lg,
          paddingBottom: insets.bottom + space.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorativa: a tela já se chama pelo título. */}
        <BrandMark size="md" color={colors.accent} decorative style={{ marginBottom: space.md }} />
        <Text style={[text('title'), { color: colors.text, marginBottom: space.xs }]}>{t('auth.login')}</Text>
        <Text style={[text('body'), { color: colors.textSubtle, marginBottom: space.lg }]}>{t('auth.loginLead')}</Text>

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
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={passwordRef}
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onToggleSecure={() => setShowPassword((v) => !v)}
            toggleSecureLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={linkInfo ? handleLink : handleLogin}
          />
        </Group>

        {linkInfo ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.separator,
              padding: space.md,
              marginTop: space.sm,
              gap: space.xs,
            }}
          >
            <Text style={[text('headline'), { color: colors.text }]}>
              {isEn ? 'You already have an account with this email' : 'Você já tem uma conta com este e-mail'}
            </Text>
            <Text style={[text('footnote'), { color: colors.textSubtle }]}>
              {isEn
                ? `Enter the password for ${linkInfo.email} to link Google to that account.`
                : `Digite a senha de ${linkInfo.email} para vincular o Google a essa conta.`}
            </Text>
            <Button
              variant="secondary"
              icon="link-outline"
              label={isEn ? 'Link Google' : 'Vincular Google'}
              onPress={handleLink}
              loading={busy}
            />
          </View>
        ) : null}

        {shownError ? (
          <Text style={[text('footnote'), { color: colors.danger, marginTop: space.sm }]}>{shownError}</Text>
        ) : null}

        <Button label={t('auth.login')} onPress={handleLogin} loading={busy} style={{ marginTop: space.md }} />
        <Button variant="plain" label={t('auth.forgotPassword')} onPress={() => navigation.navigate('ForgotPassword')} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.md }}>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.separator }} />
          <Text style={[text('footnote'), { color: colors.textSubtle }]}>{isEn ? 'or' : 'ou'}</Text>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.separator }} />
        </View>

        <View style={{ gap: space.xs }}>
          {!google.unavailable && (
            <Button
              variant="secondary"
              icon="logo-google"
              label={isEn ? 'Continue with Google' : 'Continuar com Google'}
              onPress={google.signIn}
              disabled={!google.ready}
              loading={google.busy}
            />
          )}
          <Button variant="secondary" label={t('auth.signup')} onPress={() => navigation.navigate('Signup')} />
          <Button variant="plain" label={t('auth.guest')} onPress={continueAsGuest} />
        </View>

        <Text style={[text('caption1'), { color: colors.textSubtle, textAlign: 'center', marginTop: space.xs }]}>
          {isEn
            ? 'You can explore articles, Bible, liturgy and references.\nHighlights and notes require an account.'
            : 'Você pode explorar artigos, Bíblia, liturgia e referências.\nMarcações e notas exigem conta.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
