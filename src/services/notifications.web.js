// Variante web: notificações push não são suportadas na web v1.
// Stubs no-op com a mesma interface de notifications.js (o Metro resolve este
// arquivo na web, mantendo expo-notifications/expo-device fora do bundle).
// A seção de notificações fica oculta em Ajustes na web (ver SettingsScreen).

const DEFAULT_PREFS = {
  dailyVerse: false,
  sundayLiturgy: false,
  dailyQuiz: false,
  verseHour: 7,
  verseMinute: 0,
};

export async function getPrefs() {
  return { ...DEFAULT_PREFS };
}

export async function requestPermissions() {
  return false;
}

export async function setDailyVerseEnabled() {
  return { ok: true };
}

export async function setSundayLiturgyEnabled() {
  return { ok: true };
}

export async function setDailyQuizEnabled() {
  return { ok: true };
}

export async function rescheduleAll() {
  return { ok: true };
}

export async function ensureScheduled() {}

export async function sendTestNotification() {
  return { ok: false, error: 'Notificações não disponíveis na web.' };
}
