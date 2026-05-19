import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const DONATE_URL = 'https://movits.github.io/apologetica-app/donate.html';

const FONT_OPTIONS = [
  { key: 'pequeno', label: 'Pequeno', sample: 14 },
  { key: 'normal', label: 'Normal', sample: 16 },
  { key: 'grande', label: 'Grande', sample: 18 },
  { key: 'enorme', label: 'Enorme', sample: 21 },
];

export default function SettingsScreen() {
  const { colors, darkMode, setDarkMode, fontSize, setFontSize, fs } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sair da conta?', 'Você pode entrar novamente quando quiser.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const styles = makeStyles(colors, fs);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {user && (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {user.displayName && <Text style={styles.profileName}>{user.displayName}</Text>}
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      <Text style={styles.section}>Aparência</Text>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="moon-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>Modo escuro</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ true: colors.accent, false: '#ccc' }}
          thumbColor="#fff"
        />
      </View>

      <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="text-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>Tamanho da letra</Text>
        </View>
        <View style={styles.fontGrid}>
          {FONT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.fontChip, fontSize === opt.key && styles.fontChipActive]}
              onPress={() => setFontSize(opt.key)}
            >
              <Text
                style={[
                  styles.fontChipLabel,
                  { fontSize: opt.sample },
                  fontSize === opt.key && styles.fontChipLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {user && (
        <>
          <Text style={styles.section}>Conta</Text>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={22} color="#c0392b" />
              <Text style={[styles.rowLabel, { color: '#c0392b' }]}>Sair da conta</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.section}>Apoie o projeto</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(DONATE_URL).catch(() => {})}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="heart-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Fazer uma doação</Text>
            <Text style={styles.rowSub}>Via PIX. Qualquer valor ajuda a manter o app gratuito.</Text>
          </View>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <Text style={styles.section}>Sobre</Text>

      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>APPologética</Text>
        <Text style={styles.aboutVersion}>Versão 1.4.0</Text>
        <Text style={styles.aboutText}>
          App de estudo e evangelização. Artigos de apologética, referências bíblicas, Bíblia católica completa, marcações e notas sincronizadas.
        </Text>
        <Text style={styles.aboutText}>
          Tradução bíblica: Bíblia Ave Maria (73 livros do cânon católico).
        </Text>
        <Text style={styles.aboutQuote}>
          "Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós."
        </Text>
        <Text style={styles.aboutQuoteRef}>1 Pedro 3,15</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c, fs) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 16, paddingBottom: 40 },
    profileCard: {
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: c.card, borderRadius: 12, padding: 16, marginBottom: 8,
    },
    avatar: {
      width: 52, height: 52, borderRadius: 26, backgroundColor: c.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontSize: fs(22), fontWeight: 'bold' },
    profileName: { fontSize: fs(16), fontWeight: 'bold', color: c.primaryText },
    profileEmail: { fontSize: fs(13), color: c.textMuted, marginTop: 2 },
    section: {
      fontSize: fs(13), fontWeight: 'bold', color: c.textSubtle,
      textTransform: 'uppercase', letterSpacing: 1,
      marginTop: 16, marginBottom: 8, paddingHorizontal: 4,
    },
    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: c.card, padding: 16, borderRadius: 12, marginBottom: 8,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    rowLabel: { fontSize: fs(15), color: c.text },
    rowSub: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    fontGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    fontChip: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
      borderWidth: 1, borderColor: c.divider, backgroundColor: c.bg,
    },
    fontChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    fontChipLabel: { color: c.text },
    fontChipLabelActive: { color: '#fff', fontWeight: 'bold' },
    aboutBox: { backgroundColor: c.card, borderRadius: 12, padding: 18, marginTop: 4 },
    aboutTitle: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    aboutVersion: { fontSize: fs(12), color: c.textSubtle, marginTop: 2 },
    aboutText: { fontSize: fs(14), color: c.text, lineHeight: fs(20), marginTop: 12 },
    aboutQuote: { fontSize: fs(14), color: c.textMuted, fontStyle: 'italic', marginTop: 16, lineHeight: fs(20) },
    aboutQuoteRef: { fontSize: fs(12), color: c.accent, fontWeight: 'bold', marginTop: 4 },
  });
