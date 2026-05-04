import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt, FaHockeyPuck } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

interface PlayerStatsSectionProps {
  playerId: string;
}

interface GameStatRow {
  goals: number;
  assists: number;
  penalty_minutes: number;
  saves: number;
  shots_on_goal: number;
  game_highlight: {
    id: string;
    title: string | null;
    opponent: string | null;
    game_date: string | null;
    final_score: string | null;
    game_id: string | null;
  } | null;
}

interface GameSchedule {
  id: string;
  opponent: string | null;
  game_date: string | null;
  result: string | null;
}

// Shared query string for both team-stats and per-player gamesheetstats URLs.
// Mirrors the live URL the team uses (compact view, team colours, division filter).
const GAMESHEET_QS =
  'configuration%5Bcompact-view%5D=true&configuration%5Bprimary-colour%5D=E92823&configuration%5Bsecondary-colour%5D=142C5D&filter%5Bdivision%5D=77698&filter%5Bstart_time_from%5D=cleared';
const GAMESHEET_TEAM_URL = `https://gamesheetstats.com/seasons/14654/teams/508480/team-stats?${GAMESHEET_QS}`;

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PlayerStatsSection({ playerId }: PlayerStatsSectionProps) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GameStatRow[]>([]);
  const [scheduleById, setScheduleById] = useState<Record<string, GameSchedule>>({});
  const [gamesheetPlayerId, setGamesheetPlayerId] = useState<string | null>(null);
  const [gamesheetSeasonId, setGamesheetSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      // Fetch gamesheetstats IDs from the players table directly (the
      // player_team_details view doesn't expose these new columns).
      const { data: playerRow } = await supabase
        .from('players')
        .select('gamesheet_player_id, gamesheet_season_id')
        .eq('id', playerId)
        .maybeSingle();
      if (!cancelled) {
        setGamesheetPlayerId(playerRow?.gamesheet_player_id || null);
        setGamesheetSeasonId(playerRow?.gamesheet_season_id || null);
      }

      const { data, error } = await supabase
        .from('player_game_stats')
        .select('goals, assists, penalty_minutes, saves, shots_on_goal, game_highlight:game_highlights(id, title, opponent, game_date, final_score, game_id)')
        .eq('player_id', playerId);

      if (cancelled) return;
      if (error) {
        console.error('Error loading player stats:', error);
        setRows([]);
        setScheduleById({});
        setLoading(false);
        return;
      }

      const statRows = (data || []) as unknown as GameStatRow[];

      // Fetch matching game_schedules rows in one query so we can resolve
      // opponent + date for highlights linked to a game (the highlight row
      // itself only has these fields populated for *standalone* entries).
      const gameIds = Array.from(
        new Set(statRows.map((r) => r.game_highlight?.game_id).filter((id): id is string => !!id))
      );
      let lookup: Record<string, GameSchedule> = {};
      if (gameIds.length > 0) {
        const { data: schedules } = await supabase
          .from('game_schedules')
          .select('id, opponent, game_date, result')
          .in('id', gameIds);
        for (const s of (schedules as GameSchedule[] | null) || []) {
          lookup[s.id] = s;
        }
      }
      if (cancelled) return;

      const sorted = statRows.slice().sort((a, b) => {
        const da = lookup[a.game_highlight?.game_id || '']?.game_date || a.game_highlight?.game_date || '';
        const db = lookup[b.game_highlight?.game_id || '']?.game_date || b.game_highlight?.game_date || '';
        return db.localeCompare(da);
      });
      setRows(sorted);
      setScheduleById(lookup);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.goals += r.goals;
      acc.assists += r.assists;
      acc.pim += r.penalty_minutes || 0;
      acc.sog += r.shots_on_goal || 0;
      acc.sv += r.saves || 0;
      return acc;
    },
    { goals: 0, assists: 0, pim: 0, sog: 0, sv: 0 }
  );
  const points = totals.goals + totals.assists;
  const showSaves = totals.sv > 0;

  const seasonId = gamesheetSeasonId || '14654';
  const externalUrl = gamesheetPlayerId
    ? `https://gamesheetstats.com/seasons/${seasonId}/players/${gamesheetPlayerId}?${GAMESHEET_QS}`
    : GAMESHEET_TEAM_URL;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaHockeyPuck className="text-steel-blue" />
          Season Stats
        </h3>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-steel-blue hover:text-dark-steel font-semibold"
        >
          USA Hockey GameSheet
          <FaExternalLinkAlt className="text-[10px]" />
        </a>
      </div>

      {/* Season totals */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatTile label="Goals" value={totals.goals} />
        <StatTile label="Assists" value={totals.assists} />
        <StatTile label="Points" value={points} highlight />
      </div>

      {/* Per-game breakdown */}
      {loading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading stats…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No game stats recorded yet.</p>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Opponent</th>
                <th className="px-2 py-2 text-center">G</th>
                <th className="px-2 py-2 text-center">A</th>
                <th className="px-2 py-2 text-center">PTS</th>
                <th className="px-2 py-2 text-center">PIM</th>
                {showSaves && <th className="px-2 py-2 text-center">SV</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                const h = row.game_highlight;
                const sched = h?.game_id ? scheduleById[h.game_id] : undefined;
                const opp = sched?.opponent || h?.opponent || (h?.title ? h.title.split(/[—,–-]/)[0]?.trim() : '—');
                const date = sched?.game_date || h?.game_date || null;
                // Prefer a game_schedules-based result string (e.g. "W 5-0") if present.
                const score = sched?.result || h?.final_score || null;
                const pts = row.goals + row.assists;
                const linkTarget = h?.game_id || h?.id;
                return (
                  <tr
                    key={idx}
                    onClick={() => linkTarget && navigate(`/game/${linkTarget}`)}
                    className={linkTarget ? 'cursor-pointer hover:bg-ice-blue/30' : 'hover:bg-gray-50'}
                  >
                    <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{formatDate(date)}</td>
                    <td className="px-2 py-2 text-gray-700">
                      <div className="line-clamp-1">{opp}</div>
                      {score && (
                        <div className="text-xs text-gray-500">{score}</div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{row.goals}</td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{row.assists}</td>
                    <td className="px-2 py-2 text-center font-bold text-steel-blue">{pts}</td>
                    <td className="px-2 py-2 text-center text-gray-700">{row.penalty_minutes || 0}</td>
                    {showSaves && (
                      <td className="px-2 py-2 text-center text-gray-700">{row.saves || 0}</td>
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
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? 'bg-steel-blue text-white' : 'bg-white border border-gray-200'}`}>
      <div className={`text-2xl font-bold ${highlight ? '' : 'text-dark-steel'}`}>{value}</div>
      <div className={`text-xs uppercase tracking-wide ${highlight ? 'text-ice-blue' : 'text-gray-500'}`}>{label}</div>
    </div>
  );
}
