import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const { colors, fs } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!name.trim()) return setError('Diga seu nome.');
    if (!email.trim()) return setError('Informe seu e-mail.');
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
    if (password !== confirm) return setError('As senhas não conferem.');

    setBusy(true);
    const res = await signUp(email.trim().toLowerCase(), password, name.trim());
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Suas marcações e notas ficarão salvas e sincronizadas.</Text>

        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color={colors.textSubtle} />
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
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
            placeholder="Senha (mínimo 6 caracteres)"
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
            placeholder="Confirme a senha"
            value={confirm}
            onChangeText={setConfirm}
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Criar conta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Já tenho uma conta. Entrar.</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 24, paddingTop: 60 },
    backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
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
    input: { flex: 1, height: 48, fontSize: fs(15), color: c.text },
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
  });
