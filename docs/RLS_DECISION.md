# RLS lockdown — decision required before Phase 1

**Status:** OPEN. Nothing has been changed. Do not run the SQL in this doc until a path is chosen.

## The problem

The `VITE_SUPABASE_ANON_KEY` ships inside the JavaScript bundle. Anyone can open devtools, copy it, and talk to the database directly. That is normal and fine — *as long as RLS is enforced.* It currently is not.

### Tables with RLS disabled entirely

| Table | Rows | Anyone with the anon key can |
|---|---|---|
| `coaches` | 4 | read / insert / update / delete |
| `player_teams` | 24 | read / insert / update / delete |
| `coach_teams` | 5 | read / insert / update / delete |
| `opponent_teams` | 8 | read / insert / update / delete |
| `practice_schedules` | 36 | read / insert / update / delete |
| `game_schedules` | 24 | read / insert / update / delete |
| `game_highlights` | 22 | read / insert / update / delete |
| `seasons` | 4 | read / insert / update / delete |

### Tables with RLS on but effectively open

- `player_game_stats` — RLS enabled, but `player-game-stats-setup.sql:51-65` creates INSERT / UPDATE / DELETE policies with `USING (true)`. Functionally identical to no RLS. The file's own comment concedes: *"admin UI uses the anon key with no auth gating."*
- `players` — `migrations/012_players_admin_policies.sql` opened anon writes for the same reason.

### Why it is like this

The admin dashboard (`src/components/admin/AdminAuth.tsx`) gates on a **password compared in the browser**, then performs every write with the **anon key**. There is no Supabase Auth session. So the database has no way to distinguish "David in the admin panel" from "anyone on the internet."

**Turning on RLS without changing how admin writes happen will lock you out of your own admin.** That is why this is a decision and not a fix.

## Realistic risk

Not theoretical, but not five-alarm either. An attacker gains nothing financial — Stripe keys are server-side in Netlify functions, and `donations` / `golf_registrations` / `store_orders` are separate. What they could do is **vandalize**: blank the roster, rewrite the schedule, delete every game highlight and photo, or quietly falsify stats. There are no backups configured beyond Supabase's own, and no audit trail of who changed what.

## Option A — Netlify functions with the service-role key (recommended)

Admin writes move from the browser to server-side functions. The browser never holds a write-capable key.

```
Browser (admin UI)  →  /.netlify/functions/admin-write  →  Supabase (service_role)
                        ↑ checks a shared admin secret
```

**Work:** one generic `admin-write` function plus an auth check; migrate the ~12 admin components' write calls to it. Public read policies stay `USING (true)` so the site keeps working unauthenticated.

**Pros:** keeps the current password-prompt UX; no new login flow; service-role key never reaches the client; can add audit logging in one place.
**Cons:** every admin save becomes a function call (slightly slower); ~a day of migration work across the admin components.

## Option B — Supabase Auth for admin

Create a real Supabase user for admins, sign in through `supabase.auth`, and write policies keyed on `auth.uid()` / a `role` claim.

**Pros:** the "correct" answer; per-user attribution; no function layer; real session expiry.
**Cons:** replaces the password prompt with a real login screen; you manage accounts; every admin write path needs the authenticated client; more moving parts to get wrong in one pass.

## Option C — Defer

Leave as-is, revisit after the redesign. Acceptable if you accept the vandalism risk in the meantime. If you pick this, at minimum turn on Supabase point-in-time recovery so a wipe is recoverable.

## The SQL (do not run yet)

Enabling RLS with **no policies blocks everything, including public reads.** So this must ship together with read policies:

```sql
-- 1) Enable RLS
ALTER TABLE public.coaches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_teams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opponent_teams      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_schedules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_highlights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons             ENABLE ROW LEVEL SECURITY;

-- 2) Public read (required — the site reads these anonymously)
CREATE POLICY "public read" ON public.coaches            FOR SELECT USING (true);
CREATE POLICY "public read" ON public.player_teams       FOR SELECT USING (true);
CREATE POLICY "public read" ON public.coach_teams        FOR SELECT USING (true);
CREATE POLICY "public read" ON public.opponent_teams     FOR SELECT USING (true);
CREATE POLICY "public read" ON public.practice_schedules FOR SELECT USING (true);
CREATE POLICY "public read" ON public.game_schedules     FOR SELECT USING (true);
CREATE POLICY "public read" ON public.game_highlights    FOR SELECT USING (true);
CREATE POLICY "public read" ON public.seasons            FOR SELECT USING (true);

-- 3) Writes: NO anon policies. Under Option A the service-role key bypasses
--    RLS entirely, so nothing further is needed. Under Option B add
--    FOR ALL USING (auth.role() = 'authenticated') per table.

-- 4) Close the wide-open write policies that already exist
DROP POLICY IF EXISTS "Anyone can insert player game stats" ON public.player_game_stats;
DROP POLICY IF EXISTS "Anyone can update player game stats" ON public.player_game_stats;
DROP POLICY IF EXISTS "Anyone can delete player game stats" ON public.player_game_stats;
-- (verify exact policy names first: select * from pg_policies where schemaname='public';)
```

## Unrelated but worth fixing while you're in there

`.env` defines `VITE_SUPABASE_SERVICE_ROLE_KEY`. Nothing reads it (verified: no `import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY` in `src/`, and the string does not appear in `dist/`), so it is **not** currently leaking. But the `VITE_` prefix means the moment anyone references it, Vite will inline the service-role key into the public bundle. Rename it to `SUPABASE_SERVICE_ROLE_KEY` to remove the footgun.
