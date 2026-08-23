-- 017_team_scope.sql
-- Give every team-scoped table a team_type, so youth and adult data can never
-- be confused for one another.
--
-- WHY team_type text AND NOT team_id uuid:
-- player_teams and coach_teams already carry team_type varchar with a
-- CHECK (team_type IN ('youth','adult')), and the frontend already speaks the
-- same 'youth' | 'adult' literals (see src/hooks/useTeamFromURL.ts). The
-- public.teams table exists but holds zero rows and duplicates the shape of
-- opponent_teams; building a FK onto it would mean migrating two working
-- tables to gain nothing. We extend the vocabulary that is already here.
--
-- This migration is ADDITIVE AND REVERSIBLE. Every column lands nullable and
-- is backfilled to 'youth'. Nothing is set NOT NULL here -- that is 018, which
-- runs only after the application is writing the column. Run 017, verify with
-- the query at the bottom, then run 018.
--
-- Existing adult data note: player_teams already has 5 rows with
-- team_type='adult' and coach_teams has 2. Those rosters predate this work and
-- are currently unreachable because App.tsx redirects /team/adult/* to /.

begin;

-- ---------------------------------------------------------------- 1. cleanup

-- practice_schedules.team_type has casing drift: 32 rows 'youth', 4 rows
-- 'Youth'. Normalize before any CHECK constraint is applied, or the constraint
-- fails to validate and equality filters silently miss those 4 rows.
update practice_schedules
   set team_type = lower(team_type)
 where team_type is not null
   and team_type <> lower(team_type);


-- ------------------------------------------------- 2. add the column, nullable

alter table game_schedules      add column if not exists team_type varchar;
alter table game_highlights     add column if not exists team_type varchar;
alter table player_game_stats   add column if not exists team_type varchar;
alter table site_sections       add column if not exists team_type varchar;
alter table seasons             add column if not exists team_type varchar;
alter table tournaments         add column if not exists team_type varchar;
alter table donations           add column if not exists team_type varchar;
alter table store_orders        add column if not exists team_type varchar;
-- practice_schedules.team_type already exists (nullable).


-- ------------------------------------------------------ 3. backfill to youth

-- Every row that exists today belongs to the youth team. This is the documented
-- historical rule: everything before the adult team went live is youth.
update game_schedules    set team_type = 'youth' where team_type is null;
update game_highlights   set team_type = 'youth' where team_type is null;
update player_game_stats set team_type = 'youth' where team_type is null;
update site_sections     set team_type = 'youth' where team_type is null;
update seasons           set team_type = 'youth' where team_type is null;
update tournaments       set team_type = 'youth' where team_type is null;
update donations         set team_type = 'youth' where team_type is null;
update store_orders      set team_type = 'youth' where team_type is null;
update practice_schedules set team_type = 'youth' where team_type is null;


-- --------------------------------------------- 4. constrain the vocabulary

-- Mirrors the existing player_teams_team_type_check / coach_teams_team_type_check.
-- A CHECK passes on NULL, so these are safe to add while the column is nullable.
do $$
declare t text;
begin
  foreach t in array array[
    'game_schedules','game_highlights','player_game_stats','site_sections',
    'seasons','tournaments','donations','store_orders','practice_schedules'
  ] loop
    execute format(
      'alter table %I drop constraint if exists %I',
      t, t || '_team_type_check'
    );
    execute format(
      'alter table %I add constraint %I check (team_type in (''youth'',''adult''))',
      t, t || '_team_type_check'
    );
  end loop;
end $$;


-- ------------------------------------------- 5. widen the unique constraints

-- site_sections currently has UNIQUE (section_key). The adult team needs its
-- own hero/about/contact/get_involved/location rows, which means two rows per
-- key. This is the one change in 017 that the live youth site can notice, so
-- it is deliberately last and deliberately explicit.
alter table site_sections drop constraint if exists site_sections_section_key_key;
alter table site_sections drop constraint if exists site_sections_section_key_team_type_key;
alter table site_sections
  add constraint site_sections_section_key_team_type_key unique (section_key, team_type);

-- seasons currently has UNIQUE (label). Adult leagues run their own calendar,
-- so "2025-26" must be able to exist once per team.
alter table seasons drop constraint if exists seasons_label_key;
alter table seasons drop constraint if exists seasons_label_team_type_key;
alter table seasons
  add constraint seasons_label_team_type_key unique (label, team_type);


-- --------------------------------------------------------------- 6. indexes

create index if not exists idx_game_schedules_team      on game_schedules(team_type);
create index if not exists idx_game_highlights_team     on game_highlights(team_type);
create index if not exists idx_player_game_stats_team   on player_game_stats(team_type);
create index if not exists idx_practice_schedules_team  on practice_schedules(team_type);
create index if not exists idx_donations_team           on donations(team_type);
create index if not exists idx_site_sections_team       on site_sections(team_type);


-- --------------------------------------------------------------- 7. comments

comment on column donations.team_type is
  'Which team this gift was designated for. Set from an allowlisted slug server-side, never from the request body. Mirrors the Stripe PaymentIntent metadata.team tag.';
comment on column store_orders.team_type is
  'Which team this order belongs to. Mirrors the Stripe PaymentIntent metadata.team tag.';
comment on column site_sections.team_type is
  'Content is per team. section_key is unique per (section_key, team_type), not globally.';

commit;


-- ============================================================== verification
-- Run this after 017. Every row must be accounted for and no NULLs may remain
-- before 018 is applied.
--
--   select 'game_schedules'    t, team_type, count(*) from game_schedules    group by 2
--   union all select 'game_highlights',   team_type, count(*) from game_highlights   group by 2
--   union all select 'player_game_stats', team_type, count(*) from player_game_stats group by 2
--   union all select 'site_sections',     team_type, count(*) from site_sections     group by 2
--   union all select 'seasons',           team_type, count(*) from seasons           group by 2
--   union all select 'tournaments',       team_type, count(*) from tournaments       group by 2
--   union all select 'donations',         team_type, count(*) from donations         group by 2
--   union all select 'store_orders',      team_type, count(*) from store_orders      group by 2
--   union all select 'practice_schedules',team_type, count(*) from practice_schedules group by 2
--   order by 1, 2;
--
-- Expected: every row 'youth'. Counts should match
-- game_schedules 24, game_highlights 22, player_game_stats 70, site_sections 5,
-- seasons 4, tournaments 1, donations 104, store_orders 1, practice_schedules 36.
