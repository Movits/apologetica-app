import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVerseOfDay } from '../data/dailyVerses';

// Como notificações aparecem com o app em foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PREFS_KEY = 'notifications:prefs';

const ID_DAILY_VERSE = 'daily-verse';
const ID_SUNDAY_LITURGY = 'sunday-liturgy';

const DEFAULT_PREFS = {
  dailyVerse: false,
  sundayLiturgy: false,
  verseHour: 7,
  verseMinute: 0,
};

export async function getPrefs() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PREFS };
}

async function savePrefs(prefs) {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelOurNotifications() {
  try {
    await Notifications.cancelScheduledNotificationAsync(ID_DAILY_VERSE).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(ID_SUNDAY_LITURGY).catch(() => {});
  } catch {}
}

// Resultado: { ok, error? }
export async function setDailyVerseEnabled(enabled, hour = 7, minute = 0) {
  const prefs = await getPrefs();
  prefs.dailyVerse = enabled;
  prefs.verseHour = hour;
  prefs.verseMinute = minute;
  await savePrefs(prefs);
  return rescheduleAll();
}

export async function setSundayLiturgyEnabled(enabled) {
  const prefs = await getPrefs();
  prefs.sundayLiturgy = enabled;
  await savePrefs(prefs);
  return rescheduleAll();
}

// Reagenda tudo com base nas prefs. Retorna { ok, error? }.
// Continua salvando as prefs mesmo se a API de notificação falhar.
export async function rescheduleAll() {
  await cancelOurNotifications();
  const prefs = await getPrefs();

  try {
    if (prefs.dailyVerse) {
      const verse = getVerseOfDay();
      await Notifications.scheduleNotificationAsync({
        identifier: ID_DAILY_VERSE,
        content: {
          title: 'Versículo do dia',
          body: `${verse.text}\n— ${verse.ref}`,
          data: { type: 'verse-of-day' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: prefs.verseHour ?? 7,
          minute: prefs.verseMinute ?? 0,
        },
      });
    }

    if (prefs.sundayLiturgy) {
      await Notifications.scheduleNotificationAsync({
        identifier: ID_SUNDAY_LITURGY,
        content: {
          title: 'Liturgia de domingo',
          body: 'As leituras da Missa de hoje já estão no APPologética.',
          data: { type: 'sunday-liturgy' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1, // 1 = domingo
          hour: 7,
          minute: 0,
        },
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'Erro ao agendar notificação' };
  }
}

export async function ensureScheduled() {
  const granted = await Notifications.getPermissionsAsync();
  if (granted.status !== 'granted') return;
  await rescheduleAll().catch(() => {});
}

// Dispara uma notificação em ~5 segundos pra teste.
export async function sendTestNotification() {
  const ok = await requestPermissions();
  if (!ok) return { ok: false, error: 'Permissão de notificação não concedida.' };
  const verse = getVerseOfDay();
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Versículo do dia (teste)',
        body: `${verse.text}\n— ${verse.ref}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'Falha ao agendar notificação' };
  }
}
