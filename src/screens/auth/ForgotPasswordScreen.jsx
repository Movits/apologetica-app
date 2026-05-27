import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { colors, fs } = useTheme();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const isEn = lang === 'en';

  const handleSend = async () => {
    setError('');
    if (!email.trim()) return setError(isEn ? 'Please enter your email.' : 'Informe seu e-mail.');
    setBusy(true);
    const res = await resetPassword(email.trim().toLowerCase());
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
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

        <Text style={styles.title}>{t('auth.recoverTitle')}</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="mail-outline" size={48} color={colors.accent} />
            <Text style={styles.successText}>{isEn ? 'Email sent!' : 'E-mail enviado!'}</Text>
            <Text style={styles.subtitle}>
              {isEn
                ? 'Check your inbox and follow the link to set a new password.'
                : 'Verifique sua caixa de entrada e siga o link para definir uma nova senha.'}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBtnText}>{t('auth.backToLogin')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {isEn
                ? 'Enter your email and we will send a link to set a new password.'
                : 'Digite seu e-mail e enviaremos um link para você criar uma nova senha.'}
            </Text>

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
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSend} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('auth.sendLink')}</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 24, paddingTop: 60 },
    backBtn: { marginBottom: 12, alignSelf: 'flex-start' },
    title: { fontSize: fs(26), fontWeight: 'bold', color: c.primaryText, marginBottom: 12 },
    subtitle: { fontSize: fs(14), color: c.textMuted, marginBottom: 24, lineHeight: fs(20), textAlign: 'center' },
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
    successBox: { alignItems: 'center', marginTop: 30, gap: 12 },
    successText: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText },
  });
