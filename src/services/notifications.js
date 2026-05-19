import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getVerseOfDay } from '../data/dailyVerses';

// Configuração global de como notificações são mostradas quando o app está aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PREFS_KEY = 'notifications:prefs';

// Identificadores fixos pra cancelar/reagendar sem duplicar
const ID_DAILY_VERSE = 'daily-verse';
const ID_SUNDAY_LITURGY = 'sunday-liturgy';

export async function getPrefs() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { dailyVerse: false, sundayLiturgy: false, verseHour: 7, verseMinute: 0 };
}

async function savePrefs(prefs) {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
}

export async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Cancela todas notificações agendadas com nossos ids conhecidos
async function cancelOurNotifications() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.identifier === ID_DAILY_VERSE || n.identifier === ID_SUNDAY_LITURGY) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
    }
  }
}

export async function setDailyVerseEnabled(enabled, hour = 7, minute = 0) {
  const prefs = await getPrefs();
  prefs.dailyVerse = enabled;
  prefs.verseHour = hour;
  prefs.verseMinute = minute;
  await savePrefs(prefs);
  await rescheduleAll();
}

export async function setSundayLiturgyEnabled(enabled) {
  const prefs = await getPrefs();
  prefs.sundayLiturgy = enabled;
  await savePrefs(prefs);
  await rescheduleAll();
}

// Reagenda tudo do zero baseado nas prefs salvas.
export async function rescheduleAll() {
  await cancelOurNotifications();
  const prefs = await getPrefs();

  if (prefs.dailyVerse) {
    const verse = getVerseOfDay();
    await Notifications.scheduleNotificationAsync({
      identifier: ID_DAILY_VERSE,
      content: {
        title: '🌅 Versículo do dia',
        body: `${verse.text}\n— ${verse.ref}`,
        data: { type: 'verse-of-day' },
      },
      trigger: {
        hour: prefs.verseHour ?? 7,
        minute: prefs.verseMinute ?? 0,
        repeats: true,
      },
    });
  }

  if (prefs.sundayLiturgy) {
    await Notifications.scheduleNotificationAsync({
      identifier: ID_SUNDAY_LITURGY,
      content: {
        title: '⛪ Liturgia de domingo',
        body: 'As leituras da Missa de hoje já estão disponíveis no APPologética.',
        data: { type: 'sunday-liturgy' },
      },
      trigger: {
        weekday: 1, // 1 = domingo
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });
  }
}

// Garante que as notificações estão agendadas conforme as prefs.
// Chamar no boot do app (depois do AuthContext hydratar).
export async function ensureScheduled() {
  const granted = await Notifications.getPermissionsAsync();
  if (granted.status !== 'granted') return;
  await rescheduleAll();
}

// Dispara uma notificação de teste em ~5 segundos, pra verificar se funciona.
export async function sendTestNotification() {
  const ok = await requestPermissions();
  if (!ok) return { ok: false, error: 'Permissão de notificação não concedida.' };
  const verse = getVerseOfDay();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 Versículo do dia (teste)',
      body: `${verse.text}\n— ${verse.ref}`,
    },
    trigger: { seconds: 5 },
  });
  return { ok: true };
}
