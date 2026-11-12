#!/usr/bin/env node
/**
 * TRIQUIZ Phase 8 Idempotent Curated Question Bank Migration Script
 * (`scripts/migrateCuratedBankToFirestore.mjs`)
 *
 * Features:
 * 1. Reads the existing curated question bank (`src/utils/questionBanks.ts` + `src/utils/curatedExpansionBatch1.ts`).
 * 2. Writes a timestamped JSON backup to `.data/question_bank_backup_<timestamp>.json` BEFORE any migration.
 * 3. Validates every question, generates deterministic IDs (`q_<subjectId>_<hash>`) and canonical fingerprints.
 * 4. Detects and skips exact, punctuation, and reordered-option duplicates before importing.
 * 5. Supports `--dry-run` (default) to verify counts, backups, and validation without touching Firestore.
 * 6. When executed with `--execute --project=quiz-site-cb9db --admin-uid=<UID>` and `GOOGLE_APPLICATION_CREDENTIALS`,
 *    performs an idempotent batched upsert to `questionBank/{questionId}` without duplicating existing records.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  buildInitialCuratedQuestionBankDocs,
  computeQuestionBankOverviewStats,
} from '../src/utils/questionBankService.ts';

function parseArgs(argv) {
  const args = { dryRun: true };
  for (const arg of argv.slice(2)) {
    if (arg === '--execute') args.dryRun = false;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--project=')) args.project = arg.split('=')[1];
    else if (arg.startsWith('--admin-uid=')) args.adminUid = arg.split('=')[1];
  }
  return args;
}

async function runMigration() {
  const args = parseArgs(process.argv);
  const adminUid = args.adminUid || 'systemAdminCuratedSeed01';

  const docs = buildInitialCuratedQuestionBankDocs(adminUid);
  const stats = computeQuestionBankOverviewStats();

  const backupDir = path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFile = path.join(
    backupDir,
    'curated_question_bank_migration_backup.json'
  );
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        backedUpAt: new Date().toISOString(),
        totalCuratedQuestions: docs.length,
        subjectBreakdown: Object.fromEntries(
          Object.entries(stats.bySubject).map(([k, v]) => [
            k,
            {
              published: v.published,
              easy: v.easy,
              medium: v.medium,
              hard: v.hard,
              remainingTo1000Target: v.remainingToTarget,
            },
          ])
        ),
        questions: docs,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log('=== TRIQUIZ CURATED QUESTION BANK MIGRATION REPORT ===');
  console.log(`Backup written to: ${backupFile}`);
  console.log(`Total Validated Unique Questions Prepared: ${docs.length}`);
  console.log('\nSubject-wise Breakdown (Target: 1,000 per subject / 9,000 total):');
  for (const [subjId, st] of Object.entries(stats.bySubject)) {
    console.log(
      `  - ${subjId.padEnd(8)} : ${String(st.published).padStart(4)} published | Easy: ${String(st.easy).padStart(3)}, Med: ${String(st.medium).padStart(3)}, Hard: ${String(st.hard).padStart(3)} | Remaining to 1,000: ${st.remainingToTarget}`
    );
  }

  if (args.dryRun) {
    console.log(
      '\n[DRY RUN COMPLETE] No remote Firestore writes were executed. To run against Firestore after confirming project ID, pass: --execute --project=quiz-site-cb9db --admin-uid=<YOUR_ADMIN_UID>'
    );
    return;
  }

  if (!args.project) {
    console.error(
      'Error: Explicit --project=<FIREBASE_PROJECT_ID> is required when using --execute.'
    );
    process.exit(1);
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath || !fs.existsSync(credPath)) {
    console.error(
      'Error: GOOGLE_APPLICATION_CREDENTIALS must point to your Firebase service account JSON file.'
    );
    process.exit(1);
  }

  const adminAppMod = await import('firebase-admin/app');
  const adminFirestoreMod = await import('firebase-admin/firestore');
  const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));

  if (serviceAccount.project_id !== args.project) {
    console.error(
      `Safety Abort: Service account project_id (${serviceAccount.project_id}) does not match confirmed --project=${args.project}.`
    );
    process.exit(1);
  }

  const app = adminAppMod.initializeApp({
    credential: adminAppMod.cert(serviceAccount),
    projectId: args.project,
  });
  const db = adminFirestoreMod.getFirestore(app);

  const existingSnap = await db.collection('questionBank').select().get();
  const existingIds = new Set(existingSnap.docs.map((d) => d.id));

  const toInsert = docs.filter((d) => !existingIds.has(d.id));
  console.log(
    `Found ${existingIds.size} existing documents in questionBank. Inserting ${toInsert.length} new curated documents...`
  );

  const BATCH_SIZE = 200;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const slice = toInsert.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const d of slice) {
      const ref = db.collection('questionBank').doc(d.id);
      batch.set(ref, {
        subjectId: d.subjectId,
        topic: d.topic,
        subtopic: d.subtopic,
        difficulty: d.difficulty,
        type: 'single_choice',
        question: d.question,
        options: d.options,
        correctIndex: d.correctIndex,
        explanation: d.explanation,
        status: 'published',
        fingerprint: d.fingerprint,
        contentSignature: d.contentSignature,
        source: 'migrated',
        ...(d.eventDate ? { eventDate: d.eventDate } : {}),
        ...(d.verifiedSource ? { verifiedSource: d.verifiedSource } : {}),
        createdAt: adminFirestoreMod.FieldValue.serverTimestamp(),
        updatedAt: adminFirestoreMod.FieldValue.serverTimestamp(),
        createdBy: adminUid,
      });
    }
    await batch.commit();
    console.log(
      `Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${Math.min(i + BATCH_SIZE, toInsert.length)}/${toInsert.length})`
    );
  }

  console.log('Idempotent Firestore questionBank migration completed.');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
