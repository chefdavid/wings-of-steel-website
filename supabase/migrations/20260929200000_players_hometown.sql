-- Where a player came from, shown in the admin roster. Free text on purpose:
-- "Deptford, NJ", "Philadelphia", "originally from Buffalo" are all things the
-- coaches will want to type, and a lookup table would just get in the way.
--
-- Not added to the public player_team_details view. The public roster reads a
-- tight column allowlist (src/utils/teamQueries.ts PUBLIC_PLAYER_COLUMNS) that
-- exists because select('*') was serving contacts, medical_info and player
-- notes to anonymous visitors. Putting a child's hometown on the public site
-- is a separate decision for the owner, not a side effect of an admin field.
alter table public.players
  add column if not exists hometown text;
