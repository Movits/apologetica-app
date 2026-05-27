import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const STORAGE_VOICE_PT = 'settings:ttsVoice';
const STORAGE_VOICE_EN = 'settings:ttsVoiceEn';
const STORAGE_RATE = 'settings:ttsRate';

// Padrões do Google TTS Android para português.
const PT_BR_PATTERNS = [
  { re: /-x-ptd/i, name: 'Bruno',   gender: 'M' },
  { re: /-x-pte/i, name: 'Camila',  gender: 'F' },
  { re: /-x-afp/i, name: 'Felipe',  gender: 'M' },
  { re: /-x-afs/i, name: 'Camila',  gender: 'F' },
];

const PT_PT_PATTERNS = [
  { re: /-x-pte/i, name: 'Tiago',   gender: 'M' },
  { re: /-x-ptd/i, name: 'Vitória', gender: 'F' },
  { re: /-x-ptg/i, name: 'Antônio', gender: 'M' },
  { re: /-x-pti/i, name: 'Inês',    gender: 'F' },
  { re: /-x-pta/i, name: 'André',   gender: 'M' },
  { re: /-x-ptc/i, name: 'Helena',  gender: 'F' },
  { re: /-x-ptb/i, name: 'Beatriz', gender: 'F' },
];

// Padrões para inglês (US e UK). Google TTS Android usa identifiers como
// en-us-x-iol-local, en-us-x-sfg-network, etc. Mapeamos por padrão de gênero típico.
const EN_US_PATTERNS = [
  { re: /-x-iol/i, name: 'James',     gender: 'M' },
  { re: /-x-iom/i, name: 'Michael',   gender: 'M' },
  { re: /-x-sfg/i, name: 'Sarah',     gender: 'F' },
  { re: /-x-tpc/i, name: 'Emma',      gender: 'F' },
  { re: /-x-tpd/i, name: 'John',      gender: 'M' },
  { re: /-x-iog/i, name: 'David',     gender: 'M' },
  { re: /-x-iob/i, name: 'Olivia',    gender: 'F' },
  { re: /-x-iof/i, name: 'Emily',     gender: 'F' },
];

const EN_GB_PATTERNS = [
  { re: /-x-rjs/i, name: 'Oliver',   gender: 'M' },
  { re: /-x-gba/i, name: 'Charlotte', gender: 'F' },
  { re: /-x-gbb/i, name: 'William',   gender: 'M' },
  { re: /-x-gbc/i, name: 'Sophie',    gender: 'F' },
  { re: /-x-gbd/i, name: 'Henry',     gender: 'M' },
];

function classifyVoice(voice) {
  const id = voice.identifier || '';
  const rawName = (voice.name || '').toLowerCase();
  const lang = (voice.language || '').toLowerCase().replace('_', '-');

  if (lang.startsWith('pt-br')) {
    for (const p of PT_BR_PATTERNS) {
      if (p.re.test(id)) return { langGroup: 'pt', country: 'Brasil', name: p.name, gender: p.gender };
    }
    if (rawName.includes('felipe')) return { langGroup: 'pt', country: 'Brasil', name: 'Felipe', gender: 'M' };
    if (rawName.includes('luciana')) return { langGroup: 'pt', country: 'Brasil', name: 'Luciana', gender: 'F' };
    return null;
  }
  if (lang.startsWith('pt-pt')) {
    for (const p of PT_PT_PATTERNS) {
      if (p.re.test(id)) return { langGroup: 'pt', country: 'Portugal', name: p.name, gender: p.gender };
    }
    if (rawName.includes('joana')) return { langGroup: 'pt', country: 'Portugal', name: 'Joana', gender: 'F' };
    if (rawName.includes('tiago')) return { langGroup: 'pt', country: 'Portugal', name: 'Tiago', gender: 'M' };
    return null;
  }
  if (lang.startsWith('en-us')) {
    for (const p of EN_US_PATTERNS) {
      if (p.re.test(id)) return { langGroup: 'en', country: 'USA', name: p.name, gender: p.gender };
    }
    // iOS uses real names directly
    if (rawName.includes('samantha')) return { langGroup: 'en', country: 'USA', name: 'Samantha', gender: 'F' };
    if (rawName.includes('alex')) return { langGroup: 'en', country: 'USA', name: 'Alex', gender: 'M' };
    if (rawName.includes('fred')) return { langGroup: 'en', country: 'USA', name: 'Fred', gender: 'M' };
    return null;
  }
  if (lang.startsWith('en-gb')) {
    for (const p of EN_GB_PATTERNS) {
      if (p.re.test(id)) return { langGroup: 'en', country: 'UK', name: p.name, gender: p.gender };
    }
    if (rawName.includes('daniel')) return { langGroup: 'en', country: 'UK', name: 'Daniel', gender: 'M' };
    if (rawName.includes('serena')) return { langGroup: 'en', country: 'UK', name: 'Serena', gender: 'F' };
    if (rawName.includes('kate')) return { langGroup: 'en', country: 'UK', name: 'Kate', gender: 'F' };
    return null;
  }
  return null;
}

