# Tasks

## In flight — redesign + season-aware stats

Branch: `redesign/phase-0-stabilize` (Phase 0). Later phases get their own
branches off the same line.

### ✅ Phase 0 — Stabilize
- [x] Define `championship-gold` (24 broken usages across nav + golf)
- [x] Fix hero preload path; move to static `<link>` with `fetchpriority`
- [x] Stop the hero blocking LCP on Supabase
- [x] One `<h1>`, one skip link, `<Footer>` out of `<main>`
- [x] Delete 18 dead files / 4,823 lines
- [x] Seed the vault + write `docs/RLS_DECISION.md`
- [ ] **David: pick an RLS option** (A / B / C in `docs/RLS_DECISION.md`)

### ✅ Phase 1 — Design foundation
- [x] Real token set in `src/design/tokens.js`
- [x] Collapse the six competing theme definitions into one
- [x] Generate critical CSS from tokens instead of a hardcoded string
- [x] `<Layout>` route element — killed 21 duplicate Nav/Footer imports and the
      per-page `pt-20`
- [x] Remove the `fixed inset-0 z-[9999]` overlay wrapper from 5 pages
- [x] Move Suspense inside the shell so nav/footer survive chunk loads
- [x] `src/lib/motion.ts` shared Framer variants
- [ ] ~~Migrate the 76 inline-variant files~~ → moved to Phase 4
- [ ] ~~Icon library consolidation~~ → moved to Phase 4
- [x] `--team-*` kept but now resolves through tokens (only `youth` exists)
- [x] `InitialShell` superseded by in-shell Suspense; delete in Phase 4

### Phase 2 — Stats data layer
- [ ] Bring the live schema under migration control
- [ ] Retire the dead `game_schedule` (singular) table
- [ ] Structured `wings_score` / `opponent_score`; backfill from `result` strings
- [ ] Goalie support: `is_goalie`, `goals_against`, `shots_faced`, `minutes_played`
- [ ] Games-played concept (stop dropping all-zero rows on save)
- [ ] Season-aware aggregates: rebuilt `player_season_totals`,
      `team_season_record`, `head_to_head_records`
- [ ] `player_game_stats.game_id` so stats stop hanging off highlights

### Phase 3 — Stats UI
- [ ] `useSeasons` / `useCurrentSeason` / `usePlayerStats` / `useLeaderboard`
- [ ] `/stats` route: season selector, scoring leaders, record, goalies, H2H
- [ ] Per-game box score on `/game/:gameId`, decoupled from highlights
- [ ] Honest "This Season / Career" toggle on the player card
- [ ] Admin box-score entry screen, single transactional save
- [ ] `result` field in the schedule admin (today it requires writing a recap)

### Phase 4 — Visual overhaul
- [ ] Restyle all surfaces on the token system
- [ ] Replace `ModalEscapeHandler` DOM hacks with a real dialog primitive
- [ ] Keyboard-accessible mega menu
- [ ] Adopt `OptimizedImage` across the site
- [ ] Migrate the 76 files that inline Framer variants to `src/lib/motion.ts`
- [ ] Consolidate react-icons (58 files) and lucide (33) onto one library
- [ ] Delete `AppWrapper` / `InitialShell` unless a use appears
- [ ] Decide on dark mode

### Phase 5 — Verify and ship
- [ ] Build + preview + `npm run smoke` (18 routes)
- [ ] Lighthouse + axe pass
- [ ] Confirm `scripts/prerender.mjs` covers `/stats`
- [ ] Netlify deploy preview review, then merge

## Backlog (not scheduled)
- [ ] GameSheet sync feasibility spike — would end double data entry
- [ ] ~76 standing TypeScript errors (`tsc` is not in the build)
- [ ] Rename `VITE_SUPABASE_SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
      (unused today, but the `VITE_` prefix is a loaded gun)
- [ ] Supabase point-in-time recovery / backups
