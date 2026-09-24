import { Linking, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { pick } from '../utils/i18nData';
import { SectionTitle } from '../components/ui';

// E-mails e endereços citados no texto viram links (mailto: / https://).
const LINK_RE = /([\w.+-]+@[\w-]+\.[\w.-]*\w|(?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\.(?:app|com|org|net|io|br)\b\S*)/gi;

const hrefOf = (s) => {
  if (s.includes('@')) return `mailto:${s}`;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

// Parágrafo em text('body') com os links em tint.
function LinkedText({ children, style }) {
  const { colors } = useTheme();
  const parts = String(children).split(LINK_RE);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            role="link"
            style={{ color: colors.tint }}
            onPress={() => Linking.openURL(hrefOf(part)).catch(() => {})}
          >
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}

// Tela única que renderiza Política de Privacidade OU Termos de Uso,
// conforme o param `kind` (privacy | terms). Conteúdo embarcado para não
// depender de hospedagem externa; bilíngue no padrão campo/campoEn, lido
// com `pick`.
export default function LegalScreen({ route }) {
  const { colors, tokens, text } = useTheme();
  const { isEn } = useLanguage();
  const { space } = tokens;
  const kind = route?.params?.kind || 'privacy';
  const content = kind === 'terms' ? TERMS : PRIVACY;
  const inset = { marginHorizontal: space.md };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: space.lg, paddingBottom: space.xxl }}
    >
      <Text role="heading" style={[text('title'), { color: colors.text }, inset]}>{pick(content, 'title', isEn)}</Text>
      <Text style={[text('footnote'), { color: colors.textSubtle, marginTop: space.xxs }, inset]}>
        {pick(content, 'updated', isEn)}
      </Text>
      {content.sections.map((s, i) => (
        <View key={i}>
          <SectionTitle title={pick(s, 'heading', isEn)} />
          <LinkedText style={[text('body'), { color: colors.text }, inset]}>{pick(s, 'body', isEn)}</LinkedText>
        </View>
      ))}
    </ScrollView>
  );
}

const PRIVACY = {
  title: 'Política de Privacidade',
  titleEn: 'Privacy Policy',
  updated: 'Atualizada em 23 de maio de 2026.',
  updatedEn: 'Updated on May 23, 2026.',
  sections: [
    {
      heading: 'O que coletamos',
      headingEn: 'What we collect',
      body: 'Se você criar uma conta, coletamos seu e-mail e nome de exibição (opcional) para autenticação via Firebase Authentication. Suas marcações na Bíblia e notas pessoais são salvas no Firestore associadas ao seu UID. Seus favoritos ficam salvos apenas no aparelho. Se você usar o app como visitante, nenhum dado é enviado a servidores nossos: tudo fica só no aparelho.',
      bodyEn: 'If you create an account, we collect your email and display name (optional) for authentication via Firebase Authentication. Your Bible highlights and personal notes are stored in Firestore associated with your UID. Your favorites are stored on the device only. If you use the app as a guest, no data is sent to our servers: everything stays only on the device.',
    },
    {
      heading: 'Por que coletamos',
      headingEn: 'Why we collect',
      body: 'Para que suas marcações e notas fiquem sincronizadas entre dispositivos quando você faz login. Não usamos seus dados para publicidade, marketing ou perfilamento.',
      bodyEn: 'So that your highlights and notes stay synced across devices when you sign in. We do not use your data for advertising, marketing, or profiling.',
    },
    {
      heading: 'Crash reporting (Sentry)',
      headingEn: 'Crash reporting (Sentry)',
      body: 'Usamos Sentry apenas para relatórios de erro (crash reporting), sem gravação de sessão nem análise de comportamento. Esses relatórios contêm informações técnicas (versão do sistema, modelo do aparelho, trecho de código que falhou) e, conforme configuração padrão do Sentry, podem incluir IP. Não enviamos conteúdo de suas notas, marcações ou favoritos.',
      bodyEn: 'We use Sentry only for crash reporting, with no session recording or behavior analytics. These reports contain technical information (OS version, device model, code snippet that failed) and, per Sentry default configuration, may include IP. We do not send the content of your notes, highlights, or favorites.',
    },
    {
      heading: 'Liturgia diária',
      headingEn: 'Daily liturgy',
      body: 'A leitura litúrgica de hoje é buscada na API pública liturgia.up.railway.app sob demanda. Nenhum dado pessoal seu é enviado nessa requisição. Sem internet, esse card mostra mensagem orientando a abrir com conexão.',
      bodyEn: 'Today\'s liturgical reading is fetched from the public API liturgia.up.railway.app on demand. No personal data of yours is sent in that request. Offline, this card shows a message asking you to open with a connection.',
    },
    {
      heading: 'Notificações',
      headingEn: 'Notifications',
      body: 'Se você habilitar lembretes (versículo do dia, liturgia de domingo, quiz diário), eles são agendados localmente no seu aparelho via expo-notifications. Não enviamos push remotos.',
      bodyEn: 'If you enable reminders (verse of the day, Sunday liturgy, daily quiz), they are scheduled locally on your device via expo-notifications. We do not send remote push.',
    },
    {
      heading: 'Direitos seus',
      headingEn: 'Your rights',
      body: 'Você pode sair da conta a qualquer momento em Ajustes. Para apagar permanentemente sua conta e dados sincronizados, envie e-mail solicitando exclusão (contato abaixo). Sob a LGPD (Brasil) e o GDPR (EU), você tem direito de acesso, correção e exclusão dos seus dados.',
      bodyEn: 'You can sign out at any time in Settings. To permanently delete your account and synced data, send an email requesting deletion (contact below). Under LGPD (Brazil) and GDPR (EU), you have the right to access, correct, and delete your data.',
    },
    {
      heading: 'Crianças',
      headingEn: 'Children',
      body: 'O app é apropriado para todas as idades. Não pedimos data de nascimento. Pais devem supervisionar o uso por crianças menores de 13 anos, especialmente quanto à criação de conta.',
      bodyEn: 'The app is appropriate for all ages. We do not ask for date of birth. Parents should supervise use by children under 13, especially regarding account creation.',
    },
    {
      heading: 'Contato',
      headingEn: 'Contact',
      body: 'Dúvidas sobre privacidade ou solicitações de exclusão: deusosfera@gmail.com',
      bodyEn: 'Privacy questions or deletion requests: deusosfera@gmail.com',
    },
  ],
};

