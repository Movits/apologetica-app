import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import AuthTopToggles from '../../components/AuthTopToggles';
import BrandMark from '../../components/BrandMark';
import { Button, Field, Group, PressScale } from '../../components/ui';

// Cadastro com a mesma pele do Login (Onda 7): cruz, título em display, lista
// agrupada de campos rotulados e botões do design system. O fluxo, as
// validações e as mensagens são os de antes.
export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const { colors, tokens, text } = useTheme();
  const { t, lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const google = useGoogleSignIn();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ageOk, setAgeOk] = useState(false);
  const { space, icon } = tokens;

  const isEn = lang === 'en';
  const msg = {
    needName: isEn ? 'Please enter your name.' : 'Diga seu nome.',
    needEmail: isEn ? 'Please enter your email.' : 'Informe seu e-mail.',
    pwShort: isEn ? 'Password must be at least 6 characters.' : 'A senha precisa ter pelo menos 6 caracteres.',
    pwMismatch: isEn ? 'Passwords do not match.' : 'As senhas não conferem.',
    needAge: isEn ? 'Please confirm you are 13 or older.' : 'Confirme que você tem 13 anos ou mais.',
  };

  const handleSignup = async () => {
    setError('');
    if (!name.trim()) return setError(msg.needName);
    if (!email.trim()) return setError(msg.needEmail);
    if (password.length < 6) return setError(msg.pwShort);
    if (password !== confirm) return setError(msg.pwMismatch);
    if (!ageOk) return setError(msg.needAge);

    setBusy(true);
    const res = await signUp(email.trim().toLowerCase(), password, name.trim());
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const shownError = error || google.error;
  const toggleSecureLabel = showPassword ? t('auth.hidePassword') : t('auth.showPassword');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthTopToggles />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: insets.top + space.xs,
          paddingBottom: insets.bottom + space.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Voltar na mesma linha das pílulas do topo, alvo de 44. */}
        <PressScale
          role="button"
          aria-label={t('common.back')}
          onPress={() => navigation.goBack()}
          style={{ alignSelf: 'flex-start', minWidth: 44, minHeight: 44, justifyContent: 'center', marginLeft: -space.sm, marginBottom: space.lg }}
        >
          <Ionicons name="chevron-back" size={icon.lg} color={colors.tint} />
        </PressScale>

        <BrandMark size="md" color={colors.accent} decorative style={{ marginBottom: space.md }} />
        <Text style={[text('title'), { color: colors.text, marginBottom: space.xs }]}>{t('auth.signup')}</Text>
        <Text style={[text('body'), { color: colors.textSubtle, marginBottom: space.lg }]}>
          {isEn ? 'Your highlights and notes will be saved and synced.' : 'Suas marcações e notas ficarão salvas e sincronizadas.'}
        </Text>

        <Group>
          <Field
            label={isEn ? 'Name' : 'Nome'}
            placeholder={isEn ? 'Your name' : 'Seu nome'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            blurOnSubmit={false}
          />
          <Field
            ref={emailRef}
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
            blurOnSubmit={false}
          />
          <Field
            ref={passwordRef}
            label={t('auth.password')}
            placeholder={isEn ? 'At least 6 characters' : 'Mínimo 6 caracteres'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onToggleSecure={() => setShowPassword((v) => !v)}
            toggleSecureLabel={toggleSecureLabel}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            blurOnSubmit={false}
          />
          <Field
            ref={confirmRef}
            label={isEn ? 'Confirm password' : 'Confirme a senha'}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSignup}
          />
        </Group>

        <PressScale
          role="checkbox"
          aria-checked={ageOk}
          aria-label={isEn ? 'I am 13 years or older' : 'Tenho 13 anos ou mais'}
          onPress={() => setAgeOk((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, marginTop: space.sm }}
        >
          <Ionicons name={ageOk ? 'checkbox' : 'square-outline'} size={icon.lg} color={colors.tint} />
          <Text style={[text('body'), { color: colors.text, flex: 1 }]}>
            {isEn ? 'I am 13 years old or older.' : 'Tenho 13 anos ou mais.'}
          </Text>
        </PressScale>

        {shownError ? (
          <Text style={[text('footnote'), { color: colors.danger, marginTop: space.sm }]}>{shownError}</Text>
        ) : null}

        <Button label={t('auth.signup')} onPress={handleSignup} loading={busy} style={{ marginTop: space.md }} />

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
              onPress={() => { if (!ageOk) { setError(msg.needAge); return; } google.signIn(); }}
              disabled={!google.ready}
              loading={google.busy}
            />
          )}
          <Button
            variant="plain"
            label={isEn ? 'I already have an account. Sign in.' : 'Já tenho uma conta. Entrar.'}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
