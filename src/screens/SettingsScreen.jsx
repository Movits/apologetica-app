import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Linking, Modal, FlatList, Platform } from 'react-native';
import { confirmAction, notify } from '../utils/dialog';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { captureException } from '../sentry';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useScrollHints } from '../hooks/useScrollHints';
import ScrollHint from '../components/ScrollHint';
import WebDownloadBanner from '../components/WebDownloadBanner';
import {
  getPrefs, requestPermissions,
  setDailyVerseEnabled, setSundayLiturgyEnabled,
  setDailyQuizEnabled,
  sendTestNotification,
} from '../services/notifications';
import {
  listVoicesForLanguage, getSavedVoiceId, saveVoiceId,
  getSavedRate, saveRate, describeVoice, describeVoiceShort,
} from '../utils/ttsVoice';
import { useModalNavBar } from '../hooks/useModalNavBar';
import { useLanguage } from '../context/LanguageContext';

const DONATE_URL = 'https://movits.github.io/apologetica-app/donate.html';

const FONT_OPTIONS = [
  { key: 'pequeno', label: 'Pequeno', sample: 14 },
  { key: 'normal', label: 'Normal', sample: 16 },
  { key: 'grande', label: 'Grande', sample: 18 },
  { key: 'enorme', label: 'Enorme', sample: 21 },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, darkMode, setDarkMode, fontSize, setFontSize, fs } = useTheme();
  const { lang, setLang, t, isEn } = useLanguage();
  const { user, signOut, guest, exitGuest } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState({ dailyVerse: false, sundayLiturgy: false, dailyQuiz: false, verseHour: 7, verseMinute: 0 });

  // TTS state
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

  const chooseVoice = async (id) => {
    setTtsVoiceId(id);
    setVoicePickerOpen(false);
    await saveVoiceId(id, lang);
  };

  const previewPhrase = () => isEn
    ? 'Always be prepared to give an answer.'
    : 'Esteja sempre pronto para dar uma resposta.';

  const ratePhrase = () => isEn ? 'Reading speed.' : 'Velocidade de leitura.';
  const fallbackLang = () => isEn ? 'en-US' : 'pt-BR';

  const previewVoice = (voice) => {
    Speech.stop();
    Speech.speak(previewPhrase(), {
      language: voice?.language || fallbackLang(),
      voice: voice?.identifier,
      rate: ttsRate,
      pitch: 1.0,
    });
  };

  const changeRate = async (newRate) => {
    setTtsRate(newRate);
    await saveRate(newRate);
    Speech.stop();
    Speech.speak(ratePhrase(), {
      language: selectedVoice?.language || fallbackLang(),
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

  const { showTop, showBottom, onScroll, onContentSizeChange, onLayout } = useScrollHints();
  const scrollRef = useRef(null);
  const styles = makeStyles(colors, fs);

  // Scroll to top quando tap no tab Ajustes de novo
  useEffect(() => {
    const unsub = navigation.addListener?.('tabPress', () => {
      if (navigation.isFocused?.()) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    });
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.container}>
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      scrollEventThrottle={32}
    >
      <WebDownloadBanner />

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

      {!user && guest && (
        <TouchableOpacity style={[styles.profileCard, { borderWidth: 1, borderColor: colors.accent }]} onPress={exitGuest}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Ionicons name="person-add-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{t('settings.guest.title')}</Text>
            <Text style={styles.profileEmail}>{t('settings.guest.sub')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}

      <Text style={styles.section}>{t('settings.section.appearance')}</Text>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="moon-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('settings.darkMode.label')}</Text>
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
          <Text style={styles.rowLabel}>{t('settings.font.label')}</Text>
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

      {Platform.OS !== 'web' && (
       <>
      <Text style={styles.section}>{t('settings.section.notifications')}</Text>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="sunny-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.notif.daily')}</Text>
            <Text style={styles.rowSub}>
              {notifPrefs.dailyVerse
                ? (isEn ? `Receive at ${String(notifPrefs.verseHour).padStart(2,'0')}:${String(notifPrefs.verseMinute).padStart(2,'0')}` : `Receber às ${String(notifPrefs.verseHour).padStart(2,'0')}:${String(notifPrefs.verseMinute).padStart(2,'0')}`)
                : (isEn ? 'Daily reminder' : 'Receber lembrete diário')}
            </Text>
          </View>
        </View>
        <Switch
          value={notifPrefs.dailyVerse}
          onValueChange={toggleDailyVerse}
          trackColor={{ true: colors.accent, false: '#ccc' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="calendar-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.notif.sunday')}</Text>
            <Text style={styles.rowSub}>
              {isEn ? 'Liturgy reminder every Sunday morning' : 'Lembrete da liturgia toda manhã de domingo'}
            </Text>
          </View>
        </View>
        <Switch
          value={notifPrefs.sundayLiturgy}
          onValueChange={toggleSundayLiturgy}
          trackColor={{ true: colors.accent, false: '#ccc' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name="help-circle-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.notif.quiz')}</Text>
            <Text style={styles.rowSub}>
              {isEn ? 'A new question every day at 7 PM' : 'Uma pergunta nova todo dia às 19h'}
            </Text>
          </View>
        </View>
        <Switch
          value={notifPrefs.dailyQuiz}
          onValueChange={toggleDailyQuiz}
          trackColor={{ true: colors.accent, false: '#ccc' }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={async () => {
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
        }}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="notifications-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('settings.notif.test')}</Text>
        </View>
      </TouchableOpacity>
       </>
      )}

      <Text style={styles.section}>{t('settings.section.content')}</Text>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Glossary')}>
        <View style={styles.rowLeft}>
          <Ionicons name="school-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('home.card.glossary')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ReadingPlan')}>
        <View style={styles.rowLeft}>
          <Ionicons name="calendar-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('header.readingPlan')} (30)</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Rosary')}>
        <View style={styles.rowLeft}>
          <Ionicons name="flower-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('home.card.rosary')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ExamConscience')}>
        <View style={styles.rowLeft}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('home.card.exam')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Favorites')}>
        <View style={styles.rowLeft}>
          <Ionicons name="star-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('home.card.favorites')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      {user && (
        <>
          <Text style={styles.section}>{t('settings.section.account')}</Text>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={22} color="#c0392b" />
              <Text style={[styles.rowLabel, { color: '#c0392b' }]}>{t('settings.logout')}</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.section}>{t('settings.section.diagnostic')}</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
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
        }}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="bug-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.sentry.test')}</Text>
            <Text style={styles.rowSub}>{t('settings.sentry.testSub')}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.section.donate')}</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(DONATE_URL).catch(() => {})}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="heart-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.donate')}</Text>
            <Text style={styles.rowSub}>{t('settings.donateSub')}</Text>
          </View>
        </View>
        <Ionicons name="open-outline" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.section.language')}</Text>
      <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="language-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.language.label')}</Text>
            <Text style={styles.rowSub}>
              {lang === 'pt' ? 'Português' : 'English'}.{' '}
              {isEn ? 'UI translated. Bible (DRA) and most articles in English.' : 'UI traduzida. Bíblia (DRA) e a maioria dos artigos em inglês quando ativado.'}
            </Text>
          </View>
        </View>
        <View style={styles.fontGrid}>
          <TouchableOpacity
            style={[styles.fontChip, lang === 'pt' && styles.fontChipActive]}
            onPress={() => setLang('pt')}
          >
            <Text style={[styles.fontChipLabel, lang === 'pt' && styles.fontChipLabelActive]}>
              Português
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontChip, lang === 'en' && styles.fontChipActive]}
            onPress={() => setLang('en')}
          >
            <Text style={[styles.fontChipLabel, lang === 'en' && styles.fontChipLabelActive]}>
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voz e velocidade da narração (TTS) agrupadas com o idioma. */}
      <TouchableOpacity
        style={[styles.row, { flexDirection: 'column', alignItems: 'stretch' }]}
        onPress={() => setVoicePickerOpen(true)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={styles.rowLeft}>
            <Ionicons name="mic-outline" size={22} color={colors.primaryText} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.voice')}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>
                {ttsVoices.length === 0
                  ? (isEn ? 'No voices found for this language' : 'Nenhuma voz encontrada para esse idioma')
                  : describeVoiceShort(selectedVoice)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
        </View>
        {Platform.OS === 'ios' && (
          <Text style={[styles.rowSub, { marginTop: 8, marginLeft: 34 }]}>
            {isEn
              ? 'Tip: "Premium" voices can be downloaded in iOS Settings → Accessibility → Spoken Content → Voices.'
              : 'Dica: vozes "Premium" podem ser baixadas em Ajustes do iOS → Acessibilidade → Conteúdo Falado → Vozes.'}
          </Text>
        )}
        {Platform.OS === 'android' && (
          <Text style={[styles.rowSub, { marginTop: 8, marginLeft: 34 }]}>
            {isEn
              ? 'Tip: install "Google Speech Services" from Play Store for more voices.'
              : 'Dica: instale "Google Serviços de Fala" na Play Store para mais vozes.'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="speedometer-outline" size={22} color={colors.primaryText} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('settings.speed')}</Text>
            <Text style={styles.rowSub}>{rateLabel(ttsRate, isEn)}</Text>
          </View>
        </View>
        <View style={styles.fontGrid}>
          {RATE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.fontChip, Math.abs(ttsRate - opt.value) < 0.01 && styles.fontChipActive]}
              onPress={() => changeRate(opt.value)}
            >
              <Text
                style={[
                  styles.fontChipLabel,
                  Math.abs(ttsRate - opt.value) < 0.01 && styles.fontChipLabelActive,
                ]}
              >
                {isEn ? opt.labelEn : opt.labelPt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.section}>{t('settings.section.privacy')}</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Legal', { kind: 'privacy' })}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="shield-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('settings.privacy')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Legal', { kind: 'terms' })}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="document-text-outline" size={22} color={colors.primaryText} />
          <Text style={styles.rowLabel}>{t('settings.terms')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </TouchableOpacity>

      <Text style={styles.section}>{t('settings.section.about')}</Text>

      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>APPologética</Text>
        <Text style={styles.aboutVersion}>{isEn ? 'Version' : 'Versão'} 1.4.0</Text>
        <Text style={styles.aboutText}>
          {isEn
            ? 'App for study and evangelization. Apologetics articles, biblical references, complete Catholic Bible, synced highlights and notes.'
            : 'App de estudo e evangelização. Artigos de apologética, referências bíblicas, Bíblia católica completa, marcações e notas sincronizadas.'}
        </Text>
        <Text style={styles.aboutText}>
          {isEn
            ? 'Bible translations: Ave Maria (Portuguese) and Douay-Rheims-Challoner (English).'
            : 'Tradução bíblica: Ave Maria (português) e Douay-Rheims-Challoner (inglês).'}
        </Text>
        <Text style={styles.aboutQuote}>
          {isEn
            ? '"Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have."'
            : '"Esteja sempre pronto para dar uma resposta a qualquer pessoa que vos pedir razão da esperança que há em vós."'}
        </Text>
        <Text style={styles.aboutQuoteRef}>1 {isEn ? 'Peter' : 'Pedro'} 3,15</Text>
      </View>
    </ScrollView>
      <ScrollHint direction="up" visible={showTop} />
      <ScrollHint direction="down" visible={showBottom} />

      <VoicePickerModal
        visible={voicePickerOpen}
        voices={ttsVoices}
        selectedId={ttsVoiceId}
        onSelect={chooseVoice}
        onPreview={previewVoice}
        onClose={() => { setVoicePickerOpen(false); Speech.stop(); }}
        colors={colors}
        fs={fs}
        isEn={isEn}
      />
    </View>
  );
}

const RATE_OPTIONS = [
  { value: 0.75, labelPt: 'Lenta', labelEn: 'Slow' },
  { value: 0.95, labelPt: 'Normal', labelEn: 'Normal' },
  { value: 1.15, labelPt: 'Rápida', labelEn: 'Fast' },
  { value: 1.35, labelPt: 'Muito rápida', labelEn: 'Very fast' },
];

function rateLabel(r, isEn = false) {
  const found = RATE_OPTIONS.find((o) => Math.abs(o.value - r) < 0.01);
  return found ? (isEn ? found.labelEn : found.labelPt) : `${r.toFixed(2)}x`;
}

function VoicePickerModal({ visible, voices, selectedId, onSelect, onPreview, onClose, colors, fs, isEn }) {
  const s = pickerStyles(colors, fs);
  useModalNavBar(visible);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>{isEn ? 'Choose voice' : 'Escolher voz'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {voices.length === 0 ? (
            <View style={{ padding: 24 }}>
              <Text style={s.empty}>
                {isEn
                  ? 'No voices found for this language. Check your device system settings for installed TTS engines.'
                  : 'Nenhuma voz foi encontrada para este idioma. Verifique nas configurações do sistema se há motores de TTS instalados.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={voices}
              keyExtractor={(v) => v.identifier}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => {
                const selected = item.identifier === selectedId;
                const info = describeVoice(item);
                return (
                  <TouchableOpacity
                    style={[s.item, selected && s.itemSelected]}
                    onPress={() => onSelect(item.identifier)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemTitle}>{info.name}</Text>
                      {info.badges.length > 0 && (
                        <View style={s.badgeRow}>
                          {info.badges.map((b) => (
                            <View key={b} style={s.badge}>
                              <Text style={s.badgeText}>{b}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => onPreview(item)}
                      hitSlop={8}
                      style={s.previewBtn}
                    >
                      <Ionicons name="play" size={16} color={colors.accent} />
                    </TouchableOpacity>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.accent} style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const pickerStyles = (c, fs) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(13, 23, 34, 0.75)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.bg,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      maxHeight: '75%',
      paddingBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
    },
    title: { fontSize: fs(17), fontWeight: 'bold', color: c.primaryText },
    empty: { fontSize: fs(14), color: c.textMuted, lineHeight: fs(20), textAlign: 'center' },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
      backgroundColor: c.bg,
    },
    itemSelected: { backgroundColor: c.badgeBg },
    itemTitle: { fontSize: fs(15), color: c.text, fontWeight: '600' },
    itemSub: { fontSize: fs(11), color: c.textSubtle, marginTop: 2 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    badge: {
      paddingHorizontal: 8, paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: c.badgeBg,
      borderWidth: 1,
      borderColor: c.divider,
    },
    badgeText: { fontSize: fs(10), color: c.accent, fontWeight: '600', letterSpacing: 0.3 },
    previewBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: c.badgeBg,
      justifyContent: 'center', alignItems: 'center',
      marginLeft: 8,
      borderWidth: 1,
      borderColor: c.accent,
    },
  });

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
