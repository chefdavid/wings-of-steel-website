-- 014 — Structured scores on game_schedules.
--
-- Background: the score lived only in `result`, a free-text VARCHAR holding
-- strings like 'W 5-3'. SeasonRecordGrid computed the team record by reading
-- `result.trim()[0]` — a substring index — and parsed the score by splitting on
-- whitespace. The same score was also stored independently in
-- game_highlights.final_score, written by a separate non-transactional
-- statement, with nothing keeping the two in sync.
--
-- This adds integer columns as the source of truth and keeps `result` as a
-- derived display string so existing components keep working unchanged.

------------------------------------------------------------------ columns ---

ALTER TABLE public.game_schedules
  ADD COLUMN IF NOT EXISTS wings_score    integer,
  ADD COLUMN IF NOT EXISTS opponent_score integer;

COMMENT ON COLUMN public.game_schedules.wings_score IS
  'Goals for Wings of Steel. NULL until the game has been played.';
COMMENT ON COLUMN public.game_schedules.opponent_score IS
  'Goals against. NULL until the game has been played.';

----------------------------------------------------------------- backfill ---
-- Every existing `result` matches '<letter> <n>-<n>' with the Wings score
-- first (verified against all 21 non-null rows on 2026-08-15).

UPDATE public.game_schedules
SET wings_score    = (regexp_match(result, '(\d+)\s*-\s*(\d+)'))[1]::int,
    opponent_score = (regexp_match(result, '(\d+)\s*-\s*(\d+)'))[2]::int
WHERE result IS NOT NULL
  AND result ~ '(\d+)\s*-\s*(\d+)'
  AND wings_score IS NULL;

-- Fail loudly if any backfilled row disagrees with its own W/L/T letter,
-- rather than silently shipping a wrong record.
DO $$
DECLARE bad integer;
BEGIN
  SELECT count(*) INTO bad
  FROM public.game_schedules
  WHERE wings_score IS NOT NULL
    AND result IS NOT NULL
    AND upper(left(btrim(result), 1)) <> CASE
      WHEN wings_score > opponent_score THEN 'W'
      WHEN wings_score < opponent_score THEN 'L'
      ELSE 'T'
    END;

  IF bad > 0 THEN
    RAISE EXCEPTION
      'Score backfill mismatch on % row(s): result letter disagrees with parsed scores', bad;
  END IF;
END $$;

------------------------------------------------------------- constraints ----

ALTER TABLE public.game_schedules
  DROP CONSTRAINT IF EXISTS game_schedules_scores_non_negative;
ALTER TABLE public.game_schedules
  ADD CONSTRAINT game_schedules_scores_non_negative
  CHECK (
    (wings_score IS NULL AND opponent_score IS NULL)
    OR (wings_score >= 0 AND opponent_score >= 0)
  );

------------------------------------------------------ derived result text ---
-- `result` stays a text column because ~15 component call sites read it, but
-- it is now maintained by the database rather than by string concatenation in
-- the admin UI. Setting scores updates `result`; setting `result` by hand
-- (legacy write paths) still works and backfills the scores.

CREATE OR REPLACE FUNCTION public.sync_game_result()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE parsed text[];
BEGIN
  IF NEW.wings_score IS NOT NULL AND NEW.opponent_score IS NOT NULL THEN
    NEW.result :=
      CASE
        WHEN NEW.wings_score > NEW.opponent_score THEN 'W'
        WHEN NEW.wings_score < NEW.opponent_score THEN 'L'
        ELSE 'T'
      END || ' ' || NEW.wings_score || '-' || NEW.opponent_score;

  -- Legacy path: something wrote `result` without the integer columns.
  ELSIF NEW.result IS NOT NULL AND NEW.result ~ '(\d+)\s*-\s*(\d+)' THEN
    parsed := regexp_match(NEW.result, '(\d+)\s*-\s*(\d+)');
    NEW.wings_score    := parsed[1]::int;
    NEW.opponent_score := parsed[2]::int;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_sync_game_result ON public.game_schedules;
CREATE TRIGGER trg_sync_game_result
  BEFORE INSERT OR UPDATE OF wings_score, opponent_score, result
  ON public.game_schedules
  FOR EACH ROW EXECUTE FUNCTION public.sync_game_result();

------------------------------------------------------------------ indexes ---

CREATE INDEX IF NOT EXISTS idx_game_schedules_season_id ON public.game_schedules (season_id);
CREATE INDEX IF NOT EXISTS idx_game_schedules_game_date ON public.game_schedules (game_date);
