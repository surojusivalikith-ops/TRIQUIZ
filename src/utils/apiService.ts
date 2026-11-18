import {
  LeaderboardRow,
  LeaderboardUserDoc,
  MIN_Q_FOR_RANK,
  QuizAttempt,
  SubjectBest,
  VALID_SUBJECT_IDS,
  computeLeaderboardRows,
  isContaminatedOrCodeText,
  isValidFirebaseAuthUid,
  mergeAttemptIntoUserScore,
  validateAttemptPayload,
  validateDisplayName,
  validateLeaderboardUserDoc,
} from './leaderboardEngine';
import {
  Question,
  SUBJECTS,
  computeQuestionContentSignature,
  computeQuestionFingerprint,
  normalizeQuestionSignature,
} from './questionEngine';
import {
  BulkImportValidationSummary,
  QuestionBankDocument,
  QuestionSource,
  QuestionStatus,
  QuestionValidationResult,
  commitBulkImportDraftsToStore,
  createQuestionInStore,
  deleteAllDraftQuestionsFromStore,
  deleteBulkImportedQuestionsFromStore,
  deleteQuestionFromStore,
  getUnsyncedCustomQuestions,
  isQuestionSyncedToFirestore,
  markQuestionsSyncedToFirestore,
  mergeRemoteFirestoreQuestionsIntoStore,
  prepareIdempotentCuratedMigration,
  publishAllDraftQuestionsInStore,
  unmarkQuestionsSyncedToFirestore,
  updateQuestionInStore,
} from './questionBankService';
import type { QuestionDifficulty } from './questionBanks';
import { FIREBASE_CONFIG } from '../firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const LEGACY_SEEN_QUESTIONS_KEY = 'compile_rank_seen_questions_v1';
const USER_QHIST_KEY_PREFIX = 'compile_rank_qhist_v2_';
const ACTIVE_QUIZ_SESSION_PREFIX = 'compile_rank_active_quiz_v2_';
const SUBMITTED_ATTEMPTS_KEY = 'compile_rank_submitted_attempts_v1';
const LOCAL_FALLBACK_DB_KEY = 'compile_rank_offline_fallback_v4';
const LOCAL_FALLBACK_SESSION_KEY = 'compile_rank_offline_session_v4';

// Purge any legacy seed storage keys from earlier builds
try {
  localStorage.removeItem('compile_rank_global_db_v1');
  localStorage.removeItem('compile_rank_global_db_v2');
  localStorage.removeItem('compile_rank_real_db_v3');
  localStorage.removeItem('compile_rank_auth_token_v1');
  localStorage.removeItem('compile_rank_auth_token_v2');
  localStorage.removeItem('compile_rank_real_session_v3');
} catch {
  // ignore storage errors
}

let activeUserUidForStorage = 'anonymous';

export function setActiveStorageUserUid(uid: string | null | undefined): void {
  activeUserUidForStorage = uid && uid.trim() ? uid.trim() : 'anonymous';
}

export function generateAttemptId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `att_${Date.now()}_${rand}`;
}

const submittedAttemptIdsMemory = new Set<string>();

function getSubmittedAttemptIds(): Set<string> {
  const combined = new Set<string>(submittedAttemptIdsMemory);
  try {
    const raw = sessionStorage.getItem(SUBMITTED_ATTEMPTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const id of arr) {
          if (typeof id === 'string') combined.add(id);
        }
      }
    }
  } catch {
    // ignore
  }
  return combined;
}

