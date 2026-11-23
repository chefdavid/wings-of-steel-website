import { getAvatarUrl } from '../utils/avatar';
import { getTeamYearOrdinal } from '../utils/dateUtils';
import type { PlayerWithTeams } from '../types/database';

/**
 * Front face of a roster trading card ("Script, stacked" — chosen 2026-11-23).
 *
 * Every size inside is in `cqw`, so the card scales as one piece with the
 * width of `.player-card`, which is the container. Styles live in index.css
 * under "player trading card".
 */

const captainLetter = (tags?: string[]): string | null => {
  if (!tags?.length) return null;
  if (tags.some((t) => /assistant/i.test(t))) return 'A';
  if (tags.some((t) => /captain/i.test(t))) return 'C';
  return null;
};

// Alfa Slab One runs about 0.84em per capital. Shrink long surnames to fit
// the nameplate instead of clipping them ("JASTRZEMBSKI" is 12 letters).
const nameSize = (name: string, plateWidth: number) =>
  `${Math.min(11.5, plateWidth / Math.max(name.length, 1) / 0.84).toFixed(2)}cqw`;

const PlayerCardFront = ({ player }: { player: PlayerWithTeams }) => {
  const hasNumber = !!player.jersey_number && player.jersey_number !== 0;
  const letter = captainLetter(player.tags);
  const bigName = player.last_name || player.first_name;
  const smallName = player.last_name ? player.first_name : '';
  const fullName = `${player.first_name} ${player.last_name}`.trim();

  return (
    <div className="pc-in">
      <div className="pc-photo">
        <img
          src={getAvatarUrl(player.image_url, player.first_name, player.last_name, '#14267F', 320)}
          alt={fullName}
          loading="lazy"
        />
      </div>
      <div className="pc-script" aria-hidden="true">
        Wings <span>of Steel</span>
      </div>
      {player.start_date && (
        <div className="pc-burst" aria-hidden="true">
          <span>
            {getTeamYearOrdinal(player.start_date)}
            <small>year</small>
          </span>
        </div>
      )}
      {letter && (
        <span className="pc-tag" title={letter === 'C' ? 'Captain' : 'Assistant Captain'}>
          {letter}
        </span>
      )}
      <div className={`pc-plate ${hasNumber ? '' : 'pc-plate-wide'}`}>
        {smallName && <span className="pc-first">{smallName}</span>}
        <span className="pc-last" style={{ fontSize: nameSize(bigName, hasNumber ? 55 : 72) }}>
          {bigName}
        </span>
      </div>
      {hasNumber && <div className="pc-num">#{player.jersey_number}</div>}
    </div>
  );
};

export default PlayerCardFront;
