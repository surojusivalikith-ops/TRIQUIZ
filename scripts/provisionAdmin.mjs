#!/usr/bin/env node
/**
 * TRIQUIZ Trusted Server-Side Admin Provisioning Script (`scripts/provisionAdmin.mjs`)
 *
 * Grants or revokes administrator privileges for a Firebase Authentication user using:
 * 1. Firebase Auth Custom Claims (`{ admin: true, role: 'admin' }`)
 * 2. Server-controlled `/admins/{uid}` document in Firestore
 *
 * SECURITY REQUIREMENTS:
 * - Never run this in the browser or expose service account credentials to the frontend.
 * - Requires `GOOGLE_APPLICATION_CREDENTIALS` pointing to your Firebase Admin Service Account JSON
 *   and `--project=quiz-site-cb9db --uid=<FIREBASE_AUTH_UID> --confirm`.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json \
 *   node scripts/provisionAdmin.mjs --project=quiz-site-cb9db --uid=<ADMIN_UID> --confirm
 */

import fs from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg === '--confirm') args.confirm = true;
    else if (arg === '--revoke') args.revoke = true;
    else if (arg.startsWith('--project=')) args.project = arg.split('=')[1];
    else if (arg.startsWith('--uid=')) args.uid = arg.split('=')[1];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const expectedProject = args.project || process.env.FIREBASE_PROJECT_ID;
  const uid = args.uid;

  if (!expectedProject || !uid || !args.confirm) {
    console.error(
      [
        'Usage:',
        '  GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \\',
        '  node scripts/provisionAdmin.mjs --project=quiz-site-cb9db --uid=<FIREBASE_UID> --confirm [--revoke]',
        '',
        'Safety Guard: Refusing to run without explicit --project, --uid, and --confirm flags.',
      ].join('\n')
    );
    process.exit(1);
  }

  if (!/^[A-Za-z0-9]{20,64}$/.test(uid)) {
    console.error(`Error: "${uid}" is not a valid Firebase Authentication UID.`);
    process.exit(1);
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath || !fs.existsSync(credPath)) {
    console.error(
      'Error: GOOGLE_APPLICATION_CREDENTIALS environment variable must point to a valid service account JSON file.'
    );
    process.exit(1);
  }

  const adminAppMod = await import('firebase-admin/app');
  const adminAuthMod = await import('firebase-admin/auth');
  const adminFirestoreMod = await import('firebase-admin/firestore');

  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
  if (
    serviceAccount.project_id &&
    serviceAccount.project_id !== expectedProject
  ) {
    console.error(
      `Project mismatch: service account belongs to "${serviceAccount.project_id}", but --project="${expectedProject}" was specified. Aborting.`
    );
    process.exit(1);
  }

  const app = adminAppMod.initializeApp({
    credential: adminAppMod.cert(serviceAccount),
    projectId: expectedProject,
  });

  const auth = adminAuthMod.getAuth(app);
  const db = adminFirestoreMod.getFirestore(app);

  if (args.revoke) {
    await auth.setCustomUserClaims(uid, { admin: false, role: 'student' });
    await db.collection('admins').doc(uid).delete();
    console.log(
      `Revoked admin custom claims and removed /admins/${uid} in project "${expectedProject}".`
    );
  } else {
    const userRecord = await auth.getUser(uid);
    if (!userRecord.emailVerified) {
      console.error(
        `Error: User ${uid} (${userRecord.email}) does not have a verified email address. Verify email before granting admin access.`
      );
      process.exit(1);
    }

    await auth.setCustomUserClaims(uid, { admin: true, role: 'admin' });
    await db
      .collection('admins')
      .doc(uid)
      .set({
        uid,
        role: 'admin',
        createdAt: adminFirestoreMod.FieldValue.serverTimestamp(),
      });

    console.log(
      `Successfully provisioned admin access (custom claims + /admins/${uid}) for ${userRecord.email} (${uid}) on project "${expectedProject}".`
    );
  }
}

main().catch((err) => {
  console.error('Admin provisioning failed:', err);
  process.exit(1);
});