function markAttemptIdSubmitted(attemptId: string): void {
  if (!attemptId) return;
  submittedAttemptIdsMemory.add(attemptId);
  try {
    const current = Array.from(getSubmittedAttemptIds()).slice(-200);
    sessionStorage.setItem(SUBMITTED_ATTEMPTS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function isAttemptIdAlreadySubmitted(attemptId?: string): boolean {
  if (!attemptId) return false;
  return getSubmittedAttemptIds().has(attemptId);
}

let fbPromise: Promise<{
  auth: any;
  db: any;
  fbAuthMod: any;
  fbStoreMod: any;
} | null> | null = null;

async function getFirebaseServices() {
  if (fbPromise) return fbPromise;
  fbPromise = (async () => {
    try {
      const appUrl = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
      const authUrl = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
      const storeUrl = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

      const [fbAppMod, fbAuthMod, fbStoreMod] = await Promise.all([
        import(/* @vite-ignore */ appUrl),
        import(/* @vite-ignore */ authUrl),
        import(/* @vite-ignore */ storeUrl),
      ]);

      const app =
        fbAppMod.getApps && fbAppMod.getApps().length > 0
          ? fbAppMod.getApp()
          : fbAppMod.initializeApp(FIREBASE_CONFIG);
      const auth = fbAuthMod.getAuth(app);
      const db = fbStoreMod.getFirestore(app);
      return { auth, db, fbAuthMod, fbStoreMod };
    } catch (err) {
      console.warn('Firebase CDN unavailable, using isolated offline fallback:', err);
      return null;
    }
  })();
  return fbPromise;
}

/**
 * Ensures a user's display name is never contaminated with Firestore rules,
 * documentation titles, or code snippets. Falls back to the email handle if contaminated.
 */
export function resolveSafeUserDisplayName(
  rawDisplayName: unknown,
  email: string
): string {
  const check = validateDisplayName(rawDisplayName);
  if (check.valid && check.sanitized) {
    return check.sanitized;
  }
  const emailHandle = (email || '').split('@')[0].trim().slice(0, 40);
  const handleCheck = validateDisplayName(emailHandle);
  if (handleCheck.valid && handleCheck.sanitized) {
    return handleCheck.sanitized;
  }
  return 'Competitor';
}

export function formatFirebaseAuthError(e: any): string {
  const c = (e && e.code) || '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'incorrect email or password.',
    'auth/wrong-password': 'incorrect email or password.',
    'auth/user-not-found': 'incorrect email or password.',
    'auth/email-already-in-use':
      'an account with this email already exists — log in instead.',
    'auth/weak-password': 'password is too weak — use at least 8 characters.',
    'auth/invalid-email': "that email address doesn't look valid.",
    'auth/too-many-requests':
      'too many attempts — wait a few minutes and try again.',
    'auth/network-request-failed':
      'network error — check your internet connection.',
    'auth/operation-not-allowed':
      'this sign-in method is turned off in the Firebase console.',
    'auth/popup-blocked':
      'the browser blocked the Google popup — allow popups for this site and try again.',
    'auth/unauthorized-domain':
      'this preview domain is not yet in Firebase Authorized Domains — use email/password login or add this domain in Firebase Console → Authentication → Settings → Authorized domains.',
  };
  if (map[c]) return map[c];
  if (e instanceof Error && e.message) return e.message;
  return 'authentication error — please check your credentials and try again.';
}

/* ============================================================================
   ISOLATED OFFLINE FALLBACK STORE
   Kept strictly separate from the global Firebase leaderboard.
   ============================================================================ */
interface OfflineLocalStore {
  accounts: Record<
    string,
    {
      uid: string;
      email: string;
      name: string;
      password: string;
      emailVerified: boolean;
    }
  >;
  scores: Record<string, LeaderboardUserDoc>;
  attempts: Record<string, QuizAttempt[]>;
}

function generateOfflineUid(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = 'fB9xK2mP7qR4tV8wY1zA';
  for (let i = 0; i < 8; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function getOfflineLocalStore(): OfflineLocalStore {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OfflineLocalStore;
      if (parsed && parsed.accounts && parsed.scores && parsed.attempts) {
        const sanitizedScores: Record<string, LeaderboardUserDoc> = {};
        for (const [uid, docData] of Object.entries(parsed.scores)) {
          const check = validateLeaderboardUserDoc(uid, docData, VALID_SUBJECT_IDS, {
            allowLegacyMissingAggregates: true,
          });
          if (check.valid && check.doc) {
            sanitizedScores[uid] = check.doc;
          }
        }
        return {
          accounts: parsed.accounts,
          scores: sanitizedScores,
          attempts: parsed.attempts,
        };
      }
    }
  } catch {
    // ignore
  }
  return { accounts: {}, scores: {}, attempts: {} };
}

function saveOfflineLocalStore(store: OfflineLocalStore): void {
  try {
    localStorage.setItem(LOCAL_FALLBACK_DB_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/* ============================================================================
   PERSISTENT PER-USER QUESTION HISTORY (Firestore + per-UID localStorage)
   ============================================================================ */
export interface SubjectQuestionHistoryRecord {
  subject: string;
  seenFingerprints: string[];
  attemptedFingerprints: string[];
  topicsSeen: string[];
  updatedAt: number;
}

function getUserHistoryStorageKey(uid?: string): string {
  const resolvedUid = uid && uid.trim() ? uid.trim() : activeUserUidForStorage;
  return `${USER_QHIST_KEY_PREFIX}${resolvedUid}`;
}

function readUserQuestionHistoryMap(
  uid?: string
): Record<string, SubjectQuestionHistoryRecord> {
  const key = getUserHistoryStorageKey(uid);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<
        string,
        SubjectQuestionHistoryRecord
      >;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function writeUserQuestionHistoryMap(
  map: Record<string, SubjectQuestionHistoryRecord>,
  uid?: string
): void {
  const key = getUserHistoryStorageKey(uid);
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getSeenSignaturesForSubject(
  subjectId: string,
  uid?: string
): Set<string> {
  const map = readUserQuestionHistoryMap(uid);
  const rec = map[subjectId];
  const set = new Set<string>();
  if (rec && Array.isArray(rec.seenFingerprints)) {
    for (const fp of rec.seenFingerprints) {
      if (typeof fp === 'string' && fp) set.add(fp);
    }
  }
  // If no user-scoped record exists yet and uid is anonymous, check legacy storage
  if (set.size === 0 && (!uid || uid === 'anonymous')) {
    try {
      const rawLegacy = localStorage.getItem(LEGACY_SEEN_QUESTIONS_KEY);
      if (rawLegacy) {
        const parsed = JSON.parse(rawLegacy) as Record<string, string[]>;
        const list = parsed?.[subjectId];
        if (Array.isArray(list)) {
          for (const item of list) set.add(item);
        }
      }
    } catch {
      // ignore
    }
  }
  return set;
}

export function getAttemptedSignaturesForSubject(
  subjectId: string,
  uid?: string
): Set<string> {
  const map = readUserQuestionHistoryMap(uid);
  const rec = map[subjectId];
  const set = new Set<string>();
  if (rec && Array.isArray(rec.attemptedFingerprints)) {
    for (const fp of rec.attemptedFingerprints) {
      if (typeof fp === 'string' && fp) set.add(fp);
    }
  }
  return set;
}

export function saveSeenSignaturesForSubject(
  subjectId: string,
  seen: Set<string>,
  uid?: string
): void {
  const resolvedUid = uid && uid.trim() ? uid.trim() : activeUserUidForStorage;
  const map = readUserQuestionHistoryMap(resolvedUid);
  const existing = map[subjectId] || {
    subject: subjectId,
    seenFingerprints: [],
    attemptedFingerprints: [],
    topicsSeen: [],
    updatedAt: Date.now(),
  };
  const merged = Array.from(
    new Set([...existing.seenFingerprints, ...Array.from(seen)])
  ).slice(-2400);
  map[subjectId] = {
    ...existing,
    subject: subjectId,
    seenFingerprints: merged,
    updatedAt: Date.now(),
  };
  writeUserQuestionHistoryMap(map, resolvedUid);
  void persistQuestionHistoryToFirestore(resolvedUid, subjectId, map[subjectId]);
}

async function persistQuestionHistoryToFirestore(
  uid: string,
  subjectId: string,
  record: SubjectQuestionHistoryRecord
): Promise<void> {
  if (!isValidFirebaseAuthUid(uid)) return;
  if (!(VALID_SUBJECT_IDS as readonly string[]).includes(subjectId)) return;
  try {
    const fb = await getFirebaseServices();
    if (!fb || !fb.auth.currentUser || fb.auth.currentUser.uid !== uid) return;
    const { doc, setDoc, serverTimestamp } = fb.fbStoreMod;
    const ref = doc(fb.db, 'users', uid, 'questionHistory', subjectId);
    await setDoc(ref, {
      subject: subjectId,
      seenFingerprints: record.seenFingerprints.slice(-2400),
      attemptedFingerprints: record.attemptedFingerprints.slice(-2400),
      topicsSeen: record.topicsSeen.slice(-100),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Offline or unverified; localStorage fallback already persisted
  }
}

export async function syncUserQuestionHistoryFromFirestore(
  uid: string
): Promise<void> {
  if (!isValidFirebaseAuthUid(uid)) return;
  try {
    const fb = await getFirebaseServices();
    if (!fb || !fb.auth.currentUser || fb.auth.currentUser.uid !== uid) return;
    const { collection, getDocs } = fb.fbStoreMod;
    const snap = await getDocs(collection(fb.db, 'users', uid, 'questionHistory'));
    const localMap = readUserQuestionHistoryMap(uid);
    let changed = false;

    snap.docs.forEach((d: any) => {
      const subj = d.id;
      const data = d.data();
      if (!data || typeof data !== 'object') return;
      const existing = localMap[subj] || {
        subject: subj,
        seenFingerprints: [],
        attemptedFingerprints: [],
        topicsSeen: [],
        updatedAt: Date.now(),
      };
      const remoteSeen = Array.isArray(data.seenFingerprints)
        ? data.seenFingerprints.filter((x: unknown) => typeof x === 'string')
        : [];
      const remoteAttempted = Array.isArray(data.attemptedFingerprints)
        ? data.attemptedFingerprints.filter((x: unknown) => typeof x === 'string')
        : [];
      const remoteTopics = Array.isArray(data.topicsSeen)
        ? data.topicsSeen.filter((x: unknown) => typeof x === 'string')
        : [];

      localMap[subj] = {
        subject: subj,
        seenFingerprints: Array.from(
          new Set([...existing.seenFingerprints, ...remoteSeen])
        ).slice(-2400),
        attemptedFingerprints: Array.from(
          new Set([...existing.attemptedFingerprints, ...remoteAttempted])
        ).slice(-2400),
        topicsSeen: Array.from(
          new Set([...existing.topicsSeen, ...remoteTopics])
        ).slice(-100),
        updatedAt: Date.now(),
      };
      changed = true;
    });

    if (changed) {
      writeUserQuestionHistoryMap(localMap, uid);
    }
  } catch {
    // Ignore offline errors
  }
}

/**
 * Records that a question was actually presented to the user during a test.
 */
export function recordQuestionPresented(
  uid: string,
  subjectId: string,
  question: Question
): void {
  const resolvedUid = uid && uid.trim() ? uid.trim() : activeUserUidForStorage;
  const map = readUserQuestionHistoryMap(resolvedUid);
  const existing = map[subjectId] || {
    subject: subjectId,
    seenFingerprints: [],
    attemptedFingerprints: [],
    topicsSeen: [],
    updatedAt: Date.now(),
  };

  const stemSig = normalizeQuestionSignature(question.text);
  const contentSig = computeQuestionContentSignature(question, subjectId);
  const fullFp = computeQuestionFingerprint(question, subjectId);

  const seenSet = new Set(existing.seenFingerprints);
  seenSet.add(stemSig);
  seenSet.add(contentSig);
  seenSet.add(fullFp);

  const topicsSet = new Set(existing.topicsSeen);
  if (question.cat) topicsSet.add(question.cat);

  map[subjectId] = {
    subject: subjectId,
    seenFingerprints: Array.from(seenSet).slice(-2400),
    attemptedFingerprints: existing.attemptedFingerprints,
    topicsSeen: Array.from(topicsSet).slice(-100),
    updatedAt: Date.now(),
  };

  writeUserQuestionHistoryMap(map, resolvedUid);
  void persistQuestionHistoryToFirestore(resolvedUid, subjectId, map[subjectId]);
}

/**
 * Records that a question was answered/attempted by the user.
 */
export function recordQuestionAttempted(
  uid: string,
  subjectId: string,
  question: Question
): void {
  const resolvedUid = uid && uid.trim() ? uid.trim() : activeUserUidForStorage;
  const map = readUserQuestionHistoryMap(resolvedUid);
  const existing = map[subjectId] || {
    subject: subjectId,
    seenFingerprints: [],
    attemptedFingerprints: [],
    topicsSeen: [],
    updatedAt: Date.now(),
  };

  const stemSig = normalizeQuestionSignature(question.text);
  const contentSig = computeQuestionContentSignature(question, subjectId);
  const fullFp = computeQuestionFingerprint(question, subjectId);

  const seenSet = new Set(existing.seenFingerprints);
  seenSet.add(stemSig);
  seenSet.add(contentSig);
  seenSet.add(fullFp);

  const attemptedSet = new Set(existing.attemptedFingerprints);
  attemptedSet.add(stemSig);
  attemptedSet.add(contentSig);
  attemptedSet.add(fullFp);

  const topicsSet = new Set(existing.topicsSeen);
  if (question.cat) topicsSet.add(question.cat);

  map[subjectId] = {
    subject: subjectId,
    seenFingerprints: Array.from(seenSet).slice(-2400),
    attemptedFingerprints: Array.from(attemptedSet).slice(-2400),
    topicsSeen: Array.from(topicsSet).slice(-100),
    updatedAt: Date.now(),
  };

  writeUserQuestionHistoryMap(map, resolvedUid);
  void persistQuestionHistoryToFirestore(resolvedUid, subjectId, map[subjectId]);
}

export function getAllSeenCounts(uid?: string): Record<string, number> {
  const resolvedUid = uid && uid.trim() ? uid.trim() : activeUserUidForStorage;
  const map = readUserQuestionHistoryMap(resolvedUid);
  const counts: Record<string, number> = {};
  for (const [subj, rec] of Object.entries(map)) {
    if (rec && Array.isArray(rec.seenFingerprints)) {
      // Each presented question stores 3 canonical keys (stem, content, full fingerprint)
      const uniqueFullFps = rec.seenFingerprints.filter((s) =>
        s.includes('::')
      );
      counts[subj] =
        uniqueFullFps.length > 0
          ? Math.ceil(uniqueFullFps.length / 2)
          : rec.seenFingerprints.length;
    }
  }
  return counts;
}

/* ============================================================================
   ACTIVE TEST ATTEMPT SESSION PERSISTENCE (Survives Browser Refresh)
   ============================================================================ */
export interface PersistedActiveQuizSession {
  attemptId: string;
  uid: string;
  subjectId: string;
  gkCategory?: string | null;
  mode: 'standard' | 'deep' | 'unlimited';
  questions: Question[];
  idx: number;
  selected: Array<number | null>;
  locked: boolean;
  timedOut: boolean;
  timeLeft: number;
  streak: number;
  bestStreak: number;
  shortageMessage?: string;
  startedAt: number;
}

export function saveActiveQuizSession(
  uid: string,
  session: PersistedActiveQuizSession | null
): void {
  const key = `${ACTIVE_QUIZ_SESSION_PREFIX}${uid}`;
  try {
    if (!session) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(session));
    }
  } catch {
    // ignore storage errors
  }
}

export function loadActiveQuizSession(
  uid: string
): PersistedActiveQuizSession | null {
  const key = `${ACTIVE_QUIZ_SESSION_PREFIX}${uid}`;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedActiveQuizSession;
    if (
      parsed &&
      parsed.uid === uid &&
      typeof parsed.attemptId === 'string' &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0 &&
      !isAttemptIdAlreadySubmitted(parsed.attemptId)
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/* ============================================================================
   FIRESTORE SCORE DOCUMENT UPDATE HELPER (Satisfies firestore.rules)
   Includes updatedAt: serverTimestamp() and full aggregate consistency.
   ============================================================================ */
export function buildConsistentScorePayloadFromRawSubjects(
  safeName: string,
  rawSubjects: unknown,
  serverTimestampValue: unknown
): {
  name: string;
  subjects: Record<string, SubjectBest>;
  overallScore: number;
  overallTotal: number;
  overallPct: number;
  subjectsCount: number;
  updatedAt: unknown;
} | null {
  const nameCheck = validateDisplayName(safeName);
  if (!nameCheck.valid || !nameCheck.sanitized) {
    return null;
  }
  if (!rawSubjects || typeof rawSubjects !== 'object' || Array.isArray(rawSubjects)) {
    return null;
  }

  const subjects: Record<string, SubjectBest> = {};
  let overallScore = 0;
  let overallTotal = 0;

  for (const [k, v] of Object.entries(rawSubjects as Record<string, unknown>)) {
    if (!(VALID_SUBJECT_IDS as readonly string[]).includes(k)) continue;
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    const entry = v as Record<string, unknown>;
    const s = typeof entry.score === 'number' ? entry.score : NaN;
    const t = typeof entry.total === 'number' ? entry.total : NaN;
    if (
      Number.isInteger(s) &&
      Number.isInteger(t) &&
      t >= MIN_Q_FOR_RANK &&
      t <= 500 &&
      s >= 0 &&
      s <= t
    ) {
      const pct = Math.round((s / t) * 10000) / 100;
      subjects[k] = { score: s, total: t, pct };
      overallScore += s;
      overallTotal += t;
    }
  }

  const subjectsCount = Object.keys(subjects).length;
  if (subjectsCount === 0 || overallTotal < MIN_Q_FOR_RANK) {
    return null;
  }

  const overallPct = Math.round((overallScore / overallTotal) * 10000) / 100;

  return {
    name: nameCheck.sanitized,
    subjects,
    overallScore,
    overallTotal,
    overallPct,
    subjectsCount,
    updatedAt: serverTimestampValue,
  };
}

async function syncUserScoreDocNameInFirestore(
  fb: NonNullable<Awaited<ReturnType<typeof getFirebaseServices>>>,
  uid: string,
  safeName: string
): Promise<void> {
  if (!isValidFirebaseAuthUid(uid)) return;
  const { doc, runTransaction, serverTimestamp } = fb.fbStoreMod;
  const scoreRef = doc(fb.db, 'scores', uid);

  await runTransaction(fb.db, async (tx: any) => {
    const snap = await tx.get(scoreRef);
    if (!snap.exists()) {
      return;
    }
    const existingData = snap.data();
    const payload = buildConsistentScorePayloadFromRawSubjects(
      safeName,
      existingData?.subjects,
      serverTimestamp()
    );
    if (!payload) {
      return;
    }
    tx.set(scoreRef, payload);
  });
}

/* ============================================================================
   AUTHENTICATION (Real Firebase Auth + Isolated Offline Fallback)
   ============================================================================ */
async function healContaminatedUserProfileIfNeeded(
  fb: NonNullable<Awaited<ReturnType<typeof getFirebaseServices>>>,
  firebaseUser: any,
  safeName: string
): Promise<void> {
  if (
    firebaseUser.displayName &&
    isContaminatedOrCodeText(firebaseUser.displayName)
  ) {
    try {
      await fb.fbAuthMod.updateProfile(firebaseUser, { displayName: safeName });
    } catch {
      // ignore
    }
    try {
      await syncUserScoreDocNameInFirestore(fb, firebaseUser.uid, safeName);
    } catch {
      // ignore if score doc does not exist yet or user is unverified
    }
  }
}

/**
 * Checks whether the authenticated Firebase user has server-provisioned administrator
 * authorization via:
 * 1. Firebase Auth ID token custom claims (`claims.admin === true` or `claims.role === "admin"`), OR
 * 2. Presence of a server-provisioned `/admins/{uid}` document in Firestore.
 *
 * Never uses client-side email lists or client-writable profile fields.
 */
export async function checkUserAdminAuthorization(
  fb: NonNullable<Awaited<ReturnType<typeof getFirebaseServices>>>,
  firebaseUser: any
): Promise<boolean> {
  if (!firebaseUser || !firebaseUser.uid || !firebaseUser.emailVerified) {
    return false;
  }
  try {
    if (typeof firebaseUser.getIdTokenResult === 'function') {
      const tokenResult = await firebaseUser.getIdTokenResult();
      const claims = tokenResult?.claims || {};
      if (claims.admin === true || claims.role === 'admin') {
        return true;
      }
    }
  } catch {
    // Continue to Firestore /admins/{uid} lookup
  }

  try {
    const { doc, getDoc } = fb.fbStoreMod;
    const adminSnap = await getDoc(doc(fb.db, 'admins', firebaseUser.uid));
    if (adminSnap.exists()) {
      const data = adminSnap.data();
      if (!data || data.role === 'admin' || data.admin === true) {
        return true;
      }
    }
  } catch {
    // Non-admin or offline
  }
  return false;
}

export async function apiRestoreSession(): Promise<{
  user: UserProfile | null;
  needsVerification?: boolean;
}> {
  const fb = await getFirebaseServices();
  if (fb) {
    const currentUser = await new Promise<any>((resolve) => {
      const unsub = fb.fbAuthMod.onAuthStateChanged(
        fb.auth,
        (u: any) => {
          unsub();
          resolve(u);
        },
        () => {
          unsub();
          resolve(null);
        }
      );
    });
    if (currentUser) {
      const safeName = resolveSafeUserDisplayName(
        currentUser.displayName,
        currentUser.email || ''
      );
      setActiveStorageUserUid(currentUser.uid);
      void healContaminatedUserProfileIfNeeded(fb, currentUser, safeName);
      void syncUserQuestionHistoryFromFirestore(currentUser.uid);
      const isAdmin = currentUser.emailVerified
        ? await checkUserAdminAuthorization(fb, currentUser)
        : false;
      const profile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        name: safeName,
        emailVerified: !!currentUser.emailVerified,
        isAdmin,
      };
      if (!currentUser.emailVerified) {
        return { user: profile, needsVerification: true };
      }
      return { user: profile, needsVerification: false };
    }
    return { user: null, needsVerification: false };
  }

  try {
    const localUid = localStorage.getItem(LOCAL_FALLBACK_SESSION_KEY);
    if (localUid && isValidFirebaseAuthUid(localUid)) {
      const store = getOfflineLocalStore();
      const acc = store.accounts[localUid];
      if (acc) {
        const safeName = resolveSafeUserDisplayName(acc.name, acc.email);
        setActiveStorageUserUid(acc.uid);
        return {
          user: {
            uid: acc.uid,
            email: acc.email,
            name: safeName,
            emailVerified: true,
            isAdmin: false,
          },
          needsVerification: false,
        };
      }
    }
  } catch {
    // ignore
  }
  return { user: null, needsVerification: false };
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ user: UserProfile; needsVerification: boolean }> {
  const cleanEmail = email.trim();
  const fb = await getFirebaseServices();
  if (fb) {
    try {
      const cred = await fb.fbAuthMod.signInWithEmailAndPassword(
        fb.auth,
        cleanEmail,
        password
      );
      const u = cred.user;
      const safeName = resolveSafeUserDisplayName(
        u.displayName,
        u.email || cleanEmail
      );
      setActiveStorageUserUid(u.uid);
      void healContaminatedUserProfileIfNeeded(fb, u, safeName);
      void syncUserQuestionHistoryFromFirestore(u.uid);
      const isAdmin = u.emailVerified
        ? await checkUserAdminAuthorization(fb, u)
        : false;
      const profile: UserProfile = {
        uid: u.uid,
        email: u.email || cleanEmail,
        name: safeName,
        emailVerified: !!u.emailVerified,
        isAdmin,
      };
      return { user: profile, needsVerification: !u.emailVerified };
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code !== 'auth/network-request-failed' &&
        code !== 'auth/unauthorized-domain' &&
        code !== 'auth/operation-not-supported-in-this-environment'
      ) {
        throw new Error(formatFirebaseAuthError(err));
      }
    }
  }

  const store = getOfflineLocalStore();
  const acc = Object.values(store.accounts).find(
    (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
  );
  if (!acc || acc.password !== password) {
    throw new Error('incorrect email or password.');
  }
  localStorage.setItem(LOCAL_FALLBACK_SESSION_KEY, acc.uid);
  setActiveStorageUserUid(acc.uid);
  return {
    user: {
      uid: acc.uid,
      email: acc.email,
      name: resolveSafeUserDisplayName(acc.name, acc.email),
      emailVerified: true,
      isAdmin: false,
    },
    needsVerification: false,
  };
}

export async function apiSignup(
  name: string,
  email: string,
  password: string
): Promise<{
  user: UserProfile;
  needsVerification: boolean;
  verificationMessage?: string;
}> {
  const nameCheck = validateDisplayName(name);
  if (!nameCheck.valid) {
    throw new Error(nameCheck.error || 'please enter your name.');
  }
  const cleanEmail = email.trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("that email address doesn't look valid.");
  }
  if (password.length < 8) {
    throw new Error('password is too weak — use at least 8 characters.');
  }

  const fb = await getFirebaseServices();
  if (fb) {
    try {
      const cred = await fb.fbAuthMod.createUserWithEmailAndPassword(
        fb.auth,
        cleanEmail,
        password
      );
      try {
        await fb.fbAuthMod.updateProfile(cred.user, {
          displayName: nameCheck.sanitized,
        });
      } catch (e) {
        console.warn('Could not save displayName:', e);
      }
      setActiveStorageUserUid(cred.user.uid);
      let verificationMessage = 'verification email sent.';
      try {
        await fb.fbAuthMod.sendEmailVerification(cred.user);
      } catch (e) {
        verificationMessage =
          'account created, but verification email could not be sent — ' +
          formatFirebaseAuthError(e);
      }
      return {
        user: {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          name: nameCheck.sanitized,
          emailVerified: !!cred.user.emailVerified,
        },
        needsVerification: !cred.user.emailVerified,
        verificationMessage,
      };
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code !== 'auth/network-request-failed' &&
        code !== 'auth/unauthorized-domain' &&
        code !== 'auth/operation-not-supported-in-this-environment'
      ) {
        throw new Error(formatFirebaseAuthError(err));
      }
    }
  }

  const store = getOfflineLocalStore();
  const existing = Object.values(store.accounts).find(
    (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
  );
  if (existing) {
    throw new Error(
      'an account with this email already exists — log in instead.'
    );
  }
  const uid = generateOfflineUid();
  store.accounts[uid] = {
    uid,
    email: cleanEmail,
    name: nameCheck.sanitized,
    password,
    emailVerified: true,
  };
  saveOfflineLocalStore(store);
  localStorage.setItem(LOCAL_FALLBACK_SESSION_KEY, uid);
  setActiveStorageUserUid(uid);
  return {
    user: {
      uid,
      email: cleanEmail,
      name: nameCheck.sanitized,
      emailVerified: true,
    },
    needsVerification: false,
  };
}

export async function apiGoogleSignIn(): Promise<UserProfile> {
  const fb = await getFirebaseServices();
  if (!fb) {
    throw new Error('Firebase SDK could not be loaded. Check your connection.');
  }
  try {
    const provider = new fb.fbAuthMod.GoogleAuthProvider();
    const cred = await fb.fbAuthMod.signInWithPopup(fb.auth, provider);
    const u = cred.user;
    const safeName = resolveSafeUserDisplayName(u.displayName, u.email || '');
    setActiveStorageUserUid(u.uid);
    void syncUserQuestionHistoryFromFirestore(u.uid);
    const isAdmin = await checkUserAdminAuthorization(fb, u);
    return {
      uid: u.uid,
      email: u.email || '',
      name: safeName,
      emailVerified: true,
      isAdmin,
    };
  } catch (err: any) {
    const c = err?.code || '';
    if (
      c === 'auth/popup-closed-by-user' ||
      c === 'auth/cancelled-popup-request'
    ) {
      throw new Error('');
    }
    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function apiCheckEmailVerified(): Promise<UserProfile | null> {
  const fb = await getFirebaseServices();
  if (!fb || !fb.auth.currentUser) {
    throw new Error('no active user session found.');
  }
  await fb.fbAuthMod.reload(fb.auth.currentUser);
  const u = fb.auth.currentUser;
  if (u.emailVerified) {
    await u.getIdToken(true);
    setActiveStorageUserUid(u.uid);
    const isAdmin = await checkUserAdminAuthorization(fb, u);
    return {
      uid: u.uid,
      email: u.email || '',
      name: resolveSafeUserDisplayName(u.displayName, u.email || ''),
      emailVerified: true,
      isAdmin,
    };
  }
  return null;
}

export async function apiResendVerificationEmail(): Promise<void> {
  const fb = await getFirebaseServices();
  if (!fb || !fb.auth.currentUser) {
    throw new Error('no active user session found.');
  }
  try {
    await fb.fbAuthMod.sendEmailVerification(fb.auth.currentUser);
  } catch (err) {
    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function apiResetPassword(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const cleanEmail = email.trim();
  if (!cleanEmail) {
    throw new Error('please enter your email address.');
  }
  const fb = await getFirebaseServices();
  if (fb) {
    try {
      await fb.fbAuthMod.sendPasswordResetEmail(fb.auth, cleanEmail);
    } catch (err: any) {
      if (
        err?.code !== 'auth/user-not-found' &&
        err?.code !== 'auth/invalid-email'
      ) {
        throw new Error(formatFirebaseAuthError(err));
      }
    }
  }
  return {
    ok: true,
    message:
      'if an account exists for that email, a reset link has been sent.',
  };
}

export async function apiLogout(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_FALLBACK_SESSION_KEY);
  } catch {
    // ignore
  }
  setActiveStorageUserUid('anonymous');
  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser) {
    try {
      await fb.fbAuthMod.signOut(fb.auth);
    } catch {
      // ignore
    }
  }
  invalidateClientLeaderboardCache();
  myAttemptsCache = null;
}

/* ============================================================================
   OPTIMIZED FIRESTORE DATA LAYER (scores/{uid} & users/{uid}/attempts)
   ============================================================================ */
const leaderboardQueryCache = new Map<
  string,
  { t: number; rows: LeaderboardRow[]; totalUsers: number }
>();
let myAttemptsCache: { uid: string; t: number; list: QuizAttempt[] } | null =
  null;

export function invalidateClientLeaderboardCache(): void {
  leaderboardQueryCache.clear();
}

export async function apiUpdateProfileName(
  name: string,
  currentUser: UserProfile
): Promise<UserProfile> {
  const nameCheck = validateDisplayName(name);
  if (!nameCheck.valid) {
    throw new Error(nameCheck.error || "name can't be empty.");
  }
  const newName = nameCheck.sanitized;

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser) {
    await fb.fbAuthMod.updateProfile(fb.auth.currentUser, {
      displayName: newName,
    });
    try {
      await syncUserScoreDocNameInFirestore(fb, currentUser.uid, newName);
    } catch {
      // user may not have a ranked scores doc yet — fine
    }
    invalidateClientLeaderboardCache();
    return {
      ...currentUser,
      name: newName,
    };
  }

  // Offline fallback store (strictly separate from Firebase)
  const store = getOfflineLocalStore();
  if (store.accounts[currentUser.uid]) {
    store.accounts[currentUser.uid].name = newName;
  }
  if (store.scores[currentUser.uid]) {
    store.scores[currentUser.uid] = {
      ...store.scores[currentUser.uid],
      name: newName,
      updatedAt: Date.now(),
    };
  }
  saveOfflineLocalStore(store);
  invalidateClientLeaderboardCache();

  return {
    ...currentUser,
    name: newName,
  };
}

/**
 * Records a completed quiz attempt and updates the user's global `scores/{uid}` document:
 * 1. Prevents duplicate score submissions for the same `attemptId`.
 * 2. Awaits all Firestore writes before returning.
 * 3. Runs the `scores/{uid}` transaction independently of the `attempts` history write so
 *    a transient `attempts` error never blocks the user's score from appearing on the leaderboard.
 * 4. Invalidates the leaderboard cache immediately upon completion.
 */
export async function apiRecordAttempt(
  attemptInput: {
    subject: string;
    score: number;
    total: number;
    attemptId?: string;
    mode?: 'standard' | 'deep' | 'unlimited';
  },
  currentUser: UserProfile
): Promise<{ alreadySubmitted?: boolean; updatedScoreDoc?: LeaderboardUserDoc }> {
  const validSubjIds = SUBJECTS.map((s) => s.id);
  const validation = validateAttemptPayload(attemptInput, validSubjIds);
  if (!validation.valid || !validation.data) {
    throw new Error(validation.error || 'Invalid attempt.');
  }
  const { subject, score, total } = validation.data;
  const attemptId =
    attemptInput.attemptId && /^[A-Za-z0-9_-]{1,128}$/.test(attemptInput.attemptId)
      ? attemptInput.attemptId
      : generateAttemptId();

  // Duplicate submission guard for the same test attempt
  if (isAttemptIdAlreadySubmitted(attemptId)) {
    invalidateClientLeaderboardCache();
    return { alreadySubmitted: true };
  }

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser) {
    const authUser = fb.auth.currentUser;
    const uid = authUser.uid;
    if (!isValidFirebaseAuthUid(uid)) {
      throw new Error('Invalid Firebase Authentication UID.');
    }

    const safeName = resolveSafeUserDisplayName(
      currentUser.name || authUser.displayName,
      currentUser.email || authUser.email || ''
    );

    const {
      collection,
      addDoc,
      setDoc,
      doc,
      runTransaction,
      serverTimestamp,
    } = fb.fbStoreMod;

    // Step 1: Update the global `scores/{uid}` leaderboard document FIRST when eligible (>= 10 questions)
    // so the user's ranking is never blocked by private attempt history writes.
    let updatedScoreDoc: LeaderboardUserDoc | undefined;
    let scoreWriteError: unknown = null;

    if (total >= MIN_Q_FOR_RANK) {
      const ref = doc(fb.db, 'scores', uid);
      try {
        await runTransaction(fb.db, async (tx: any) => {
          const snap = await tx.get(ref);
          const rawExistingSubjects =
            snap.exists() &&
            snap.data()?.subjects &&
            typeof snap.data().subjects === 'object'
              ? snap.data().subjects
              : {};

          const subjects: Record<string, SubjectBest> = {};
          for (const [k, v] of Object.entries(rawExistingSubjects)) {
            if (!(VALID_SUBJECT_IDS as readonly string[]).includes(k)) continue;
            const entry = v as any;
            if (
              entry &&
              Number.isInteger(entry.score) &&
              Number.isInteger(entry.total) &&
              entry.total >= MIN_Q_FOR_RANK &&
              entry.total <= 500 &&
              entry.score >= 0 &&
              entry.score <= entry.total
            ) {
              subjects[k] = {
                score: entry.score,
                total: entry.total,
                pct: Math.round((entry.score / entry.total) * 10000) / 100,
              };
            }
          }

          const prev = subjects[subject];
          const pct = score / total;
          const better =
            !prev ||
            pct > prev.score / prev.total ||
            (Math.abs(pct - prev.score / prev.total) < 1e-9 &&
              score > prev.score);
          if (better) {
            subjects[subject] = {
              score,
              total,
              pct: Math.round(pct * 10000) / 100,
            };
          }

          // Resolve the best display name (prefer existing non-contaminated name if currentUser.name was fallback)
          const existingName = snap.exists() ? snap.data()?.name : undefined;
          const finalName =
            safeName !== 'Competitor'
              ? safeName
              : resolveSafeUserDisplayName(
                  existingName,
                  currentUser.email || authUser.email || ''
                );

          const payload = buildConsistentScorePayloadFromRawSubjects(
            finalName,
            subjects,
            serverTimestamp()
          );
          if (payload) {
            tx.set(ref, payload);
            updatedScoreDoc = {
              uid,
              name: payload.name,
              subjects: payload.subjects,
              overallScore: payload.overallScore,
              overallTotal: payload.overallTotal,
              overallPct: payload.overallPct,
              subjectsCount: payload.subjectsCount,
              updatedAt: Date.now(),
            };
          }
        });
      } catch (err) {
        scoreWriteError = err;
      }
    }

    // Step 2: Record private attempt history (`users/{uid}/attempts/{attemptId}`) idempotently
    try {
      const attemptRef = doc(fb.db, 'users', uid, 'attempts', attemptId);
      await setDoc(attemptRef, {
        subject,
        score,
        total,
        ts: serverTimestamp(),
      });
    } catch {
      // Fallback to addDoc if custom doc ID was rejected by legacy deployed rules
      try {
        await addDoc(collection(fb.db, 'users', uid, 'attempts'), {
          subject,
          score,
          total,
          ts: serverTimestamp(),
        });
      } catch (attemptErr) {
        if (scoreWriteError) {
          throw scoreWriteError;
        }
        console.warn('Could not write private attempt history:', attemptErr);
      }
    }

    if (scoreWriteError) {
      const msg =
        scoreWriteError instanceof Error
          ? scoreWriteError.message
          : 'Permission denied or network error while saving leaderboard score.';
      throw new Error(msg);
    }

    markAttemptIdSubmitted(attemptId);
    myAttemptsCache = null;
    invalidateClientLeaderboardCache();
    return { alreadySubmitted: false, updatedScoreDoc };
  }

  // Isolated offline fallback mode (only used when Firebase Auth is not active)
  const safeName = resolveSafeUserDisplayName(
    currentUser.name,
    currentUser.email
  );
  const store = getOfflineLocalStore();
  if (!store.attempts[currentUser.uid]) store.attempts[currentUser.uid] = [];
  store.attempts[currentUser.uid].unshift({
    id: attemptId,
    attemptId,
    subject,
    score,
    total,
    ts: Date.now(),
  });
  let updatedScoreDoc: LeaderboardUserDoc | undefined;
  if (total >= MIN_Q_FOR_RANK) {
    updatedScoreDoc = mergeAttemptIntoUserScore(
      store.scores[currentUser.uid] || null,
      currentUser.uid,
      safeName,
      { subject, score, total }
    );
    store.scores[currentUser.uid] = updatedScoreDoc;
  }
  saveOfflineLocalStore(store);
  markAttemptIdSubmitted(attemptId);
  myAttemptsCache = null;
  invalidateClientLeaderboardCache();
  return { alreadySubmitted: false, updatedScoreDoc };
}

export async function apiGetMyAttempts(
  uid: string
): Promise<QuizAttempt[]> {
  if (
    myAttemptsCache &&
    myAttemptsCache.uid === uid &&
    Date.now() - myAttemptsCache.t < 20000
  ) {
    return myAttemptsCache.list;
  }

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === uid) {
    try {
      const { collection, query, orderBy, limit, getDocs } = fb.fbStoreMod;
      const q = query(
        collection(fb.db, 'users', uid, 'attempts'),
        orderBy('ts', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      const list: QuizAttempt[] = snap.docs.map((d: any) => {
        const x = d.data();
        return {
          id: d.id,
          subject: x.subject,
          score: x.score,
          total: x.total,
          ts: x.ts && x.ts.toMillis ? x.ts.toMillis() : Date.now(),
        };
      });
      myAttemptsCache = { uid, t: Date.now(), list };
      return list;
    } catch (err) {
      console.warn('Firestore attempts query warning:', err);
      return [];
    }
  }

  const store = getOfflineLocalStore();
  return store.attempts[uid] || [];
}

/**
 * Queries and validates the global leaderboard.
 * - For `all` (overall): queries `scores` with `orderBy('overallScore', 'desc'), limit(50)`.
 * - For a specific subject (`python`, `java`, etc.): queries `scores` with
 *   `orderBy('subjects.<subject>.pct', 'desc'), limit(50)` and `orderBy('subjects.<subject>.score', 'desc'), limit(50)`.
 * - Also includes a direct read of `scores/{signedInUid}` and a fallback scan of `scores`
 *   so valid legacy score documents (missing newly indexed subfields) and just-submitted scores
 *   are never silently omitted.
 * - Never merges local offline fallback accounts into the global Firebase leaderboard.
 */
export async function apiGetLeaderboard(
  subjectFilter = 'all',
  force = false
): Promise<{
  rows: LeaderboardRow[];
  totalUsers: number;
}> {
  const cached = leaderboardQueryCache.get(subjectFilter);
  if (!force && cached && Date.now() - cached.t < 15000) {
    return { rows: cached.rows, totalUsers: cached.totalUsers };
  }

  const fb = await getFirebaseServices();

  // Global Firebase Leaderboard (strictly authenticated Firebase users only)
  if (fb && fb.auth.currentUser) {
    const validatedByUid = new Map<string, LeaderboardUserDoc>();
    const {
      collection,
      query,
      orderBy,
      limit,
      getDocs,
      getDoc,
      doc,
      setDoc,
      serverTimestamp,
    } = fb.fbStoreMod;
    const scoresCol = collection(fb.db, 'scores');
    const signedInUid = fb.auth.currentUser.uid;

    const processSingleScoreDoc = (docId: string, rawData: any) => {
      if (!isValidFirebaseAuthUid(docId)) {
        return;
      }
      if (!rawData || typeof rawData !== 'object') {
        return;
      }

      let candidateData: Record<string, unknown> = rawData;
      const isSignedInUserDoc = docId === signedInUid;
      const needsAggregateBackfill =
        rawData.overallScore === undefined ||
        rawData.overallTotal === undefined ||
        rawData.overallPct === undefined ||
        rawData.subjectsCount === undefined;

      if (
        isSignedInUserDoc &&
        (isContaminatedOrCodeText(rawData.name) || needsAggregateBackfill)
      ) {
        const repairedName = resolveSafeUserDisplayName(
          isContaminatedOrCodeText(rawData.name)
            ? fb.auth.currentUser.displayName
            : rawData.name || fb.auth.currentUser.displayName,
          fb.auth.currentUser.email || ''
        );
        const repairedPayload = buildConsistentScorePayloadFromRawSubjects(
          repairedName,
          rawData.subjects,
          serverTimestamp()
        );
        if (repairedPayload) {
          candidateData = {
            ...repairedPayload,
            updatedAt: Date.now(),
          };
          void setDoc(doc(fb.db, 'scores', docId), repairedPayload).catch(
            () => {}
          );
        }
      }

      const validation = validateLeaderboardUserDoc(
        docId,
        candidateData,
        VALID_SUBJECT_IDS,
        { allowLegacyMissingAggregates: true }
      );
      if (validation.valid && validation.doc) {
        validatedByUid.set(docId, validation.doc);
      }
    };

    const collectAndValidateDocs = (docs: any[]) => {
      for (const d of docs) {
        processSingleScoreDoc(d.id, d.data());
      }
    };

    try {
      if (subjectFilter === 'all') {
        const overallSnap = await getDocs(
          query(scoresCol, orderBy('overallScore', 'desc'), limit(50))
        );
        collectAndValidateDocs(overallSnap.docs);
      } else if (
        (VALID_SUBJECT_IDS as readonly string[]).includes(subjectFilter)
      ) {
        const pctField = `subjects.${subjectFilter}.pct`;
        const scoreField = `subjects.${subjectFilter}.score`;
        try {
          const subjPctSnap = await getDocs(
            query(scoresCol, orderBy(pctField, 'desc'), limit(50))
          );
          collectAndValidateDocs(subjPctSnap.docs);
        } catch {
          // Fallback if single-field index is building
        }

        try {
          const subjScoreSnap = await getDocs(
            query(scoresCol, orderBy(scoreField, 'desc'), limit(50))
          );
          collectAndValidateDocs(subjScoreSnap.docs);
        } catch {
          // Fallback if single-field index is building
        }
      }

      // Also ensure any legacy score documents (written before `overallScore` or `subjects.<id>.pct` existed)
      // and the signed-in user's own document are included
      if (validatedByUid.size < 50) {
        const fallbackSnap = await getDocs(query(scoresCol, limit(100)));
        collectAndValidateDocs(fallbackSnap.docs);
      }

      if (isValidFirebaseAuthUid(signedInUid) && !validatedByUid.has(signedInUid)) {
        const myDocSnap = await getDoc(doc(fb.db, 'scores', signedInUid));
        if (myDocSnap.exists()) {
          processSingleScoreDoc(myDocSnap.id, myDocSnap.data());
        }
      }
    } catch (err) {
      console.warn('Firestore leaderboard query warning:', err);
    }

    const users = Array.from(validatedByUid.values());
    const rows = computeLeaderboardRows(users, subjectFilter);
    leaderboardQueryCache.set(subjectFilter, {
      t: Date.now(),
      rows,
      totalUsers: rows.length,
    });
    return { rows, totalUsers: rows.length };
  }

  // Isolated offline fallback leaderboard (used ONLY when Firebase Auth is unavailable)
  const store = getOfflineLocalStore();
  const offlineUsers: LeaderboardUserDoc[] = [];
  for (const [uid, docData] of Object.entries(store.scores)) {
    const check = validateLeaderboardUserDoc(
      uid,
      docData,
      VALID_SUBJECT_IDS,
      { allowLegacyMissingAggregates: true }
    );
    if (check.valid && check.doc) {
      offlineUsers.push(check.doc);
    }
  }
  const rows = computeLeaderboardRows(offlineUsers, subjectFilter);
  leaderboardQueryCache.set(subjectFilter, {
    t: Date.now(),
    rows,
    totalUsers: rows.length,
  });
  return { rows, totalUsers: rows.length };
}

/* ============================================================================
   PHASE 3, 4, 7 & 8: FIRESTORE QUESTION BANK & ADMIN OPERATIONS
   ============================================================================ */

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  currentUser?: any
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const subjectPublishedSyncTimestamps = new Map<string, number>();
const SUBJECT_PUBLISHED_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function parseFirestoreQuestionDoc(
  docId: string,
  raw: Record<string, any>
): QuestionBankDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  if (
    typeof raw.subjectId !== 'string' ||
    typeof raw.question !== 'string' ||
    !Array.isArray(raw.options) ||
    raw.options.length !== 4 ||
    typeof raw.correctIndex !== 'number' ||
    typeof raw.explanation !== 'string'
  ) {
    return null;
  }
  const toMillis = (v: any) =>
    typeof v === 'number'
      ? v
      : v && typeof v.toMillis === 'function'
        ? v.toMillis()
        : Date.now();

  return {
    id: docId,
    subjectId: raw.subjectId.toLowerCase(),
    topic: String(raw.topic || 'General'),
    subtopic: String(raw.subtopic || 'Core Concepts'),
    difficulty:
      raw.difficulty === 'easy' ||
      raw.difficulty === 'medium' ||
      raw.difficulty === 'hard'
        ? raw.difficulty
        : 'medium',
    type: 'single_choice',
    question: raw.question,
    options: [
      String(raw.options[0]),
      String(raw.options[1]),
      String(raw.options[2]),
      String(raw.options[3]),
    ],
    correctIndex: raw.correctIndex,
    explanation: raw.explanation,
    status:
      raw.status === 'published' ||
      raw.status === 'draft' ||
      raw.status === 'archived'
        ? raw.status
        : 'draft',
    fingerprint: String(raw.fingerprint || ''),
    contentSignature: String(raw.contentSignature || ''),
    source:
      raw.source === 'curated' ||
      raw.source === 'imported' ||
      raw.source === 'migrated' ||
      raw.source === 'admin'
        ? raw.source
        : 'curated',
    ...(raw.eventDate ? { eventDate: String(raw.eventDate) } : {}),
    ...(raw.verifiedSource
      ? { verifiedSource: String(raw.verifiedSource) }
      : {}),
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
    createdBy: String(raw.createdBy || 'systemAdminCuratedSeed01'),
    ...(raw.reviewedBy ? { reviewedBy: String(raw.reviewedBy) } : {}),
  };
}

/**
 * Phase 7: Synchronizes published questions (`status == "published"`) for `subjectId`
 * from Firestore `questionBank` with a 5-minute TTL cache so student quizzes always
 * receive the latest published questions without excessive Firestore reads.
 */
export async function apiSyncPublishedQuestionsForSubject(
  subjectId: string,
  force = false
): Promise<number> {
  const subj = subjectId.trim().toLowerCase();
  const lastSync = subjectPublishedSyncTimestamps.get(subj) || 0;
  if (!force && Date.now() - lastSync < SUBJECT_PUBLISHED_CACHE_TTL_MS) {
    return 0;
  }

  const fb = await getFirebaseServices();
  if (!fb || !fb.auth.currentUser) {
    return 0;
  }

  const { collection, query, where, limit, getDocs } = fb.fbStoreMod;
  const colRef = collection(fb.db, 'questionBank');

  const ingestSnapDocs = (docs: any[]): number => {
    const remotePublished: QuestionBankDocument[] = [];
    docs.forEach((d: any) => {
      const parsed = parseFirestoreQuestionDoc(d.id, d.data());
      if (parsed && parsed.status === 'published') {
        remotePublished.push(parsed);
      }
    });
    if (remotePublished.length > 0) {
      mergeRemoteFirestoreQuestionsIntoStore(remotePublished);
      markQuestionsSyncedToFirestore(remotePublished.map((d) => d.id));
    }
    return remotePublished.length;
  };

  try {
    const q = query(
      colRef,
      where('subjectId', '==', subj),
      where('status', '==', 'published'),
      limit(500)
    );
    const snap = await getDocs(q);
    const count = ingestSnapDocs(snap.docs);
    subjectPublishedSyncTimestamps.set(subj, Date.now());
    return count;
  } catch {
    // Fallback to single-field query on status == 'published' (automatic single-field index in Firestore)
    try {
      const fallbackQ = query(
        colRef,
        where('status', '==', 'published'),
        limit(500)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      const count = ingestSnapDocs(fallbackSnap.docs);
      subjectPublishedSyncTimestamps.set(subj, Date.now());
      return count;
    } catch {
      // Graceful offline fallback: local curated & custom store remains active
      return 0;
    }
  }
}

/**
 * Admin Action: Syncs questions (published, draft, and archived) from Firestore `questionBank`
 * using cursor-based pagination (startAfter) to safely retrieve all documents without the 1,000-document limit.
 */
export async function apiAdminSyncQuestionBank(
  currentUser: UserProfile,
  subjectFilter?: string,
  onProgress?: (syncedSoFar: number) => void
): Promise<{ syncedCount: number; syncError?: string }> {
  if (!currentUser.isAdmin) {
    throw new Error('Administrator authorization is required.');
  }
  const fb = await getFirebaseServices();
  if (!fb || !fb.auth.currentUser) {
    return { syncedCount: 0 };
  }

  try {
    const { collection, query, where, limit, startAfter, getDocs } =
      fb.fbStoreMod;
    const colRef = collection(fb.db, 'questionBank');
    const PAGE_SIZE = 500;
    let lastDoc: any = null;
    let hasMore = true;
    const allFetchedDocs: QuestionBankDocument[] = [];

    while (hasMore) {
      const constraints: any[] = [];
      if (subjectFilter && subjectFilter !== 'all') {
        constraints.push(where('subjectId', '==', subjectFilter));
      }
      constraints.push(limit(PAGE_SIZE));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);

      snap.docs.forEach((d: any) => {
        const parsed = parseFirestoreQuestionDoc(d.id, d.data());
        if (parsed) allFetchedDocs.push(parsed);
      });

      if (snap.docs.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        lastDoc = snap.docs[snap.docs.length - 1];
      }

      if (onProgress) {
        onProgress(allFetchedDocs.length);
      }
    }

    if (allFetchedDocs.length > 0) {
      mergeRemoteFirestoreQuestionsIntoStore(allFetchedDocs);
      markQuestionsSyncedToFirestore(allFetchedDocs.map((d) => d.id));
    }

    return { syncedCount: allFetchedDocs.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Admin Firestore sync warning:', msg);
    return { syncedCount: 0, syncError: msg };
  }
}

function recordNonFatalQuestionBankSyncWarning(
  error: unknown,
  operationType: OperationType,
  path: string,
  currentUser?: any
): string {
  const errMsg = error instanceof Error ? error.message : String(error);
  const uid = currentUser?.uid || 'unknown-uid';
  console.warn(
    `[QuestionBank Firestore Sync Notice] (${operationType} on ${path}): ${errMsg}. Make sure the updated firestore.rules file is published in Firebase Console -> Firestore Database -> Rules and /admins/${uid} exists.`
  );
  return `Saved in Admin Question Bank locally, but remote Firestore returned "${errMsg}". Publish the updated firestore.rules in Firebase Console → Firestore Database → Rules to sync to cloud.`;
}

/**
 * Admin Action: Creates a new question in the local store and persists it to Firestore `questionBank/{id}`.
 */
export async function apiAdminCreateQuestion(
  input: {
    subjectId: string;
    topic: string;
    subtopic: string;
    difficulty: QuestionDifficulty;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    status: QuestionStatus;
    source?: QuestionSource;
    eventDate?: string;
    verifiedSource?: string;
  },
  currentUser: UserProfile
): Promise<{
  ok: boolean;
  doc?: QuestionBankDocument;
  validation: QuestionValidationResult;
  persistedToFirestore: boolean;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can create questions.');
  }

  const res = createQuestionInStore(input, currentUser.uid);
  if (!res.ok || !res.doc) {
    return { ...res, persistedToFirestore: false };
  }

  let persistedToFirestore = false;
  let firestoreSyncWarning: string | undefined;
  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { doc, setDoc, serverTimestamp } = fb.fbStoreMod;
    const ref = doc(fb.db, 'questionBank', res.doc.id);
    const firestorePayload: Record<string, unknown> = {
      subjectId: res.doc.subjectId,
      topic: res.doc.topic,
      subtopic: res.doc.subtopic,
      difficulty: res.doc.difficulty,
      type: 'single_choice',
      question: res.doc.question,
      options: res.doc.options,
      correctIndex: res.doc.correctIndex,
      explanation: res.doc.explanation,
      status: res.doc.status,
      fingerprint: res.doc.fingerprint,
      contentSignature: res.doc.contentSignature,
      source: res.doc.source,
      ...(res.doc.eventDate ? { eventDate: res.doc.eventDate } : {}),
      ...(res.doc.verifiedSource
        ? { verifiedSource: res.doc.verifiedSource }
        : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser.uid,
    };

    try {
      await setDoc(ref, firestorePayload);
      persistedToFirestore = true;
      markQuestionsSyncedToFirestore([res.doc.id]);
      subjectPublishedSyncTimestamps.clear();
    } catch (err) {
      firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
        err,
        OperationType.CREATE,
        `questionBank/${res.doc.id}`,
        fb.auth.currentUser
      );
    }
  }

  return { ...res, persistedToFirestore, firestoreSyncWarning };
}

/**
 * Admin Action: Updates an existing question (editing, publishing, or archiving).
 */
export async function apiAdminUpdateQuestion(
  questionId: string,
  updates: Partial<{
    subjectId: string;
    topic: string;
    subtopic: string;
    difficulty: QuestionDifficulty;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    status: QuestionStatus;
    eventDate?: string;
    verifiedSource?: string;
  }>,
  currentUser: UserProfile
): Promise<{
  ok: boolean;
  doc?: QuestionBankDocument;
  validation: QuestionValidationResult;
  persistedToFirestore: boolean;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can update questions.');
  }

  const res = updateQuestionInStore(questionId, updates, currentUser.uid);
  if (!res.ok || !res.doc) {
    return { ...res, persistedToFirestore: false };
  }

  let persistedToFirestore = false;
  let firestoreSyncWarning: string | undefined;
  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { doc, getDoc, setDoc, serverTimestamp } = fb.fbStoreMod;
    const ref = doc(fb.db, 'questionBank', questionId);
    try {
      const existingSnap = await getDoc(ref);
      const existingData = existingSnap.exists() ? existingSnap.data() : null;
      const firestorePayload: Record<string, unknown> = {
        subjectId: res.doc.subjectId,
        topic: res.doc.topic,
        subtopic: res.doc.subtopic,
        difficulty: res.doc.difficulty,
        type: 'single_choice',
        question: res.doc.question,
        options: res.doc.options,
        correctIndex: res.doc.correctIndex,
        explanation: res.doc.explanation,
        status: res.doc.status,
        fingerprint: res.doc.fingerprint,
        contentSignature: res.doc.contentSignature,
        source: res.doc.source,
        ...(res.doc.eventDate ? { eventDate: res.doc.eventDate } : {}),
        ...(res.doc.verifiedSource
          ? { verifiedSource: res.doc.verifiedSource }
          : {}),
        createdAt: existingData?.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: existingData?.createdBy ?? currentUser.uid,
        reviewedBy: currentUser.uid,
      };
      await setDoc(ref, firestorePayload);
      persistedToFirestore = true;
      markQuestionsSyncedToFirestore([questionId]);
      subjectPublishedSyncTimestamps.clear();
    } catch (err) {
      firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
        err,
        OperationType.UPDATE,
        `questionBank/${questionId}`,
        fb.auth.currentUser
      );
    }
  }

  return { ...res, persistedToFirestore, firestoreSyncWarning };
}

/**
 * Admin Action: Deletes a question from the question bank.
 */
export async function apiAdminDeleteQuestion(
  questionId: string,
  currentUser: UserProfile
): Promise<{
  deleted: boolean;
  persistedToFirestore: boolean;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can delete questions.');
  }

  const deleted = deleteQuestionFromStore(questionId);
  let persistedToFirestore = false;
  let firestoreSyncWarning: string | undefined;

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { doc, deleteDoc } = fb.fbStoreMod;
    try {
      await deleteDoc(doc(fb.db, 'questionBank', questionId));
      persistedToFirestore = true;
      unmarkQuestionsSyncedToFirestore([questionId]);
      subjectPublishedSyncTimestamps.clear();
    } catch (err) {
      firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
        err,
        OperationType.DELETE,
        `questionBank/${questionId}`,
        fb.auth.currentUser
      );
    }
  }

  return { deleted, persistedToFirestore, firestoreSyncWarning };
}

