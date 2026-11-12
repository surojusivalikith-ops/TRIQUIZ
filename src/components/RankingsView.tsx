import React, { useState } from 'react';
import { SUBJECTS } from '../utils/questionEngine';
import { MIN_Q_FOR_RANK } from '../utils/leaderboardEngine';
import { LeaderboardTable } from './LeaderboardTable';
import { invalidateClientLeaderboardCache } from '../utils/apiService';

interface RankingsViewProps {
  initialFilter: string;
  currentUid: string;
  onBackToDashboard: () => void;
}

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function isValidId(id) { return id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$'); }

    // Public Leaderboard (PII isolated — emails never stored here)
    match /scores/{uid} {
      allow get, list: if isSignedIn();
      allow create, update: if isVerified() && request.auth.uid == uid && isValidId(uid)
        && request.resource.data.keys().hasOnly(['name','subjects','overallScore','overallTotal','overallPct','subjectsCount','updatedAt'])
        && request.resource.data.name is string && request.resource.data.name.size() >= 1 && request.resource.data.name.size() <= 40
        && request.resource.data.updatedAt == request.time;
    }

    // Private User Attempts (Strictly owner-isolated)
    match /users/{uid}/attempts/{attemptId} {
      allow get, list: if isSignedIn() && request.auth.uid == uid;
      allow create: if isVerified() && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['subject','score','total','ts'])
        && request.resource.data.score >= 0 && request.resource.data.score <= request.resource.data.total
        && request.resource.data.ts == request.time;
    }
  }
}`;

export const RankingsView: React.FC<RankingsViewProps> = ({
  initialFilter,
  currentUid,
  onBackToDashboard,
}) => {
  const [filter, setFilter] = useState(initialFilter || 'all');
  const [search, setSearch] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [showSecuritySpec, setShowSecuritySpec] = useState(false);
  const [copied, setCopied] = useState(false);
  const [queryMeta, setQueryMeta] = useState<{
    queryTimeMs: number;
    cacheHit: boolean;
    totalUsers: number;
  } | null>(null);

  const handleRefresh = () => {
    invalidateClientLeaderboardCache();
    setRefreshCount((c) => c + 1);
  };

  const handleCopyRules = () => {
    navigator.clipboard?.writeText(FIRESTORE_RULES_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-1.5">
        <h1 className="font-mono text-2xl font-bold text-[#e6edf3]">
          rankings<span className="terminal-cursor" />
        </h1>

        {queryMeta && (
          <div className="font-mono text-xs text-[#8b96a3] tabular-nums">
            <span>{queryMeta.totalUsers} global competitors</span>
          </div>
        )}
      </div>

      <p className="text-sm text-[#8b96a3] mb-5 leading-relaxed">
        {filter === 'all'
          ? "Overall = the sum of each person's best score in every subject, so mastering more subjects earns more points."
          : 'Best score per person in this subject. Switch tabs or search to compare global progress.'}
      </p>

      {/* Subject Filter Tabs */}
      <div
        role="tablist"
        aria-label="Leaderboard subject filter"
        className="flex items-center gap-1.5 flex-wrap mb-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`font-mono text-xs px-3 py-1.5 rounded-md border cursor-pointer transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#161d26] text-[#e6edf3] border-[#00d9a0]'
              : 'bg-[#161d26] text-[#8b96a3] border-[#232b35] hover:text-[#e6edf3]'
          }`}
        >
          overall
        </button>

        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={filter === s.id}
            onClick={() => setFilter(s.id)}
            className={`font-mono text-xs px-3 py-1.5 rounded-md border cursor-pointer transition-colors whitespace-nowrap ${
              filter === s.id
                ? 'bg-[#161d26] text-[#e6edf3] border-[#00d9a0]'
                : 'bg-[#161d26] text-[#8b96a3] border-[#232b35] hover:text-[#e6edf3]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label htmlFor="lb-search" className="sr-only">
          Search competitor by name
        </label>
        <input
          id="lb-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="filter competitors by name..."
          className="w-full sm:w-72 bg-[#161d26] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none transition-colors"
        />
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable
        filter={filter}
        currentUid={currentUid}
        refreshTrigger={refreshCount}
        searchQuery={search}
        onQueryMeta={setQueryMeta}
      />

      {/* Footer Navigation & Firebase Security/Optimization Inspector */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          >
            ← back to subjects
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="bg-transparent hover:border-[#8b96a3] border border-[#232b35] text-[#e6edf3] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          >
            refresh rankings
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSecuritySpec((v) => !v)}
          className="bg-transparent hover:border-[#00d9a0] border border-[#232b35] text-[#00d9a0] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
        >
          {showSecuritySpec
            ? 'hide firebase rules & query config'
            : 'view firebase security rules & indexes'}
        </button>
      </div>

      {showSecuritySpec && (
        <div className="mt-5 p-4 rounded-lg bg-[#161d26] border border-[#232b35] text-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono font-bold text-[#e6edf3]">
              Hardened Firestore Security Rules &amp; Query Optimizations (tri-quiz-4dc5e)
            </span>
            <button
              type="button"
              onClick={handleCopyRules}
              className="font-mono text-xs text-[#00d9a0] hover:underline cursor-pointer"
            >
              {copied ? '✓ copied firestore.rules' : 'copy firestore.rules'}
            </button>
          </div>
          <p className="text-[#8b96a3] leading-relaxed">
            Denormalized top-level fields (<code className="font-mono text-[#00d9a0]">overallScore</code>,{' '}
            <code className="font-mono text-[#00d9a0]">overallPct</code>,{' '}
            <code className="font-mono text-[#00d9a0]">subjectsCount</code>) allow{' '}
            <code className="font-mono text-[#e6edf3]">orderBy(&apos;overallScore&apos;, &apos;desc&apos;), limit(50)</code>{' '}
            in O(log N) index time instead of downloading 500 unindexed user documents. Emails are strictly excluded from{' '}
            <code className="font-mono text-[#e6edf3]">scores/&#123;uid&#125;</code> for PII isolation.
          </p>
          <pre className="bg-[#0d1117] border border-[#232b35] rounded p-3 font-mono text-[11px] text-[#c9d3df] overflow-x-auto leading-relaxed">
            {FIRESTORE_RULES_SNIPPET}
          </pre>
        </div>
      )}

      <div className="mt-5 pt-3.5 border-t border-dashed border-[#232b35] text-xs text-[#8b96a3]">
        Only display names and scores are shared on this board — emails are never stored here. Tests shorter than{' '}
        {MIN_Q_FOR_RANK} questions don&apos;t count toward rankings.
      </div>
    </div>
  );
};
