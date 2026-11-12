import React, { useEffect, useState } from 'react';
import { LeaderboardRow, MIN_Q_FOR_RANK } from '../utils/leaderboardEngine';
import { SUBJECTS } from '../utils/questionEngine';
import { apiGetLeaderboard } from '../utils/apiService';

interface LeaderboardTableProps {
  filter: string;
  currentUid: string;
  refreshTrigger?: number;
  searchQuery?: string;
  onQueryMeta?: (meta: { totalUsers: number }) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  filter,
  currentUid,
  refreshTrigger = 0,
  searchQuery = '',
  onQueryMeta,
}) => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiGetLeaderboard(filter, refreshTrigger > 0)
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setLoading(false);
        if (onQueryMeta) {
          onQueryMeta({
            totalUsers: res.totalUsers,
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, refreshTrigger]);

  if (loading) {
    return (
      <div className="py-6 text-center font-mono text-xs text-[#8b96a3]">
        loading rankings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center font-mono text-xs text-[#ff6b6b]">
        couldn&apos;t load rankings — {error}
      </div>
    );
  }

  const label =
    filter === 'all'
      ? 'overall'
      : SUBJECTS.find((s) => s.id === filter)?.label || filter;
  const meRow = rows.find((r) => r.uid === currentUid);
  const isAll = filter === 'all';

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleRows = normalizedQuery
    ? rows.filter((r) => r.name.toLowerCase().includes(normalizedQuery))
    : rows.slice(0, 20);

  return (
    <div>
      {/* User Standing Summary Box */}
      <div className="bg-[#161d26] border border-[#232b35] rounded-lg px-4 py-3 mb-3.5 font-mono text-xs flex items-center justify-between flex-wrap gap-2">
        {meRow ? (
          <div>
            <span className="text-[#00d9a0] font-bold">
              your rank in {label}: #{meRow.rank}
            </span>{' '}
            <span className="text-[#8b96a3] tabular-nums">
              of {rows.length} ·{' '}
              {isAll
                ? `${meRow.score} pts across ${meRow.subjects} subject${
                    meRow.subjects === 1 ? '' : 's'
                  } (${meRow.pct}%)`
                : `best ${meRow.score}/${meRow.total} (${meRow.pct}%)`}
            </span>
          </div>
        ) : (
          <span className="text-[#8b96a3]">
            you haven&apos;t ranked in {label} yet — finish a {MIN_Q_FOR_RANK}+ question test to get on the board.
          </span>
        )}
      </div>

      {visibleRows.length === 0 ? (
        <div className="py-6 text-center font-mono text-xs text-[#8b96a3]">
          {normalizedQuery
            ? `no competitors matching "${searchQuery}".`
            : 'no attempts recorded yet — be the first.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-[#232b35] text-left font-mono text-[11px] text-[#8b96a3] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12">#</th>
                <th className="py-2.5 px-3">name</th>
                {isAll ? (
                  <>
                    <th className="py-2.5 px-3">points</th>
                    <th className="py-2.5 px-3">subjects</th>
                    <th className="py-2.5 px-3">%</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3">score</th>
                    <th className="py-2.5 px-3">%</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const isMine = row.uid === currentUid;
                const rankColor =
                  row.rank === 1
                    ? 'text-[#ffd166] font-bold'
                    : row.rank === 2
                      ? 'text-[#c9d6df] font-bold'
                      : row.rank === 3
                        ? 'text-[#d6a15a] font-bold'
                        : 'text-[#8b96a3]';

                return (
                  <tr
                    key={row.uid}
                    className={`border-b border-[#232b35] transition-colors ${
                      isMine ? 'bg-[#00d9a0]/10' : 'hover:bg-[#161d26]/60'
                    }`}
                  >
                    <td className={`py-2.5 px-3 font-mono ${rankColor}`}>
                      {row.rank}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#e6edf3]">
                      {row.name}
                      {isMine && (
                        <span className="ml-1.5 font-mono text-xs text-[#00d9a0]">
                          (you)
                        </span>
                      )}
                    </td>
                    {isAll ? (
                      <>
                        <td className="py-2.5 px-3 font-mono text-[#e6edf3]">
                          {row.score}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#8b96a3]">
                          {row.subjects}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#00d9a0]">
                          {row.pct}%
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 font-mono text-[#e6edf3]">
                          {row.score}/{row.total}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#00d9a0]">
                          {row.pct}%
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
