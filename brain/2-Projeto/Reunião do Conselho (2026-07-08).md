---
tags: [projeto, decisao]
atualizado: 2026-07-08
---
# Reunião do Conselho (2026-07-08)

Conselho de administração de IA (12 conselheiros + Presidente Helena Vasquez)
analisou o projeto inteiro. Placar: **7 Aprovar + 5 Aprovar com ressalvas = 12 a 0
no mérito, zero rejeições**. Veredito da Helena: **GO condicional e faseado, como
MINISTÉRIO autossustentável, não startup de venture.**

## Consensos reais

- **O gargalo não é o produto, é a distribuição.** Produto pronto e bom, fundador
  solo sem audiência, pesquisa com zero respostas. Levar gente até o que já existe
  é o risco nº1, não construir mais.
- **A cunha é apologética ("responder quando questionarem sua fé"), não devocional.**
  Ninguém vence Hallow e Capela em oração. Rosário/exame/liturgia viram elenco de apoio.
- **Disposição a pagar se mede por comportamento** (Pix de doação, fake paywall, Van
  Westendorp), não por contagem de survey.
- **Uma campanha de recrutamento, não cinco**: o Círculo Fundador (~50) é beta +
  entrevistas + voluntários + primeiros doadores. Separado, 15-20 macro-embaixadores
  para alcance.
- **Instrumentar analytics ANTES do teste fechado.** Hoje o app tem zero medição.
- **Sequência de monetização travada**: núcleo sempre grátis; Pix (doação pura) agora;
  premium/B2B só após D7≥20% provado e ME no Simples.

## Pontos-cegos (o que ninguém tinha levantado)

1. **Mercado EN abandonado**: app já bilíngue, custo marginal zero, ARPU anglófono de
   apologética 5-10x o BR. Maior aposta assimétrica da mesa, quase ignorada. Decidir:
   testar EN ou congelar a manutenção EN (senão paga imposto de conteúdo em dobro).
2. **Falta kill-metric de AQUISIÇÃO, só de retenção**: o primeiro portão de morte é a
   waitlist (200 e-mails/30 dias com ≤3 embaixadores). Sem isso, D7 mede retenção de um
   público que talvez nunca chegue.
3. **Card compartilhável é o motor de crescimento P0**, não item secundário. Cada
   resposta de objeção como card de WhatsApp (objeção + resposta + fonte + marca) é
   aquisição embutida e de graça.
4. **Risco adversarial/brigading**: app de apologética é combativo por design.
   Comunidades protestantes/ateias podem coordenar 1-estrela. Precisa de kit de crise.
5. **Imprimatur/Nihil Obstat como MOAT ofensivo**, não só defesa: aval eclesiástico
   formal é selo que nenhum concorrente tem.
6. **A decisão de FRAME (ministério x negócio) nunca foi cravada** e muda tudo (o que
   é sucesso, como recruta, por que é grátis). Roberto precisa declarar por escrito.
7. **O gancho diário tem teto de 53 dias**: se a "objeção do dia" só cicla os 53
   diálogos, repete em ~2 meses e a retenção que o plano assume desmorona. Precisa de
   cadência editorial.

## Achados de código verificados (reais, não teoria)

- **`src/sentry.js` viola a política publicada**: `sendDefaultPii: true` + session
  replay ligados, enquanto `docs/privacy.html` diz "Não rastreamos seu comportamento
  de uso". Declaração falsa no ar. URGENTE.
- **Sem exclusão de conta in-app**: bloqueio certo em Apple 5.1.1(v) e Google Play.
- **Bíblia Ave Maria sob copyright**: risco de takedown. Trocar por Figueiredo
  (domínio público, custo zero).
- **Typo "biblicas"** em `OnboardingScreen.jsx` (falta acento em "bíblicas").
- **Badges "Em breve"** na landing capturam zero: virar waitlist.

## Plano priorizado (Helena)

### 7 dias (desacoplado do app)
- Waitlist no ar na landing (troca badges "Em breve", grava lead com consentimento LGPD).
- Reposicionar a dobra: tagline "Saiba responder quando questionarem a sua fé, com
  fontes e com respeito". "Apologética" só na eyebrow/SEO.
- Roberto escreve o doc de compromisso (frame ministério x negócio, teto de horas, SLA).
- Trocar Ave Maria → Figueiredo. Corrigir `sentry.js` (PII/replay). Registrar marca INPI.
- Abrir a campanha única de recrutamento (survey + 15-20 embaixadores nomeados).

### 30 dias
- Gate 1 do app: exclusão de conta, OTA/EAS Update testado, analytics (~15 eventos),
  onboarding v2 (2 perguntas → diálogo em <60s), acessibilidade P0, política única.
- Recrutar e nomear revisor teológico credenciado. Kill-gate: 200 e-mails de waitlist.
- Teste fechado no Google Play para o Círculo Fundador (~50).

### 90 dias
- Soft-launch 100-300, medir D7 (kill-metric: D7<10% para de escalar). Auditoria
  doutrinária das ~540 unidades. Teste de doação Pix. Descoberta B2B (3 LOIs). Card
  compartilhável P0. Testar mercado EN.

## Ligações

- [[Plano de Negócio]]
- [[Pesquisa de Concorrência - Capela e Hallow (UI-UX)]]
- [[Roteiro de Ideias (Roadmap)]] | [[Candidatos à Limpeza]]
