// Ferramenta administrativa (uso pontual, FORA do app) para:
//   1) listar as contas do Firestore e quantos dados cada uma tem (--list)
//   2) juntar os dados de uma conta (UID) em outra (--from X --to Y)
//
// Por que existe: os dados do usuario ficam em users/{uid}/... no Firestore,
// indexados pelo UID. Quem entrou com email/senha e tambem com Google (mesmo
// email) pode ter acabado com DUAS contas (dois UIDs) e dados separados. Este
// script copia notas/destaques/caderno de um UID para o outro.
//
// Requer uma chave de service account do Firebase (acesso admin):
//   Firebase Console -> Project Settings -> Service accounts -> Generate new
//   private key -> salvar em ./.secrets/serviceAccount.json (esta pasta esta
//   no .gitignore; a chave NUNCA deve ser commitada).
//
// Uso:
//   node scripts/merge-accounts.mjs --list
//   node scripts/merge-accounts.mjs --from <uidOrigem> --to <uidDestino> --dry-run
//   node scripts/merge-accounts.mjs --from <uidOrigem> --to <uidDestino>
//   node scripts/merge-accounts.mjs --from <uidOrigem> --to <uidDestino> --delete-source
//
// Instalar a dependencia uma vez: npm i -D firebase-admin

import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Subcolecoes de dados do usuario (ver src/services/userData.js)
const SUBCOLLECTIONS = ['highlights', 'notes', 'notebook'];

function loadCredentialPath() {
  const env = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidates = [env, './.secrets/serviceAccount.json'].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  console.error(
    'Chave de service account nao encontrada.\n' +
    'Baixe em Firebase Console -> Project Settings -> Service accounts -> ' +
    'Generate new private key e salve em ./.secrets/serviceAccount.json\n' +
    '(ou aponte GOOGLE_APPLICATION_CREDENTIALS para o arquivo).'
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--list') args.list = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--delete-source') args.deleteSource = true;
    else if (a === '--from') args.from = argv[++i];
    else if (a === '--to') args.to = argv[++i];
    else args._.push(a);
  }
  return args;
}

async function countSub(db, uid, sub) {
  try {
    const snap = await db.collection('users').doc(uid).collection(sub).count().get();
    return snap.data().count;
  } catch {
    return 0;
  }
}

async function userInfo(uid) {
  try {
    const u = await getAuth().getUser(uid);
    const providers = u.providerData.map((p) => p.providerId).join(',') || '(nenhum)';
    return { email: u.email || '(sem email)', providers };
  } catch {
    return { email: '(sem registro de auth)', providers: '-' };
  }
}

async function listAll(db) {
  const refs = await db.collection('users').listDocuments();
  if (!refs.length) {
    console.log('Nenhum documento em users/. (Talvez ninguem tenha salvo dados ainda.)');
    return;
  }
  console.log(`Encontrados ${refs.length} UID(s) em users/:\n`);
  for (const ref of refs) {
    const uid = ref.id;
    const { email, providers } = await userInfo(uid);
    const counts = {};
    for (const sub of SUBCOLLECTIONS) counts[sub] = await countSub(db, uid, sub);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`UID: ${uid}`);
    console.log(`  email: ${email}   provedores: ${providers}`);
    console.log(`  ${SUBCOLLECTIONS.map((s) => `${s}=${counts[s]}`).join('  ')}  (total ${total})\n`);
  }
  console.log('Para juntar: node scripts/merge-accounts.mjs --from <origem> --to <destino> --dry-run');
}

async function merge(db, from, to, { dryRun, deleteSource }) {
  if (from === to) {
    console.error('--from e --to nao podem ser o mesmo UID.');
    process.exit(1);
  }
  const fromInfo = await userInfo(from);
  const toInfo = await userInfo(to);
  console.log(`Origem  ${from}  (${fromInfo.email}, ${fromInfo.providers})`);
  console.log(`Destino ${to}  (${toInfo.email}, ${toInfo.providers})`);
  console.log(dryRun ? '\n[DRY-RUN] nada sera gravado.\n' : '\nCopiando...\n');

  let grandTotal = 0;
  for (const sub of SUBCOLLECTIONS) {
    const srcSnap = await db.collection('users').doc(from).collection(sub).get();
    console.log(`${sub}: ${srcSnap.size} doc(s) na origem`);
    if (dryRun || srcSnap.empty) { grandTotal += srcSnap.size; continue; }
    // Copia preservando o id (idempotente: rodar de novo nao duplica).
    let batch = db.batch();
    let n = 0;
    for (const d of srcSnap.docs) {
      const dest = db.collection('users').doc(to).collection(sub).doc(d.id);
      batch.set(dest, d.data(), { merge: true });
      n++;
      if (n % 400 === 0) { await batch.commit(); batch = db.batch(); }
    }
    await batch.commit();
    grandTotal += srcSnap.size;
    console.log(`  -> copiados ${srcSnap.size} para o destino`);
  }

  if (deleteSource && !dryRun) {
    for (const sub of SUBCOLLECTIONS) {
      const srcSnap = await db.collection('users').doc(from).collection(sub).get();
      let batch = db.batch();
      let n = 0;
      for (const d of srcSnap.docs) {
        batch.delete(d.ref);
        n++;
        if (n % 400 === 0) { await batch.commit(); batch = db.batch(); }
      }
      await batch.commit();
    }
    console.log('\nOrigem apagada (--delete-source).');
  }

  console.log(`\nConcluido. ${grandTotal} doc(s) ${dryRun ? 'seriam copiados' : 'processados'}.`);
  if (!dryRun) console.log('Entre no app com a conta de DESTINO para ver os dados.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const credPath = loadCredentialPath();
  const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  if (args.list || (!args.from && !args.to)) {
    await listAll(db);
    return;
  }
  if (!args.from || !args.to) {
    console.error('Informe --from <uid> e --to <uid> (ou use --list).');
    process.exit(1);
  }
  await merge(db, args.from, args.to, { dryRun: !!args.dryRun, deleteSource: !!args.deleteSource });
}

main().catch((e) => { console.error(e); process.exit(1); });
