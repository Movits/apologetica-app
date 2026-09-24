import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, Modal, TouchableWithoutFeedback,
  StyleSheet, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { space } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useModalNavBar } from '../hooks/useModalNavBar';
import { Button } from './ui';

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
  // Entrada: o card sobe `space.lg` enquanto o véu aparece, em `motion.aba` ms.
  const slideFrom = tokens.space.lg;
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(slideFrom)).current;
  useModalNavBar(visible);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: tokens.motion.aba, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: tokens.motion.aba, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      fade.setValue(0);
      slide.setValue(slideFrom);
    }
  }, [visible, fade, slide, slideFrom, tokens.motion.aba]);

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
            {/* O ícone ocupa metade do disco (proporção, não tamanho solto). */}
            <Ionicons name={opts.icon} size={ICON_CIRCLE / 2} color={colors.accent} />
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

          {/* Os mesmos botões do resto do app: primary com ícone e plain. */}
          <Button icon="person-add-outline" label={t('auth.createFree')} onPress={onCreate} style={{ marginBottom: tokens.space.xs }} />
          <Button variant="plain" label={t('auth.notNow')} onPress={onClose} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Benefit({ icon, label }) {
  const { colors, tokens, text } = useTheme();
  const { space, icon: iconSize } = tokens;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginVertical: space.xxs / 2 }}>
      <Ionicons name={icon} size={iconSize.sm} color={colors.accent} />
      <Text style={[text('footnote'), { color: colors.textMuted, flex: 1 }]}>{label}</Text>
    </View>
  );
}

// Disco do ícone (dois `space.xxl`, 64) e largura máxima do card em telas
// largas (um limite de coluna, como READING_COLUMN no Artigo).
const ICON_CIRCLE = space.xxl * 2;
const CARD_MAX_WIDTH = 380;

const makeStyles = (c, darkMode, tokens, text) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: tokens.space.xl,
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX_WIDTH,
      backgroundColor: c.card,
      borderRadius: tokens.radius.lg,
      paddingHorizontal: tokens.space.xl,
      paddingTop: tokens.space.xl,
      paddingBottom: tokens.space.lg,
      alignItems: 'center',
      borderWidth: darkMode ? StyleSheet.hairlineWidth : 0,
      borderColor: c.cardBorder,
      ...tokens.shadow.floating,
    },
    iconCircle: {
      width: ICON_CIRCLE, height: ICON_CIRCLE, borderRadius: tokens.radius.full,
      backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: tokens.space.md,
      borderWidth: 2,
      borderColor: c.accent,
    },
    title: {
      ...text('title3'),
      color: c.primaryText,
      textAlign: 'center',
      marginBottom: tokens.space.xs,
    },
    message: {
      ...text('subhead'),
      color: c.textMuted,
      textAlign: 'center',
      marginBottom: tokens.space.md,
    },
    benefits: {
      alignSelf: 'stretch',
      backgroundColor: c.badgeBg,
      borderRadius: tokens.radius.md,
      padding: tokens.space.sm,
      marginBottom: tokens.space.lg,
    },
  });
