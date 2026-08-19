# AI Context — Wings of Steel

## What this is

The website for Wings of Steel, a youth sled hockey team in New Jersey.
501(c)(3) nonprofit. The mission line that runs through the whole site is
**"No child pays to play."** Three-time USA Hockey Sled Nationals champions
(2024, 2025, 2026) and undefeated in the 2025–26 season.

The site does five jobs:

1. **Tell the story** — hero, about, press stories, photo galleries.
2. **Publish the schedule and results** — games, practices, highlights.
3. **Raise money** — donations (Stripe), the annual golf outing (the single
   largest fundraiser, ~75% of annual budget), Topgolf, Pizza Pins & Pop.
4. **Sell merch** — Printify-backed storefront.
5. **Recruit** — join-team forms, SEO landing pages targeting "sled hockey NJ",
   "free youth hockey", equipment guides.

There is an **admin dashboard at `/admin`** (password prompt, no real auth —
see `docs/RLS_DECISION.md`) where the team manages roster, coaches, schedule,
highlights, stats, press, donations and event visibility.

## Who uses it

Parents and players (schedule, practice times, photos), donors and sponsors
(golf outing, donate), and prospective families finding the program via search.

## Non-negotiables

- **Netlify must build `dist` fresh.** Never commit `dist`. Asset hash
  mismatches produce blank pages.
- **There is exactly one Hero component**, `src/components/Hero.tsx`. Do not
  create variants.
- **Test `npm run build && npm run preview` before pushing.** `npm run smoke`
  boots the production build and visits all 18 routes; run it locally (it was
  removed from the Netlify build on 2026-05-08 for exceeding the 18-min timeout).
- The build does **not** run `tsc`. There is a standing backlog of ~76 type
  errors; they do not block deploys. Do not treat a clean `tsc` as a gate, but
  do not add to the pile either.

## Things that are true and surprising

- **The database is ahead of the code.** A `seasons` table exists with four
  seasons and `season_id` is backfilled on every game and every stat row — and
  no application code reads any of it. Wiring this up is Phase 2/3.
- **"Season Stats" on the player card is actually career totals.** No season or
  date filter is applied anywhere. Same for the season record grid.
- **Stats hang off highlights, not games.** `player_game_stats.game_highlight_id`
  points at `game_highlights`. No highlight row means stats cannot be recorded
  for that game at all.
- **Scores are free text.** `game_schedules.result` is a string like `'W 5-3'`,
  and the team record is computed by reading its first character.
- **Two schedule tables exist.** `game_schedules` (plural) is the live one.
  `game_schedule` (singular) is created and seeded by migrations 001–003 and is
  read by nothing. Do not confuse them.
- **GameSheet is link-out only.** Eight players have `gamesheet_player_id`
  mapped; there is no sync code anywhere.
