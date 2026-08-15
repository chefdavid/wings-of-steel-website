import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt, FaHockeyPuck } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { useSeasons, usePlayerStats } from '../hooks/useStats';
import { formatSavePct } from '../types/stats';

interface PlayerStatsSectionProps {
  playerId: string;
}

/**
 * Per-player stats on the roster card.
 *
 * This panel was previously titled "Season Stats" while querying
 * player_game_stats by player_id with NO season or date filter — it was career
 * totals. It only looked right because the bulk importer DELETED the previous
 * season's rows before importing, so there was never more than one season in
 * the table. Season isolation was enforced by destroying history.
 *
 * Now the totals come from the season-aware views and the scope is explicit and
 * switchable, so "this season" and "career" are both available and both honest.
 */

interface GameStatRow {
  id: string;
  goals: number;
  assists: number;
  penalty_minutes: number | null;
  saves: number | null;
  shots_on_goal: number | null;
  goals_against: number | null;
  shots_faced: number | null;
  season_id: string | null;
  game: {
    id: string;
    opponent: string | null;
    game_date: string | null;
    result: string | null;
  } | null;
  game_highlight: {
    id: string;
    title: string | null;
    opponent: string | null;
    game_date: string | null;
    final_score: string | null;
  } | null;
}

// Shared query string for both team-stats and per-player gamesheetstats URLs.
// Mirrors the live URL the team uses (compact view, team colours, division filter).
const GAMESHEET_QS =
  'configuration%5Bcompact-view%5D=true&configuration%5Bprimary-colour%5D=E92823&configuration%5Bsecondary-colour%5D=142C5D&filter%5Bdivision%5D=77698&filter%5Bstart_time_from%5D=cleared';
const GAMESHEET_TEAM_URL = `https://gamesheetstats.com/seasons/14654/teams/508480/team-stats?${GAMESHEET_QS}`;

