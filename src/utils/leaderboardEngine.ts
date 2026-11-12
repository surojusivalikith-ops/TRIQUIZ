export const MIN_Q_FOR_RANK = 10;

export const VALID_SUBJECT_IDS = [
  'python',
  'java',
  'c',
  'cpp',
  'html',
  'crt',
  'gk',
  'neet',
  'jee',
] as const;

export interface SubjectBest {
  score: number;
  total: number;
  pct?: number;
  updatedAt?: number;
}

export interface LeaderboardUserDoc {
  uid: string;
  name: string;
  subjects: Record<string, SubjectBest>;
  overallScore: number;
  overallTotal: number;
  overallPct: number;
  subjectsCount: number;
  updatedAt?: number;
}

export interface LeaderboardRow {
  uid: string;
  name: string;
  score: number;
  total: number;
  pct: number;
  subjects: number;
  rank: number;
}

export interface QuizAttempt {
  id?: string;
  attemptId?: string;
  subject: string;
  score: number;
  total: number;
  ts: number;
  mode?: 'standard' | 'deep' | 'unlimited';
}

const CONTAMINATED_TEXT_PATTERNS: RegExp[] = [
  /hardened\s+firestore/i,
  /firestore\s+security\s+rules/i,
  /security\s+rules/i,
  /query\s+optimizations?/i,
  /tri-quiz/i,
  /rules_version/i,
  /service\s+cloud\.firestore/i,
  /match\s+\/databases/i,
  /request\.auth/i,
  /request\.resource/i,
  /allow\s+(read|write|get|list|create|update|delete)/i,
  /firestore\.rules/i,
  /firestore\.indexes/i,
  /collectiongroup/i,
  /firebase_config/i,
  /ai_studio|aistudio/i,
  /[{};<>`]/,
  /=>/,
  /\bfunction\s*\(/i,
];

const RESERVED_INVALID_UIDS = new Set([
  'rules',
  'firestore_rules',
  'firestore-rules',
  'security_rules',
  'security-rules',
  'config',
  'configuration',
  'settings',
  'index',
  'indexes',
  'schema',
  'metadata',
  'documentation',
  'docs',
  'readme',
  'sample',
  'seed',
  'demo',
  'fake',
  'test_doc',
  'tri-quiz-4dc5e',
  'tri-quiz-4dc5',
]);

/**
 * Detects whether a string contains Firestore rules, code snippets,
 * documentation headers, configuration text, or arbitrary non-user text.
 */
export function isContaminatedOrCodeText(value: unknown): boolean {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > 40) return true;
  if (trimmed.includes('\n') || trimmed.includes('\r')) return true;

  for (const pattern of CONTAMINATED_TEXT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates that a document ID is a genuine Firebase Authentication UID.
 * Firebase Auth UIDs are 20-64 character alphanumeric strings.
 * Rejects local fallback prefixes (usr_, local_, demo_, fake_, seed_, test_)
 * and any config/rules/documentation identifiers.
 */
export function isValidFirebaseAuthUid(uid: unknown): uid is string {
  if (typeof uid !== 'string') return false;
  const trimmed = uid.trim();
  if (trimmed.length < 20 || trimmed.length > 64) return false;
  if (RESERVED_INVALID_UIDS.has(trimmed.toLowerCase())) return false;
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) return false;
  if (/^(usr|local|demo|fake|seed|test|mock|anon)/i.test(trimmed)) return false;
  if (/firestore|rules|optimiz|config|snippet|doc/i.test(trimmed)) return false;
  return true;
}

export function validateDisplayName(
  name: unknown
): { valid: boolean; sanitized: string; error?: string } {
  if (typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'Display name must be text.' };
  }
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 1) {
    return { valid: false, sanitized: '', error: 'Display name cannot be empty.' };
  }
  if (trimmed.length > 40) {
    return {
      valid: false,
      sanitized: '',
      error: 'Display name must be 40 characters or fewer.',
    };
  }
  if (isContaminatedOrCodeText(trimmed)) {
    return {
      valid: false,
      sanitized: '',
      error:
        'Display name cannot contain rules, code snippets, or configuration text.',
    };
  }
  return { valid: true, sanitized: trimmed };
}

export function validateAttemptPayload(
  payload: unknown,
  validSubjectIds: readonly string[] = VALID_SUBJECT_IDS
): {
  valid: boolean;
  error?: string;
  data?: { subject: string; score: number; total: number; attemptId?: string };
} {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Invalid attempt payload.' };
  }
  const obj = payload as Record<string, unknown>;
  const subject = typeof obj.subject === 'string' ? obj.subject : '';
  const score = typeof obj.score === 'number' ? obj.score : NaN;
  const total = typeof obj.total === 'number' ? obj.total : NaN;
  const attemptId =
    typeof obj.attemptId === 'string' && obj.attemptId.trim().length > 0
      ? obj.attemptId.trim()
      : undefined;

  if (!validSubjectIds.includes(subject)) {
    return { valid: false, error: `Unknown subject "${subject}".` };
  }
  if (!Number.isInteger(total) || total < 1 || total > 500) {
    return {
      valid: false,
      error: 'Total questions must be an integer between 1 and 500.',
    };
  }
  if (!Number.isInteger(score) || score < 0 || score > total) {
    return {
      valid: false,
      error: 'Score must be an integer between 0 and total.',
    };
  }
  return {
    valid: true,
    data: { subject, score, total, ...(attemptId ? { attemptId } : {}) },
  };
}

function normalizeTimestampToMillis(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (val && typeof val === 'object') {
    const anyVal = val as { toMillis?: () => number; seconds?: number };
    if (typeof anyVal.toMillis === 'function') {
      try {
        return anyVal.toMillis();
      } catch {
        return Date.now();
      }
    }
    if (typeof anyVal.seconds === 'number') {
      return anyVal.seconds * 1000;
    }
  }
  return Date.now();
}

/**
 * Strictly validates a Firestore `scores/{uid}` document:
 * 1. `uid` must be a genuine Firebase Authentication UID (`isValidFirebaseAuthUid`).
 * 2. Only allowed score-document fields are permitted.
 * 3. `name` must be a valid human display name (never rules, code snippets, or docs).
 * 4. Every nested entry in `subjects` must have a valid subject ID and valid integer
 *    `score` and `total` (`10 <= total <= 500`, `0 <= score <= total`).
 * 5. Required aggregate fields (`name`, `overallScore`, `overallTotal`, `overallPct`, `subjectsCount`)
 *    must all be present and strictly consistent with the sum/count/percentage of `subjects`
 *    (unless `options?.allowLegacyMissingAggregates` is enabled AND the document is a legacy
 *    pre-aggregate document where all 4 aggregate fields are absent).
 */
export function validateLeaderboardUserDoc(
  rawUid: unknown,
  rawDoc: unknown,
  validSubjectIds: readonly string[] = VALID_SUBJECT_IDS,
  options?: { allowLegacyMissingAggregates?: boolean }
): { valid: boolean; error?: string; doc?: LeaderboardUserDoc } {
  if (!isValidFirebaseAuthUid(rawUid)) {
    return { valid: false, error: 'Invalid or non-Firebase Authentication UID.' };
  }
  if (!rawDoc || typeof rawDoc !== 'object' || Array.isArray(rawDoc)) {
    return { valid: false, error: 'Score document must be a plain object.' };
  }

  const data = rawDoc as Record<string, unknown>;

  const allowedTopKeys = new Set([
    'uid',
    'name',
    'subjects',
    'overallScore',
    'overallTotal',
    'overallPct',
    'subjectsCount',
    'updatedAt',
  ]);
  for (const key of Object.keys(data)) {
    if (!allowedTopKeys.has(key)) {
      return {
        valid: false,
        error: `Score document contains unexpected field "${key}".`,
      };
    }
  }

  if (data.uid !== undefined && data.uid !== rawUid) {
    return {
      valid: false,
      error: 'Document uid field does not match document ID.',
    };
  }

  const nameValidation = validateDisplayName(data.name);
  if (!nameValidation.valid) {
    return {
      valid: false,
      error: nameValidation.error || 'Invalid competitor display name.',
    };
  }

  if (
    !data.subjects ||
    typeof data.subjects !== 'object' ||
    Array.isArray(data.subjects)
  ) {
    return { valid: false, error: 'Missing or invalid subjects map.' };
  }

  const rawSubjects = data.subjects as Record<string, unknown>;
  const rawSubjectEntries = Object.entries(rawSubjects);
  if (
    rawSubjectEntries.length === 0 ||
    rawSubjectEntries.length > validSubjectIds.length
  ) {
    return {
      valid: false,
      error: 'Score document must contain between 1 and 9 valid subjects.',
    };
  }

  const cleanSubjects: Record<string, SubjectBest> = {};
  let computedScore = 0;
  let computedTotal = 0;

  for (const [subjKey, subjVal] of rawSubjectEntries) {
    if (!validSubjectIds.includes(subjKey)) {
      return {
        valid: false,
        error: `Invalid nested subject ID "${subjKey}".`,
      };
    }
    if (!subjVal || typeof subjVal !== 'object' || Array.isArray(subjVal)) {
      return { valid: false, error: `Invalid subject entry for "${subjKey}".` };
    }
    const sb = subjVal as Record<string, unknown>;
    for (const sk of Object.keys(sb)) {
      if (
        sk !== 'score' &&
        sk !== 'total' &&
        sk !== 'pct' &&
        sk !== 'updatedAt'
      ) {
        return {
          valid: false,
          error: `Unexpected property "${sk}" in subject "${subjKey}".`,
        };
      }
    }

    const score = typeof sb.score === 'number' ? sb.score : NaN;
    const total = typeof sb.total === 'number' ? sb.total : NaN;

    if (
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      total < MIN_Q_FOR_RANK ||
      total > 500 ||
      score < 0 ||
      score > total
    ) {
      return {
        valid: false,
        error: `Invalid or ineligible score/total in subject "${subjKey}".`,
      };
    }

    const computedSubjPct = Math.round((score / total) * 10000) / 100;
    const computedSubjPctInt = Math.round((score / total) * 100);
    if (sb.pct !== undefined) {
      if (
        typeof sb.pct !== 'number' ||
        !Number.isFinite(sb.pct) ||
        sb.pct < 0 ||
        sb.pct > 100 ||
        (Math.abs(sb.pct - computedSubjPct) > 0.05 &&
          Math.abs(sb.pct - computedSubjPctInt) > 0.51)
      ) {
        return {
          valid: false,
          error: `Inconsistent pct in subject "${subjKey}".`,
        };
      }
    }

    cleanSubjects[subjKey] = {
      score,
      total,
      pct: computedSubjPct,
    };
    computedScore += score;
    computedTotal += total;
  }

  const computedSubjectsCount = Object.keys(cleanSubjects).length;
  const computedPct2Dec =
    Math.round((computedScore / computedTotal) * 10000) / 100;
  const computedPctInt = Math.round((computedScore / computedTotal) * 100);
  const computedPctRaw = (computedScore / computedTotal) * 100;

  const oScore = data.overallScore;
  const oTotal = data.overallTotal;
  const oPct = data.overallPct;
  const sCount = data.subjectsCount;

  const isLegacyWithoutAggregates =
    options?.allowLegacyMissingAggregates === true &&
    oScore === undefined &&
    oTotal === undefined &&
    oPct === undefined &&
    sCount === undefined;

  if (!isLegacyWithoutAggregates) {
    if (
      typeof oScore !== 'number' ||
      !Number.isInteger(oScore) ||
      oScore !== computedScore
    ) {
      return {
        valid: false,
        error: `overallScore (${String(oScore)}) does not equal sum of valid subject scores (${computedScore}).`,
      };
    }

    if (
      typeof oTotal !== 'number' ||
      !Number.isInteger(oTotal) ||
      oTotal !== computedTotal
    ) {
      return {
        valid: false,
        error: `overallTotal (${String(oTotal)}) does not equal sum of valid subject totals (${computedTotal}).`,
      };
    }

    if (
      typeof sCount !== 'number' ||
      !Number.isInteger(sCount) ||
      sCount !== computedSubjectsCount
    ) {
      return {
        valid: false,
        error: `subjectsCount (${String(sCount)}) does not equal valid subjects count (${computedSubjectsCount}).`,
      };
    }

    if (
      typeof oPct !== 'number' ||
      !Number.isFinite(oPct) ||
      oPct < 0 ||
      oPct > 100 ||
      (Math.abs(oPct - computedPct2Dec) > 0.05 &&
        Math.abs(oPct - computedPctInt) > 0.51 &&
        Math.abs(oPct - computedPctRaw) > 0.05)
    ) {
      return {
        valid: false,
        error: `overallPct (${String(oPct)}) does not match calculated percentage (${computedPct2Dec}%).`,
      };
    }
  }

  return {
    valid: true,
    doc: {
      uid: rawUid,
      name: nameValidation.sanitized,
      subjects: cleanSubjects,
      overallScore: computedScore,
      overallTotal: computedTotal,
      overallPct: computedPct2Dec,
      subjectsCount: computedSubjectsCount,
      updatedAt: normalizeTimestampToMillis(data.updatedAt),
    },
  };
}

export function mergeAttemptIntoUserScore(
  existingDoc: LeaderboardUserDoc | null,
  uid: string,
  name: string,
  attempt: { subject: string; score: number; total: number }
): LeaderboardUserDoc {
  const nameCheck = validateDisplayName(name);
  const safeName = nameCheck.valid ? nameCheck.sanitized : 'Competitor';

  const baseSubjects: Record<string, SubjectBest> = {};
  if (existingDoc?.subjects && typeof existingDoc.subjects === 'object') {
    for (const [k, v] of Object.entries(existingDoc.subjects)) {
      if (
        (VALID_SUBJECT_IDS as readonly string[]).includes(k) &&
        v &&
        Number.isInteger(v.score) &&
        Number.isInteger(v.total) &&
        v.total >= MIN_Q_FOR_RANK &&
        v.total <= 500 &&
        v.score >= 0 &&
        v.score <= v.total
      ) {
        baseSubjects[k] = {
          score: v.score,
          total: v.total,
          pct: Math.round((v.score / v.total) * 10000) / 100,
        };
      }
    }
  }

  if (
    Number.isInteger(attempt.score) &&
    Number.isInteger(attempt.total) &&
    attempt.total >= MIN_Q_FOR_RANK &&
    attempt.total <= 500 &&
    attempt.score >= 0 &&
    attempt.score <= attempt.total &&
    (VALID_SUBJECT_IDS as readonly string[]).includes(attempt.subject)
  ) {
    const prev = baseSubjects[attempt.subject];
    const newPct = attempt.score / attempt.total;
    const prevPct = prev ? prev.score / prev.total : -1;
    const isBetter =
      !prev ||
      newPct > prevPct ||
      (Math.abs(newPct - prevPct) < 1e-9 && attempt.score > prev.score);

    if (isBetter) {
      baseSubjects[attempt.subject] = {
        score: attempt.score,
        total: attempt.total,
        pct: Math.round(newPct * 10000) / 100,
      };
    }
  }

  let overallScore = 0;
  let overallTotal = 0;
  const keys = Object.keys(baseSubjects);
  for (const k of keys) {
    overallScore += baseSubjects[k].score;
    overallTotal += baseSubjects[k].total;
  }

  return {
    uid,
    name: safeName,
    subjects: baseSubjects,
    overallScore,
    overallTotal,
    overallPct:
      overallTotal > 0
        ? Math.round((overallScore / overallTotal) * 10000) / 100
        : 0,
    subjectsCount: keys.length,
    updatedAt: Date.now(),
  };
}

export function computeLeaderboardRows(
  users: LeaderboardUserDoc[],
  filter: string
): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [];

  for (const rawUser of users) {
    const check = validateLeaderboardUserDoc(rawUser?.uid, rawUser);
    if (!check.valid || !check.doc) {
      continue;
    }
    const u = check.doc;

    if (filter === 'all') {
      if (u.subjectsCount < 1 || u.overallTotal < MIN_Q_FOR_RANK) continue;
      rows.push({
        uid: u.uid,
        name: u.name,
        score: u.overallScore,
        total: u.overallTotal,
        pct: Math.round((u.overallScore / u.overallTotal) * 100),
        subjects: u.subjectsCount,
        rank: 0,
      });
    } else {
      const s = u.subjects[filter];
      if (s && s.total >= MIN_Q_FOR_RANK) {
        rows.push({
          uid: u.uid,
          name: u.name,
          score: s.score,
          total: s.total,
          pct: Math.round((s.score / s.total) * 100),
          subjects: 1,
          rank: 0,
        });
      }
    }
  }

  if (filter === 'all') {
    rows.sort(
      (a, b) => b.score - a.score || b.score / b.total - a.score / a.total
    );
  } else {
    rows.sort(
      (a, b) => b.score / b.total - a.score / a.total || b.score - a.score
    );
  }

  const keyOf = (r: LeaderboardRow) =>
    filter === 'all'
      ? `${r.score}|${(r.score / r.total).toFixed(4)}`
      : `${(r.score / r.total).toFixed(4)}|${r.score}`;

  for (let i = 0; i < rows.length; i++) {
    rows[i].rank =
      i > 0 && keyOf(rows[i]) === keyOf(rows[i - 1]) ? rows[i - 1].rank : i + 1;
  }

  return rows;
}

/**
 * Evaluates access permissions and schema rules matching `firestore.rules`
 * for unit testing authorized/unauthorized access and rule enforcement.
 */
export function evaluateFirestoreAccessRule(params: {
  auth: { uid: string; emailVerified: boolean } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  collectionPath: 'scores' | 'attempts';
  targetUid: string;
  attemptId?: string;
  resourceData?: Record<string, unknown>;
  requestTimeSymbol?: unknown;
}): { allowed: boolean; reason?: string } {
  const {
    auth,
    operation,
    collectionPath,
    targetUid,
    attemptId,
    resourceData,
    requestTimeSymbol,
  } = params;

  if (!auth || !auth.uid) {
    return { allowed: false, reason: 'Unauthenticated request denied.' };
  }

  if (collectionPath === 'scores') {
    if (operation === 'list') {
      // Signed-in users can list scores; rule does not filter by resource.data
      return { allowed: true };
    }
    if (operation === 'get') {
      if (!isValidFirebaseAuthUid(targetUid)) {
        return { allowed: false, reason: 'Invalid target UID.' };
      }
      return { allowed: true };
    }
    if (operation === 'delete') {
      return { allowed: false, reason: 'Deleting score documents is forbidden.' };
    }
    if (operation === 'create' || operation === 'update') {
      if (!auth.emailVerified) {
        return { allowed: false, reason: 'Email must be verified to write scores.' };
      }
      if (auth.uid !== targetUid) {
        return {
          allowed: false,
          reason: "Cannot create or modify another user's score document.",
        };
      }
      if (!resourceData) {
        return { allowed: false, reason: 'Missing request.resource.data.' };
      }
      if (
        requestTimeSymbol !== undefined &&
        resourceData.updatedAt !== requestTimeSymbol
      ) {
        return {
          allowed: false,
          reason: 'updatedAt must equal request.time (serverTimestamp).',
        };
      }
      const docForCheck = {
        ...resourceData,
        updatedAt: Date.now(),
      };
      const check = validateLeaderboardUserDoc(targetUid, docForCheck);
      if (!check.valid) {
        return { allowed: false, reason: check.error };
      }
      return { allowed: true };
    }
  }

  if (collectionPath === 'attempts') {
    if (auth.uid !== targetUid) {
      return {
        allowed: false,
        reason: "Cannot read or write another user's private attempt history.",
      };
    }
    if (!isValidFirebaseAuthUid(targetUid)) {
      return { allowed: false, reason: 'Invalid user UID.' };
    }
    if (operation === 'get' || operation === 'list') {
      return { allowed: true };
    }
    if (operation === 'update' || operation === 'delete') {
      return { allowed: false, reason: 'Attempts are immutable once recorded.' };
    }
    if (operation === 'create') {
      if (!auth.emailVerified) {
        return { allowed: false, reason: 'Email must be verified to create attempts.' };
      }
      if (!attemptId || attemptId.length < 1 || attemptId.length > 128) {
        return { allowed: false, reason: 'Invalid attemptId.' };
      }
      if (!resourceData) {
        return { allowed: false, reason: 'Missing attempt data.' };
      }
      if (
        requestTimeSymbol !== undefined &&
        resourceData.ts !== requestTimeSymbol
      ) {
        return { allowed: false, reason: 'ts must equal request.time.' };
      }
      const check = validateAttemptPayload(resourceData);
      if (!check.valid) {
        return { allowed: false, reason: check.error };
      }
      return { allowed: true };
    }
  }

  return { allowed: false, reason: 'Denied by default catch-all rule.' };
}

export function getScoreVerdict(pct: number): string {
  if (pct === 100) return 'Flawless run. Nothing left uncovered.';
  if (pct >= 80) return 'Strong result — you know this material well.';
  if (pct >= 60) return 'Solid, with a few gaps worth revisiting.';
  if (pct >= 40) return 'Middling — another pass through the basics will help.';
  return 'Rough round. Review the fundamentals and try again.';
}
