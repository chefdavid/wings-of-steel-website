-- 016 — Season-aware aggregate views.
--
-- Background: every aggregate on the site is computed client-side. Each
-- component refetches raw rows and reduce()s them; the team record is derived
-- by string-parsing `result`. A `player_season_totals` view already existed but
-- (a) had no season dimension despite the name and (b) was read by exactly zero
-- application code — only a sanity printout in a backfill script.
--
-- The database has had a `seasons` table and a fully backfilled `season_id` on
-- every game and every stat row since before this migration. Nothing read it.
-- These views are what makes that data reachable.

-- ============================================================ player totals ==

DROP VIEW IF EXISTS public.player_season_totals CASCADE;

CREATE VIEW public.player_season_totals AS
SELECT
  p.id                                        AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.position,
  p.is_goalie,
  s.season_id,
  se.label                                    AS season_label,
  se.is_current                               AS is_current_season,
  count(*) FILTER (WHERE s.dressed)           AS games_played,
  coalesce(sum(s.goals), 0)                   AS goals,
  coalesce(sum(s.assists), 0)                 AS assists,
  coalesce(sum(s.goals), 0)
    + coalesce(sum(s.assists), 0)             AS points,
  coalesce(sum(s.penalty_minutes), 0)         AS penalty_minutes,
  coalesce(sum(s.shots_on_goal), 0)           AS shots_on_goal,
  coalesce(sum(s.saves), 0)                   AS saves,
  sum(s.goals_against)                        AS goals_against,
  sum(s.shots_faced)                          AS shots_faced,
  sum(s.minutes_played)                       AS minutes_played
FROM public.players p
JOIN public.player_game_stats s ON s.player_id = p.id
LEFT JOIN public.seasons se     ON se.id = s.season_id
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.position,
         p.is_goalie, s.season_id, se.label, se.is_current;

COMMENT ON VIEW public.player_season_totals IS
  'Per-player totals grouped BY SEASON. The previous view of this name had no '
  'season dimension and was career totals mislabelled.';

-- ========================================================== career totals ===

CREATE VIEW public.player_career_totals AS
SELECT
  p.id                                        AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.is_goalie,
  count(*) FILTER (WHERE s.dressed)           AS games_played,
  count(DISTINCT s.season_id)                 AS seasons_played,
  coalesce(sum(s.goals), 0)                   AS goals,
  coalesce(sum(s.assists), 0)                 AS assists,
  coalesce(sum(s.goals), 0)
    + coalesce(sum(s.assists), 0)             AS points,
  coalesce(sum(s.penalty_minutes), 0)         AS penalty_minutes,
  coalesce(sum(s.shots_on_goal), 0)           AS shots_on_goal,
  coalesce(sum(s.saves), 0)                   AS saves
FROM public.players p
JOIN public.player_game_stats s ON s.player_id = p.id
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.is_goalie;

-- ========================================================= goalie totals ====

CREATE VIEW public.goalie_season_totals AS
SELECT
  p.id                                                    AS player_id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  s.season_id,
  se.label                                                AS season_label,
  count(*) FILTER (WHERE s.dressed)                       AS games_played,
  coalesce(sum(s.saves), 0)                               AS saves,
  coalesce(sum(s.goals_against), 0)                       AS goals_against,
  coalesce(sum(s.shots_faced), 0)                         AS shots_faced,
  coalesce(sum(s.minutes_played), 0)                      AS minutes_played,
  -- NULLIF guards the no-shots-faced case rather than dividing by zero.
  round(
    coalesce(sum(s.saves), 0)::numeric
      / NULLIF(sum(s.shots_faced), 0), 3
  )                                                       AS save_pct,
  round(
    coalesce(sum(s.goals_against), 0)::numeric * 60
      / NULLIF(sum(s.minutes_played), 0), 2
  )                                                       AS gaa,
  count(*) FILTER (WHERE s.goals_against = 0 AND s.dressed) AS shutouts
FROM public.players p
JOIN public.player_game_stats s ON s.player_id = p.id
LEFT JOIN public.seasons se     ON se.id = s.season_id
WHERE p.is_goalie
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, s.season_id, se.label;

