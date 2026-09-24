import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Linking, Modal, FlatList, Platform } from 'react-native';
import { confirmAction, notify } from '../utils/dialog';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureException } from '../sentry';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { getBuildId } from '../utils/webUpdate';
import { pick, pickPair } from '../utils/i18nData';
import { THEME_MODES } from '../utils/themeMode';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  getPrefs, requestPermissions,
  setDailyVerseEnabled, setSundayLiturgyEnabled,
  setDailyQuizEnabled, setObjectionOfDayEnabled,
  sendTestNotification,
} from '../services/notifications';
import {
  listVoicesForLanguage, getSavedVoiceId, saveVoiceId,
  getSavedRate, saveRate, describeVoice, describeVoiceShort, ttsLocale,
} from '../utils/ttsVoice';
import { useModalNavBar } from '../hooks/useModalNavBar';
import { useLanguage } from '../context/LanguageContext';
import { Button, Chip, ChipRow, EmptyState, Field, GuestGate, Group, LargeTitleScreen, Row, SectionTitle } from '../components/ui';

const DONATE_URL = 'https://movits.github.io/apologetica-app/donate.html';

// Escalas de FONT_SCALES (ThemeContext); o rótulo vem de strings.js em
// `settings.font.<key>`. A prévia é o próprio app, que reescala na hora.
const FONT_KEYS = ['pequeno', 'normal', 'grande', 'enorme', 'muitoGrande', 'maximo'];

// Velocidades da narração. `label` em PT e `labelEn` seguem a convenção dos
// dados bilíngues, lidos por `pick`.
const RATE_OPTIONS = [
  { value: 0.75, label: 'Lenta', labelEn: 'Slow' },
  { value: 0.95, label: 'Normal', labelEn: 'Normal' },
  { value: 1.15, label: 'Rápida', labelEn: 'Fast' },
  { value: 1.35, label: 'Muito rápida', labelEn: 'Very fast' },
];

const sameRate = (a, b) => Math.abs(a - b) < 0.01;

function rateLabel(r, isEn = false) {
  const found = RATE_OPTIONS.find((o) => sameRate(o.value, r));
  return found ? pick(found, 'label', isEn) : `${r.toFixed(2)}x`;
}

// Versão real do app.json. No web, mostra também os 7 primeiros caracteres do
// commit publicado, que é a única forma de saber qual build o aparelho roda.
const appVersion = Constants.expoConfig?.version || '?';
const buildLabel = (() => {
  const id = getBuildId();
  return id && id !== 'dev' ? id.slice(0, 7) : null;
})();

