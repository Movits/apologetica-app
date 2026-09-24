import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useModalNavBar } from '../hooks/useModalNavBar';

// Modal "Criar uma conta?" customizado, no estilo visual do app.
// Substitui o Alert.alert nativo. Controlado por contexto + hook
// useRequireAccount() exportado em GuestGate.jsx.

const AccountPromptContext = createContext(null);

const DEFAULT_OPTS = {
  title: 'Criar uma conta?',
  message: 'Esta funcionalidade exige uma conta. Marcações, notas e caderno ficam salvos na sua conta e sincronizados entre aparelhos.',
  icon: 'lock-closed-outline',
};

export function AccountPromptProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState(DEFAULT_OPTS);

  const show = useCallback((customOpts = {}) => {
    setOpts({ ...DEFAULT_OPTS, ...customOpts });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <AccountPromptContext.Provider value={{ show, hide }}>
      {children}
      <AccountPromptModal visible={visible} opts={opts} onClose={hide} />
    </AccountPromptContext.Provider>
  );
}

export function useAccountPrompt() {
  const ctx = useContext(AccountPromptContext);
  if (!ctx) throw new Error('useAccountPrompt precisa estar dentro de AccountPromptProvider');
  return ctx;
}

function AccountPromptModal({ visible, opts, onClose }) {
  const { colors, darkMode, tokens, text } = useTheme();
  const { exitGuest } = useAuth();
  const { t, isEn } = useLanguage();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useModalNavBar(visible);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(20);
    }
  }, [visible, fade, slide]);

  const onCreate = async () => {
    onClose();
    await exitGuest();
  };

  const styles = makeStyles(colors, darkMode, tokens, text);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.card, { transform: [{ translateY: slide }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name={opts.icon} size={32} color={colors.accent} />
          </View>

          <Text style={styles.title}>
            {opts.title === DEFAULT_OPTS.title && isEn ? 'Create an account?' : opts.title}
          </Text>
          <Text style={styles.message}>
            {opts.message === DEFAULT_OPTS.message && isEn
              ? 'This feature requires an account. Highlights, notes and notebook are saved to your account and synced across devices.'
              : opts.message}
          </Text>

          <View style={styles.benefits}>
            <Benefit icon="cloud-done-outline" label={isEn ? 'Synced across devices' : 'Sincronizado entre celulares'} />
            <Benefit icon="bookmark-outline" label={isEn ? 'Saved highlights and notes' : 'Marcações e notas salvas'} />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={onCreate} activeOpacity={0.85}>
            {/* Navy da paleta sobre o botão dourado (accent). */}
            <Ionicons name="person-add-outline" size={tokens.icon.sm} color={colors.primary} style={{ marginRight: tokens.space.xs }} />
            <Text style={styles.btnPrimaryText}>{t('auth.createFree')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>{t('auth.notNow')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Benefit({ icon, label }) {
  const { colors, text } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 3 }}>
      <Ionicons name={icon} size={15} color={colors.accent} />
      <Text style={[text('footnote'), { color: colors.textMuted, flex: 1 }]}>{label}</Text>
    </View>
  );
}

const makeStyles = (c, darkMode, tokens, text) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(13, 23, 34, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: c.card,
      borderRadius: 18,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 20,
      alignItems: 'center',
      borderWidth: darkMode ? 1 : 0,
      borderColor: c.cardBorder,
      ...tokens.shadow.floating,
    },
    iconCircle: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: c.accent,
    },
    title: {
      ...text('title3'),
      color: c.primaryText,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      ...text('subhead'),
      color: c.textMuted,
      textAlign: 'center',
      marginBottom: 18,
    },
    benefits: {
      alignSelf: 'stretch',
      backgroundColor: c.badgeBg,
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
    },
    btnPrimary: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      backgroundColor: c.accent,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    btnPrimaryText: {
      ...text('subhead'),
      fontWeight: '600',
      color: c.primary,
    },
    btnSecondary: {
      paddingVertical: 12,
      alignItems: 'center',
      alignSelf: 'stretch',
    },
    btnSecondaryText: {
      ...text('subhead'),
      color: c.textSubtle,
      fontWeight: '600',
    },
  });
