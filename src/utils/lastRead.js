import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'lastRead:article';

export async function setLastRead(articleId) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ articleId, at: Date.now() }));
  } catch {}
}

export async function getLastRead() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