/**
 * Admin Action: Deletes all draft questions (optionally filtered by subjectId)
 * from both the local store and Firestore `questionBank/{id}`.
 * Uses CHUNK_SIZE = 10 to stay well within Firestore's 20-exists()-calls-per-batch rule limit.
 */
export async function apiAdminDeleteAllDrafts(
  currentUser: UserProfile,
  subjectId?: string
): Promise<{
  deletedCount: number;
  deletedFromFirestoreCount: number;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can delete draft questions.');
  }

  const { deletedCount, deletedIds } =
    deleteAllDraftQuestionsFromStore(subjectId);
  let deletedFromFirestoreCount = 0;
  let firestoreSyncWarning: string | undefined;

  const fb = await getFirebaseServices();
  if (
    fb &&
    fb.auth.currentUser &&
    fb.auth.currentUser.uid === currentUser.uid &&
    deletedIds.length > 0
  ) {
    const { doc, writeBatch } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    for (let i = 0; i < deletedIds.length; i += CHUNK_SIZE) {
      const slice = deletedIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(fb.db);
      for (const qId of slice) {
        batch.delete(doc(fb.db, 'questionBank', qId));
      }
      try {
        await batch.commit();
        deletedFromFirestoreCount += slice.length;
        unmarkQuestionsSyncedToFirestore(slice);
      } catch (err) {
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.DELETE,
          'questionBank (delete all drafts)',
          fb.auth.currentUser
        );
        break;
      }
    }
  }

  return { deletedCount, deletedFromFirestoreCount, firestoreSyncWarning };
}