const TERMS = {
  title: 'Termos de Uso',
  titleEn: 'Terms of Use',
  updated: 'Atualizados em 23 de maio de 2026.',
  updatedEn: 'Updated on May 23, 2026.',
  sections: [
    {
      heading: 'Sobre o app',
      headingEn: 'About the app',
      body: 'O APPologética é um aplicativo gratuito de estudo e evangelização católica. Reúne artigos de apologética, Bíblia católica (Ave Maria em PT, Douay-Rheims em EN), referências bíblicas, glossário, plano de leitura, exame de consciência, Rosário e ferramentas de estudo (marcações, notas, favoritos).',
      bodyEn: 'APPologética is a free Catholic study and evangelization app. It brings together apologetics articles, the Catholic Bible (Ave Maria in PT, Douay-Rheims in EN), biblical references, glossary, reading plan, examination of conscience, Rosary, and study tools (highlights, notes, favorites).',
    },
    {
      heading: 'Uso aceitável',
      headingEn: 'Acceptable use',
      body: 'Use o app dentro da legalidade e do bom senso. Não tente extrair em massa, automatizar acesso ou usar para fins comerciais sem autorização. Você não pode redistribuir o app modificado fingindo ser oficial.',
      bodyEn: 'Use the app within the law and common sense. Do not attempt mass extraction, automate access, or use for commercial purposes without authorization. You may not redistribute the modified app pretending to be official.',
    },
    {
      heading: 'Conta',
      headingEn: 'Account',
      body: 'Você é responsável pela segurança da sua conta e pela veracidade das informações fornecidas. Podemos suspender contas que violem estes termos ou que sejam usadas para fins fraudulentos.',
      bodyEn: 'You are responsible for the security of your account and the truthfulness of the information provided. We may suspend accounts that violate these terms or are used for fraudulent purposes.',
    },
    {
      heading: 'Conteúdo religioso',
      headingEn: 'Religious content',
      body: 'O conteúdo apologético reflete o Magistério da Igreja Católica. As referências bíblicas e do Catecismo provêm de fontes oficiais publicamente disponíveis. Os artigos próprios são escritos com diligência e revisão, mas não substituem orientação pastoral pessoal.',
      bodyEn: 'The apologetic content reflects the Magisterium of the Catholic Church. Biblical and Catechism references come from publicly available official sources. The original articles are written with diligence and revision, but do not replace personal pastoral guidance.',
    },
    {
      heading: 'Sem garantia de disponibilidade',
      headingEn: 'No availability guarantee',
      body: 'O app é oferecido "como está". A liturgia diária depende de uma API pública externa que pode ficar indisponível. Não nos responsabilizamos por interrupções, erros ou consequências do uso. A maior parte do app funciona offline.',
      bodyEn: 'The app is provided "as is". The daily liturgy depends on an external public API that may become unavailable. We are not responsible for interruptions, errors, or consequences of use. Most of the app works offline.',
    },
    {
      heading: 'Alterações destes termos',
      headingEn: 'Changes to these terms',
      body: 'Podemos atualizar estes termos ocasionalmente. Mudanças significativas serão sinalizadas no app. Continuar usando após a mudança significa aceitação.',
      bodyEn: 'We may update these terms occasionally. Significant changes will be flagged in the app. Continuing to use after a change means acceptance.',
    },
    {
      heading: 'Contato',
      headingEn: 'Contact',
      body: 'Para dúvidas legais ou sugestões: deusosfera@gmail.com',
      bodyEn: 'For legal questions or suggestions: deusosfera@gmail.com',
    },
  ],
};
