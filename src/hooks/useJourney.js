import { useEffect, useState } from 'react';
import { getJourney, subscribeJourney } from '../utils/journeyStore';

// Estado da Jornada (src/utils/journeyStore.js) para as telas: lê uma vez e
// acompanha cada mudança (um evento aplicado em qualquer tela atualiza a
// Início, a lista de artigos e o próprio artigo). `null` enquanto carrega,
// para a tela não desenhar "nada respondido" e logo trocar.
export function useJourney() {
  const [state, setState] = useState(null);
  useEffect(() => {
    let alive = true;
    getJourney().then((s) => { if (alive) setState(s); });
    const unsub = subscribeJourney((s) => { if (alive) setState(s); });
    return () => { alive = false; unsub(); };
  }, []);
  return state;
}
