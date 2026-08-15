import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  useSeasons,
  usePlayerSeasonTotals,
  useGoalieSeasonTotals,
  useTeamSeasonRecord,
  useHeadToHead,
} from '../hooks/useStats';
import { fullName, formatRecord, formatSavePct, formatGaa } from '../types/stats';
import type { PlayerSeasonTotals } from '../types/stats';
import { fadeUp, inView } from '../lib/motion';

/**
 * /stats — the season-aware stats hub.
 *
 * Design notes (per the dataviz guidance):
 * - The headline numbers are STAT TILES, not charts. A record and a goal total
 *   are single values; plotting them would add nothing.
 * - The leaderboard uses a magnitude bar in a SEQUENTIAL single hue (steel),
 *   not categorical color. Rank is conveyed by position and by the number;
 *   the bar is a redundant magnitude cue, never the only encoding.
 * - Win/loss uses status color AND a letter, never color alone.
 * - Gold is reserved for the single headline accent. It is 6.7:1 on the dark
 *   surface as text, but only 1.6:1 on white — never use it as a fill on light.
 */

const SectionHeading = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="mb-6">
    <h2 className="font-sport text-2xl md:text-display-sm text-white tracking-wide">{children}</h2>
    {sub && <p className="text-sm text-ice-200/70 mt-1">{sub}</p>}
  </div>
);

const StatTile = ({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string | number;
  detail?: string;
  accent?: boolean;
}) => (
  <div className="rounded-card bg-white/5 border border-white/10 px-5 py-6 text-center">
    <div
      className={`font-sport text-4xl md:text-5xl leading-none ${
        accent ? 'text-championship-gold' : 'text-white'
      }`}
    >
      {value}
    </div>
    <div className="mt-2 text-xs uppercase tracking-widest text-ice-200/70">{label}</div>
    {detail && <div className="mt-1 text-xs text-ice-200/50">{detail}</div>}
  </div>
);

/** Recessive magnitude bar behind a leaderboard row. Sequential, one hue. */
const MagnitudeBar = ({ value, max }: { value: number; max: number }) => {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full rounded-pill bg-white/10 overflow-hidden" aria-hidden="true">
      <div
        className="h-full rounded-pill bg-steel-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const EmptyNote = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-ice-200/60 italic border border-dashed border-white/15 rounded-card px-4 py-6 text-center">
    {children}
  </p>
);

