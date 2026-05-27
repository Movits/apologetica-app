import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Tela única que renderiza Política de Privacidade OU Termos de Uso,
// conforme o param `kind` (privacy | terms). Conteúdo embarcado pra
// não depender de hospedagem externa.
export default function LegalScreen({ route }) {
  const { colors, fs } = useTheme();
  const { isEn } = useLanguage();
  const kind = route?.params?.kind || 'privacy';
  const styles = makeStyles(colors, fs);
  const content = kind === 'terms' ? TERMS : PRIVACY;
  const lang = isEn ? 'en' : 'pt';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{content.title[lang]}</Text>
        <Text style={styles.updated}>{content.updated[lang]}</Text>
        {content.sections.map((s, i) => (
          <View key={i} style={{ marginTop: 18 }}>
            <Text style={styles.section}>{s.heading[lang]}</Text>
            <Text style={styles.body}>{s.body[lang]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const PRIVACY = {
  title: { pt: 'Política de Privacidade', en: 'Privacy Policy' },
  updated: { pt: 'Atualizada em 23 de maio de 2026.', en: 'Updated on May 23, 2026.' },
  sections: [
    {
      heading: { pt: 'O que coletamos', en: 'What we collect' },
      body: {
        pt: 'Se você criar uma conta, coletamos seu e-mail e nome de exibição (opcional) para autenticação via Firebase Authentication. Seus favoritos, marcações na Bíblia e notas pessoais são salvos no Firestore associados ao seu UID. Se você usar o app como visitante, nenhum dado é enviado a servidores nossos: tudo fica só no aparelho.',
        en: 'If you create an account, we collect your email and display name (optional) for authentication via Firebase Authentication. Your favorites, Bible highlights, and personal notes are stored in Firestore associated with your UID. If you use the app as a guest, no data is sent to our servers: everything stays only on the device.',
      },
    },
    {
      heading: { pt: 'Por que coletamos', en: 'Why we collect' },
      body: {
        pt: 'Para que suas marcações, notas e favoritos fiquem sincronizados entre dispositivos quando você faz login. Não usamos seus dados para publicidade, marketing ou perfilamento.',
        en: 'So that your highlights, notes, and favorites stay synced across devices when you sign in. We do not use your data for advertising, marketing, or profiling.',
      },
    },
    {
      heading: { pt: 'Crash reporting (Sentry)', en: 'Crash reporting (Sentry)' },
      body: {
        pt: 'Usamos Sentry para receber relatórios automáticos quando o app trava ou apresenta erro. Esses relatórios contêm informações técnicas (versão do sistema, modelo do aparelho, trecho de código que falhou) e, conforme configuração padrão do Sentry, podem incluir IP. Não enviamos conteúdo de suas notas, marcações ou favoritos.',
        en: 'We use Sentry to receive automatic reports when the app crashes or errors. These reports contain technical information (OS version, device model, code snippet that failed) and, per Sentry default configuration, may include IP. We do not send the content of your notes, highlights, or favorites.',
      },
    },
    {
      heading: { pt: 'Liturgia diária', en: 'Daily liturgy' },
      body: {
        pt: 'A leitura litúrgica de hoje é buscada na API pública liturgia.up.railway.app sob demanda. Nenhum dado pessoal seu é enviado nessa requisição. Sem internet, esse card mostra mensagem orientando a abrir com conexão.',
        en: 'Today\'s liturgical reading is fetched from the public API liturgia.up.railway.app on demand. No personal data of yours is sent in that request. Offline, this card shows a message asking you to open with a connection.',
      },
    },
    {
      heading: { pt: 'Notificações', en: 'Notifications' },
      body: {
        pt: 'Se você habilitar lembretes (versículo do dia, liturgia de domingo, quiz diário), eles são agendados localmente no seu aparelho via expo-notifications. Não enviamos push remotos.',
        en: 'If you enable reminders (verse of the day, Sunday liturgy, daily quiz), they are scheduled locally on your device via expo-notifications. We do not send remote push.',
      },
    },
    {
      heading: { pt: 'Direitos seus', en: 'Your rights' },
      body: {
        pt: 'Você pode sair da conta a qualquer momento em Ajustes. Para apagar permanentemente sua conta e dados sincronizados, envie e-mail solicitando exclusão (contato abaixo). Sob a LGPD (Brasil) e o GDPR (EU), você tem direito de acesso, correção e exclusão dos seus dados.',
        en: 'You can sign out at any time in Settings. To permanently delete your account and synced data, send an email requesting deletion (contact below). Under LGPD (Brazil) and GDPR (EU), you have the right to access, correct, and delete your data.',
      },
    },
    {
      heading: { pt: 'Crianças', en: 'Children' },
      body: {
        pt: 'O app é apropriado para todas as idades. Não pedimos data de nascimento. Pais devem supervisionar o uso por crianças menores de 13 anos, especialmente quanto à criação de conta.',
        en: 'The app is appropriate for all ages. We do not ask for date of birth. Parents should supervise use by children under 13, especially regarding account creation.',
      },
    },
    {
      heading: { pt: 'Contato', en: 'Contact' },
      body: {
        pt: 'Dúvidas sobre privacidade ou solicitações de exclusão: apologetica.app@proton.me',
        en: 'Privacy questions or deletion requests: apologetica.app@proton.me',
      },
    },
  ],
};

const TERMS = {
  title: { pt: 'Termos de Uso', en: 'Terms of Use' },
  updated: { pt: 'Atualizados em 23 de maio de 2026.', en: 'Updated on May 23, 2026.' },
  sections: [
    {
      heading: { pt: 'Sobre o app', en: 'About the app' },
      body: {
        pt: 'O APPologética é um aplicativo gratuito de estudo e evangelização católica. Reúne artigos de apologética, Bíblia católica (Ave Maria em PT, Douay-Rheims em EN), referências bíblicas, glossário, plano de leitura, exame de consciência, Rosário e ferramentas de estudo (marcações, notas, favoritos).',
        en: 'APPologética is a free Catholic study and evangelization app. It brings together apologetics articles, the Catholic Bible (Ave Maria in PT, Douay-Rheims in EN), biblical references, glossary, reading plan, examination of conscience, Rosary, and study tools (highlights, notes, favorites).',
      },
    },
    {
      heading: { pt: 'Uso aceitável', en: 'Acceptable use' },
      body: {
        pt: 'Use o app dentro da legalidade e do bom senso. Não tente extrair em massa, automatizar acesso ou usar para fins comerciais sem autorização. Você não pode redistribuir o app modificado fingindo ser oficial.',
        en: 'Use the app within the law and common sense. Do not attempt mass extraction, automate access, or use for commercial purposes without authorization. You may not redistribute the modified app pretending to be official.',
      },
    },
    {
      heading: { pt: 'Conta', en: 'Account' },
      body: {
        pt: 'Você é responsável pela segurança da sua conta e pela veracidade das informações fornecidas. Podemos suspender contas que violem estes termos ou que sejam usadas para fins fraudulentos.',
        en: 'You are responsible for the security of your account and the truthfulness of the information provided. We may suspend accounts that violate these terms or are used for fraudulent purposes.',
      },
    },
    {
      heading: { pt: 'Conteúdo religioso', en: 'Religious content' },
      body: {
        pt: 'O conteúdo apologético reflete o Magistério da Igreja Católica. As referências bíblicas e do Catecismo provêm de fontes oficiais publicamente disponíveis. Os artigos próprios são escritos com diligência e revisão, mas não substituem orientação pastoral pessoal.',
        en: 'The apologetic content reflects the Magisterium of the Catholic Church. Biblical and Catechism references come from publicly available official sources. The original articles are written with diligence and revision, but do not replace personal pastoral guidance.',
      },
    },
    {
      heading: { pt: 'Sem garantia de disponibilidade', en: 'No availability guarantee' },
      body: {
        pt: 'O app é oferecido "como está". A liturgia diária depende de uma API pública externa que pode ficar indisponível. Não nos responsabilizamos por interrupções, erros ou consequências do uso. A maior parte do app funciona offline.',
        en: 'The app is provided "as is". The daily liturgy depends on an external public API that may become unavailable. We are not responsible for interruptions, errors, or consequences of use. Most of the app works offline.',
      },
    },
    {
      heading: { pt: 'Alterações destes termos', en: 'Changes to these terms' },
      body: {
        pt: 'Podemos atualizar estes termos ocasionalmente. Mudanças significativas serão sinalizadas no app. Continuar usando após a mudança significa aceitação.',
        en: 'We may update these terms occasionally. Significant changes will be flagged in the app. Continuing to use after a change means acceptance.',
      },
    },
    {
      heading: { pt: 'Contato', en: 'Contact' },
      body: {
        pt: 'Para dúvidas legais ou sugestões: apologetica.app@proton.me',
        en: 'For legal questions or suggestions: apologetica.app@proton.me',
      },
    },
  ],
};

const makeStyles = (c, fs) =>
  StyleSheet.create({
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: fs(20), fontWeight: 'bold', color: c.primaryText },
    updated: { fontSize: fs(11), color: c.textSubtle, fontStyle: 'italic', marginTop: 4 },
    section: { fontSize: fs(15), fontWeight: 'bold', color: c.primaryText, marginBottom: 6 },
    body: { fontSize: fs(14), color: c.text, lineHeight: fs(22) },
  });
