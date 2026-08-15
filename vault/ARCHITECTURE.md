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

`src/components/layout/Layout.tsx` is a **React Router layout route** and is the
only place nav, the `<main>` landmark, and the footer are rendered:

```tsx
<URLTeamProvider>
  <div className="min-h-screen flex flex-col">
    <Navigation />
    <main id="main-content" className="pt-nav flex-1">
      <Suspense><Outlet /></Suspense>
    </main>
    {withFooter && <Footer />}
  </div>
</URLTeamProvider>
```

Pages render **only their own content**. They must not import `Navigation`,
`Footer` or `URLTeamProvider`, and must not add a `<main>` element or top
padding to clear the nav.

- The nav offset is the `nav` spacing token (`pt-nav`, `top-nav`, `h-nav`).
  Change `spacing.nav` in `src/design/tokens.js` and every page follows.
- `/admin` sits **outside** Layout — it renders its own chrome.
- `/gallery` uses `<Layout withFooter={false} />`.
- `Suspense` is inside the shell, so loading a lazy page chunk swaps only the
  content area; nav and footer stay painted.

`URLTeamProvider` now lives in Layout. It used to be mounted inside `TeamSite`
only, so `useTeam()` fell back on every other route.

## Theming — one source of truth

**`src/design/tokens.js` is the source of truth for every brand value.** It is
plain, dependency-free JS so it can be imported by node at build time and by the
browser at runtime. Consumers:

- `tailwind.config.js` — colors, fonts, type scale, spacing, radius, shadow,
  transition durations
- `vite-plugin-critical-css.ts` — reads tokens instead of carrying its own hex
  copies
- `src/index.css` — uses Tailwind's `theme()` function, no literal hex
- `src/lib/motion.ts` — duration and easing

Do not hardcode a hex value anywhere else. Theme values previously lived in six
places, four of which hardcoded `#2C3E50` / `#4682B4` independently.

Color scales are `steel`, `ice`, `gold`, `steel-neutral`. The historical class
names (`steel-blue`, `dark-steel`, `ice-blue`, `steel-gray`,
`championship-gold`) are kept as aliases so the redesign can proceed
incrementally rather than as one unreviewable rename.

The `--team-*` CSS variable layer remains for multi-team support, but
`src/config/teams.ts` defines only `youth` (the adult config was removed), so it
always resolves to the same values already in the token file.

## CSS coupling to watch

- The mega menu hard-links to literal section ids: `#about`, `#location`,
  `#team-players`, `#team-coaches`, `#schedule`, `#get-involved`, `#contact`.
  Renaming a section id silently breaks navigation.
- `index.css` still keys the hero container off `#home`. The child selector
  (`#home > div:first-child`) was replaced by an explicit `.hero-backdrop`
  class, so reordering the hero's children is now safe.

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
