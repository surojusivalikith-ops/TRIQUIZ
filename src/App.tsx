import React, { useEffect, useState } from 'react';
import {
  GK_CATEGORIES,
  Question,
  SUBJECTS,
  selectQuizQuestions,
} from './utils/questionEngine';
import {
  PersistedActiveQuizSession,
  UserProfile,
  apiLogout,
  apiRecordAttempt,
  apiRestoreSession,
  apiSyncPublishedQuestionsForSubject,
  generateAttemptId,
  getAllSeenCounts,
  getAttemptedSignaturesForSubject,
  getSeenSignaturesForSubject,
  loadActiveQuizSession,
  saveActiveQuizSession,
} from './utils/apiService';
import { AuthScreenMode, AuthViews } from './components/AuthViews';
import { CompletedQuizSummary, QuizMode, QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { RankingsView } from './components/RankingsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';

type Screen =
  | 'boot'
  | 'login'
  | 'signup'
  | 'verify'
  | 'reset'
  | 'dashboard'
  | 'gkCategory'
  | 'quiz'
  | 'result'
  | 'rankings'
  | 'profile'
  | 'admin';

export default function App() {
  const [screen, setScreen] = useState<Screen>('boot');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>('standard');
  const [activeQuiz, setActiveQuiz] = useState<{
    attemptId: string;
    subjectId: string;
    gkCategory?: string | null;
    mode: QuizMode;
    questions: Question[];
    restoredSession?: PersistedActiveQuizSession | null;
    shortageMessage?: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<CompletedQuizSummary | null>(null);
  const [saveError, setSaveError] = useState('');
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [leaderboardRefreshTrigger, setLeaderboardRefreshTrigger] = useState(1);
  const [rankFilter, setRankFilter] = useState('all');
  const [seenCounts, setSeenCounts] = useState<Record<string, number>>({});

  const refreshSeenCounts = (uid?: string) => {
    setSeenCounts(getAllSeenCounts(uid || currentUser?.uid));
  };

  useEffect(() => {
    apiRestoreSession()
      .then((res) => {
        if (res.user) {
          if (res.needsVerification) {
            setPendingUser(res.user);
            setScreen('verify');
          } else {
            setCurrentUser(res.user);
            refreshSeenCounts(res.user.uid);
            void apiSyncPublishedQuestionsForSubject('python');
            const restored = loadActiveQuizSession(res.user.uid);
            if (restored) {
              setQuizMode(restored.mode);
              setActiveQuiz({
                attemptId: restored.attemptId,
                subjectId: restored.subjectId,
                gkCategory: restored.gkCategory,
                mode: restored.mode,
                questions: restored.questions,
                restoredSession: restored,
                shortageMessage: restored.shortageMessage,
              });
              setScreen('quiz');
            } else {
              setScreen('dashboard');
            }
          }
        } else {
          setScreen('login');
        }
      })
      .catch(() => {
        setScreen('login');
      });
  }, []);

  const startSubjectQuiz = async (
    subjectId: string,
    modeOverride?: QuizMode,
    gkCategory?: string | null
  ) => {
    const uid = currentUser?.uid || 'anonymous';
    saveActiveQuizSession(uid, null);
    await apiSyncPublishedQuestionsForSubject(subjectId);

    const chosenMode = modeOverride || quizMode;
    const initialCount = chosenMode === 'deep' ? 30 : 15;
    const seen = getSeenSignaturesForSubject(subjectId, uid);
    const attempted = getAttemptedSignaturesForSubject(subjectId, uid);

    const selection = selectQuizQuestions(
      subjectId,
      initialCount,
      seen,
      gkCategory,
      {
        maxAttemptsPerQuestion: 250,
        attemptedSignatures: attempted,
        // Do NOT mark all generated questions as seen upfront;
        // QuizView records each question only when it is actually presented to the user.
        recordIntoProvidedSet: false,
      }
    );

    const attemptId = generateAttemptId();

    setActiveQuiz({
      attemptId,
      subjectId,
      gkCategory,
      mode: chosenMode,
      questions: selection.questions,
      restoredSession: null,
      shortageMessage: selection.shortageMessage,
    });
    setScreen('quiz');
  };

  const persistAttemptScore = async (summary: CompletedQuizSummary) => {
    if (!currentUser) return;
    setSaveError('');
    setIsSavingScore(true);

    try {
      await apiRecordAttempt(
        {
          attemptId: summary.attemptId,
          subject: summary.subject,
          score: summary.score,
          total: summary.total,
          mode: summary.mode,
        },
        currentUser
      );
      setLeaderboardRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'check your connection and try again.'
      );
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleFinishQuiz = async (summary: CompletedQuizSummary) => {
    setLastResult(summary);
    setRankFilter(summary.subject);
    setActiveQuiz(null);
    refreshSeenCounts(currentUser?.uid);
    setScreen('result');

    await persistAttemptScore(summary);
  };

  const handleLogout = async () => {
    if (currentUser) {
      saveActiveQuizSession(currentUser.uid, null);
    }
    setActiveQuiz(null);
    await apiLogout();
    setCurrentUser(null);
    setPendingUser(null);
    setSeenCounts({});
    setScreen('login');
  };

  const getTerminalPath = (): string => {
    if (
      !currentUser ||
      ['boot', 'login', 'signup', 'verify', 'reset'].includes(screen)
    ) {
      const subPath =
        screen === 'boot' ? '' : screen === 'verify' ? 'verify-email' : screen;
      return `guest@compile-rank: ~/${subPath}`;
    }
    const handle = currentUser.email.split('@')[0];
    if (screen === 'dashboard') return `${handle}@compile-rank: ~/subjects`;
    if (screen === 'profile') return `${handle}@compile-rank: ~/profile`;
    if (screen === 'gkCategory') return `${handle}@compile-rank: ~/gk/topics`;
    if (screen === 'quiz' && activeQuiz)
      return `${handle}@compile-rank: ~/quiz/${activeQuiz.subjectId}`;
    if (screen === 'result') return `${handle}@compile-rank: ~/result`;
    if (screen === 'rankings') return `${handle}@compile-rank: ~/rankings`;
    if (screen === 'admin') return `${handle}@compile-rank: ~/admin/question-bank`;
    return `${handle}@compile-rank: ~`;
  };

  const showUserBar =
    currentUser &&
    !['boot', 'login', 'signup', 'verify', 'reset'].includes(screen);

  return (
    <div className="max-w-[960px] mx-auto px-4 pt-7 pb-20">
      <div className="bg-[#12181f] border border-[#232b35] rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Chrome Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#161d26] border-b border-[#232b35]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shrink-0" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shrink-0" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] shrink-0" />
            <span className="ml-2 font-mono text-xs text-[#8b96a3] truncate">
              {getTerminalPath()}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#8b96a3] hidden sm:inline">
            all 9 modules · unlimited non-repeating engine
          </span>
        </div>

        {/* Terminal Body */}
        <main className="p-6 sm:p-8">
          {/* Top Brand & Navigation Row */}
          <header className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  saveActiveQuizSession(currentUser.uid, null);
                  setActiveQuiz(null);
                  setScreen('dashboard');
                }
              }}
              className="font-mono font-bold text-base tracking-wide text-[#e6edf3] cursor-pointer text-left whitespace-nowrap shrink-0"
            >
              compile<span className="text-[#00d9a0]">&amp;</span>rank
            </button>

            {showUserBar && currentUser && (
              <div className="flex items-center gap-3 font-mono text-xs text-[#8b96a3]">
                <button
                  type="button"
                  onClick={() => {
                    saveActiveQuizSession(currentUser.uid, null);
                    setActiveQuiz(null);
                    setScreen('dashboard');
                  }}
                  className={`hover:text-[#e6edf3] cursor-pointer transition-colors whitespace-nowrap ${
                    screen === 'dashboard' ? 'text-[#00d9a0] font-semibold' : ''
                  }`}
                >
                  subjects
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    saveActiveQuizSession(currentUser.uid, null);
                    setActiveQuiz(null);
                    setScreen('rankings');
                  }}
                  className={`hover:text-[#e6edf3] cursor-pointer transition-colors whitespace-nowrap ${
                    screen === 'rankings' ? 'text-[#00d9a0] font-semibold' : ''
                  }`}
                >
                  rankings
                </button>
                {currentUser.isAdmin && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        saveActiveQuizSession(currentUser.uid, null);
                        setActiveQuiz(null);
                        setScreen('admin');
                      }}
                      className={`hover:text-[#e6edf3] cursor-pointer transition-colors whitespace-nowrap ${
                        screen === 'admin'
                          ? 'text-[#00d9a0] font-semibold'
                          : 'text-[#ffb454]'
                      }`}
                    >
                      admin
                    </button>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    saveActiveQuizSession(currentUser.uid, null);
                    setActiveQuiz(null);
                    setScreen('profile');
                  }}
                  title="view profile"
                  className={`underline decoration-dotted hover:text-[#e6edf3] cursor-pointer transition-colors whitespace-nowrap ${
                    screen === 'profile' ? 'text-[#00d9a0] font-semibold' : ''
                  }`}
                >
                  {currentUser.name || currentUser.email}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="border border-[#232b35] hover:border-[#8b96a3] hover:text-[#e6edf3] px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-colors whitespace-nowrap"
                >
                  log out
                </button>
              </div>
            )}
          </header>

          {/* Screen Content */}
          {screen === 'boot' && (
            <div className="py-8 text-center font-mono text-xs text-[#8b96a3]">
              connecting…
            </div>
          )}

          {(screen === 'login' ||
            screen === 'signup' ||
            screen === 'verify' ||
            screen === 'reset') && (
            <AuthViews
              mode={screen as AuthScreenMode}
              pendingUser={pendingUser}
              onSwitchMode={(m, user) => {
                if (user !== undefined) setPendingUser(user);
                setScreen(m);
              }}
              onAuthenticated={(user) => {
                setPendingUser(null);
                setCurrentUser(user);
                refreshSeenCounts(user.uid);
                setScreen('dashboard');
              }}
            />
          )}

          {screen === 'dashboard' && currentUser && (
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
                <h1 className="font-mono text-2xl font-bold text-[#e6edf3]">
                  choose a subject<span className="terminal-cursor" />
                </h1>

                {/* Quiz Mode Selector */}
                <div
                  role="group"
                  aria-label="Quiz length mode"
                  className="flex items-center gap-1.5 bg-[#161d26] p-1 rounded-lg border border-[#232b35]"
                >
                  {(
                    [
                      { id: 'standard', label: '15 Qs (Ranked)' },
                      { id: 'deep', label: '30 Qs (Deep)' },
                      { id: 'unlimited', label: '∞ Unlimited Mode' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setQuizMode(m.id)}
                      className={`font-mono text-[11px] px-2.5 py-1 rounded cursor-pointer transition-colors whitespace-nowrap ${
                        quizMode === m.id
                          ? 'bg-[#00d9a0] text-[#04140f] font-bold'
                          : 'text-[#8b96a3] hover:text-[#e6edf3]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#8b96a3] mb-6 leading-relaxed">
                Every module generates unlimited, non-repeating multiple-choice questions (40s per question) with step-by-step explanations for both right and wrong answers. Seen questions are tracked per user so you never repeat a question.
              </p>

              {/* 9 Subject Modules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {SUBJECTS.map((s) => {
                  const seenInSubj = seenCounts[s.id] || 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (s.id === 'gk') {
                          setScreen('gkCategory');
                        } else {
                          startSubjectQuiz(s.id);
                        }
                      }}
                      className="text-left bg-[#161d26] hover:bg-[#1b2430] border border-[#232b35] hover:border-[#00d9a0] rounded-xl p-4.5 cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className="font-mono text-base font-bold whitespace-nowrap"
                            style={{ color: s.hex }}
                          >
                            {s.label}
                          </span>
                          <span className="font-mono text-[11px] text-[#8b96a3] whitespace-nowrap shrink-0">
                            {s.id === 'gk' ? '14 topics →' : 'start →'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b96a3] leading-relaxed">
                          {s.desc}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#232b35] font-mono text-[11px] text-[#8b96a3] flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-[#e6edf3]">unlimited</strong> · non-repeating
                        </span>
                        {seenInSubj > 0 && (
                          <span className="text-[#00d9a0] tabular-nums">
                            {seenInSubj} seen
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation Row */}
              <div className="flex items-center gap-2.5 flex-wrap mt-6">
                <button
                  type="button"
                  onClick={() => setScreen('rankings')}
                  className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  view rankings →
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('profile')}
                  className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  my profile →
                </button>
              </div>
            </div>
          )}

          {screen === 'gkCategory' && currentUser && (
            <div>
              <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-1.5">
                general knowledge<span className="terminal-cursor" />
              </h1>
              <p className="text-sm text-[#8b96a3] mb-6 leading-relaxed">
                Pick a specific topic to focus on, or run a mixed test across all{' '}
                {GK_CATEGORIES.length - 1} topics. Every topic generates unlimited non-repeating questions with full explanations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {GK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      startSubjectQuiz(
                        'gk',
                        quizMode,
                        cat === 'All' ? null : cat
                      )
                    }
                    className="text-left bg-[#161d26] hover:bg-[#1b2430] border border-[#232b35] hover:border-[#6fcf97] rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    <div className="font-mono text-sm font-bold text-[#6fcf97] mb-1">
                      {cat}
                    </div>
                    <div className="text-xs text-[#8b96a3] leading-relaxed mb-3">
                      {cat === 'All'
                        ? 'Mixed set drawn across every GK topic.'
                        : `${cat} curated & generated questions.`}
                    </div>
                    <div className="font-mono text-[11px] text-[#8b96a3]">
                      <strong className="text-[#e6edf3]">unlimited</strong> · non-repeating
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setScreen('dashboard')}
                  className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                >
                  ← back to subjects
                </button>
              </div>
            </div>
          )}

          {screen === 'quiz' && activeQuiz && currentUser && (
            <QuizView
              attemptId={activeQuiz.attemptId}
              currentUid={currentUser.uid}
              subjectId={activeQuiz.subjectId}
              gkCategory={activeQuiz.gkCategory}
              mode={activeQuiz.mode}
              initialQuestions={activeQuiz.questions}
              restoredSession={activeQuiz.restoredSession}
              initialShortageMessage={activeQuiz.shortageMessage}
              onFinishQuiz={handleFinishQuiz}
              onQuestionHistoryUpdated={() => refreshSeenCounts(currentUser.uid)}
              onExitQuiz={() => {
                saveActiveQuizSession(currentUser.uid, null);
                setActiveQuiz(null);
                refreshSeenCounts(currentUser.uid);
                setScreen('dashboard');
              }}
            />
          )}

          {screen === 'result' && lastResult && currentUser && (
            <ResultView
              summary={lastResult}
              currentUid={currentUser.uid}
              saveError={saveError}
              isSavingScore={isSavingScore}
              leaderboardRefreshTrigger={leaderboardRefreshTrigger}
              onRetrySave={() => persistAttemptScore(lastResult)}
              onRetake={(subjId, mode, gkCat) =>
                startSubjectQuiz(subjId, mode, gkCat)
              }
              onBackToDashboard={() => {
                refreshSeenCounts(currentUser.uid);
                setScreen('dashboard');
              }}
              onViewRankings={(subjId) => {
                setRankFilter(subjId);
                setScreen('rankings');
              }}
            />
          )}

          {screen === 'rankings' && currentUser && (
            <RankingsView
              initialFilter={rankFilter}
              currentUid={currentUser.uid}
              onBackToDashboard={() => setScreen('dashboard')}
            />
          )}

          {screen === 'profile' && currentUser && (
            <ProfileView
              user={currentUser}
              onUserUpdated={(updated) => {
                setCurrentUser(updated);
                setLeaderboardRefreshTrigger((prev) => prev + 1);
              }}
              onBackToDashboard={() => setScreen('dashboard')}
            />
          )}

          {screen === 'admin' && currentUser && (
            <AdminDashboardView
              currentUser={currentUser}
              onBackToStudentApp={() => {
                refreshSeenCounts(currentUser.uid);
                setScreen('dashboard');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
