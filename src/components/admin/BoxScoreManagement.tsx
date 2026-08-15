import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaSave, FaHockeyPuck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { useSeasons } from '../../hooks/useStats';

/**
 * Box score entry.
 *
 * Why this screen exists: stats used to be a sub-panel of the game HIGHLIGHTS
 * editor, and `player_game_stats` hung off `game_highlight_id`. That meant you
 * could not record a box score without first writing a photo recap — so a game
 * either got the full treatment or no stats at all. Migration 015 moved the
 * link to `game_id`, and this is the screen that uses it.
 *
 * Two other things it fixes:
 * - The old save dropped any all-zero row, so a player who dressed and did not
 *   record a point vanished from the season and games-played was uncomputable.
 *   Here, "dressed" is its own checkbox and a zero line is a real row.
 * - Goalies were inferred from `saves > 0`. Here they are marked on the roster
 *   and get their own goals-against / shots-faced fields, so save percentage
 *   and shutouts are actually derivable.
 */

interface GameRow {
  id: string;
  game_date: string | null;
  opponent: string | null;
  home_away: string | null;
  result: string | null;
  wings_score: number | null;
  opponent_score: number | null;
  season_id: string | null;
}

interface PlayerRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  jersey_number: number | null;
  is_goalie: boolean;
  active: boolean | null;
}

interface StatLine {
  id?: string;
  player_id: string;
  dressed: boolean;
  goals: number;
  assists: number;
  penalty_minutes: number;
  shots_on_goal: number;
  saves: number;
  goals_against: number | null;
  shots_faced: number | null;
  minutes_played: number | null;
}

const blankLine = (player_id: string): StatLine => ({
  player_id,
  dressed: false,
  goals: 0,
  assists: 0,
  penalty_minutes: 0,
  shots_on_goal: 0,
  saves: 0,
  goals_against: null,
  shots_faced: null,
  minutes_played: null,
});

