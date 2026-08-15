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

### Phase 1 — Design foundation
- [ ] Real token set: color scales, type scale, spacing, radius, shadow, motion
- [ ] Collapse the six competing theme definitions into one
- [ ] Generate critical CSS from tokens instead of a hardcoded string
- [ ] `<Layout>` route element — kills 21 duplicate Nav/Footer imports and the
      per-page `pt-20`
- [ ] `src/lib/motion.ts` shared Framer variants; migrate the 76 files
- [ ] Standardize on one icon library (react-icons 58 files vs lucide 33)
- [ ] Collapse the `--team-*` CSS variable indirection (only `youth` exists)
- [ ] Wire up `InitialShell` or drop it

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