/**
 * Admin Action: Approves and publishes all draft questions (optionally filtered by subjectId)
 * in both the local store and Firestore `questionBank/{id}`.
 * Uses CHUNK_SIZE = 10 to stay well within Firestore's 20-exists()-calls-per-batch rule limit.
 */
export async function apiAdminPublishAllDrafts(
  currentUser: UserProfile,
  subjectId?: string
): Promise<{
  publishedCount: number;
  publishedToFirestoreCount: number;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error(
      'Unauthorized: Only administrators can approve and publish draft questions.'
    );
  }

  const { publishedCount, publishedDocs } = publishAllDraftQuestionsInStore(
    currentUser.uid,
    subjectId
  );
  let publishedToFirestoreCount = 0;
  let firestoreSyncWarning: string | undefined;
  subjectPublishedSyncTimestamps.clear();

  const fb = await getFirebaseServices();
  if (
    fb &&
    fb.auth.currentUser &&
    fb.auth.currentUser.uid === currentUser.uid &&
    publishedDocs.length > 0
  ) {
    const { doc, writeBatch, serverTimestamp } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    for (let i = 0; i < publishedDocs.length; i += CHUNK_SIZE) {
      const slice = publishedDocs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(fb.db);
      for (const d of slice) {
        const ref = doc(fb.db, 'questionBank', d.id);
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
          source: d.source,
          ...(d.eventDate ? { eventDate: d.eventDate } : {}),
          ...(d.verifiedSource ? { verifiedSource: d.verifiedSource } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
          reviewedBy: currentUser.uid,
        });
      }
      try {
        await batch.commit();
        publishedToFirestoreCount += slice.length;
        markQuestionsSyncedToFirestore(slice.map((d) => d.id));
      } catch (err) {
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.UPDATE,
          'questionBank (approve & publish all drafts)',
          fb.auth.currentUser
        );
        break;
      }
    }
  }

  return { publishedCount, publishedToFirestoreCount, firestoreSyncWarning };
}

