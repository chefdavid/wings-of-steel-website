-- 015 — Make player_game_stats able to answer real questions.
--
-- Three structural problems this fixes:
--
-- 1. A stat row linked to a HIGHLIGHT, not a game
--    (player_game_stats.game_highlight_id -> game_highlights). No highlight row
--    meant stats were structurally unrecordable for a played game, and reading
--    a stat line's date/opponent took two hops through a nullable FK, ending in
--    a fallback that split the highlight title on punctuation.
--
-- 2. No goalie concept. A goalie was inferred at render time by `saves > 0`, so
--    a shutout goalie credited zero saves disappeared and a skater credited one
--    save rendered as a goalie. No goals_against or shots_faced means no SV%,
--    no GAA, no shutouts. (As of 2026-08-15 no goalie stat row exists at all.)
--
-- 3. No games-played. The admin save drops any all-zero row, so a player who
--    dressed and recorded nothing has no row — making GP, per-game rates and
--    streaks uncomputable.

------------------------------------------------------------------ goalies ---

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS is_goalie boolean NOT NULL DEFAULT false;

UPDATE public.players
SET is_goalie = true
WHERE position ILIKE 'goal%' AND is_goalie = false;

COMMENT ON COLUMN public.players.is_goalie IS
  'Explicit goalie flag. Replaces inferring "goalie" from saves > 0 at render '
  'time. Seeded from position ILIKE ''goal%''.';

------------------------------------------------------- stat row: the spine ---

ALTER TABLE public.player_game_stats
  ADD COLUMN IF NOT EXISTS game_id uuid REFERENCES public.game_schedules(id) ON DELETE CASCADE;

-- Backfill from the highlight the row currently hangs off.
UPDATE public.player_game_stats s
SET game_id = h.game_id
FROM public.game_highlights h
WHERE s.game_highlight_id = h.id
  AND h.game_id IS NOT NULL
  AND s.game_id IS NULL;

COMMENT ON COLUMN public.player_game_stats.game_id IS
  'The game this stat line belongs to. This is the spine. game_highlight_id is '
  'now only the optional link to a published recap, not the thing that makes a '
  'stat row possible.';
COMMENT ON COLUMN public.player_game_stats.game_highlight_id IS
  'Optional link to the published recap for this game. Nullable on purpose: a '
  'box score can exist with no highlight written.';

-- game_highlight_id must become nullable so a box score can be entered before
-- (or without) a recap.
ALTER TABLE public.player_game_stats
  ALTER COLUMN game_highlight_id DROP NOT NULL;

--------------------------------------------------------- goalie stat lines ---

ALTER TABLE public.player_game_stats
  ADD COLUMN IF NOT EXISTS goals_against  integer,
  ADD COLUMN IF NOT EXISTS shots_faced    integer,
  ADD COLUMN IF NOT EXISTS minutes_played numeric(5,2);

COMMENT ON COLUMN public.player_game_stats.goals_against IS
  'Goalies only. NULL for skaters — distinct from 0, which is a shutout.';
COMMENT ON COLUMN public.player_game_stats.shots_faced IS
  'Goalies only. saves + goals_against. NULL for skaters.';

ALTER TABLE public.player_game_stats
  DROP CONSTRAINT IF EXISTS player_game_stats_goalie_counts_non_negative;
ALTER TABLE public.player_game_stats
  ADD CONSTRAINT player_game_stats_goalie_counts_non_negative
  CHECK (
    (goals_against IS NULL OR goals_against >= 0)
    AND (shots_faced IS NULL OR shots_faced >= 0)
    AND (minutes_played IS NULL OR minutes_played >= 0)
  );

------------------------------------------------------------ games played ----

ALTER TABLE public.player_game_stats
  ADD COLUMN IF NOT EXISTS dressed boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.player_game_stats.dressed IS
  'True when the player was in the lineup. Lets an all-zero row exist and count '
  'toward games played, instead of being dropped on save as it is today.';

------------------------------------------------------------------ indexes ---

CREATE INDEX IF NOT EXISTS idx_pgs_game_id   ON public.player_game_stats (game_id);
CREATE INDEX IF NOT EXISTS idx_pgs_season_id ON public.player_game_stats (season_id);
CREATE INDEX IF NOT EXISTS idx_pgs_player_id ON public.player_game_stats (player_id);

-- One stat line per player per game. The old uniqueness was
-- (player_id, game_highlight_id), which allowed duplicates once a game could
-- have a box score without a highlight.
CREATE UNIQUE INDEX IF NOT EXISTS uq_pgs_player_game
  ON public.player_game_stats (player_id, game_id)
  WHERE game_id IS NOT NULL;
