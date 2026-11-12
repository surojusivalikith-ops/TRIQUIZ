import React, { useEffect, useRef, useState } from 'react';
import {
  Question,
  SUBJECTS,
  getNextUniqueQuestion,
  registerQuestionInSignatureSet,
} from '../utils/questionEngine';
import {
  PersistedActiveQuizSession,
  getAttemptedSignaturesForSubject,
  getSeenSignaturesForSubject,
  recordQuestionAttempted,
  recordQuestionPresented,
  saveActiveQuizSession,
} from '../utils/apiService';

export type QuizMode = 'standard' | 'deep' | 'unlimited';

export interface CompletedQuizSummary {
  attemptId: string;
  subject: string;
  gkCategory?: string | null;
  mode: QuizMode;
  score: number;
  total: number;
  bestStreak: number;
  questions: Question[];
  selected: Array<number | null>;
}

interface QuizViewProps {
  attemptId: string;
  currentUid: string;
  subjectId: string;
  gkCategory?: string | null;
  mode: QuizMode;
  initialQuestions: Question[];
  restoredSession?: PersistedActiveQuizSession | null;
  initialShortageMessage?: string;
  onFinishQuiz: (summary: CompletedQuizSummary) => void;
  onExitQuiz: () => void;
  onQuestionHistoryUpdated?: () => void;
}

const QUESTION_TIME_LIMIT = 40;
const LETTERS = ['A', 'B', 'C', 'D'];