const num = (v: string): number => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const nullableNum = (v: string): number | null => {
  if (v.trim() === '') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const formatGameLabel = (g: GameRow) => {
  const date = g.game_date
    ? new Date(g.game_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';
  const venue = g.home_away === 'away' ? '@' : 'vs';
  return `${date} — ${venue} ${g.opponent ?? 'TBD'}${g.result ? ` (${g.result})` : ''}`;
};

export default function BoxScoreManagement() {
  const { seasons, defaultSeason } = useSeasons();
  const [seasonId, setSeasonId] = useState<string | null>(null);
  useEffect(() => {
    if (!seasonId && defaultSeason) setSeasonId(defaultSeason.id);
  }, [defaultSeason, seasonId]);

  const [games, setGames] = useState<GameRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [gameId, setGameId] = useState<string>('');
  const [lines, setLines] = useState<Record<string, StatLine>>({});
  const [wingsScore, setWingsScore] = useState<string>('');
  const [oppScore, setOppScore] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const selectedGame = useMemo(() => games.find((g) => g.id === gameId) ?? null, [games, gameId]);

  /* ------------------------------------------------------------- load lists */

  useEffect(() => {
    if (!seasonId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('game_schedules')
        .select('id, game_date, opponent, home_away, result, wings_score, opponent_score, season_id')
        .eq('season_id', seasonId)
        .order('game_date', { ascending: false });
      if (cancelled) return;
      if (error) {
        setMessage({ kind: 'err', text: `Could not load games: ${error.message}` });
        return;
      }
      setGames((data as GameRow[]) ?? []);
      setGameId('');
    })();
    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, jersey_number, is_goalie, active')
        .order('jersey_number', { ascending: true, nullsFirst: false });
      if (cancelled) return;
      if (error) {
        setMessage({ kind: 'err', text: `Could not load roster: ${error.message}` });
        return;
      }
      setPlayers(((data as PlayerRow[]) ?? []).filter((p) => p.active !== false));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------- load the selected game */

  const loadGame = useCallback(
    async (id: string) => {
      setLoading(true);
      setMessage(null);
      const game = games.find((g) => g.id === id) ?? null;
      setWingsScore(game?.wings_score != null ? String(game.wings_score) : '');
      setOppScore(game?.opponent_score != null ? String(game.opponent_score) : '');

      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          'id, player_id, dressed, goals, assists, penalty_minutes, shots_on_goal, saves, goals_against, shots_faced, minutes_played'
        )
        .eq('game_id', id);

      if (error) {
        setMessage({ kind: 'err', text: `Could not load existing stats: ${error.message}` });
        setLoading(false);
        return;
      }

      const next: Record<string, StatLine> = {};
      for (const p of players) next[p.id] = blankLine(p.id);
      for (const row of (data as StatLine[]) ?? []) {
        next[row.player_id] = { ...blankLine(row.player_id), ...row, dressed: row.dressed ?? true };
      }
      setLines(next);
      setLoading(false);
    },
    [games, players]
  );

  useEffect(() => {
    if (gameId) loadGame(gameId);
    else setLines({});
  }, [gameId, loadGame]);

  const update = (playerId: string, patch: Partial<StatLine>) =>
    setLines((prev) => ({ ...prev, [playerId]: { ...prev[playerId], ...patch } }));

  /* ------------------------------------------------------------------ save */

  const dressedCount = Object.values(lines).filter((l) => l.dressed).length;
  const goalsEntered = Object.values(lines)
    .filter((l) => l.dressed)
    .reduce((n, l) => n + l.goals, 0);

  const scoreMismatch =
    wingsScore.trim() !== '' && goalsEntered > 0 && num(wingsScore) !== goalsEntered;

  const save = async () => {
    if (!gameId) return;
    setSaving(true);
    setMessage(null);

    try {
      // 1) Score on the game. The trigger from migration 014 keeps `result` in
      //    sync, so we never write the display string by hand.
      if (wingsScore.trim() !== '' && oppScore.trim() !== '') {
        const { error } = await supabase
          .from('game_schedules')
          .update({ wings_score: num(wingsScore), opponent_score: num(oppScore) })
          .eq('id', gameId);
        if (error) throw new Error(`score: ${error.message}`);
      }

      // 2) Stat lines. Every dressed player gets a row, including all-zero
      //    ones — that is what makes games-played real. Undressed players are
      //    removed rather than stored as zeros.
      const toUpsert = Object.values(lines)
        .filter((l) => l.dressed)
        .map((l) => ({
          player_id: l.player_id,
          game_id: gameId,
          season_id: selectedGame?.season_id ?? seasonId,
          dressed: true,
          goals: l.goals,
          assists: l.assists,
          penalty_minutes: l.penalty_minutes,
          shots_on_goal: l.shots_on_goal,
          saves: l.saves,
          goals_against: l.goals_against,
          shots_faced: l.shots_faced,
          minutes_played: l.minutes_played,
        }));

      const undressed = Object.values(lines)
        .filter((l) => !l.dressed && l.id)
        .map((l) => l.id as string);

      if (undressed.length > 0) {
        const { error } = await supabase.from('player_game_stats').delete().in('id', undressed);
        if (error) throw new Error(`removing lines: ${error.message}`);
      }

      if (toUpsert.length > 0) {
        // Relies on the unique index on (player_id, game_id) from migration 015.
        const { error } = await supabase
          .from('player_game_stats')
          .upsert(toUpsert, { onConflict: 'player_id,game_id' });
        if (error) throw new Error(`stat lines: ${error.message}`);
      }

      setMessage({
        kind: 'ok',
        text: `Saved ${toUpsert.length} stat line${toUpsert.length === 1 ? '' : 's'}.`,
      });
      await loadGame(gameId);
    } catch (err) {
      setMessage({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------------------------------------- render */

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaHockeyPuck className="text-steel-blue text-2xl" />
        <h2 className="text-2xl font-bold text-dark-steel">Box Scores</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6 max-w-3xl">
        Enter the score and per-player stats for a game. A box score no longer needs a
        published highlight — the two are independent now. Tick <strong>Dressed</strong> for
        everyone in the lineup, even if they did not record a point; that is what makes games
        played and per-game averages correct.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <label htmlFor="bs-season" className="block text-sm font-semibold text-gray-700 mb-1">
            Season
          </label>
          <select
            id="bs-season"
            value={seasonId ?? ''}
            onChange={(e) => setSeasonId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
                {s.is_current ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bs-game" className="block text-sm font-semibold text-gray-700 mb-1">
            Game
          </label>
          <select
            id="bs-game"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select a game…</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {formatGameLabel(g)}
              </option>
            ))}
          </select>
          {games.length === 0 && seasonId && (
            <p className="text-xs text-gray-500 mt-1">No games scheduled in this season yet.</p>
          )}
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-4 flex items-start gap-2 rounded px-4 py-3 text-sm ${
            message.kind === 'ok'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.kind === 'ok' ? (
            <FaCheckCircle className="mt-0.5 flex-shrink-0" />
          ) : (
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {gameId && (
        <>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-dark-steel mb-3">Final score</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="bs-wings" className="block text-xs text-gray-600 mb-1">
                  Wings of Steel
                </label>
                <input
                  id="bs-wings"
                  type="number"
                  min={0}
                  value={wingsScore}
                  onChange={(e) => setWingsScore(e.target.value)}
                  className="w-24 border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <span className="pb-2 text-gray-400">–</span>
              <div>
                <label htmlFor="bs-opp" className="block text-xs text-gray-600 mb-1">
                  {selectedGame?.opponent ?? 'Opponent'}
                </label>
                <input
                  id="bs-opp"
                  type="number"
                  min={0}
                  value={oppScore}
                  onChange={(e) => setOppScore(e.target.value)}
                  className="w-24 border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <p className="text-xs text-gray-500 pb-2">
                W/L/T is derived from these — no need to type it.
              </p>
            </div>

            {scoreMismatch && (
              <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Heads up: the goals entered below add up to <strong>{goalsEntered}</strong> but the
                final score says <strong>{num(wingsScore)}</strong>. That is allowed (own goals,
                unrecorded scorers) — just make sure it is intentional.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              {dressedCount} of {players.length} players marked dressed
            </p>
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 bg-steel-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-dark-steel disabled:opacity-50 transition-colors"
            >
              <FaSave />
              {saving ? 'Saving…' : 'Save box score'}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-6 text-center">Loading…</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <caption className="sr-only">Per-player stat entry</caption>
                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">Dressed</th>
                    <th scope="col" className="px-3 py-2 text-left">Player</th>
                    <th scope="col" className="px-2 py-2">G</th>
                    <th scope="col" className="px-2 py-2">A</th>
                    <th scope="col" className="px-2 py-2">SOG</th>
                    <th scope="col" className="px-2 py-2">PIM</th>
                    <th scope="col" className="px-2 py-2">SV</th>
                    <th scope="col" className="px-2 py-2">GA</th>
                    <th scope="col" className="px-2 py-2">Shots faced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {players.map((p) => {
                    const line = lines[p.id] ?? blankLine(p.id);
                    const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
                    const dim = line.dressed ? '' : 'opacity-40';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={line.dressed}
                            onChange={(e) => update(p.id, { dressed: e.target.checked })}
                            aria-label={`${name} dressed`}
                            className="w-4 h-4"
                          />
                        </td>
                        <th scope="row" className={`px-3 py-2 text-left font-normal ${dim}`}>
                          <span className="text-gray-400 tabular-nums mr-2">
                            {p.jersey_number ?? '—'}
                          </span>
                          {name}
                          {p.is_goalie && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide bg-steel-blue/10 text-steel-blue px-1.5 py-0.5 rounded">
                              G
                            </span>
                          )}
                        </th>
                        <StatCell
                          value={line.goals}
                          disabled={!line.dressed}
                          onChange={(v) => update(p.id, { goals: num(v) })}
                          label={`${name} goals`}
                        />
                        <StatCell
                          value={line.assists}
                          disabled={!line.dressed}
                          onChange={(v) => update(p.id, { assists: num(v) })}
                          label={`${name} assists`}
                        />
                        <StatCell
                          value={line.shots_on_goal}
                          disabled={!line.dressed}
                          onChange={(v) => update(p.id, { shots_on_goal: num(v) })}
                          label={`${name} shots on goal`}
                        />
                        <StatCell
                          value={line.penalty_minutes}
                          disabled={!line.dressed}
                          onChange={(v) => update(p.id, { penalty_minutes: num(v) })}
                          label={`${name} penalty minutes`}
                        />
                        <StatCell
                          value={line.saves}
                          disabled={!line.dressed || !p.is_goalie}
                          onChange={(v) => update(p.id, { saves: num(v) })}
                          label={`${name} saves`}
                        />
                        <StatCell
                          value={line.goals_against}
                          disabled={!line.dressed || !p.is_goalie}
                          onChange={(v) => update(p.id, { goals_against: nullableNum(v) })}
                          label={`${name} goals against`}
                          nullable
                        />
                        <StatCell
                          value={line.shots_faced}
                          disabled={!line.dressed || !p.is_goalie}
                          onChange={(v) => update(p.id, { shots_faced: nullableNum(v) })}
                          label={`${name} shots faced`}
                          nullable
                        />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Goalie columns are only editable for players marked as a goalie on the roster. A
            goalie with 0 goals against is a shutout — leave it as 0, not blank.
          </p>
        </>
      )}
    </div>
  );
}

function StatCell({
  value,
  onChange,
  disabled,
  label,
  nullable,
}: {
  value: number | null;
  onChange: (v: string) => void;
  disabled?: boolean;
  label: string;
  nullable?: boolean;
}) {
  return (
    <td className="px-2 py-2 text-center">
      <input
        type="number"
        min={0}
        aria-label={label}
        disabled={disabled}
        value={value == null ? '' : value}
        placeholder={nullable ? '—' : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 border border-gray-300 rounded px-2 py-1 text-center disabled:bg-gray-100 disabled:text-gray-400"
      />
    </td>
  );
}
