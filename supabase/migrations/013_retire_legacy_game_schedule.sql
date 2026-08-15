-- 013 — Retire the legacy `game_schedule` (singular) table.
--
-- Background: migrations 001–003 create and seed a table called
-- `game_schedule`. The application has never read it. Everything actually
-- reads `game_schedules` (plural), whose DDL was never in a migration — it was
-- created by hand from scripts/update-game-schedule-home-games.sql. Migration
-- 007 then ALTERed the plural table, which no migration had created.
--
-- Two similarly named tables is a live footgun: a `from('game_schedule')` typo
-- returns an empty, stale schedule instead of an error. Renaming makes the
-- mistake loud.
--
-- Reversible: ALTER TABLE deprecated_game_schedule RENAME TO game_schedule;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'game_schedule'
  ) THEN
    ALTER TABLE public.game_schedule RENAME TO deprecated_game_schedule;

    COMMENT ON TABLE public.deprecated_game_schedule IS
      'DEPRECATED 2026-08-15. Created by migrations 001-003 and never read by '
      'the application. The live schedule is public.game_schedules (plural). '
      'Kept temporarily so the rename is reversible; safe to DROP once no one '
      'has needed it for a season.';
  END IF;
END $$;
