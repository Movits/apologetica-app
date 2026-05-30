import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const { colors, fs } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const google = useGoogleSignIn();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isEn = lang === 'en';
  const msg = {
    needName: isEn ? 'Please enter your name.' : 'Diga seu nome.',
    needEmail: isEn ? 'Please enter your email.' : 'Informe seu e-mail.',
    pwShort: isEn ? 'Password must be at least 6 characters.' : 'A senha precisa ter pelo menos 6 caracteres.',
    pwMismatch: isEn ? 'Passwords do not match.' : 'As senhas não conferem.',
  };

  const handleSignup = async () => {
    setError('');
    if (!name.trim()) return setError(msg.needName);
    if (!email.trim()) return setError(msg.needEmail);
    if (password.length < 6) return setError(msg.pwShort);
    if (password !== confirm) return setError(msg.pwMismatch);

    setBusy(true);
    const res = await signUp(email.trim().toLowerCase(), password, name.trim());
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const styles = makeStyles(colors, fs);
  const toggleLang = () => setLang(lang === 'pt' ? 'en' : 'pt');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.langToggle} onPress={toggleLang} hitSlop={12}>
        <Ionicons name="language-outline" size={14} color={colors.textMuted} />
        <Text style={styles.langText}>{lang === 'pt' ? 'English' : 'Português'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>

        <Text style={styles.title}>{t('auth.signup')}</Text>
        <Text style={styles.subtitle}>
          {isEn ? 'Your highlights and notes will be saved and synced.' : 'Suas marcações e notas ficarão salvas e sincronizadas.'}
        </Text>

        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder={isEn ? 'Your name' : 'Seu nome'}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

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
            placeholder={isEn ? 'Password (min. 6 characters)' : 'Senha (mínimo 6 caracteres)'}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSubtle} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder={isEn ? 'Confirm password' : 'Confirme a senha'}
            value={confirm}
            onChangeText={setConfirm}
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
          />
        </View>

        {error || google.error ? <Text style={styles.error}>{error || google.error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.signup')}</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{isEn ? 'or' : 'ou'}</Text>
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
                <Text style={styles.googleBtnText}>{isEn ? 'Continue with Google' : 'Continuar com Google'}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>
            {isEn ? 'I already have an account. Sign in.' : 'Já tenho uma conta. Entrar.'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 24, paddingTop: 60 },
    backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
    langToggle: {
      position: 'absolute', top: 50, right: 20,
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
      borderWidth: 1, borderColor: c.divider, backgroundColor: c.card, zIndex: 10,
    },
    langText: { color: c.textMuted, fontSize: fs(11), fontWeight: '600' },
    title: { fontSize: fs(26), fontWeight: 'bold', color: c.primaryText, marginBottom: 6 },
    subtitle: { fontSize: fs(14), color: c.textMuted, marginBottom: 28, lineHeight: fs(20) },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 12,
      gap: 10,
    },
    input: { flex: 1, height: 48, fontSize: fs(15), color: c.text, outlineStyle: 'none', outlineWidth: 0 },
    error: { color: '#c0392b', fontSize: fs(13), marginVertical: 12, textAlign: 'center' },
    primaryBtn: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    primaryBtnText: { color: '#fff', fontSize: fs(16), fontWeight: 'bold' },
    linkText: { color: c.accent, textAlign: 'center', fontSize: fs(14), fontWeight: '600' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.divider },
    dividerText: { marginHorizontal: 12, color: c.textSubtle, fontSize: fs(12) },
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
    },
    googleBtnText: { color: c.text, fontSize: fs(15), fontWeight: '600' },
  });