/**
 * Admin Action: Deletes all bulk-imported questions (`source === 'imported'`)
 * from both the local store and Firestore `questionBank/{id}`.
 * Uses CHUNK_SIZE = 10 to stay well within Firestore's 20-exists()-calls-per-batch rule limit.
 */
export async function apiAdminDeleteBulkImportedQuestions(
  currentUser: UserProfile
): Promise<{
  deletedCount: number;
  deletedFromFirestoreCount: number;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can delete bulk-imported questions.');
  }

  const { deletedCount, deletedIds } = deleteBulkImportedQuestionsFromStore();
  let deletedFromFirestoreCount = 0;
  let firestoreSyncWarning: string | undefined;
  subjectPublishedSyncTimestamps.clear();

  const fb = await getFirebaseServices();
  if (
    fb &&
    fb.auth.currentUser &&
    fb.auth.currentUser.uid === currentUser.uid &&
    deletedIds.length > 0
  ) {
    const { doc, writeBatch } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    for (let i = 0; i < deletedIds.length; i += CHUNK_SIZE) {
      const slice = deletedIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(fb.db);
      for (const qId of slice) {
        batch.delete(doc(fb.db, 'questionBank', qId));
      }
      try {
        await batch.commit();
        deletedFromFirestoreCount += slice.length;
        unmarkQuestionsSyncedToFirestore(slice);
      } catch (err) {
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.DELETE,
          'questionBank (delete bulk imported questions)',
          fb.auth.currentUser
        );
        break;
      }
    }
  }

  return { deletedCount, deletedFromFirestoreCount, firestoreSyncWarning };
}

