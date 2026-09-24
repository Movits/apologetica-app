// Narração longa com expo-speech (Onda 8, S6). Fica separado de tts.js de
// propósito: tts.js é puro e testável no Node, e este arquivo é o único que
// importa expo-speech. Não importe expo-speech direto nas telas para narrar
// texto longo; use speakLong/stopSpeaking daqui.
//
// speakLong(text, opts) fatia o texto com chunkText (4000 caracteres, limite do
// Android) e fala os pedaços em sequência encadeando o onDone de cada um.
// `opts` leva as opções do Speech.speak (language, voice, rate, pitch) mais os
// callbacks finais, chamados uma vez só para a narração inteira:
//   onStart   ao começar o primeiro pedaço
//   onDone    ao terminar o último pedaço
//   onStopped se o sistema interromper a fala (perda de foco de áudio etc.)
//   onError   no primeiro erro (a fila para)
// stopSpeaking() interrompe a fila atual sem chamar callbacks: quem chamou já
// sabe que parou (é o que as telas fazem hoje depois de Speech.stop()).

import * as Speech from 'expo-speech';
import { chunkText } from './tts';

export const MAX_UTTERANCE = 4000;

// Identifica a narração em curso. Qualquer stopSpeaking() ou nova narração
// invalida a anterior, então um onDone atrasado de um pedaço antigo não dispara
// o pedaço seguinte por cima da narração nova.
let current = 0;

export function speakLong(text, opts = {}) {
  const { onStart, onDone, onStopped, onError, maxChunk = MAX_UTTERANCE, ...speechOpts } = opts;
  const chunks = chunkText(text, maxChunk);
  const mine = ++current;
  if (!chunks.length) {
    onDone?.();
    return;
  }
  const alive = () => mine === current;
  let idx = 0;
  const speakNext = () => {
    if (!alive()) return;
    if (idx >= chunks.length) {
      onDone?.();
      return;
    }
    const i = idx++;
    Speech.speak(chunks[i], {
      ...speechOpts,
      onStart: i === 0 ? onStart : undefined,
      onDone: speakNext,
      onStopped: () => {
        if (!alive()) return;
        current++;
        onStopped?.();
      },
      onError: (err) => {
        if (!alive()) return;
        current++;
        onError?.(err);
      },
    });
  };
  speakNext();
}

// Para a narração em curso (e qualquer pedaço ainda na fila).
export function stopSpeaking() {
  current++;
  return Speech.stop();
}

// Atalho para o isSpeakingAsync do expo-speech.
export function isSpeaking() {
  return Speech.isSpeakingAsync();
}
