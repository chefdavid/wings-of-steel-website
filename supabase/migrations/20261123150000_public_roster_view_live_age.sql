-- Ages on the public roster were stale for 11 of 19 players (2026-11-23).
--
-- Cause: the public site reads player_team_details and deliberately does not
-- fetch birthdate, so it showed players.age, a stored number that is only
-- recalculated when someone re-saves that player in the admin.
--
-- Fix: the view now works age out from birthdate on every read (New York
-- date), falling back to the stored number only when there is no birthdate.
--
-- The view also stops carrying birthdate, contacts, emergency_contact,
-- medical_info and player_notes. The site never selected them (see
-- PUBLIC_PLAYER_COLUMNS in src/utils/teamQueries.ts), but anyone holding the
-- public key could. Grants drop from full DML to SELECT only.
--
-- NOT fixed here: public.players itself still has open public read/update/
-- delete policies. Closing those needs the admin read path moved first.
--
-- DROP + CREATE because CREATE OR REPLACE VIEW cannot remove columns.

BEGIN;

DROP VIEW public.player_team_details;

CREATE VIEW public.player_team_details AS
SELECT
  p.id,
  p.name,
  p.first_name,
  p.last_name,
  p."position",
  p.bio,
  p.image_url,
  p.jersey_number,
  p.tags,
  p.active,
  CASE
    WHEN p.birthdate IS NOT NULL THEN
      GREATEST(0, date_part('year', age((now() AT TIME ZONE 'America/New_York')::date, p.birthdate))::int)
    ELSE p.age
  END AS age,
  p.start_date,
  pt.team_type,
  pt.jersey_number AS team_jersey_number,
  pt."position" AS team_position,
  pt.is_captain
FROM public.players p
JOIN public.player_teams pt ON p.id = pt.player_id
WHERE p.active = true;

REVOKE ALL ON public.player_team_details FROM anon, authenticated;
GRANT SELECT ON public.player_team_details TO anon, authenticated, service_role;

COMMIT;
