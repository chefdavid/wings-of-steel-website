-- 018_team_scope_enforce.sql
-- Make team_type mandatory, so a row can never be written without saying which
-- team it belongs to. This is the constraint that turns "we tag rows" into a
-- guarantee.
--
-- ORDER OF OPERATIONS -- read before running:
--
--   1. Apply 017 and run its verification query. Zero NULLs, all 'youth'.
--   2. Ship the application code that writes team_type on every insert into
--      these tables (B2: the admin write paths in netlify/lib/adminPlayersCore.js
--      and the schedule/highlight/stats admin screens).
--   3. THEN apply this migration.
--
-- Applying this before step 2 will break admin inserts with a not-null
-- violation. That failure is loud and immediate rather than silent, which is
-- the point, but it is still an outage. Do it in order.
--
-- The financial tables (donations, store_orders) are deliberately NOT enforced
-- here -- see the block at the bottom.

begin;

-- ------------------------------------------- content and schedule tables

alter table game_schedules      alter column team_type set not null;
alter table game_highlights     alter column team_type set not null;
alter table player_game_stats   alter column team_type set not null;
alter table site_sections       alter column team_type set not null;
alter table seasons             alter column team_type set not null;
alter table tournaments         alter column team_type set not null;
alter table practice_schedules  alter column team_type set not null;

-- Defaulting to 'youth' would defeat the purpose: a forgotten call site would
-- silently file adult data under youth instead of failing. No default is set
-- anywhere in this migration, on purpose.

commit;


-- ================================================== deferred: money tables
--
-- donations and store_orders keep team_type nullable until B6, when the
-- payment paths are updated to set it alongside the Stripe PaymentIntent
-- metadata.team tag. Enforcing it now would break live donation and store
-- checkout the moment someone gives.
--
-- Run this as migration 0XX during B6, after create-donation-payment.js,
-- create-store-payment, and the webhook handlers all set team_type:
--
--   begin;
--   alter table donations    alter column team_type set not null;
--   alter table store_orders alter column team_type set not null;
--   commit;
--
-- Before running it, confirm no unlabeled rows have accumulated since 017:
--
--   select count(*) from donations    where team_type is null;
--   select count(*) from store_orders where team_type is null;
--
-- Both must be 0. If they are not, a payment path is still writing untagged
-- rows -- find it before enforcing, because the constraint will take that
-- path down.
