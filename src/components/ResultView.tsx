import React, { useState } from 'react';
import { CompletedQuizSummary, QuizMode } from './QuizView';
import { SUBJECTS } from '../utils/questionEngine';
import { MIN_Q_FOR_RANK, getScoreVerdict } from '../utils/leaderboardEngine';
import { LeaderboardTable } from './LeaderboardTable';

interface ResultViewProps {
  summary: CompletedQuizSummary;
  currentUid: string;
  saveError: string;
  isSavingScore?: boolean;
  leaderboardRefreshTrigger?: number;
  onRetrySave?: () => void;
  onRetake: (
    subjectId: string,
    mode: QuizMode,
    gkCategory?: string | null
  ) => void;
  onBackToDashboard: () => void;
  onViewRankings: (subjectId: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const ResultView: React.FC<ResultViewProps> = ({
  summary,
  currentUid,
  saveError,
  isSavingScore = false,
  leaderboardRefreshTrigger = 1,
  onRetrySave,
  onRetake,
  onBackToDashboard,
  onViewRankings,
}) => {
  const [showReview, setShowReview] = useState(true);
  const subj = SUBJECTS.find((s) => s.id === summary.subject) || SUBJECTS[0];
  const pct =
    summary.total > 0 ? Math.round((summary.score / summary.total) * 100) : 0;

  return (
    <div>
      <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-2">
        test complete<span className="terminal-cursor" />
      </h1>

      {/* Score Hero */}
      <div className="text-center py-4 mb-4 border-b border-[#232b35]">
        <div className="font-mono text-5xl font-bold text-[#00d9a0] leading-none tabular-nums">
          {summary.score}/{summary.total}
        </div>
        <div className="font-mono text-sm text-[#8b96a3] mt-2 tabular-nums">
          {pct}% correct —{' '}
          <span className="font-bold" style={{ color: subj.hex }}>
            {subj.label}
          </span>
          {summary.gkCategory && summary.gkCategory !== 'All' && (
            <span> ({summary.gkCategory})</span>
          )}
        </div>
        <div className="text-xs text-[#8b96a3] mt-2">{getScoreVerdict(pct)}</div>
        {summary.bestStreak >= 2 && (
          <div className="font-mono text-xs text-[#ffb454] mt-1.5 tabular-nums">
            best streak this run: {summary.bestStreak} in a row
          </div>
        )}
      </div>

      {isSavingScore && (
        <div className="font-mono text-xs text-[#00d9a0] text-center mb-4">
          saving your score and updating global rankings…
        </div>
      )}

      {!isSavingScore && saveError ? (
        <div className="font-mono text-xs text-[#ff6b6b] text-center mb-4 flex items-center justify-center gap-3 flex-wrap">
          <span>your score could not be saved — {saveError}</span>
          {onRetrySave && (
            <button
              type="button"
              onClick={onRetrySave}
              className="border border-[#ff6b6b] hover:bg-[#ff6b6b]/15 text-[#ff6b6b] px-2.5 py-1 rounded cursor-pointer"
            >
              retry save
            </button>
          )}
        </div>
      ) : (
        !isSavingScore &&
        summary.total < MIN_Q_FOR_RANK && (
          <div className="font-mono text-xs text-[#8b96a3] text-center mb-4">
            Saved to your history. Tests under {MIN_Q_FOR_RANK} questions don&apos;t count toward global rankings.
          </div>
        )
      )}

      {/* Question-by-Question Review Toggle & List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-[#8b96a3] uppercase tracking-wider">
            answer &amp; explanation review ({summary.questions.length} questions)
          </span>
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            className="font-mono text-xs text-[#00d9a0] hover:underline cursor-pointer"
          >
            {showReview ? 'hide review ▲' : 'show review ▼'}
          </button>
        </div>

        {showReview && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {summary.questions.map((q, i) => {
              const picked = summary.selected[i];
              const right = picked === q.ans;
              return (
                <div
                  key={i}
                  className="bg-[#161d26] border border-[#232b35] rounded-lg p-3.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-[#e6edf3] leading-snug">
                      {i + 1}. {q.text}
                    </span>
                    <span
                      className={`font-mono font-bold shrink-0 whitespace-nowrap ${
                        right ? 'text-[#00d9a0]' : 'text-[#ff6b6b]'
                      }`}
                    >
                      {right ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  </div>

                  <div className="font-mono text-[11.5px] space-y-1 mb-2">
                    {!right && (
                      <div className="text-[#ff6b6b]">
                        Your Answer:{' '}
                        {picked === null || picked === undefined
                          ? 'Skipped / Time Out'
                          : `${LETTERS[picked]}. ${q.opts[picked]}`}
                      </div>
                    )}
                    <div className="text-[#00d9a0]">
                      Correct Answer: {LETTERS[q.ans]}. {q.opts[q.ans]}
                    </div>
                  </div>

                  <div className="text-[#8b96a3] leading-relaxed border-t border-[#232b35] pt-2">
                    <strong className="font-mono text-[#e6edf3] mr-1">
                      Reason:
                    </strong>
                    {q.exp}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Top Ranks (Fetched fresh after score write completes) */}
      <div className="font-mono text-xs text-[#8b96a3] uppercase tracking-wider mb-2.5">
        {subj.label} — Top Ranks
      </div>
      {isSavingScore ? (
        <div className="py-6 text-center font-mono text-xs text-[#8b96a3]">
          updating leaderboard with your score…
        </div>
      ) : (
        <LeaderboardTable
          filter={summary.subject}
          currentUid={currentUid}
          refreshTrigger={leaderboardRefreshTrigger}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap mt-6">
        <button
          type="button"
          onClick={() =>
            onRetake(summary.subject, summary.mode, summary.gkCategory)
          }
          className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all whitespace-nowrap"
        >
          retake this subject (new questions)
        </button>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
        >
          back to subjects
        </button>
        <button
          type="button"
          onClick={() => onViewRankings(summary.subject)}
          className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
        >
          view full rankings →
        </button>
      </div>
    </div>
  );
};