export interface BulkImportBatchOutcome {
  batchIndex: number;
  count: number;
  status: 'persisted' | 'failed';
  error?: string;
  questionIds: string[];
}

export interface BulkImportCommitResult {
  totalDetected: number;
  validReadyCount: number;
  rejectedCount: number;
  importedCount: number;
  persistedToFirestoreCount: number;
  failedCount: number;
  pendingCount: number;
  batchOutcomes: BulkImportBatchOutcome[];
  firestoreSyncWarning?: string;
}

/**
 * Admin Action: Commits validated bulk-import records strictly as `status: 'draft'`
 * so unreviewed imports are never automatically published to students.
 * Uses CHUNK_SIZE = 10 so each batch triggers at most 10 `exists()` checks in Firestore rules.
 * Continues processing subsequent batches even if one fails and maintains accurate per-batch reports.
 */
export async function apiAdminCommitBulkImport(
  summary: BulkImportValidationSummary,
  currentUser: UserProfile,
  onProgress?: (progress: {
    currentBatch: number;
    totalBatches: number;
    persistedCount: number;
    failedCount: number;
  }) => void
): Promise<BulkImportCommitResult> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can bulk-import questions.');
  }

  const { importedCount, importedDocs } = commitBulkImportDraftsToStore(summary);
  let persistedToFirestoreCount = 0;
  let failedCount = 0;
  const batchOutcomes: BulkImportBatchOutcome[] = [];
  let firestoreSyncWarning: string | undefined;

  const fb = await getFirebaseServices();
  if (
    fb &&
    fb.auth.currentUser &&
    fb.auth.currentUser.uid === currentUser.uid &&
    importedDocs.length > 0
  ) {
    const { doc, writeBatch, serverTimestamp } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    const totalBatches = Math.ceil(importedDocs.length / CHUNK_SIZE);

    for (let i = 0; i < importedDocs.length; i += CHUNK_SIZE) {
      const slice = importedDocs.slice(i, i + CHUNK_SIZE);
      const batchIdx = Math.floor(i / CHUNK_SIZE) + 1;
      const batch = writeBatch(fb.db);
      for (const d of slice) {
        const ref = doc(fb.db, 'questionBank', d.id);
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
          status: 'draft', // Never auto-publish bulk imports
          fingerprint: d.fingerprint,
          contentSignature: d.contentSignature,
          source: 'imported',
          ...(d.eventDate ? { eventDate: d.eventDate } : {}),
          ...(d.verifiedSource ? { verifiedSource: d.verifiedSource } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
      }

      try {
        await batch.commit();
        persistedToFirestoreCount += slice.length;
        markQuestionsSyncedToFirestore(slice.map((d) => d.id));
        batchOutcomes.push({
          batchIndex: batchIdx,
          count: slice.length,
          status: 'persisted',
          questionIds: slice.map((d) => d.id),
        });
      } catch (err) {
        failedCount += slice.length;
        const errMsg = err instanceof Error ? err.message : String(err);
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.WRITE,
          `questionBank (bulk import batch #${batchIdx})`,
          fb.auth.currentUser
        );
        batchOutcomes.push({
          batchIndex: batchIdx,
          count: slice.length,
          status: 'failed',
          error: errMsg,
          questionIds: slice.map((d) => d.id),
        });
        // Continue processing independent batches per Condition 5
      }

      if (onProgress) {
        onProgress({
          currentBatch: batchIdx,
          totalBatches,
          persistedCount: persistedToFirestoreCount,
          failedCount,
        });
      }
    }
  } else if (!fb || !fb.auth.currentUser) {
    failedCount = importedDocs.length;
    firestoreSyncWarning =
      'Cloud Firestore is currently offline or unauthenticated. Questions are staged locally as drafts.';
    batchOutcomes.push({
      batchIndex: 1,
      count: importedDocs.length,
      status: 'failed',
      error: firestoreSyncWarning,
      questionIds: importedDocs.map((d) => d.id),
    });
  }

  const pendingCount = Math.max(0, importedCount - persistedToFirestoreCount);

  return {
    totalDetected: summary.totalRecords,
    validReadyCount: summary.validReadyCount,
    rejectedCount: summary.rejectedCount,
    importedCount,
    persistedToFirestoreCount,
    failedCount,
    pendingCount,
    batchOutcomes,
    firestoreSyncWarning,
  };
}