// Switch nas cores do tema: trilho em `tint` quando ligado, `separator` quando
// desligado, bolinha em `elevated`. Na web o react-native-web pinta a bolinha
// ligada com uma cor própria, por isso o `activeThumbColor` só ali.
function ThemedSwitch({ value, onValueChange, label }) {
  const { colors } = useTheme();
  const webProps = Platform.OS === 'web' ? { activeThumbColor: colors.elevated } : null;
  return (
    <Switch
      value={Boolean(value)}
      onValueChange={onValueChange}
      aria-label={label}
      trackColor={{ true: colors.tint, false: colors.separator }}
      thumbColor={colors.elevated}
      {...webProps}
    />
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, tokens, text, themeMode, setThemeMode, fontSize, setFontSize } = useTheme();
  const { lang, setLang, t, isEn } = useLanguage();
  const { user, signOut, guest, deleteAccount } = useAuth();
  const { space, radius, icon } = tokens;
  const [delOpen, setDelOpen] = useState(false);
  const [delPass, setDelPass] = useState('');
  const [showDelPass, setShowDelPass] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const isPasswordUser = (user?.providerData || []).some((p) => p.providerId === 'password');
  const [notifPrefs, setNotifPrefs] = useState({ dailyVerse: false, sundayLiturgy: false, dailyQuiz: false, verseHour: 7, verseMinute: 0 });

  // Narração (TTS)
  const [ttsVoices, setTtsVoices] = useState([]);
  const [ttsVoiceId, setTtsVoiceId] = useState(null);
  const [ttsRate, setTtsRate] = useState(0.95);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);

  useEffect(() => {
    getPrefs().then(setNotifPrefs);
  }, []);

  // Recarrega vozes quando o idioma do app muda (PT/EN têm catálogos diferentes).
  useEffect(() => {
    (async () => {
      const [voices, savedId, savedRate] = await Promise.all([
        listVoicesForLanguage(lang),
        getSavedVoiceId(lang),
        getSavedRate(),
      ]);
      setTtsVoices(voices);
      setTtsVoiceId(savedId || voices[0]?.identifier || null);
      setTtsRate(savedRate);
    })();
  }, [lang]);

  const selectedVoice = ttsVoices.find((v) => v.identifier === ttsVoiceId) || ttsVoices[0] || null;

  const previewPhrase = () => pickPair('Esteja sempre pronto para dar uma resposta.', 'Always be prepared to give an answer.', isEn);
  const ratePhrase = () => pickPair('Velocidade de leitura.', 'Reading speed.', isEn);

  const previewVoice = (voice) => {
    Speech.stop();
    Speech.speak(previewPhrase(), {
      language: voice?.language || ttsLocale(lang),
      voice: voice?.identifier,
      rate: ttsRate,
      pitch: 1.0,
    });
  };

  // Escolher uma voz na lista já toca a prévia dela, e a lista fica aberta
  // para comparar; fecha pelo X, pelo fundo ou pelo botão voltar.
  const chooseVoice = async (voice) => {
    setTtsVoiceId(voice.identifier);
    previewVoice(voice);
    await saveVoiceId(voice.identifier, lang);
  };

  const changeRate = async (newRate) => {
    setTtsRate(newRate);
    await saveRate(newRate);
    Speech.stop();
    Speech.speak(ratePhrase(), {
      language: selectedVoice?.language || ttsLocale(lang),
      voice: selectedVoice?.identifier,
      rate: newRate,
      pitch: 1.0,
    });
  };

  const permTitle = () => isEn ? 'Permission required' : 'Permissão necessária';
  const permMsg = () => isEn ? 'Enable notifications in your device settings.' : 'Habilite as notificações nas configurações do celular.';
  const warnTitle = () => isEn ? 'Heads up' : 'Atenção';
  const expoGoNote = () => isEn ? '\n\nExpo Go has limitations with notifications. It will work normally when published.' : '\n\nO Expo Go tem limitações com notificações. Vai funcionar normalmente quando publicado.';

  const toggleDailyVerse = async (value) => {
    if (value) {
      const ok = await requestPermissions();
      if (!ok) { notify(permTitle(), permMsg()); return; }
    }
    setNotifPrefs((p) => ({ ...p, dailyVerse: value }));
    const res = await setDailyVerseEnabled(value, notifPrefs.verseHour, notifPrefs.verseMinute);
    if (!res.ok) notify(warnTitle(), `${res.error}${expoGoNote()}`);
  };

  const toggleSundayLiturgy = async (value) => {
    if (value) {
      const ok = await requestPermissions();
      if (!ok) { notify(permTitle(), permMsg()); return; }
    }
    setNotifPrefs((p) => ({ ...p, sundayLiturgy: value }));
    const res = await setSundayLiturgyEnabled(value);
    if (!res.ok) notify(warnTitle(), `${res.error}${expoGoNote()}`);
  };

  const toggleDailyQuiz = async (value) => {
    if (value) {
      const ok = await requestPermissions();
      if (!ok) { notify(permTitle(), permMsg()); return; }
    }
    setNotifPrefs((p) => ({ ...p, dailyQuiz: value }));
    await setDailyQuizEnabled(value);
  };

  const toggleObjectionOfDay = async (value) => {
    if (value) {
      const ok = await requestPermissions();
      if (!ok) { notify(permTitle(), permMsg()); return; }
    }
    setNotifPrefs((p) => ({ ...p, objectionOfDay: value }));
    await setObjectionOfDayEnabled(value);
  };

  const sendTest = async () => {
    const res = await sendTestNotification();
    if (!res.ok) {
      notify(
        isEn ? 'Error' : 'Erro',
        res.error || (isEn ? 'Could not schedule notification.' : 'Não consegui agendar a notificação.')
      );
    } else {
      notify(
        isEn ? 'Notification scheduled' : 'Notificação agendada',
        isEn ? 'It will arrive in ~5 seconds. You can minimize the app to see it better.' : 'Vai chegar em ~5 segundos. Pode minimizar o app pra ver melhor.'
      );
    }
  };

  const sendSentryTest = () => {
    try {
      captureException(new Error('Teste manual do Sentry, APPologetica'));
      notify(
        isEn ? 'Test error sent' : 'Erro de teste enviado',
        isEn ? 'Check at https://appologetica.sentry.io/issues. The event should appear in a few seconds.' : 'Verifique em https://appologetica.sentry.io/issues. O evento deve aparecer em alguns segundos.'
      );
    } catch (e) {
      notify(
        isEn ? 'Failed' : 'Falha',
        isEn ? 'Sentry is not available in this build.' : 'Sentry não está disponível neste build.'
      );
    }
  };

  const handleLogout = () => {
    confirmAction({
      title: isEn ? 'Sign out?' : 'Sair da conta?',
      message: isEn ? 'You can sign in again anytime.' : 'Você pode entrar novamente quando quiser.',
      confirmText: isEn ? 'Sign out' : 'Sair',
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: () => signOut(),
    });
  };

  const askDeleteAccount = () => {
    confirmAction({
      title: isEn ? 'Delete your account?' : 'Excluir sua conta?',
      message: isEn
        ? 'This permanently deletes your account and all your highlights and notes. This cannot be undone.'
        : 'Isto apaga em definitivo sua conta e todas as suas marcações e notas. Não tem como desfazer.',
      confirmText: isEn ? 'Continue' : 'Continuar',
      cancelText: t('common.cancel'),
      destructive: true,
      onConfirm: () => { setDelPass(''); setShowDelPass(false); setDelOpen(true); },
    });
  };

  const doDeleteAccount = async () => {
    if (delBusy || (isPasswordUser && !delPass)) return;
    setDelBusy(true);
    const res = await deleteAccount(isPasswordUser ? { password: delPass } : {});
    setDelBusy(false);
    if (res.needsPassword) {
      notify(isEn ? 'Password required' : 'Senha necessária', isEn ? 'Enter your password to confirm.' : 'Digite sua senha para confirmar.');
      return;
    }
    if (!res.ok) {
      notify(isEn ? 'Could not delete' : 'Não foi possível excluir', res.error);
      return;
    }
    setDelOpen(false);
    // A troca de estado de auth leva de volta ao login automaticamente.
  };

  // Rola ao topo quando a aba Ajustes é tocada de novo já focada.
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const notifTime = `${String(notifPrefs.verseHour).padStart(2, '0')}:${String(notifPrefs.verseMinute).padStart(2, '0')}`;
  const voiceSubtitle = ttsVoices.length === 0
    ? (isEn ? 'No voices found for this language' : 'Nenhuma voz encontrada para esse idioma')
    : describeVoiceShort(selectedVoice);
  const ttsTip = Platform.OS === 'ios'
    ? pickPair(
      'Dica: vozes "Premium" podem ser baixadas em Ajustes do iOS > Acessibilidade > Conteúdo Falado > Vozes.',
      'Tip: "Premium" voices can be downloaded in iOS Settings > Accessibility > Spoken Content > Voices.',
      isEn,
    )
    : Platform.OS === 'android'
      ? pickPair(
        'Dica: instale "Google Serviços de Fala" na Play Store para mais vozes.',
        'Tip: install "Google Speech Services" from Play Store for more voices.',
        isEn,
      )
      : null;

  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase();
  const caption = [text('footnote'), { color: colors.textSubtle, marginHorizontal: space.md, marginTop: space.xs }];
  // Os chips ficam abaixo do título da linha, com um respiro.
  const chipRow = { marginTop: space.xxs };

  return (
    <>
      <LargeTitleScreen
        title={t('tab.settings')}
        // A ref vai ao Animated.ScrollView do componente, para o useScrollToTop.
        scrollProps={{ ref: scrollRef, keyboardShouldPersistTaps: 'handled' }}
      >
        {/* Conta: perfil de quem está logado, ou o convite do visitante. */}
        <SectionTitle title={t('settings.section.account')} style={{ marginTop: 0 }} />
        {user ? (
          <Group>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 44,
                paddingHorizontal: space.md,
                paddingVertical: space.sm,
                gap: space.sm,
              }}
            >
              <View
                style={{
                  width: space.xxxl,
                  height: space.xxxl,
                  borderRadius: radius.full,
                  backgroundColor: colors.tint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={[text('headline'), { color: colors.onTint }]}>{initial}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                {user.displayName ? (
                  <Text style={[text('body'), { color: colors.text }]} numberOfLines={1}>{user.displayName}</Text>
                ) : null}
                <Text style={[text('subhead'), { color: colors.textSubtle }]} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>
            {/* Ação destrutiva: ícone e rótulo na mesma cor, como "Excluir conta". */}
            <Row icon="log-out-outline" iconColor={colors.danger} titleColor={colors.danger} title={t('settings.logout')} onPress={handleLogout} />
          </Group>
        ) : guest ? (
          <GuestGate inline />
        ) : null}

        {/* Aparência: tema (sistema, claro, escuro), tamanho da letra e idioma. */}
        <SectionTitle title={t('settings.section.appearance')} />
        <Group>
          <Row icon="moon-outline" title={t('settings.theme.label')}>
            <ChipRow style={chipRow}>
              {THEME_MODES.map((mode) => (
                <Chip
                  key={mode}
                  label={t(`settings.theme.${mode}`)}
                  selected={themeMode === mode}
                  onPress={() => setThemeMode(mode)}
                  haptic
                />
              ))}
            </ChipRow>
          </Row>
          <Row icon="text-outline" title={t('settings.font.label')}>
            <ChipRow style={chipRow}>
              {FONT_KEYS.map((key) => (
                <Chip
                  key={key}
                  label={t(`settings.font.${key}`)}
                  selected={fontSize === key}
                  onPress={() => setFontSize(key)}
                  haptic
                />
              ))}
            </ChipRow>
          </Row>
          <Row
            icon="language-outline"
            title={t('settings.language.label')}
            subtitle={pickPair('Bíblia (DRA) e a maioria dos artigos em inglês quando ativado.', 'Bible (DRA) and most articles in English.', isEn)}
          >
            <ChipRow style={chipRow}>
              <Chip label="Português" selected={lang === 'pt'} onPress={() => setLang('pt')} haptic />
              <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} haptic />
            </ChipRow>
          </Row>
        </Group>

        {/* Leitura em voz alta: voz, velocidade e prévia. */}
        <SectionTitle title={t('settings.section.tts')} />
        <Group>
          <Row
            icon="mic-outline"
            title={t('settings.voice')}
            subtitle={voiceSubtitle}
            trailing="chevron"
            onPress={() => setVoicePickerOpen(true)}
          />
          <Row icon="speedometer-outline" title={t('settings.speed')} subtitle={rateLabel(ttsRate, isEn)}>
            <ChipRow style={chipRow}>
              {RATE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={pick(opt, 'label', isEn)}
                  selected={sameRate(ttsRate, opt.value)}
                  onPress={() => changeRate(opt.value)}
                  haptic
                />
              ))}
            </ChipRow>
          </Row>
        </Group>
        <Button
          variant="secondary"
          icon="play-outline"
          label={t('settings.voice.preview')}
          onPress={() => previewVoice(selectedVoice)}
          style={{ marginTop: space.sm }}
        />
        {ttsTip ? <Text style={caption}>{ttsTip}</Text> : null}

        {/* Notificações: só no nativo. */}
        {Platform.OS !== 'web' && (
          <>
            <SectionTitle title={t('settings.section.notifications')} />
            <Group>
              <Row
                icon="sunny-outline"
                title={t('settings.notif.daily')}
                subtitle={notifPrefs.dailyVerse
                  ? (isEn ? `Receive at ${notifTime}` : `Receber às ${notifTime}`)
                  : (isEn ? 'Daily reminder' : 'Receber lembrete diário')}
                trailing={<ThemedSwitch value={notifPrefs.dailyVerse} onValueChange={toggleDailyVerse} label={t('settings.notif.daily')} />}
              />
              <Row
                icon="calendar-outline"
                title={t('settings.notif.sunday')}
                subtitle={isEn ? 'Liturgy reminder every Sunday morning' : 'Lembrete da liturgia toda manhã de domingo'}
                trailing={<ThemedSwitch value={notifPrefs.sundayLiturgy} onValueChange={toggleSundayLiturgy} label={t('settings.notif.sunday')} />}
              />
              <Row
                icon="help-circle-outline"
                title={t('settings.notif.quiz')}
                subtitle={isEn ? 'A new question every day at 7 PM' : 'Uma pergunta nova todo dia às 19h'}
                trailing={<ThemedSwitch value={notifPrefs.dailyQuiz} onValueChange={toggleDailyQuiz} label={t('settings.notif.quiz')} />}
              />
              <Row
                icon="chatbubbles-outline"
                title={isEn ? 'Objection of the day' : 'Objeção do dia'}
                subtitle={isEn ? 'A common objection to answer, every day at noon' : 'Uma objeção comum pra responder, todo dia ao meio-dia'}
                trailing={<ThemedSwitch value={notifPrefs.objectionOfDay} onValueChange={toggleObjectionOfDay} label={isEn ? 'Objection of the day' : 'Objeção do dia'} />}
              />
              <Row icon="notifications-outline" title={t('settings.notif.test')} onPress={sendTest} />
            </Group>
          </>
        )}

        {/* Diagnóstico */}
        <SectionTitle title={t('settings.section.diagnostic')} />
        <Group>
          <Row icon="bug-outline" title={t('settings.sentry.test')} subtitle={t('settings.sentry.testSub')} onPress={sendSentryTest} />
        </Group>

        {/* Apoie o projeto */}
        <SectionTitle title={t('settings.section.donate')} />
        <Group>
          <Row
            icon="heart-outline"
            title={t('settings.donate')}
            subtitle={t('settings.donateSub')}
            trailing={<Ionicons name="open-outline" size={icon.sm} color={colors.textTertiary} />}
            onPress={() => Linking.openURL(DONATE_URL).catch(() => {})}
          />
        </Group>

        {/* Sobre e legal */}
        <SectionTitle title={t('settings.section.about')} />
        <Group
          footer={pickPair(
            '"Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós." (1 Pedro 3,15)',
            '"Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have." (1 Peter 3:15)',
            isEn,
          )}
        >
          <Row
            icon="information-circle-outline"
            title="APPologética"
            subtitle={pickPair(
              'App de estudo e evangelização. Artigos de apologética, referências bíblicas, Bíblia católica completa, marcações e notas sincronizadas.',
              'App for study and evangelization. Apologetics articles, biblical references, complete Catholic Bible, synced highlights and notes.',
              isEn,
            )}
          />
          <Row
            icon="book-outline"
            title={pickPair('Traduções bíblicas', 'Bible translations', isEn)}
            subtitle={pickPair(
              'Ave Maria (português) e Douay-Rheims-Challoner (inglês).',
              'Ave Maria (Portuguese) and Douay-Rheims-Challoner (English).',
              isEn,
            )}
          />
          <Row
            icon="shield-outline"
            title={t('settings.privacy')}
            trailing="chevron"
            onPress={() => navigation.navigate('Legal', { kind: 'privacy' })}
          />
          <Row
            icon="document-text-outline"
            title={t('settings.terms')}
            trailing="chevron"
            onPress={() => navigation.navigate('Legal', { kind: 'terms' })}
          />
        </Group>

        {user ? (
          <Button
            variant="plain"
            label={isEn ? 'Delete account' : 'Excluir conta'}
            onPress={askDeleteAccount}
            textStyle={{ color: colors.danger }}
            style={{ marginTop: space.lg }}
          />
        ) : null}

        <Text style={[text('footnote'), { color: colors.textTertiary, textAlign: 'center', marginTop: space.xl }]}>
          APPologética · {isEn ? 'Version' : 'Versão'} {appVersion}
          {buildLabel ? ` · ${buildLabel}` : ''}
        </Text>
      </LargeTitleScreen>

      {/* Confirmação final da exclusão da conta (com senha para conta de e-mail). */}
      <Modal visible={delOpen} transparent animationType="fade" onRequestClose={() => setDelOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: space.xl }}>
          <View
            role="dialog"
            aria-modal
            style={{ backgroundColor: colors.elevated, borderRadius: radius.lg, padding: space.lg, gap: space.sm }}
          >
            <Ionicons name="warning-outline" size={icon.lg} color={colors.danger} style={{ alignSelf: 'center' }} />
            <Text style={[text('headline'), { color: colors.text, textAlign: 'center' }]}>
              {isEn ? 'Delete account permanently' : 'Excluir conta em definitivo'}
            </Text>
            <Text style={[text('subhead'), { color: colors.textSubtle, textAlign: 'center' }]}>
              {isEn
                ? 'Your account, highlights and notes will be erased and cannot be recovered.'
                : 'Sua conta, marcações e notas serão apagadas e não poderão ser recuperadas.'}
            </Text>
            {isPasswordUser && (
              <Group style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator, borderRadius: radius.md }}>
                <Field
                  label={isEn ? 'Your password' : 'Sua senha'}
                  value={delPass}
                  onChangeText={setDelPass}
                  secureTextEntry={!showDelPass}
                  onToggleSecure={() => setShowDelPass((v) => !v)}
                  toggleSecureLabel={showDelPass ? t('auth.hidePassword') : t('auth.showPassword')}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={doDeleteAccount}
                />
              </Group>
            )}
            <Button
              label={isEn ? 'Delete' : 'Excluir'}
              onPress={doDeleteAccount}
              loading={delBusy}
              disabled={isPasswordUser && !delPass}
              style={{ backgroundColor: colors.danger, marginTop: space.xs }}
            />
            <Button variant="plain" label={t('common.cancel')} onPress={() => setDelOpen(false)} disabled={delBusy} />
          </View>
        </View>
      </Modal>

      <VoicePickerModal
        visible={voicePickerOpen}
        voices={ttsVoices}
        selectedId={ttsVoiceId}
        onSelect={chooseVoice}
        onClose={() => { setVoicePickerOpen(false); Speech.stop(); }}
      />
    </>
  );
}

