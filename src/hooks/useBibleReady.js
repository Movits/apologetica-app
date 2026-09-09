import { useState, useEffect, useCallback } from 'react';
import { ensureBible, isBibleLoaded } from '../services/bibleApi';

// Garante que a tradução do idioma ativo esteja carregada antes da tela mostrar
// texto bíblico. Existe porque a Bíblia deixou de vir no bundle principal
// (ver src/services/bibleApi.js): na web ela é um pedaço baixado sob demanda.
//
// Uso:
//   const { pronta, carregando, erro, tentarDeNovo } = useBibleReady(lang);
//   if (!pronta) return <algum estado de carregamento ou erro/>;
//
// `pronta` já vem true quando o dado está em memória (segunda visita, ou nativo,
// onde o import é resolvido em build), então a tela não pisca à toa.
export function useBibleReady(language) {
  const lang = language === 'en' ? 'en' : 'pt';
  const [pronta, setPronta] = useState(() => isBibleLoaded(lang));
  const [erro, setErro] = useState(false);
  // Muda para forçar nova tentativa depois de uma falha de rede.
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (isBibleLoaded(lang)) {
      setPronta(true);
      setErro(false);
      return undefined;
    }
    let vivo = true;
    setPronta(false);
    setErro(false);
    ensureBible(lang)
      .then(() => { if (vivo) setPronta(true); })
      .catch(() => { if (vivo) setErro(true); });
    return () => { vivo = false; };
  }, [lang, tentativa]);

  const tentarDeNovo = useCallback(() => setTentativa((n) => n + 1), []);

  return { pronta, carregando: !pronta && !erro, erro, tentarDeNovo };
}