/**
 * Admin Action: Retries persisting unpersisted bulk-import records to Cloud Firestore.
 * Does NOT re-upload already confirmed documents. Uses deterministic IDs for 100% idempotent writes.
 */
export async function apiAdminRetryBulkImport(
  summary: BulkImportValidationSummary,
  currentUser: UserProfile,
  onProgress?: (progress: {
    currentBatch: number;
    totalBatches: number;
    persistedCount: number;
    failedCount: number;
  }) => void
): Promise<BulkImportCommitResult> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can retry bulk imports.');
  }

  const validPreparedDocs = summary.rows
    .filter((r) => r.valid && r.preparedDoc)
    .map((r) => r.preparedDoc!);

  const unpersistedDocs = validPreparedDocs.filter(
    (d) => !isQuestionSyncedToFirestore(d.id)
  );

  const alreadyPersistedCount =
    validPreparedDocs.length - unpersistedDocs.length;

  if (unpersistedDocs.length === 0) {
    return {
      totalDetected: summary.totalRecords,
      validReadyCount: summary.validReadyCount,
      rejectedCount: summary.rejectedCount,
      importedCount: validPreparedDocs.length,
      persistedToFirestoreCount: alreadyPersistedCount,
      failedCount: 0,
      pendingCount: 0,
      batchOutcomes: [],
    };
  }

  const fb = await getFirebaseServices();
  let newlyPersistedCount = 0;
  let failedCount = 0;
  const batchOutcomes: BulkImportBatchOutcome[] = [];
  let firestoreSyncWarning: string | undefined;

  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { doc, writeBatch, serverTimestamp } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    const totalBatches = Math.ceil(unpersistedDocs.length / CHUNK_SIZE);

    for (let i = 0; i < unpersistedDocs.length; i += CHUNK_SIZE) {
      const slice = unpersistedDocs.slice(i, i + CHUNK_SIZE);
      const batchIdx = Math.floor(i / CHUNK_SIZE) + 1;
      const batch = writeBatch(fb.db);
      for (const d of slice) {
        const ref = doc(fb.db, 'questionBank', d.id);
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
          status: 'draft',
          fingerprint: d.fingerprint,
          contentSignature: d.contentSignature,
          source: 'imported',
          ...(d.eventDate ? { eventDate: d.eventDate } : {}),
          ...(d.verifiedSource ? { verifiedSource: d.verifiedSource } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
      }

      try {
        await batch.commit();
        newlyPersistedCount += slice.length;
        markQuestionsSyncedToFirestore(slice.map((d) => d.id));
        batchOutcomes.push({
          batchIndex: batchIdx,
          count: slice.length,
          status: 'persisted',
          questionIds: slice.map((d) => d.id),
        });
      } catch (err) {
        failedCount += slice.length;
        const errMsg = err instanceof Error ? err.message : String(err);
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.WRITE,
          `questionBank (retry batch #${batchIdx})`,
          fb.auth.currentUser
        );
        batchOutcomes.push({
          batchIndex: batchIdx,
          count: slice.length,
          status: 'failed',
          error: errMsg,
          questionIds: slice.map((d) => d.id),
        });
      }

      if (onProgress) {
        onProgress({
          currentBatch: batchIdx,
          totalBatches,
          persistedCount: alreadyPersistedCount + newlyPersistedCount,
          failedCount,
        });
      }
    }
  } else {
    failedCount = unpersistedDocs.length;
    firestoreSyncWarning =
      'Cloud Firestore is currently offline or unauthenticated. Cannot retry at this time.';
  }

  const finalPersisted = alreadyPersistedCount + newlyPersistedCount;
  const finalPending = Math.max(0, validPreparedDocs.length - finalPersisted);

  return {
    totalDetected: summary.totalRecords,
    validReadyCount: summary.validReadyCount,
    rejectedCount: summary.rejectedCount,
    importedCount: validPreparedDocs.length,
    persistedToFirestoreCount: finalPersisted,
    failedCount,
    pendingCount: finalPending,
    batchOutcomes,
    firestoreSyncWarning,
  };
}