export const QuizView: React.FC<QuizViewProps> = ({
  attemptId,
  currentUid,
  subjectId,
  gkCategory,
  mode,
  initialQuestions,
  restoredSession,
  initialShortageMessage,
  onFinishQuiz,
  onExitQuiz,
  onQuestionHistoryUpdated,
}) => {
  const [questions, setQuestions] = useState<Question[]>(
    restoredSession?.questions?.length
      ? restoredSession.questions
      : initialQuestions
  );
  const [idx, setIdx] = useState<number>(restoredSession?.idx ?? 0);
  const [selected, setSelected] = useState<Array<number | null>>(
    restoredSession?.selected?.length ===
      (restoredSession?.questions?.length || initialQuestions.length)
      ? restoredSession.selected
      : new Array(initialQuestions.length).fill(null)
  );
  const [locked, setLocked] = useState<boolean>(
    restoredSession?.locked ?? false
  );
  const [timedOut, setTimedOut] = useState<boolean>(
    restoredSession?.timedOut ?? false
  );
  const [timeLeft, setTimeLeft] = useState<number>(
    restoredSession?.timeLeft ?? QUESTION_TIME_LIMIT
  );
  const [streak, setStreak] = useState<number>(restoredSession?.streak ?? 0);
  const [bestStreak, setBestStreak] = useState<number>(
    restoredSession?.bestStreak ?? 0
  );
  const [shortageNotice, setShortageNotice] = useState<string>(
    restoredSession?.shortageMessage || initialShortageMessage || ''
  );

  const submittedRef = useRef(false);
  const presentedIndicesRef = useRef<Set<number>>(new Set());

  const subj = SUBJECTS.find((s) => s.id === subjectId) || SUBJECTS[0];
  const cur = questions[idx];
  const userChoice = selected[idx];
  const isCorrect = locked && cur && userChoice === cur.ans;

  // Record question in persistent history ONLY when it is actually presented to the user
  useEffect(() => {
    if (!cur) return;
    if (!presentedIndicesRef.current.has(idx)) {
      presentedIndicesRef.current.add(idx);
      recordQuestionPresented(currentUid, subjectId, cur);
      if (onQuestionHistoryUpdated) {
        onQuestionHistoryUpdated();
      }
    }
  }, [idx, cur, currentUid, subjectId]);

  // Persist active quiz state in sessionStorage so page refresh preserves the exact test attempt
  useEffect(() => {
    if (submittedRef.current || !cur) return;
    saveActiveQuizSession(currentUid, {
      attemptId,
      uid: currentUid,
      subjectId,
      gkCategory,
      mode,
      questions,
      idx,
      selected,
      locked,
      timedOut,
      timeLeft,
      streak,
      bestStreak,
      shortageMessage: shortageNotice || undefined,
      startedAt: restoredSession?.startedAt || Date.now(),
    });
  }, [
    attemptId,
    currentUid,
    subjectId,
    gkCategory,
    mode,
    questions,
    idx,
    selected,
    locked,
    timedOut,
    timeLeft,
    streak,
    bestStreak,
    shortageNotice,
  ]);

  useEffect(() => {
    if (locked || !cur) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocked(true);
          setTimedOut(true);
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [idx, locked, cur]);

  if (!cur) {
    return (
      <div className="py-6 text-center font-mono text-xs text-[#ffb454]">
        <p className="mb-4">
          {shortageNotice ||
            'No additional unseen questions are available in this topic pool.'}
        </p>
        <button
          type="button"
          onClick={onExitQuiz}
          className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] font-mono text-xs px-4 py-2 rounded-lg cursor-pointer"
        >
          ← back to subjects
        </button>
      </div>
    );
  }

  const handleSelectOption = (optIndex: number) => {
    if (locked) return;
    const nextSelected = [...selected];
    nextSelected[idx] = optIndex;
    setSelected(nextSelected);
    setLocked(true);
    setTimedOut(false);

    recordQuestionAttempted(currentUid, subjectId, cur);

    if (optIndex === cur.ans) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }
    } else {
      setStreak(0);
    }
  };

  const handleSkipQuestion = () => {
    if (locked) return;
    setLocked(true);
    setTimedOut(false);
    setStreak(0);
  };

  const computeAndSubmitSummary = (upToIndexInclusive: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    saveActiveQuizSession(currentUid, null);

    const answeredQuestions = questions.slice(0, upToIndexInclusive + 1);
    const answeredSelections = selected.slice(0, upToIndexInclusive + 1);
    let score = 0;
    answeredQuestions.forEach((q, i) => {
      if (answeredSelections[i] === q.ans) score++;
    });
    onFinishQuiz({
      attemptId,
      subject: subjectId,
      gkCategory,
      mode,
      score,
      total: answeredQuestions.length,
      bestStreak,
      questions: answeredQuestions,
      selected: answeredSelections,
    });
  };

  const handleNext = () => {
    if (mode === 'unlimited') {
      if (idx + 1 >= questions.length) {
        const seen = getSeenSignaturesForSubject(subjectId, currentUid);
        const attempted = getAttemptedSignaturesForSubject(
          subjectId,
          currentUid
        );
        for (const existingQ of questions) {
          registerQuestionInSignatureSet(existingQ, subjectId, seen);
        }
        const nextRes = getNextUniqueQuestion(subjectId, seen, gkCategory, {
          maxAttempts: 250,
          attemptedSignatures: attempted,
        });
        if (nextRes.poolExhausted || !nextRes.question) {
          setShortageNotice(
            nextRes.shortageMessage ||
              'You have exhausted all unique questions in this pool without repetition. Finishing test now.'
          );
          computeAndSubmitSummary(idx);
          return;
        }
        setQuestions((prev) => [...prev, nextRes.question!]);
        setSelected((prev) => [...prev, null]);
      }
      setIdx((prev) => prev + 1);
      setLocked(false);
      setTimedOut(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      return;
    }

    if (idx < questions.length - 1) {
      setIdx((prev) => prev + 1);
      setLocked(false);
      setTimedOut(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
    } else {
      computeAndSubmitSummary(questions.length - 1);
    }
  };

  const answeredCountSoFar = idx + (locked ? 1 : 0);
  const liveScoreSoFar = questions
    .slice(0, answeredCountSoFar)
    .reduce((acc, q, i) => (selected[i] === q.ans ? acc + 1 : acc), 0);

  return (
    <div>
      {/* Progress Timer Bar */}
      <div className="h-1.5 bg-[#161d26] rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[#00d9a0] transition-all duration-200"
          style={{ width: `${(timeLeft / QUESTION_TIME_LIMIT) * 100}%` }}
        />
      </div>

      {shortageNotice && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg border border-[#ffb454]/40 bg-[#ffb454]/10 font-mono text-xs text-[#ffb454]">
          {shortageNotice}
        </div>
      )}

      {/* Metadata Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 font-mono text-xs text-[#8b96a3] mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold" style={{ color: subj.hex }}>
            {subj.label}
          </span>
          {cur.cat && (
            <>
              <span aria-hidden="true">·</span>
              <span>{cur.cat}</span>
            </>
          )}
          {(cur.source === 'admin' || cur.source === 'imported') && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#00d9a0]">questionBank</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {mode === 'unlimited'
              ? `question #${idx + 1} (unlimited mode · ${liveScoreSoFar}/${answeredCountSoFar} right)`
              : `question ${idx + 1} / ${questions.length}`}
          </span>
          {streak >= 2 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#ffb454] font-semibold tabular-nums">
                {streak} in a row
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            id="qtimer"
            className={`font-bold tabular-nums ${
              timeLeft <= 10 ? 'text-[#ff6b6b]' : 'text-[#ffb454]'
            }`}
          >
            {timeLeft}s
          </span>
          <button
            type="button"
            onClick={() => {
              saveActiveQuizSession(currentUid, null);
              onExitQuiz();
            }}
            className="text-[#8b96a3] hover:text-[#e6edf3] underline cursor-pointer text-[11px]"
          >
            quit
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <h2 className="text-[17px] font-semibold leading-relaxed text-[#e6edf3] mb-5">
        {cur.text}
      </h2>

      {/* 4 Options */}
      <div className="space-y-2.5">
        {cur.opts.map((optText, i) => {
          const isThisCorrect = i === cur.ans;
          const isThisSelected = userChoice === i;

          let borderAndBg =
            'border-[#232b35] bg-[#161d26] hover:border-[#364252] text-[#e6edf3]';
          let statusLabel = '';

          if (locked) {
            if (isThisCorrect) {
              borderAndBg =
                'border-[#00d9a0] bg-[#00d9a0]/12 text-[#e6edf3]';
              statusLabel = isThisSelected
                ? '✓ Your Answer (Correct)'
                : '✓ Correct Answer';
            } else if (isThisSelected) {
              borderAndBg =
                'border-[#ff6b6b] bg-[#ff6b6b]/12 text-[#e6edf3]';
              statusLabel = '✗ Your Answer (Wrong)';
            } else {
              borderAndBg = 'border-[#232b35] bg-[#161d26]/60 text-[#8b96a3]';
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => handleSelectOption(i)}
              className={`w-full text-left flex items-start justify-between gap-3 border rounded-lg px-4 py-3 text-sm transition-colors ${
                locked ? 'cursor-default' : 'cursor-pointer'
              } ${borderAndBg}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`font-mono font-bold w-5 shrink-0 ${
                    locked && isThisCorrect
                      ? 'text-[#00d9a0]'
                      : locked && isThisSelected
                        ? 'text-[#ff6b6b]'
                        : 'text-[#8b96a3]'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="leading-snug break-words">{optText}</span>
              </div>

              {locked && statusLabel && (
                <span
                  className={`font-mono text-[11px] font-semibold shrink-0 whitespace-nowrap ${
                    isThisCorrect ? 'text-[#00d9a0]' : 'text-[#ff6b6b]'
                  }`}
                >
                  {statusLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explicit Answer & Reason / Explanation Callout */}
      {locked && (
        <div
          role="region"
          aria-label="Answer explanation"
          className={`mt-4 p-4 rounded-lg border text-sm leading-relaxed ${
            isCorrect
              ? 'bg-[#00d9a0]/8 border-[#00d9a0]/40'
              : 'bg-[#ff6b6b]/8 border-[#ff6b6b]/40'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5 font-mono text-xs font-bold">
            {isCorrect ? (
              <span className="text-[#00d9a0]">
                ✓ RIGHT ANSWER — Option {LETTERS[cur.ans]} ({cur.opts[cur.ans]})
              </span>
            ) : (
              <span className="text-[#ff6b6b]">
                {timedOut
                  ? '⏰ TIME UP — '
                  : userChoice === null
                    ? '⏭ SKIPPED — '
                    : `✗ WRONG (${LETTERS[userChoice]}: ${cur.opts[userChoice]}) — `}
                <span className="text-[#00d9a0]">
                  Correct Answer: {LETTERS[cur.ans]}. {cur.opts[cur.ans]}
                </span>
              </span>
            )}
          </div>

          <div className="text-[#e6edf3] text-[13px]">
            <strong className="font-mono text-xs text-[#00d9a0] uppercase tracking-wider mr-1.5">
              Reason:
            </strong>
            <span className="text-[#c9d3df]">{cur.exp}</span>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-6">
        <div className="flex items-center gap-2.5">
          {!locked && (
            <button
              type="button"
              onClick={handleSkipQuestion}
              className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              skip &amp; show answer
            </button>
          )}

          {mode === 'unlimited' && answeredCountSoFar >= 1 && (
            <button
              type="button"
              onClick={() =>
                computeAndSubmitSummary(locked ? idx : Math.max(0, idx - 1))
              }
              className="bg-transparent hover:border-[#00d9a0] border border-[#232b35] text-[#00d9a0] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
            >
              finish &amp; save score ({liveScoreSoFar}/{answeredCountSoFar})
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={!locked}
          onClick={handleNext}
          className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {mode === 'unlimited'
            ? 'next unlimited question →'
            : idx === questions.length - 1
              ? 'finish test →'
              : 'next question →'}
        </button>
      </div>
    </div>
  );
};
