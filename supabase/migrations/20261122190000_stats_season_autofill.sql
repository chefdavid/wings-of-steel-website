-- Player stats entered this season (2026-27) were invisible on the site.
--
-- Cause: the stats views (player_season_totals, goalie_season_totals,
-- player_career_totals) group by player_game_stats.season_id, and the Stats
-- page filters to one season. The admin "Game Highlights" save never wrote
-- season_id on game_highlights or player_game_stats. Rows from 2025-26 had it
-- only because migration 016's era backfilled them by hand. Every row entered
-- since 2026-09-01 (3 games, 33 stat lines) landed with season_id NULL, so the
-- 2026-27 leaderboard was empty.
--
-- Fix: fill season_id in the database on every insert/update, from the linked
-- game first, then the highlight, then the game date against seasons'
-- date ranges. This covers every writer (admin screen, scripts, imports), not
-- just the one that forgot. Then backfill the rows already missing it.
--
-- Touches only season_id where it is NULL. No stat values change.

CREATE OR REPLACE FUNCTION public.season_for_date(d date)
RETURNS uuid
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT id FROM public.seasons
  WHERE d BETWEEN start_date AND end_date
  ORDER BY start_date DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.fill_highlight_season_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.season_id IS NULL THEN
    IF NEW.game_id IS NOT NULL THEN
      SELECT season_id INTO NEW.season_id
      FROM public.game_schedules WHERE id = NEW.game_id;
    END IF;
    IF NEW.season_id IS NULL AND NEW.game_date IS NOT NULL THEN
      NEW.season_id := public.season_for_date(NEW.game_date::date);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fill_stat_season_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  h_season uuid;
  h_game uuid;
  h_date date;
BEGIN
  IF NEW.season_id IS NULL THEN
    IF NEW.game_id IS NOT NULL THEN
      SELECT season_id INTO NEW.season_id
      FROM public.game_schedules WHERE id = NEW.game_id;
    END IF;
    IF NEW.season_id IS NULL AND NEW.game_highlight_id IS NOT NULL THEN
      SELECT h.season_id, h.game_id, h.game_date::date
        INTO h_season, h_game, h_date
      FROM public.game_highlights h WHERE h.id = NEW.game_highlight_id;
      NEW.season_id := h_season;
      IF NEW.season_id IS NULL AND h_game IS NOT NULL THEN
        SELECT season_id INTO NEW.season_id
        FROM public.game_schedules WHERE id = h_game;
      END IF;
      IF NEW.season_id IS NULL AND h_date IS NOT NULL THEN
        NEW.season_id := public.season_for_date(h_date);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fill_highlight_season_id ON public.game_highlights;
CREATE TRIGGER fill_highlight_season_id
  BEFORE INSERT OR UPDATE ON public.game_highlights
  FOR EACH ROW EXECUTE FUNCTION public.fill_highlight_season_id();

DROP TRIGGER IF EXISTS fill_stat_season_id ON public.player_game_stats;
CREATE TRIGGER fill_stat_season_id
  BEFORE INSERT OR UPDATE ON public.player_game_stats
  FOR EACH ROW EXECUTE FUNCTION public.fill_stat_season_id();

-- Backfill. A no-op UPDATE fires the triggers above, which fill season_id.
UPDATE public.game_highlights SET season_id = season_id WHERE season_id IS NULL;
UPDATE public.player_game_stats SET season_id = season_id WHERE season_id IS NULL;

-- Verify (expect zero rows, unless a highlight has neither a game nor a date):
-- SELECT id FROM public.game_highlights  WHERE season_id IS NULL;
-- SELECT id FROM public.player_game_stats WHERE season_id IS NULL;
