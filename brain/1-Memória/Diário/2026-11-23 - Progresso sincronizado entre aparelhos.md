# 2026-11-23 · Progresso sincronizado entre aparelhos

**Problema relatado pelo dono:** o celular e o computador não tinham o mesmo nível nem o mesmo progresso. Causa: Jornada, lidos, favoritos, sequência, plano, quiz e Bíblia moravam só no AsyncStorage, por decisão antiga. Só marcações, notas e caderno iam para o Firestore.

**O que foi feito**
- `src/services/progressSync.js`: com conta, cada chave de progresso vira `users/{uid}/progress/{chave}`. Sincroniza ao entrar, ao voltar para o app e 2,5 s depois de cada mudança. Visitante continua só local.
- `src/utils/progressMerge.js` (puro, 11 testes): junta sem perder nada. Lições, lidos, capítulos e dias somam; o XP é recalculado do estado juntado mais o extra das revisões; último aberto, posição e marcador da Bíblia ficam com o mais recente.
- `src/utils/syncSignal.js`: `markProgressDirty` nos módulos que gravam. Zerar a jornada, o plano ou a Bíblia e desmarcar capítulo usam `overwrite` com `epoch`, para o outro aparelho não devolver o que foi apagado.
- Favoritos ganharam `favorites:log` (quando entrou ou saiu cada um), para desfavoritar num aparelho valer no outro.
- `deleteAllUserData` apaga também `progress`. `firestore.rules` não mudou (já cobre `users/{uid}/**`).

**Verificado:** lint, `npm test` (212), roteiro da Bíblia no build web sem erro, favorito gravando o registro como visitante, e uma simulação de dois aparelhos com Firestore falso (somar progresso, desfavoritar, zerar jornada).
**Não verificado:** com a conta real no Firebase (não há credencial aqui). O primeiro uso real é a prova.
