import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BANK,
  GK_CATEGORIES,
  SUBJECTS,
  computeQuestionContentSignature,
  computeQuestionFingerprint,
  generateUniqueQuizQuestions,
  getNextUnlimitedQuestion,
  getNextUniqueQuestion,
  isQuestionInSignatureSet,
  normalizeQuestionSignature,
  registerQuestionInSignatureSet,
  selectQuizQuestions,
} from './questionEngine';
import { QUESTION_BANK_AUDIT_REPORT } from './questionBanks';
import {
  computeLeaderboardRows,
  evaluateFirestoreAccessRule,
  isValidFirebaseAuthUid,
  mergeAttemptIntoUserScore,
  validateAttemptPayload,
  validateDisplayName,
  validateLeaderboardUserDoc,
} from './leaderboardEngine';
import {
  buildConsistentScorePayloadFromRawSubjects,
  getAttemptedSignaturesForSubject,
  getSeenSignaturesForSubject,
  isAttemptIdAlreadySubmitted,
  loadActiveQuizSession,
  recordQuestionAttempted,
  recordQuestionPresented,
  saveActiveQuizSession,
} from './apiService';

// Setup an in-memory Web Storage polyfill for Node.js tests so localStorage/sessionStorage persistence is tested
function installMemoryStorage() {
  const createStore = () => {
    const map = new Map<string, string>();
    return {
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => {
        map.set(k, String(v));
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
      clear: () => {
        map.clear();
      },
    };
  };
  const g = globalThis as any;
  if (!g.localStorage) g.localStorage = createStore();
  if (!g.sessionStorage) g.sessionStorage = createStore();
}
installMemoryStorage();

const UID_USER_1 = 'k8xJ9pL2mN4qR7vW1yZ3aB5cD6eF';
const UID_USER_2 = 'm2pQ5rT8vW1xY4zA7bC0dE3fG6hI';
const UID_USER_3 = 'p9sV2wZ5bE8hK1nQ4tW7yA0dF3gJ';

test('Audit Verification: all 9 subjects exist, bank has 750+ unique curated questions, zero duplicates, and corrected answer keys', () => {
  assert.equal(SUBJECTS.length, 9);
  assert.ok(
    QUESTION_BANK_AUDIT_REPORT.totalUniqueCuratedQuestionsRetained >= 750
  );
  assert.equal(QUESTION_BANK_AUDIT_REPORT.answerKeysCorrectedCount, 3);

  for (const subj of SUBJECTS) {
    const list = BANK[subj.id];
    assert.ok(
      Array.isArray(list) && list.length >= 30,
      `Bank for ${subj.id} must have at least 30 curated questions`
    );
    const seenStems = new Set<string>();
    for (const q of list) {
      assert.ok(q.text.length > 5, `Question text too short in ${subj.id}`);
      assert.equal(
        q.opts.length,
        4,
        `Question must have 4 options: ${q.text}`
      );
      assert.ok(
        q.ans >= 0 && q.ans < 4,
        `Answer index out of range: ${q.text}`
      );
      assert.ok(
        typeof q.exp === 'string' && q.exp.trim().length > 10,
        `Missing explanation for: ${q.text}`
      );
      const stem = normalizeQuestionSignature(q.text);
      assert.equal(
        seenStems.has(stem),
        false,
        `Curated bank for ${subj.id} contains duplicate stem: ${q.text}`
      );
      seenStems.add(stem);
    }
  }
});

test('Scenario 1: Single user completing a test and appearing on the leaderboard (overall and subject-wise)', () => {
  const singleUser = mergeAttemptIntoUserScore(null, UID_USER_1, 'Alice Rao', {
    subject: 'python',
    score: 14,
    total: 15,
  });

  const overall = computeLeaderboardRows([singleUser], 'all');
  assert.equal(overall.length, 1);
  assert.equal(overall[0].uid, UID_USER_1);
  assert.equal(overall[0].name, 'Alice Rao');
  assert.equal(overall[0].score, 14);
  assert.equal(overall[0].total, 15);
  assert.equal(overall[0].pct, 93);
  assert.equal(overall[0].subjects, 1);
  assert.equal(overall[0].rank, 1);

  const pyRank = computeLeaderboardRows([singleUser], 'python');
  assert.equal(pyRank.length, 1);
  assert.equal(pyRank[0].uid, UID_USER_1);
  assert.equal(pyRank[0].name, 'Alice Rao');
  assert.equal(pyRank[0].rank, 1);
});

test('Scenarios 2, 3, 4, 5 & 6: Multiple users in rank order, score improvement, lower score retention, subject-wise vs overall rankings', () => {
  // Scenario 3 & 4: User 1 starts with 12/15 in Python, then scores lower (9/15), then improves to 14/15
  let doc1 = mergeAttemptIntoUserScore(null, UID_USER_1, 'Alice Rao', {
    subject: 'python',
    score: 12,
    total: 15,
  });
  assert.equal(doc1.subjects.python.score, 12);

  // Scenario 4: Same user scoring lower than previous best -> retains 12/15
  doc1 = mergeAttemptIntoUserScore(doc1, UID_USER_1, 'Alice Rao', {
    subject: 'python',
    score: 9,
    total: 15,
  });
  assert.equal(doc1.subjects.python.score, 12);

  // Scenario 3: Same user improving score -> updates to 14/15
  doc1 = mergeAttemptIntoUserScore(doc1, UID_USER_1, 'Alice Rao', {
    subject: 'python',
    score: 14,
    total: 15,
  });
  assert.equal(doc1.subjects.python.score, 14);

  // Add second subject (Java 13/15)
  doc1 = mergeAttemptIntoUserScore(doc1, UID_USER_1, 'Alice Rao', {
    subject: 'java',
    score: 13,
    total: 15,
  });
  assert.equal(doc1.overallScore, 27);
  assert.equal(doc1.overallTotal, 30);
  assert.equal(doc1.subjectsCount, 2);

  // User 2: Python 15/15 (100%)
  const doc2 = mergeAttemptIntoUserScore(null, UID_USER_2, 'Bob Kumar', {
    subject: 'python',
    score: 15,
    total: 15,
  });

  // User 3: Python 28/30 (93.33%)
  const doc3 = mergeAttemptIntoUserScore(null, UID_USER_3, 'Chitra Singh', {
    subject: 'python',
    score: 28,
    total: 30,
  });

  // Scenario 6: Overall leaderboard ranking (by total points desc, then accuracy desc)
  const overallRows = computeLeaderboardRows([doc1, doc2, doc3], 'all');
  assert.equal(overallRows.length, 3);
  assert.equal(overallRows[0].uid, UID_USER_3);
  assert.equal(overallRows[0].rank, 1);
  assert.equal(overallRows[1].uid, UID_USER_1);
  assert.equal(overallRows[1].rank, 2);
  assert.equal(overallRows[2].uid, UID_USER_2);
  assert.equal(overallRows[2].rank, 3);

  // Scenario 5: Subject-wise leaderboard ranking (by subject accuracy desc, then subject score desc)
  const pythonRows = computeLeaderboardRows([doc1, doc2, doc3], 'python');
  assert.equal(pythonRows.length, 3);
  assert.equal(pythonRows[0].uid, UID_USER_2); // 100%
  assert.equal(pythonRows[0].rank, 1);
  assert.equal(pythonRows[1].uid, UID_USER_3); // 93.33%, 28 pts
  assert.equal(pythonRows[1].rank, 2);
  assert.equal(pythonRows[2].uid, UID_USER_1); // 93.33%, 14 pts
  assert.equal(pythonRows[2].rank, 3);
});

test('Scenario 7: User display-name update reflected in rankings with serverTimestamp', () => {
  const serverTimeToken = Symbol('SERVER_TIMESTAMP');
  const existingSubjects = {
    python: { score: 14, total: 15, pct: 93.33 },
    crt: { score: 12, total: 15, pct: 80 },
  };

  const updatedPayload = buildConsistentScorePayloadFromRawSubjects(
    'Dr. Alice Rao',
    existingSubjects,
    serverTimeToken
  );
  assert.ok(updatedPayload !== null);
  assert.equal(updatedPayload.name, 'Dr. Alice Rao');
  assert.equal(updatedPayload.updatedAt, serverTimeToken);

  const rows = computeLeaderboardRows(
    [
      {
        uid: UID_USER_1,
        ...updatedPayload,
        updatedAt: Date.now(),
      },
    ],
    'all'
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Dr. Alice Rao');
});

test('Scenarios 8 & 9: No duplicate questions within a single test OR across multiple consecutive tests for the same user', () => {
  for (const subj of SUBJECTS) {
    const userSeenHistory = new Set<string>();
    const allGeneratedFingerprints = new Set<string>();
    const allGeneratedContentSigs = new Set<string>();

    // Run 4 consecutive 15-question tests (60 questions total per subject) for the same user
    for (let testRun = 0; testRun < 4; testRun++) {
      const batch = selectQuizQuestions(subj.id, 15, userSeenHistory, null, {
        recordIntoProvidedSet: true,
      });
      assert.equal(
        batch.questions.length,
        15,
        `Expected 15 unique questions on run ${testRun + 1} for ${subj.id}`
      );
      assert.equal(batch.poolExhausted, false);

      const withinTestSigs = new Set<string>();
      for (const q of batch.questions) {
        const contentSig = computeQuestionContentSignature(q, subj.id);
        const fp = computeQuestionFingerprint(q, subj.id);

        // Scenario 8: No duplicates within a single test
        assert.equal(
          withinTestSigs.has(contentSig),
          false,
          `Duplicate within single test in ${subj.id}: ${q.text}`
        );
        withinTestSigs.add(contentSig);

        // Scenario 9: No duplicates across multiple consecutive tests for the same user
        assert.equal(
          allGeneratedContentSigs.has(contentSig),
          false,
          `Duplicate across consecutive tests in ${subj.id}: ${q.text}`
        );
        allGeneratedContentSigs.add(contentSig);
        allGeneratedFingerprints.add(fp);
      }
    }

    assert.equal(allGeneratedContentSigs.size, 60);
  }
});

test('Scenarios 10 & 11: Question history survives page refresh and two different users have independent question histories', () => {
  (globalThis as any).localStorage.clear();
  (globalThis as any).sessionStorage.clear();

  const sampleQ1 = BANK.python[0];
  const sampleQ2 = BANK.python[1];

  // User 1 sees and attempts sampleQ1
  recordQuestionPresented(UID_USER_1, 'python', sampleQ1);
  recordQuestionAttempted(UID_USER_1, 'python', sampleQ1);

  // User 2 sees sampleQ2 only
  recordQuestionPresented(UID_USER_2, 'python', sampleQ2);

  // Scenario 10: Simulate reload by reading fresh Sets from storage
  const user1SeenAfterReload = getSeenSignaturesForSubject('python', UID_USER_1);
  const user1AttemptedAfterReload = getAttemptedSignaturesForSubject(
    'python',
    UID_USER_1
  );
  const user2SeenAfterReload = getSeenSignaturesForSubject('python', UID_USER_2);

  // User 1 has sampleQ1 but NOT sampleQ2
  assert.equal(
    isQuestionInSignatureSet(sampleQ1, 'python', user1SeenAfterReload),
    true
  );
  assert.equal(
    isQuestionInSignatureSet(sampleQ1, 'python', user1AttemptedAfterReload),
    true
  );
  assert.equal(
    isQuestionInSignatureSet(sampleQ2, 'python', user1SeenAfterReload),
    false
  );

  // Scenario 11: User 2 has sampleQ2 but NOT sampleQ1
  assert.equal(
    isQuestionInSignatureSet(sampleQ2, 'python', user2SeenAfterReload),
    true
  );
  assert.equal(
    isQuestionInSignatureSet(sampleQ1, 'python', user2SeenAfterReload),
    false
  );

  // Active quiz session survives refresh for User 1 without regenerating questions
  saveActiveQuizSession(UID_USER_1, {
    attemptId: 'att_refresh_test_1',
    uid: UID_USER_1,
    subjectId: 'python',
    mode: 'standard',
    questions: [sampleQ1, sampleQ2],
    idx: 1,
    selected: [sampleQ1.ans, null],
    locked: false,
    timedOut: false,
    timeLeft: 32,
    streak: 1,
    bestStreak: 1,
    startedAt: Date.now(),
  });

  const restored = loadActiveQuizSession(UID_USER_1);
  assert.ok(restored !== null);
  assert.equal(restored.attemptId, 'att_refresh_test_1');
  assert.equal(restored.idx, 1);
  assert.equal(restored.questions.length, 2);
  assert.equal(loadActiveQuizSession(UID_USER_2), null);
  assert.equal(isAttemptIdAlreadySubmitted('att_refresh_test_1'), false);
});

test('Scenario 12: Procedural generator under high-volume testing produces ZERO artificial suffixes or fake variant options', () => {
  for (const subj of SUBJECTS) {
    const seen = new Set<string>();
    const generated = generateUniqueQuizQuestions(subj.id, 110, seen);
    assert.equal(generated.length, 110);

    for (const q of generated) {
      // Never contains (#123-456) or #123 artificial suffix
      assert.equal(
        /\(\s*#\d+-\d+\s*\)/.test(q.text),
        false,
        `Question contains artificial duplicate suffix: ${q.text}`
      );
      assert.equal(
        /\[GK\s*·[^\]]*#\d+\]/.test(q.text),
        false,
        `GK question contains artificial #variantId tag: ${q.text}`
      );
      for (const opt of q.opts) {
        assert.equal(
          /\(variant\s+\d+\)/i.test(opt),
          false,
          `Option contains fake variant padding: ${opt}`
        );
      }
    }
  }

  for (const cat of GK_CATEGORIES) {
    const seen = new Set<string>();
    const qs = generateUniqueQuizQuestions('gk', 15, seen, cat);
    assert.ok(qs.length >= 10);
    for (const q of qs) {
      assert.equal(/\(\s*#\d+-\d+\s*\)/.test(q.text), false);
    }
  }
});

test('Scenario 13: Graceful behavior when the unique question pool is completely exhausted (never returns duplicates)', () => {
  // Pre-populate seenSignatures with all curated questions in a narrow GK category ('Awards & Honours')
  // and also pre-populate all GK_FACT_POOL items for 'Awards & Honours'
  const seen = new Set<string>();
  const awardsCurated = BANK.gk.filter((q) => q.cat === 'Awards & Honours');
  for (const q of awardsCurated) {
    registerQuestionInSignatureSet(q, 'gk', seen);
  }

  // Drain all remaining unique questions in 'Awards & Honours'
  const drained: string[] = [];
  for (let i = 0; i < 30; i++) {
    const res = getNextUniqueQuestion('gk', seen, 'Awards & Honours', {
      maxAttempts: 40,
    });
    if (res.poolExhausted || !res.question) {
      break;
    }
    const sig = computeQuestionContentSignature(res.question, 'gk');
    assert.equal(
      drained.includes(sig),
      false,
      'Must never return a duplicate question when draining pool'
    );
    drained.push(sig);
  }

  // Now the 'Awards & Honours' pool is completely exhausted for this user's history
  const exhaustedRes = getNextUniqueQuestion('gk', seen, 'Awards & Honours', {
    maxAttempts: 30,
  });
  assert.equal(exhaustedRes.poolExhausted, true);
  assert.equal(exhaustedRes.question, null);
  assert.ok(
    typeof exhaustedRes.shortageMessage === 'string' &&
      exhaustedRes.shortageMessage.length > 10
  );

  // Also verify getNextUnlimitedQuestion returns null on an exhausted pool instead of appending (#123-456)
  const unlimitedOnExhausted = getNextUnlimitedQuestion(
    'gk',
    seen,
    'Awards & Honours',
    30
  );
  assert.equal(unlimitedOnExhausted, null);
});

test('Aggregate score validation & Firestore security rules verification', () => {
  const validDoc = {
    name: 'Jane Doe',
    subjects: {
      python: { score: 12, total: 15, pct: 80 },
      java: { score: 15, total: 15, pct: 100 },
    },
    overallScore: 27,
    overallTotal: 30,
    overallPct: 90,
    subjectsCount: 2,
  };
  assert.equal(validateLeaderboardUserDoc(UID_USER_1, validDoc).valid, true);

  // Legacy score doc without aggregate fields is rejected on write validation,
  // but accepted when allowLegacyMissingAggregates is enabled on read
  const legacyDoc = {
    name: 'Legacy User',
    subjects: {
      python: { score: 13, total: 15 },
    },
  };
  assert.equal(validateLeaderboardUserDoc(UID_USER_1, legacyDoc).valid, false);
  const legacyReadCheck = validateLeaderboardUserDoc(
    UID_USER_1,
    legacyDoc,
    undefined,
    { allowLegacyMissingAggregates: true }
  );
  assert.equal(legacyReadCheck.valid, true);
  assert.equal(legacyReadCheck.doc?.overallScore, 13);
  assert.equal(legacyReadCheck.doc?.overallTotal, 15);
  assert.equal(legacyReadCheck.doc?.subjectsCount, 1);

  // Reject inconsistent explicit aggregates even when allowLegacyMissingAggregates is true
  assert.equal(
    validateLeaderboardUserDoc(
      UID_USER_1,
      { ...validDoc, overallScore: 99 },
      undefined,
      { allowLegacyMissingAggregates: true }
    ).valid,
    false
  );

  // Reject contaminated competitor names and non-Firebase UIDs
  assert.equal(
    validateDisplayName(
      'Hardened Firestore Security Rules & Query Optimizations (tri-quiz-4dc5)'
    ).valid,
    false
  );
  assert.equal(isValidFirebaseAuthUid('usr_a1b2c3d4e5'), false);
  assert.equal(isValidFirebaseAuthUid(UID_USER_1), true);

  const serverTime = Symbol('REQUEST_TIME');
  assert.equal(
    evaluateFirestoreAccessRule({
      auth: { uid: UID_USER_1, emailVerified: true },
      operation: 'update',
      collectionPath: 'scores',
      targetUid: UID_USER_2,
      resourceData: { ...validDoc, updatedAt: serverTime },
      requestTimeSymbol: serverTime,
    }).allowed,
    false
  );

  const validSubjects = SUBJECTS.map((s) => s.id);
  assert.equal(
    validateAttemptPayload(
      { subject: 'python', score: 16, total: 15 },
      validSubjects
    ).valid,
    false
  );
  assert.equal(
    validateAttemptPayload(
      { subject: 'jee', score: 14, total: 15, attemptId: 'att_123' },
      validSubjects
    ).valid,
    true
  );
});