const CAREER = 'career';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PlayerStatsSection({ playerId }: PlayerStatsSectionProps) {
  const navigate = useNavigate();
  const { seasons, defaultSeason } = useSeasons();

  /** Either a season id, or CAREER. Never ambiguous. */
  const [scope, setScope] = useState<string | null>(null);
  useEffect(() => {
    if (!scope && defaultSeason) setScope(defaultSeason.id);
  }, [defaultSeason, scope]);

  const isCareer = scope === CAREER;
  const seasonId = isCareer ? null : scope;

  const { season: seasonTotals, career: careerTotals, loading: totalsLoading } =
    usePlayerStats(playerId, seasonId);

  const [rows, setRows] = useState<GameStatRow[]>([]);
  const [gamesheetPlayerId, setGamesheetPlayerId] = useState<string | null>(null);
  const [gamesheetSeasonId, setGamesheetSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: playerRow } = await supabase
        .from('players')
        .select('gamesheet_player_id, gamesheet_season_id')
        .eq('id', playerId)
        .maybeSingle();
      if (!cancelled) {
        setGamesheetPlayerId(playerRow?.gamesheet_player_id || null);
        setGamesheetSeasonId(playerRow?.gamesheet_season_id || null);
      }

      // game_id is the spine now (migration 015), so opponent and date come
      // from the game in one hop instead of being resolved through the
      // highlight and, failing that, split out of the highlight's title.
      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          'id, goals, assists, penalty_minutes, saves, shots_on_goal, goals_against, shots_faced, season_id,' +
            'game:game_schedules(id, opponent, game_date, result),' +
            'game_highlight:game_highlights(id, title, opponent, game_date, final_score)'
        )
        .eq('player_id', playerId);

      if (cancelled) return;
      if (error) {
        console.error('Error loading player stats:', error);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data || []) as unknown as GameStatRow[]);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const visibleRows = useMemo(() => {
    const scoped = isCareer ? rows : rows.filter((r) => r.season_id === seasonId);
    return scoped.slice().sort((a, b) => {
      const da = a.game?.game_date || a.game_highlight?.game_date || '';
      const db = b.game?.game_date || b.game_highlight?.game_date || '';
      return db.localeCompare(da);
    });
  }, [rows, isCareer, seasonId]);

  const totals = isCareer ? careerTotals : seasonTotals;
  const goals = totals?.goals ?? 0;
  const assists = totals?.assists ?? 0;
  const points = totals?.points ?? 0;
  const gamesPlayed = totals?.games_played ?? 0;

  // Goalie columns appear only when goalie data actually exists — a skater with
  // a stray save should not turn this into a goalie table, and a shutout goalie
  // credited zero saves should not disappear.
  const isGoalie = (seasonTotals?.is_goalie ?? careerTotals?.is_goalie) === true;
  const hasGoalieData = visibleRows.some(
    (r) => r.goals_against != null || r.shots_faced != null || (r.saves ?? 0) > 0
  );
  const showGoalie = isGoalie || hasGoalieData;

  const goalieSummary = useMemo(() => {
    if (!showGoalie) return null;
    const saves = visibleRows.reduce((n, r) => n + (r.saves ?? 0), 0);
    const shots = visibleRows.reduce((n, r) => n + (r.shots_faced ?? 0), 0);
    const ga = visibleRows.reduce((n, r) => n + (r.goals_against ?? 0), 0);
    return {
      saves,
      goalsAgainst: ga,
      // NULL rather than 0.000 when no shots have been recorded — the site has
      // never tracked shots faced, and a fake .000 would read as a real number.
      savePct: shots > 0 ? saves / shots : null,
    };
  }, [visibleRows, showGoalie]);

  const gsSeasonId = gamesheetSeasonId || '14654';
  const externalUrl = gamesheetPlayerId
    ? `https://gamesheetstats.com/seasons/${gsSeasonId}/players/${gamesheetPlayerId}?${GAMESHEET_QS}`
    : GAMESHEET_TEAM_URL;

  const scopeLabel = isCareer
    ? 'Career'
    : seasons.find((s) => s.id === scope)?.label ?? 'Season';

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaHockeyPuck className="text-steel-blue" />
          {scopeLabel} Stats
          <span className="text-steel-blue" aria-hidden="true">*</span>
        </h3>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor={`stats-scope-${playerId}`}>
            Stats period
          </label>
          <select
            id={`stats-scope-${playerId}`}
            value={scope ?? ''}
            onChange={(e) => setScope(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} season
              </option>
            ))}
            <option value={CAREER}>Career</option>
          </select>
          {/*
            The official record. It was a small text link losing to the season
            dropdown next to it; as a filled pill it reads as the primary
            action in this header, which matches how often people want it.
          */}
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-steel-blue px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-card transition-colors duration-fast hover:bg-dark-steel focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-steel-blue"
          >
            USA Hockey GameSheet
            <FaExternalLinkAlt className="text-[10px]" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      {/*
        This is NOT games played. A stat row only exists for a game where the
        player recorded something, so this counts games with a stat line. Until
        every game's lineup is entered via the admin Box Scores screen (the
        "dressed" checkbox), it undercounts. Labelling it "Games Played" would
        be a lie, so it says what it actually is.
      */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatTile label="Games Scored" value={gamesPlayed} />
        <StatTile label="Goals" value={goals} />
        <StatTile label="Assists" value={assists} />
        <StatTile label="Points" value={points} highlight />
      </div>

      {showGoalie && goalieSummary && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatTile label="Saves" value={goalieSummary.saves} />
          <StatTile label="GA" value={goalieSummary.goalsAgainst} />
          <TextTile label="SV%" value={formatSavePct(goalieSummary.savePct)} />
        </div>
      )}

      {loading || totalsLoading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading stats…</p>
      ) : visibleRows.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          {isCareer
            ? 'No game stats recorded yet.'
            : `No game stats recorded for the ${scopeLabel} season.`}
        </p>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Game-by-game stats — {scopeLabel}
            </caption>
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th scope="col" className="px-2 py-2 text-left">Date</th>
                <th scope="col" className="px-2 py-2 text-left">Opponent</th>
                <th scope="col" className="px-2 py-2 text-center"><abbr title="Goals" className="no-underline">G</abbr></th>
                <th scope="col" className="px-2 py-2 text-center"><abbr title="Assists" className="no-underline">A</abbr></th>
                <th scope="col" className="px-2 py-2 text-center"><abbr title="Points (goals + assists)" className="no-underline">PTS</abbr></th>
                <th scope="col" className="px-2 py-2 text-center"><abbr title="Penalty minutes" className="no-underline">PIM</abbr></th>
                {showGoalie && <th scope="col" className="px-2 py-2 text-center"><abbr title="Saves" className="no-underline">SV</abbr></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleRows.map((row) => {
                const g = row.game;
                const h = row.game_highlight;
                const opp = g?.opponent || h?.opponent || '—';
                const date = g?.game_date || h?.game_date || null;
                const score = g?.result || h?.final_score || null;
                const pts = row.goals + row.assists;
                const linkTarget = g?.id || h?.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => linkTarget && navigate(`/game/${linkTarget}`)}
                    className={linkTarget ? 'cursor-pointer hover:bg-ice-blue/30' : 'hover:bg-gray-50'}
                  >
                    <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{formatDate(date)}</td>
                    <td className="px-2 py-2 text-gray-700">
                      <div className="line-clamp-1">{opp}</div>
                      {score && <div className="text-xs text-gray-500">{score}</div>}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{row.goals}</td>
                    <td className="px-2 py-2 text-center font-semibold text-gray-900">{row.assists}</td>
                    <td className="px-2 py-2 text-center font-bold text-steel-blue">{pts}</td>
                    <td className="px-2 py-2 text-center text-gray-700">{row.penalty_minutes || 0}</td>
                    {showGoalie && (
                      <td className="px-2 py-2 text-center text-gray-700">{row.saves ?? 0}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/*
        Explains the empty older seasons in the dropdown. Individual stats
        simply were not kept before 2025 — without this note a blank 2024-25
        reads as a bug or as a player who did not score.
      */}
      <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
        <span aria-hidden="true">*</span> Individual player stats were not
        tracked before the 2025&ndash;26 season, so earlier seasons show no
        results. &ldquo;Games Scored&rdquo; counts games where a stat was
        recorded &mdash; a player may have appeared in more games than this.
      </p>
    </div>
  );
}

function StatTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return <TextTile label={label} value={String(value)} highlight={highlight} />;
}

function TextTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        highlight ? 'bg-steel-blue text-white' : 'bg-white border border-gray-200'
      }`}
    >
      <div className={`text-2xl font-bold ${highlight ? '' : 'text-dark-steel'}`}>{value}</div>
      <div
        className={`text-xs uppercase tracking-wide ${highlight ? 'text-ice-blue' : 'text-gray-500'}`}
      >
        {label}
      </div>
    </div>
  );
}