const PREFERRED = {
  'Brasil-M': 'Bruno',
  'Brasil-F': 'Camila',
  'Portugal-M': 'Tiago',
  'Portugal-F': 'Vitória',
  'USA-M': 'James',
  'USA-F': 'Sarah',
  'UK-M': 'Oliver',
  'UK-F': 'Charlotte',
};

function isOnline(voice) {
  return /-network|cloud/i.test(voice.identifier || '');
}

function priorityScore(voice, info) {
  let score = 0;
  if (info.name === PREFERRED[`${info.country}-${info.gender}`]) score += 100;
  if (!isOnline(voice)) score += 10;
  return score;
}

// Lista vozes para o idioma escolhido ('pt' ou 'en').
// Retorna no máximo 4 vozes (2 por país, M + F).
export async function listVoicesForLanguage(language = 'pt') {
  try {
    const all = await Speech.getAvailableVoicesAsync();
    const slots = {};
    for (const v of all) {
      const info = classifyVoice(v);
      if (!info) continue;
      if (info.langGroup !== language) continue;
      const key = `${info.country}-${info.gender}`;
      const score = priorityScore(v, info);
      const existing = slots[key];
      if (!existing || score > existing.score) {
        slots[key] = { voice: v, info, score };
      }
    }
    const order = language === 'pt'
      ? ['Brasil-M', 'Brasil-F', 'Portugal-M', 'Portugal-F']
      : ['USA-M', 'USA-F', 'UK-M', 'UK-F'];
    return order.map((k) => slots[k]).filter(Boolean).map((s) => s.voice);
  } catch {
    return [];
  }
}

// Compatibilidade com chamadas antigas.
export async function listPortugueseVoices() {
  return listVoicesForLanguage('pt');
}

function storageKeyForLanguage(language) {
  return language === 'en' ? STORAGE_VOICE_EN : STORAGE_VOICE_PT;
}

export async function getSavedVoiceId(language = 'pt') {
  try {
    return await AsyncStorage.getItem(storageKeyForLanguage(language));
  } catch {
    return null;
  }
}

export async function saveVoiceId(id, language = 'pt') {
  try {
    if (id) await AsyncStorage.setItem(storageKeyForLanguage(language), id);
    else await AsyncStorage.removeItem(storageKeyForLanguage(language));
  } catch {}
}

export async function getSavedRate() {
  try {
    const v = await AsyncStorage.getItem(STORAGE_RATE);
    const n = v ? parseFloat(v) : NaN;
    return Number.isFinite(n) ? n : 0.95;
  } catch {
    return 0.95;
  }
}

export async function saveRate(rate) {
  try {
    await AsyncStorage.setItem(STORAGE_RATE, String(rate));
  } catch {}
}

// Resolve a voz a ser usada agora: salva pelo usuário pra esse idioma, ou primeira da lista.
export async function resolveVoice(language = 'pt') {
  const saved = await getSavedVoiceId(language);
  const voices = await listVoicesForLanguage(language);
  if (saved) {
    const found = voices.find((v) => v.identifier === saved);
    if (found) return found;
  }
  return voices[0] || null;
}

export function describeVoice(v) {
  if (!v) return { name: 'Voz padrão', badges: [] };
  const info = classifyVoice(v);
  if (info) return { name: info.name, badges: [info.country] };
  return { name: v.name || 'Voz', badges: [] };
}

export function describeVoiceShort(v) {
  const { name, badges } = describeVoice(v);
  return badges.length ? `${name} • ${badges.join(', ')}` : name;
}