/**
 * Admin Action: Pushes any locally staged custom or bulk-imported questions (`admin` / `imported`)
 * that have not yet been confirmed in Cloud Firestore into `questionBank/{id}`.
 */
export async function apiAdminPushUnsyncedQuestionsToFirestore(
  currentUser: UserProfile
): Promise<{
  totalUnsynced: number;
  pushedToFirestoreCount: number;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can push questions to Firestore.');
  }

  const unsyncedDocs = getUnsyncedCustomQuestions();
  const totalUnsynced = unsyncedDocs.length;
  if (totalUnsynced === 0) {
    return { totalUnsynced: 0, pushedToFirestoreCount: 0 };
  }

  let pushedToFirestoreCount = 0;
  let firestoreSyncWarning: string | undefined;

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { doc, writeBatch, serverTimestamp } = fb.fbStoreMod;
    const CHUNK_SIZE = 10;
    for (let i = 0; i < unsyncedDocs.length; i += CHUNK_SIZE) {
      const slice = unsyncedDocs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(fb.db);
      for (const d of slice) {
        const ref = doc(fb.db, 'questionBank', d.id);
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
          status: d.status,
          fingerprint: d.fingerprint,
          contentSignature: d.contentSignature,
          source: d.source,
          ...(d.eventDate ? { eventDate: d.eventDate } : {}),
          ...(d.verifiedSource ? { verifiedSource: d.verifiedSource } : {}),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
          ...(d.status === 'published' ? { reviewedBy: currentUser.uid } : {}),
        });
      }
      try {
        await batch.commit();
        pushedToFirestoreCount += slice.length;
        markQuestionsSyncedToFirestore(slice.map((d) => d.id));
        subjectPublishedSyncTimestamps.clear();
      } catch (err) {
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.WRITE,
          'questionBank (push unsynced questions)',
          fb.auth.currentUser
        );
        break;
      }
    }
  } else {
    firestoreSyncWarning =
      'Firebase Auth session is not active. Log in with your administrator account to push to Cloud Firestore.';
  }

  return { totalUnsynced, pushedToFirestoreCount, firestoreSyncWarning };
}

/**
 * Phase 8: Idempotent Migration of the Curated Question Bank into Firestore `questionBank/{questionId}`.
 * Preserves original question content, answer keys, explanations, topic/difficulty metadata,
 * deterministic IDs, and fingerprints without creating duplicates when re-run.
 * Uses CHUNK_SIZE = 10 to stay within Firestore's 20-exists()-calls-per-batch rule limit.
 */
export async function apiAdminMigrateCuratedBankToFirestore(
  currentUser: UserProfile,
  onProgress?: (completed: number, total: number) => void
): Promise<{
  totalPrepared: number;
  migratedToFirestore: number;
  skippedExistingInFirestore: number;
  backupKey: string;
  firestoreSyncWarning?: string;
}> {
  if (!currentUser.isAdmin) {
    throw new Error('Unauthorized: Only administrators can run Firestore migration.');
  }

  const prep = prepareIdempotentCuratedMigration(currentUser.uid);
  const totalPrepared = prep.docsToMigrate.length;
  let migratedToFirestore = 0;
  let skippedExistingInFirestore = 0;
  let firestoreSyncWarning: string | undefined;

  const fb = await getFirebaseServices();
  if (fb && fb.auth.currentUser && fb.auth.currentUser.uid === currentUser.uid) {
    const { collection, query, limit, startAfter, getDocs, doc, writeBatch, serverTimestamp } =
      fb.fbStoreMod;

    // Fetch existing document IDs in questionBank with cursor-based pagination so migration is 100% idempotent
    const existingIds = new Set<string>();
    try {
      let lastDoc: any = null;
      let hasMore = true;
      while (hasMore) {
        const constraints: any[] = [limit(500)];
        if (lastDoc) constraints.push(startAfter(lastDoc));
        const q = query(collection(fb.db, 'questionBank'), ...constraints);
        const snap = await getDocs(q);
        snap.docs.forEach((d: any) => existingIds.add(d.id));
        if (snap.docs.length < 500) {
          hasMore = false;
        } else {
          lastDoc = snap.docs[snap.docs.length - 1];
        }
      }
      markQuestionsSyncedToFirestore(Array.from(existingIds));
    } catch {
      // Proceed with batch set if collection is empty
    }

    const toWrite = prep.docsToMigrate.filter((d) => {
      if (existingIds.has(d.id)) {
        skippedExistingInFirestore++;
        return false;
      }
      return true;
    });

    const CHUNK_SIZE = 10;
    for (let i = 0; i < toWrite.length; i += CHUNK_SIZE) {
      const slice = toWrite.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(fb.db);
      for (const d of slice) {
        const ref = doc(fb.db, 'questionBank', d.id);
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
      }
      try {
        await batch.commit();
        migratedToFirestore += slice.length;
        markQuestionsSyncedToFirestore(slice.map((d) => d.id));
        if (onProgress) {
          onProgress(
            skippedExistingInFirestore + migratedToFirestore,
            totalPrepared
          );
        }
      } catch (err) {
        firestoreSyncWarning = recordNonFatalQuestionBankSyncWarning(
          err,
          OperationType.WRITE,
          'questionBank (curated migration batch)',
          fb.auth.currentUser
        );
        break;
      }
    }
  } else if (onProgress) {
    onProgress(totalPrepared, totalPrepared);
  }

  return {
    totalPrepared,
    migratedToFirestore,
    skippedExistingInFirestore,
    backupKey: prep.backupKey,
    firestoreSyncWarning,
  };
}


