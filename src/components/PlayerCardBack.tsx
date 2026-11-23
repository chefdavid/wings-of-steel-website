import { getTeamYearOrdinal } from '../utils/dateUtils';
import type { PlayerWithTeams } from '../types/database';
import type { PlayerSeasonTotals } from '../types/stats';

/**
 * Back face of a roster trading card ("Cardboard" — chosen 2026-11-23).
 *
 * Cream stock in one blue ink, like a classic card back: age / season / joined
 * across the top, a season-by-season stat table with a career line, the bio.
 * Sized in `cqw` against `.player-card`, same as PlayerCardFront. Styles live
 * in index.css under "player trading card".
 */

/** The table shows at most this many seasons; the career line still counts all. */
const MAX_SEASON_ROWS = 3;

const sum = (rows: PlayerSeasonTotals[], pick: (r: PlayerSeasonTotals) => number | null | undefined) =>
  rows.reduce((total, r) => total + (pick(r) ?? 0), 0);

// Alfa Slab One runs about 0.84em per capital; size the name to its longest word.
const nameSize = (name: string) => {
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  return `${Math.min(7.2, 60 / longest / 0.84).toFixed(2)}cqw`;
};

interface PlayerCardBackProps {
  player: PlayerWithTeams;
  /** Every season row for this player, any order. Empty when no games are entered. */
  seasons: PlayerSeasonTotals[];
}

const PlayerCardBack = ({ player, seasons }: PlayerCardBackProps) => {
  const fullName = `${player.first_name} ${player.last_name}`.trim();
  const hasNumber = !!player.jersey_number && player.jersey_number !== 0;
  const isGoalie = seasons.length ? seasons.some((s) => s.is_goalie) : player.position === 'Goalie';
  const ordered = [...seasons].sort((a, b) => (a.season_label || '').localeCompare(b.season_label || ''));
  const shown = ordered.slice(-MAX_SEASON_ROWS);
  const bio = player.bio?.trim();

  return (
    <div className="pb-in">
      <div className="pb-head">
        {hasNumber && <span className="pb-no">#{player.jersey_number}</span>}
        <div className="pb-name">
          <strong style={{ fontSize: nameSize(fullName) }}>{fullName}</strong>
          <span>{player.position} &middot; Wings of Steel</span>
        </div>
      </div>

      <dl className="pb-facts">
        <div>
          <dt>Age</dt>
          <dd>{player.age || '–'}</dd>
        </div>
        <div>
          <dt>Season</dt>
          <dd>{player.start_date ? getTeamYearOrdinal(player.start_date) : '–'}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{player.start_date ? player.start_date.slice(0, 4) : '–'}</dd>
        </div>
      </dl>

      {shown.length > 0 ? (
        <table className="pb-table">
          <thead>
            {isGoalie ? (
              <tr>
                <th>Season</th>
                <th>GP</th>
                <th>Saves</th>
              </tr>
            ) : (
              <tr>
                <th>Season</th>
                <th>GP</th>
                <th>G</th>
                <th>A</th>
                <th>Pts</th>
              </tr>
            )}
          </thead>
          <tbody>
            {shown.map((s) =>
              isGoalie ? (
                <tr key={s.season_id}>
                  <td>{s.season_label}</td>
                  <td>{s.games_played}</td>
                  <td>{s.saves ?? 0}</td>
                </tr>
              ) : (
                <tr key={s.season_id}>
                  <td>{s.season_label}</td>
                  <td>{s.games_played}</td>
                  <td>{s.goals}</td>
                  <td>{s.assists}</td>
                  <td>{s.points}</td>
                </tr>
              )
            )}
            {isGoalie ? (
              <tr className="pb-total">
                <td>Career</td>
                <td>{sum(ordered, (r) => r.games_played)}</td>
                <td>{sum(ordered, (r) => r.saves)}</td>
              </tr>
            ) : (
              <tr className="pb-total">
                <td>Career</td>
                <td>{sum(ordered, (r) => r.games_played)}</td>
                <td>{sum(ordered, (r) => r.goals)}</td>
                <td>{sum(ordered, (r) => r.assists)}</td>
                <td>{sum(ordered, (r) => r.points)}</td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <p className="pb-nogames">First games coming up</p>
      )}

      {bio && <p className="pb-bio">{bio}</p>}

      <div className="pb-foot">
        <span className="pb-script">No child pays to play</span>
        <span className="pb-more">Full profile &rsaquo;</span>
      </div>
    </div>
  );
};

export default PlayerCardBack;
