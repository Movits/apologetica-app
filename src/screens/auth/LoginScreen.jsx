import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const { colors, fs } = useTheme();
  const google = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setBusy(true);
    const res = await signIn(email.trim().toLowerCase(), password);
    setBusy(false);
    if (!res.ok) setError(res.error);
  };

  const styles = makeStyles(colors, fs);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.cross}>✝</Text>
        <Text style={styles.title}>APPologética</Text>
        <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
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
            placeholder="Senha"
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
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {error || google.error ? <Text style={styles.error}>{error || google.error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

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
              <Text style={styles.googleBtnText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.secondaryBtnText}>Criar conta nova</Text>
        </TouchableOpacity>
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
      paddingHorizontal: 14,
      marginBottom: 12,
      width: '100%',
      gap: 10,
    },
    input: { flex: 1, height: 48, fontSize: fs(15), color: c.text },
    forgotLink: { alignSelf: 'flex-end', marginBottom: 16, marginTop: 4 },
    forgotText: { fontSize: fs(13), color: c.accent, fontWeight: '600' },
    error: { color: '#c0392b', fontSize: fs(13), marginBottom: 12, textAlign: 'center', width: '100%' },
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