COMMENT ON VIEW public.goalie_season_totals IS
  'Save percentage, GAA and shutouts — none of which were computable before '
  'goals_against / shots_faced / minutes_played existed.';

-- ============================================================ team record ===

CREATE VIEW public.team_season_record AS
SELECT
  g.season_id,
  se.label                                                          AS season_label,
  se.is_current                                                     AS is_current_season,
  count(*) FILTER (WHERE g.wings_score IS NOT NULL)                 AS games_played,
  count(*) FILTER (WHERE g.wings_score > g.opponent_score)          AS wins,
  count(*) FILTER (WHERE g.wings_score < g.opponent_score)          AS losses,
  count(*) FILTER (WHERE g.wings_score = g.opponent_score)          AS ties,
  count(*) FILTER (WHERE g.wings_score IS NULL)                     AS upcoming,
  coalesce(sum(g.wings_score), 0)                                   AS goals_for,
  coalesce(sum(g.opponent_score), 0)                                AS goals_against,
  count(*) FILTER (WHERE g.home_away = 'home' AND g.wings_score > g.opponent_score) AS home_wins,
  count(*) FILTER (WHERE g.home_away = 'away' AND g.wings_score > g.opponent_score) AS away_wins,
  count(*) FILTER (WHERE g.wings_score IS NOT NULL AND g.opponent_score = 0)        AS shutouts_for
FROM public.game_schedules g
LEFT JOIN public.seasons se ON se.id = g.season_id
WHERE coalesce(g.is_active, true)
GROUP BY g.season_id, se.label, se.is_current;

COMMENT ON VIEW public.team_season_record IS
  'Team record per season, from integer scores. Replaces counting W/L/T by '
  'reading the first character of the `result` string across every past game '
  'ever recorded.';

-- ========================================================== head to head ====

CREATE VIEW public.head_to_head_records AS
SELECT
  g.opponent,
  g.season_id,
  se.label                                                 AS season_label,
  count(*) FILTER (WHERE g.wings_score IS NOT NULL)        AS games_played,
  count(*) FILTER (WHERE g.wings_score > g.opponent_score) AS wins,
  count(*) FILTER (WHERE g.wings_score < g.opponent_score) AS losses,
  count(*) FILTER (WHERE g.wings_score = g.opponent_score) AS ties,
  coalesce(sum(g.wings_score), 0)                          AS goals_for,
  coalesce(sum(g.opponent_score), 0)                       AS goals_against,
  max(g.game_date) FILTER (WHERE g.wings_score IS NOT NULL) AS last_played
FROM public.game_schedules g
LEFT JOIN public.seasons se ON se.id = g.season_id
WHERE coalesce(g.is_active, true) AND g.opponent IS NOT NULL
GROUP BY g.opponent, g.season_id, se.label;

-- =================================================================== grants ==
-- Read-only for the public site. These are views over data that is already
-- publicly readable; they add no new exposure.

GRANT SELECT ON public.player_season_totals  TO anon, authenticated;
GRANT SELECT ON public.player_career_totals  TO anon, authenticated;
GRANT SELECT ON public.goalie_season_totals  TO anon, authenticated;
GRANT SELECT ON public.team_season_record    TO anon, authenticated;
GRANT SELECT ON public.head_to_head_records  TO anon, authenticated;

-- ======================================================= security invoker ===
-- Views default to SECURITY DEFINER, which bypasses RLS on the underlying
-- tables. That is invisible today (RLS is disabled on those tables) but would
-- become a hole the moment RLS is turned on — see docs/RLS_DECISION.md. Every
-- pre-existing view in this database has the same problem; these are the ones
-- we own.
ALTER VIEW public.player_season_totals SET (security_invoker = true);
ALTER VIEW public.player_career_totals SET (security_invoker = true);
ALTER VIEW public.goalie_season_totals SET (security_invoker = true);
ALTER VIEW public.team_season_record   SET (security_invoker = true);
ALTER VIEW public.head_to_head_records SET (security_invoker = true);