export default function Stats() {
  const { seasons, defaultSeason, loading: seasonsLoading } = useSeasons();
  const [seasonId, setSeasonId] = useState<string | null>(null);

  // Default to the season the visitor most likely wants, once seasons load.
  useEffect(() => {
    if (!seasonId && defaultSeason) setSeasonId(defaultSeason.id);
  }, [defaultSeason, seasonId]);

  const { skaters, loading: playersLoading } = usePlayerSeasonTotals(seasonId);
  const { goalies, loading: goaliesLoading } = useGoalieSeasonTotals(seasonId);
  const { record, loading: recordLoading } = useTeamSeasonRecord(seasonId);
  const { opponents, loading: h2hLoading } = useHeadToHead(seasonId);

  // Opponents with zero games played are scheduled, not results. Showing
  // "Family Game 0-0" in a head-to-head list is noise.
  const playedOpponents = useMemo(
    () => opponents.filter((o) => o.games_played > 0),
    [opponents]
  );

  const activeSeason = seasons.find((s) => s.id === seasonId) ?? null;

  useEffect(() => {
    document.title = 'Team Stats | Wings of Steel Youth Sled Hockey';
    return () => {
      document.title = 'Wings of Steel Youth Sled Hockey';
    };
  }, []);

  const leaders = useMemo(
    () =>
      [...skaters].sort(
        (a, b) => b.points - a.points || b.goals - a.goals || a.games_played - b.games_played
      ),
    [skaters]
  );
  const maxPoints = leaders[0]?.points ?? 0;

  const hasRecordedShots = skaters.some((p) => p.shots_on_goal > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-steel via-steel-900 to-steel-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-section-sm md:py-section">
        <motion.div {...inView} variants={fadeUp}>
          <p className="text-championship-gold font-display tracking-[0.2em] text-xs uppercase mb-2">
            Wings of Steel
          </p>
          <h1 className="font-sport text-display-md md:text-display-lg tracking-wide">
            Team Stats
          </h1>
        </motion.div>

        {/* Season selector — one row of filters above the content */}
        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Select season">
          {seasonsLoading && <span className="text-sm text-ice-200/60">Loading seasons…</span>}
          {seasons.map((s) => {
            const selected = s.id === seasonId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeasonId(s.id)}
                aria-pressed={selected}
                className={`px-4 py-2 rounded-pill text-sm font-display tracking-wide transition-colors ${
                  selected
                    ? 'bg-championship-gold text-dark-steel font-bold'
                    : 'bg-white/5 text-ice-200/80 hover:bg-white/10 border border-white/10'
                }`}
              >
                {s.label}
                {s.is_current && <span className="ml-2 text-[10px] uppercase opacity-70">current</span>}
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------------------- record */}
        <section className="mt-10" aria-labelledby="record-heading">
          <div id="record-heading">
            <SectionHeading sub={activeSeason ? `${activeSeason.label} season` : undefined}>
              Team Record
            </SectionHeading>
          </div>

          {recordLoading ? (
            <EmptyNote>Loading…</EmptyNote>
          ) : !record || record.games_played === 0 ? (
            <EmptyNote>
              No games have been played yet in this season.
              {record && record.upcoming > 0 && ` ${record.upcoming} scheduled.`}
            </EmptyNote>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatTile label="Record" value={formatRecord(record)} accent detail={`${record.games_played} games`} />
              <StatTile label="Goals For" value={record.goals_for} />
              <StatTile label="Goals Against" value={record.goals_against} />
              <StatTile
                label="Shutouts"
                value={record.shutouts_for}
                detail={`${record.home_wins} home / ${record.away_wins} away wins`}
              />
            </div>
          )}
        </section>

        {/* ----------------------------------------------------- leaderboard */}
        <section className="mt-12" aria-labelledby="leaders-heading">
          <div id="leaders-heading">
            <SectionHeading sub="Sorted by points. Games played counts every game a player dressed for.">
              Scoring Leaders
            </SectionHeading>
          </div>

          {playersLoading ? (
            <EmptyNote>Loading…</EmptyNote>
          ) : leaders.length === 0 ? (
            <EmptyNote>No player stats recorded for this season yet.</EmptyNote>
          ) : (
            <div className="overflow-x-auto rounded-card border border-white/10">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Scoring leaders for the {activeSeason?.label ?? 'selected'} season
                </caption>
                <thead>
                  <tr className="bg-white/5 text-ice-200/70 text-xs uppercase tracking-wider">
                    <th scope="col" className="text-left px-4 py-3 font-display">Player</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">GP</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">G</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">A</th>
                    <th scope="col" className="text-right px-4 py-3 font-display">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((p: PlayerSeasonTotals) => (
                    <tr key={p.player_id} className="border-t border-white/5 hover:bg-white/5">
                      <th scope="row" className="text-left px-4 py-3 font-normal">
                        <div className="flex items-center gap-3">
                          {p.jersey_number != null && (
                            <span className="text-ice-200/50 tabular-nums w-6 text-right">
                              {p.jersey_number}
                            </span>
                          )}
                          <span className="text-white">{fullName(p)}</span>
                        </div>
                        <div className="mt-2 max-w-[220px]">
                          <MagnitudeBar value={p.points} max={maxPoints} />
                        </div>
                      </th>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/70">{p.games_played}</td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">{p.goals}</td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">{p.assists}</td>
                      <td className="text-right px-4 py-3 tabular-nums font-bold text-championship-gold">
                        {p.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!hasRecordedShots && leaders.length > 0 && (
            <p className="mt-3 text-xs text-ice-200/50">
              Shots on goal are not shown — they have not been tracked for this season.
            </p>
          )}
        </section>

        {/* --------------------------------------------------------- goalies */}
        <section className="mt-12" aria-labelledby="goalies-heading">
          <div id="goalies-heading">
            <SectionHeading sub="Save percentage and goals-against average.">Goaltending</SectionHeading>
          </div>

          {goaliesLoading ? (
            <EmptyNote>Loading…</EmptyNote>
          ) : goalies.length === 0 ? (
            <EmptyNote>
              No goaltending stats recorded for this season yet.
            </EmptyNote>
          ) : (
            <div className="overflow-x-auto rounded-card border border-white/10">
              <table className="w-full text-sm">
                <caption className="sr-only">Goaltending stats</caption>
                <thead>
                  <tr className="bg-white/5 text-ice-200/70 text-xs uppercase tracking-wider">
                    <th scope="col" className="text-left px-4 py-3 font-display">Goalie</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">GP</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">SV</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">GA</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">SV%</th>
                    <th scope="col" className="text-right px-3 py-3 font-display">GAA</th>
                    <th scope="col" className="text-right px-4 py-3 font-display">SO</th>
                  </tr>
                </thead>
                <tbody>
                  {goalies.map((g) => (
                    <tr key={g.player_id} className="border-t border-white/5 hover:bg-white/5">
                      <th scope="row" className="text-left px-4 py-3 font-normal text-white">
                        {fullName(g)}
                      </th>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/70">{g.games_played}</td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">{g.saves}</td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">{g.goals_against}</td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">
                        {formatSavePct(g.save_pct)}
                      </td>
                      <td className="text-right px-3 py-3 tabular-nums text-ice-200/90">
                        {formatGaa(g.gaa)}
                      </td>
                      <td className="text-right px-4 py-3 tabular-nums font-bold text-championship-gold">
                        {g.shutouts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------- head to head */}
        <section className="mt-12" aria-labelledby="h2h-heading">
          <div id="h2h-heading">
            <SectionHeading sub="How the season went against each opponent.">
              Head to Head
            </SectionHeading>
          </div>

          {h2hLoading ? (
            <EmptyNote>Loading…</EmptyNote>
          ) : playedOpponents.length === 0 ? (
            <EmptyNote>No completed games against an opponent yet this season.</EmptyNote>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playedOpponents.map((o) => {
                const decided = o.wins > o.losses ? 'up' : o.wins < o.losses ? 'down' : 'even';
                return (
                  <li
                    key={`${o.opponent}-${o.season_id}`}
                    className="rounded-card border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-white font-display">{o.opponent}</span>
                      {/* Status is carried by the letter, not by color alone. */}
                      <span
                        className={`shrink-0 text-xs font-bold px-2 py-1 rounded-pill ${
                          decided === 'up'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : decided === 'down'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-white/10 text-ice-200/80'
                        }`}
                      >
                        {formatRecord(o)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-ice-200/60 tabular-nums">
                      {o.goals_for}–{o.goals_against} goals
                      {o.last_played && ` · last played ${o.last_played}`}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-12 text-sm text-ice-200/60">
          Looking for game recaps and photos?{' '}
          <Link to="/game-highlights" className="text-championship-gold underline underline-offset-4">
            Game highlights
          </Link>{' '}
          ·{' '}
          <Link to="/#schedule" className="text-championship-gold underline underline-offset-4">
            Full schedule
          </Link>
        </p>
      </div>
    </div>
  );
}
