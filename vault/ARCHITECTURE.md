# Architecture

## Stack

React 19 · TypeScript · Vite 7 · Tailwind 3 · Framer Motion · React Router 7
Supabase (Postgres + Storage + Realtime) · Netlify (hosting + functions)
Stripe (donations, golf, store) · Printify (merch) · Resend (email)

## Build pipeline

```
npm run build
  └─ vite build                    → dist/ (terser, manualChunks, critical CSS plugin)
  └─ node scripts/prerender.mjs    → clones dist/index.html into 15 per-route
                                     folders with unique title/description/
                                     canonical/OG + <noscript> body copy
```

**Route SEO metadata lives in `scripts/prerender.mjs`, not in components.**
Adding a route means editing that script too, or the route ships with the
homepage's meta tags.

`vite-plugin-critical-css.ts` injects a **hand-maintained hardcoded string** of
utility rules into `<head>`. It duplicates theme hex values and silently drifts
when the theme changes. Slated for replacement in Phase 1.

`public/sw.js` is a manually version-bumped service worker (`wings-of-steel-v7`)
that precaches the manifest and three webp assets.

## Routing and layout

`main.tsx` → `BrowserRouter` → `App.tsx`. All page components are `React.lazy`.
Provider stack: `ErrorBoundary` → `CartProvider` → `DonationModalProvider` →
`GlobalAriaLive` + `ModalEscapeHandler` + `Suspense` → `Routes`.

**There is no shared layout component and no React Router layout route.**
Every page imports `Navigation` and `Footer` itself — 21 files do this — and
each applies its own `pt-20` to clear the fixed `h-20` nav. Changing nav height
is therefore a 21-file edit. Introducing a `<Layout>` route element is Phase 1
and is a prerequisite for any restyling.

`URLTeamProvider` is mounted **inside `TeamSite`**, not at the app root, so
`useTeam()` only works within the homepage tree.

## Theming — currently defined in six places

1. `tailwind.config.js` — the intended source of truth
2. `src/index.css` — `.gradient-text`, `:focus-visible`, `#home` layout rules
3. `index.html` inline `<style>` — overrides `.font-sport`
4. `vite-plugin-critical-css.ts` — hardcoded hex duplicates
5. `src/hooks/useTeamFromURL.ts` — sets `--team-*` CSS variables imperatively
6. `public/sw.js` / manifest `theme-color`

Four of these hardcode `#2C3E50` / `#4682B4` independently. Consolidating them
is Phase 1.

The `--team-*` CSS variable layer exists for multi-team support, but
`src/config/teams.ts` defines only `youth` (the adult config was removed), so it
always resolves to the same four values already in the Tailwind config.

## CSS coupling to watch

- `index.css` targets `#home` and `#home > div:first-child`. Rewriting the
  Hero's first child div breaks the background layout.
- The mega menu hard-links to literal section ids: `#about`, `#location`,
  `#team-players`, `#team-coaches`, `#schedule`, `#get-involved`, `#contact`.
  Renaming a section id silently breaks navigation.

## Data model — stats

```
players ──1:N──> player_game_stats ──N:1──> game_highlights ──0..1:1──> game_schedules
                 goals, assists, pim,        game_id (NULLABLE),         result 'W 5-3'
                 saves, shots_on_goal,       final_score, opponent,      game_date, season,
                 season_id (unused by code)  game_date, team_shots_*     season_id (unused)
```

Stats link to a **highlight**, not a game. Getting a date or opponent for a stat
line requires traversing two hops, and `game_highlights.game_id` is nullable
(standalone tournament highlights carry their own opponent and date).
`PlayerStatsSection.tsx` implements this manually with a fallback chain that
ends in splitting the highlight title on punctuation.

Game metadata is duplicated across `game_schedules` and `game_highlights` with
nothing keeping them in sync, and the score exists twice
(`game_highlights.final_score` and `game_schedules.result`) written by two
separate non-transactional statements.

A `player_season_totals` SQL view exists, has no season dimension despite the
name, and is read by **no** application code.

## Schema management

The stats schema is **not under migration control**. `player_game_stats` and
`game_schedules` were created by ad-hoc scripts run by hand in the Supabase SQL
editor (`supabase/player-game-stats-setup.sql`,
`scripts/update-game-schedule-home-games.sql`). Meanwhile `supabase/migrations/`
001–003 build and seed a `game_schedule` (singular) table the app abandoned, and
007 `ALTER`s a table no migration ever created. Reconciling this is Phase 2.

## Serverless

`netlify/functions/` (20 files) — Stripe payment intents and webhooks, Printify
proxy, golf registration, email. `supabase/functions/` (6) — email only.
No stats or GameSheet functions exist.
