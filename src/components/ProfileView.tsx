import React, { useEffect, useState } from 'react';
import {
  UserProfile,
  apiGetMyAttempts,
  apiUpdateProfileName,
  getAllSeenCounts,
} from '../utils/apiService';
import { QuizAttempt } from '../utils/leaderboardEngine';
import { SUBJECTS } from '../utils/questionEngine';

interface ProfileViewProps {
  user: UserProfile;
  onUserUpdated: (updated: UserProfile) => void;
  onBackToDashboard: () => void;
}

function formatAttemptDate(ms: number): string {
  const d = new Date(ms);
  return (
    d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUserUpdated,
  onBackToDashboard,
}) => {
  const [nameInput, setNameInput] = useState(user.name || '');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  const seenCounts = getAllSeenCounts();
  const totalUniqueSeen = Object.values(seenCounts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    let cancelled = false;
    setLoadingHist(true);
    apiGetMyAttempts(user.uid)
      .then((list) => {
        if (!cancelled) {
          setAttempts(list);
          setLoadingHist(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingHist(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setSaveErr("name can't be empty.");
      return;
    }
    setSaving(true);
    setSaveErr('');
    setSaveSuccess('');
    try {
      const updated = await apiUpdateProfileName(trimmed, user);
      onUserUpdated(updated);
      setSaveSuccess('display name updated on leaderboard.');
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  const totalTests = attempts.length;
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalQs = attempts.reduce((s, a) => s + a.total, 0);
  const avgPct = totalQs > 0 ? Math.round((totalScore / totalQs) * 100) : 0;

  const bySubject: Record<string, QuizAttempt> = {};
  for (const a of attempts) {
    const cur = bySubject[a.subject];
    if (!cur || a.score / a.total > cur.score / cur.total) {
      bySubject[a.subject] = a;
    }
  }

  return (
    <div>
      <h1 className="font-mono text-2xl font-bold text-[#e6edf3] mb-1.5">
        my profile<span className="terminal-cursor" />
      </h1>
      <p className="text-sm text-[#8b96a3] mb-6">
        Your account details, non-repeating question progress, and test history on compile&amp;rank.
      </p>

      {/* Avatar & Identity Card */}
      <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-5 mb-6 flex items-center gap-4">
        <div className="w-13 h-13 rounded-full bg-[#0a3d31] text-[#00d9a0] flex items-center justify-center font-mono text-xl font-bold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold text-[#e6edf3] truncate">
            {user.name || '—'}
          </div>
          <div className="font-mono text-xs text-[#8b96a3] break-all mt-0.5">
            {user.email}
          </div>
        </div>
      </div>

      {/* Edit Name Form */}
      <form onSubmit={handleSaveName} className="max-w-md space-y-3.5 mb-8">
        <div>
          <label
            htmlFor="pf-name"
            className="block font-mono text-xs text-[#8b96a3] mb-1.5"
          >
            display name (shown on the global leaderboard)
          </label>
          <input
            id="pf-name"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={40}
            className="w-full bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#e6edf3] outline-none transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="pf-email"
            className="block font-mono text-xs text-[#8b96a3] mb-1.5"
          >
            email (private — never shared on leaderboard)
          </label>
          <input
            id="pf-email"
            type="email"
            value={user.email}
            disabled
            className="w-full bg-[#161d26] border border-[#232b35] rounded-lg px-3.5 py-2.5 font-mono text-sm text-[#8b96a3] opacity-60 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? 'saving...' : 'save changes'}
        </button>

        {saveErr && <div className="font-mono text-xs text-[#ff6b6b]">{saveErr}</div>}
        {saveSuccess && (
          <div className="font-mono text-xs text-[#00d9a0]">{saveSuccess}</div>
        )}
      </form>

      {/* Test History Section */}
      <div className="font-mono text-xs text-[#8b96a3] uppercase tracking-wider mb-3">
        Test History &amp; Performance
      </div>

      {loadingHist ? (
        <div className="py-6 text-center font-mono text-xs text-[#8b96a3]">
          loading history…
        </div>
      ) : attempts.length === 0 ? (
        <div className="py-6 text-center font-mono text-xs text-[#8b96a3]">
          no attempts yet — take a test to see your stats here.
        </div>
      ) : (
        <div>
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 tabular-nums">
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-3.5">
              <div className="font-mono text-xl font-bold text-[#00d9a0]">
                {totalTests}
              </div>
              <div className="text-xs text-[#8b96a3] mt-0.5">tests taken</div>
            </div>
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-3.5">
              <div className="font-mono text-xl font-bold text-[#00d9a0]">
                {avgPct}%
              </div>
              <div className="text-xs text-[#8b96a3] mt-0.5">average score</div>
            </div>
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-3.5">
              <div className="font-mono text-xl font-bold text-[#00d9a0]">
                {Object.keys(bySubject).length} / {SUBJECTS.length}
              </div>
              <div className="text-xs text-[#8b96a3] mt-0.5">subjects tried</div>
            </div>
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-3.5">
              <div className="font-mono text-xl font-bold text-[#00d9a0]">
                {totalUniqueSeen + totalQs}
              </div>
              <div className="text-xs text-[#8b96a3] mt-0.5">
                unique questions solved
              </div>
            </div>
          </div>

          {/* Best Score Per Subject Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-[#232b35] text-left font-mono text-[11px] text-[#8b96a3] uppercase tracking-wider">
                  <th className="py-2 px-3">subject</th>
                  <th className="py-2 px-3">best score</th>
                  <th className="py-2 px-3">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(bySubject)
                  .sort((a, b) => b.score / b.total - a.score / a.total)
                  .map((a) => {
                    const subj = SUBJECTS.find((s) => s.id === a.subject);
                    return (
                      <tr key={a.subject} className="border-b border-[#232b35]">
                        <td
                          className="py-2.5 px-3 font-mono font-semibold"
                          style={{ color: subj ? subj.hex : '#e6edf3' }}
                        >
                          {subj ? subj.label : a.subject}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#e6edf3]">
                          {a.score}/{a.total}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#00d9a0]">
                          {Math.round((a.score / a.total) * 100)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Recent Attempts Table */}
          <div className="font-mono text-xs text-[#8b96a3] uppercase tracking-wider mb-2">
            Recent Attempts
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-[#232b35] text-left font-mono text-[11px] text-[#8b96a3] uppercase tracking-wider">
                  <th className="py-2 px-3">when</th>
                  <th className="py-2 px-3">subject</th>
                  <th className="py-2 px-3">score</th>
                  <th className="py-2 px-3">%</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 12).map((a, i) => {
                  const subj = SUBJECTS.find((s) => s.id === a.subject);
                  return (
                    <tr key={a.id || i} className="border-b border-[#232b35]">
                      <td className="py-2.5 px-3 font-mono text-xs text-[#8b96a3]">
                        {formatAttemptDate(a.ts)}
                      </td>
                      <td
                        className="py-2.5 px-3 font-mono font-semibold"
                        style={{ color: subj ? subj.hex : '#e6edf3' }}
                      >
                        {subj ? subj.label : a.subject}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#e6edf3]">
                        {a.score}/{a.total}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#00d9a0]">
                        {Math.round((a.score / a.total) * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
        >
          ← back to subjects
        </button>
      </div>
    </div>
  );
};