// Lista de vozes numa folha inferior. É um Modal simples (não o Sheet do
// design system) porque a lista rola: o arrasto do Sheet capturaria o gesto.
function VoicePickerModal({ visible, voices, selectedId, onSelect, onClose }) {
  const { colors, tokens, text } = useTheme();
  const { t, isEn } = useLanguage();
  const insets = useSafeAreaInsets();
  const { space, radius, icon } = tokens;
  useModalNavBar(visible);

  const separator = { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: space.md };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable role="button" aria-label={t('common.close')} onPress={onClose} style={StyleSheet.absoluteFill} />
        <View
          role="dialog"
          aria-modal
          style={{
            backgroundColor: colors.elevated,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            maxHeight: '75%',
            paddingBottom: insets.bottom + space.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: space.md, paddingRight: space.xs, paddingVertical: space.xs }}>
            <Text style={[text('headline'), { color: colors.text, flex: 1 }]}>{t('settings.voice.choose')}</Text>
            <Pressable
              role="button"
              aria-label={t('common.close')}
              onPress={onClose}
              style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="close" size={icon.md} color={colors.text} />
            </Pressable>
          </View>
          {voices.length === 0 ? (
            <EmptyState
              icon="mic-off-outline"
              title={isEn ? 'No voices found' : 'Nenhuma voz encontrada'}
              message={isEn
                ? 'Check your device system settings for installed speech engines.'
                : 'Verifique nas configurações do sistema se há motores de voz instalados.'}
            />
          ) : (
            <FlatList
              data={voices}
              keyExtractor={(v) => v.identifier}
              style={{ marginHorizontal: space.md, backgroundColor: colors.card, borderRadius: radius.md }}
              ItemSeparatorComponent={() => <View style={separator} />}
              renderItem={({ item }) => {
                const selected = item.identifier === selectedId;
                const info = describeVoice(item);
                return (
                  <Row
                    title={info.name}
                    subtitle={info.badges.length ? info.badges.join(', ') : undefined}
                    trailing={selected ? <Ionicons name="checkmark-circle" size={icon.md} color={colors.tint} /> : null}
                    onPress={() => onSelect(item)}
                  />
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
