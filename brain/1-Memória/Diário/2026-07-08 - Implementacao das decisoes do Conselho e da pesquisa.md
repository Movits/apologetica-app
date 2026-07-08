---
tags: [memoria, diario]
atualizado: 2026-07-08
---
# 2026-07-08 - Implementação das decisões do Conselho e da pesquisa

Implementei em 11 ondas (cada uma com lint + `npx expo export -p web` verde e
commit próprio) as mudanças de código que saíram da pesquisa de UI/UX
([[Pesquisa de Concorrência - Capela e Hallow (UI-UX)]]) e da
[[Reunião do Conselho (2026-07-08)]].

## O que entrou

1. **Conformidade**: `sentry.js` crash-only (sem PII/replay), políticas
   (`privacy.html` + `LegalScreen`) alinhadas à realidade (Sentry, favoritos
   são locais), typo do onboarding.
2. **Acessibilidade P0**: token `accentText` (dourado AA), 53 textos migrados
   (mantendo dourado sobre navy), piso de fonte, alvos de toque, ✝ → CrossMark.
3. **Onboarding v2**: ativação em 2 perguntas que abre um diálogo relevante.
4. **Busca full-text na Bíblia** inteira (offline).
5. **Card compartilhável** de resposta (crescimento P0).
6. **Landing**: reposicionada na cunha, waitlist (Google Form placeholder),
   página "Por que é grátis".
7. **Exclusão de conta in-app** + age gate 13+ (bloqueadores de loja).
8. **Deeplinks** (nativo) para artigo/referência/diálogo/versículo.
9. **Plano de leitura**: streak + trilha "Objeções protestantes".
10. **Home**: banner de estação litúrgica local + linha da cunha.
11. **Notificação "Objeção do dia"** opt-in.

## Pendências que dependem do usuário (não são código)

- Trocar a URL placeholder do Google Form na waitlist (`docs/index.html`).
- E-mail da marca (ainda `deusosfera@gmail`/`robertomovits@gmail`).
- Decidir o frame (ministério x negócio); INPI; ME; revisor teológico.
- Ave Maria → Figueiredo (precisa da fonte de dados).
- Analytics/feedback e waitlist-no-Firebase (adiados por decisão de privacidade).
- EAS Update/OTA (config depende da conta EAS).
- Smoke tests manuais no celular: onboarding, busca na Bíblia, card, exclusão
  de conta, streak.
