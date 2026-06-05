import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import AuthTopToggles from '../../components/AuthTopToggles';

export default function LoginScreen({ navigation }) {
  const { signIn, continueAsGuest, linkGoogleToEmail } = useAuth();
  const { colors, fs } = useTheme();
  const { t, lang } = useLanguage();
  const google = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const linkInfo = google.needsLink;
  // Quando o Google detecta conta existente, prefixa o email para o usuário só
  // precisar digitar a senha e vincular.
  useEffect(() => {
    if (linkInfo?.email) setEmail(linkInfo.email);
  }, [linkInfo?.email]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(lang === 'en' ? 'Fill in email and password.' : 'Preencha e-mail e senha.');
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
      setError(lang === 'en' ? 'Enter your password.' : 'Digite sua senha.');
      return;
    }
    setBusy(true);
    const res = await linkGoogleToEmail({ email: linkInfo.email, password, pendingCred: linkInfo.pendingCred });
    setBusy(false);
    if (!res.ok) setError(res.error);
    else google.clearLink?.();
  };

  const styles = makeStyles(colors, fs);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthTopToggles />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.cross}>✝</Text>
        <Text style={styles.title}>APPologética</Text>
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
          <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        {linkInfo ? (
          <View style={styles.linkBox}>
            <Text style={styles.linkTitle}>
              {lang === 'en' ? 'You already have an account with this email' : 'Você já tem uma conta com este e-mail'}
            </Text>
            <Text style={styles.linkBody}>
              {lang === 'en'
                ? `Enter the password for ${linkInfo.email} to link Google to that account.`
                : `Digite a senha de ${linkInfo.email} para vincular o Google a essa conta.`}
            </Text>
            <TouchableOpacity style={styles.linkBtn} onPress={handleLink} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="link-outline" size={18} color="#fff" />
                  <Text style={styles.linkBtnText}>{lang === 'en' ? 'Link Google' : 'Vincular Google'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {error || google.error ? <Text style={styles.error}>{error || google.error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.login')}</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{lang === 'en' ? 'or' : 'ou'}</Text>
          <View style={styles.dividerLine} />
        </View>

        {!google.unavailable && (
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={google.signIn}
            disabled={!google.ready || google.busy}
          >
            {google.busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleBtnText}>{lang === 'en' ? 'Continue with Google' : 'Continuar com Google'}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.secondaryBtnText}>{t('auth.signupNew')}</Text>
        </TouchableOpacity>

        <View style={styles.guestDivider}>
          <View style={styles.guestDividerLine} />
          <Text style={styles.guestDividerText}>{lang === 'en' ? 'or' : 'ou'}</Text>
          <View style={styles.guestDividerLine} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={continueAsGuest}>
          <Ionicons name="enter-outline" size={18} color={colors.textMuted} />
          <Text style={styles.guestBtnText}>{t('auth.guest')}</Text>
        </TouchableOpacity>
        <Text style={styles.guestHint}>
          {lang === 'en'
            ? 'You can explore articles, Bible, liturgy and references.\nHighlights and notes require an account.'
            : 'Você pode explorar artigos, Bíblia, liturgia e referências.\nMarcações e notas exigem conta.'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 24, paddingTop: 60, alignItems: 'center' },
    cross: { fontSize: fs(54), color: c.accent, marginBottom: 12 },
    title: { fontSize: fs(28), fontWeight: 'bold', color: c.primaryText, marginBottom: 6 },
    subtitle: { fontSize: fs(14), color: c.textMuted, marginBottom: 32, textAlign: 'center' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
      width: '100%',
      gap: 12,
    },
    input: { flex: 1, height: 48, fontSize: fs(15), color: c.text, ...(Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : null) },
    forgotLink: { alignSelf: 'flex-end', marginBottom: 16, marginTop: 4 },
    forgotText: { fontSize: fs(13), color: c.accent, fontWeight: '600' },
    error: { color: '#c0392b', fontSize: fs(13), marginBottom: 12, textAlign: 'center', width: '100%' },
    linkBox: { width: '100%', backgroundColor: c.badgeBg, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.accent },
    linkTitle: { fontSize: fs(14), fontWeight: 'bold', color: c.primaryText, marginBottom: 4 },
    linkBody: { fontSize: fs(13), color: c.textMuted, lineHeight: fs(18), marginBottom: 12 },
    linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.accent, paddingVertical: 12, borderRadius: 10 },
    linkBtnText: { color: '#fff', fontSize: fs(14), fontWeight: 'bold' },
    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: fs(16), fontWeight: 'bold' },
    divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.divider },
    dividerText: { marginHorizontal: 12, color: c.textSubtle, fontSize: fs(12) },
    secondaryBtn: {
      borderWidth: 1.5,
      borderColor: c.accent,
      paddingVertical: 14,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
    },
    secondaryBtnText: { color: c.accent, fontSize: fs(15), fontWeight: 'bold' },
    guestDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28, width: '100%' },
    guestDividerLine: { flex: 1, height: 1, backgroundColor: c.divider },
    guestDividerText: { fontSize: fs(11), color: c.textSubtle, textTransform: 'uppercase', letterSpacing: 1 },
    guestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: 14,
      marginTop: 16,
    },
    guestBtnText: { color: c.textMuted, fontSize: fs(14), fontWeight: '600' },
    guestHint: { fontSize: fs(11), color: c.textSubtle, textAlign: 'center', marginTop: 4, lineHeight: fs(16) },
    googleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: c.divider,
      backgroundColor: c.card,
      paddingVertical: 14,
      borderRadius: 12,
      width: '100%',
    },
    googleBtnText: { color: c.text, fontSize: fs(15), fontWeight: '600' },
  });
