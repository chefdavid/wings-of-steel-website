# Schedule Update Guide — 2026-2027 Season

For how the data actually fits together — and why deleting a game destroys its
recap — read **[SCHEDULE_DATA_MODEL.md](SCHEDULE_DATA_MODEL.md)** first.

## Where the season lives

`src/data/schedule-2026-2027.ts` is the single source of truth in code:

- `SEASON_LABEL` — `2026-27`, matching the `seasons` table. The home page badge
  and the nav description both read it, so bumping it updates the site.
- `schedule2026_2027` — 14 games
- `practices2026_2027` — 34 practices, every one a Thursday
- `tournaments2026_2027` — empty; the home page tournaments section hides itself
  until entries are added
- `rinkAddresses` — reference addresses

## Importing

**Admin → Game Schedule → Bulk Import**, and
**Admin → Practice Schedule → Bulk Import Season**.

Both importers are **upserts**:

- Existing rows are matched (games on date + time, practices on date) and
  updated in place, so the row keeps its `id`.
- New rows are inserted.
- **Nothing is ever deleted.** Game recaps, uploaded photos and player stats stay
  attached, because they all hang off `game_schedules.id`.
- Rows found in the date range but not in the data file are reported as warnings
  for a human to review, not removed.

Both are safe to re-run as often as you like.

### The one thing to do by hand

If a game's **date or time changes**, the importer treats it as a new game and
leaves the old row behind. Edit that game in **Admin → Game Schedule** instead,
so its recap stays attached.

## Verifying

```bash
npm run verify:schedule
```

Checks every date in the data file against the weekday printed on the source
document, computing it three ways (UTC arithmetic, local midnight, local noon).
It fails if any two disagree — that disagreement is the day-drift bug that has
bitten past imports.

```bash
npm run check:schedule-db
```

Reads the database back and diffs it against the data file: dates, times,
opponents, locations, rinks, and the `effective_from` / `effective_to` columns
that decide whether a practice is visible on the public site.

Run the first before importing and the second after. Both currently pass:
14 games, 34 practices, zero mismatches.

## Database schema (verified against Supabase)

`game_schedules`: `id`, `game_date` (date), `game_time` (time, NOT NULL),
`end_time`, `opponent`, `location` (NOT NULL), `home_away`, `game_type`,
`result`, `status`, `notes`, `season`, `season_id` → `seasons.id`,
`wings_score`, `opponent_score`, `is_active`, `created_at`, `updated_at`.

There is no `date`, `home_game` column.

`practice_schedules`: `id`, `practice_date`, `effective_from`, `effective_to`,
`day_of_week`, `day_order`, `start_time`, `end_time`, `team_type`, `location`,
`rink`, `description`, `notes`, `season`, `season_id`, `is_active`.

**Write `practice_date`, `effective_from` and `effective_to` to the same day.**
Different screens read different ones; a row with only `practice_date` set is
invisible on the public site.

## Seasons run September to August

Not January to December. A game in February 2027 belongs to the **2026-27**
season. The boundaries live in the `seasons` table (`2026-27` =
2026-09-01 → 2027-08-31) and everything on the site keys off that row, matching
rows to a season **by date** rather than by the `season` text column.

The public site and both admin lists show the **current season** by default.
Past seasons are never deleted — the admin screens have an *All seasons*
dropdown, and the home page game-recap archive deliberately spans every season
so the championship recaps stay visible.

## 2026-2027 summary

- **Games**: 14 — 11 home, 3 away. September 27, 2026 → March 21, 2027.
- **Practices**: 34 Thursdays. September 3, 2026 → August 12, 2027.
- **Home ice**: Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees NJ. Surfaces used:
  Flyers Ice Rink, Rink #3, Phantoms Ice.
- **Away rinks**: Skate Zone NE (Hammerheads), Hollydell Ice Arena (Vineland
  Sled Stars).
- **Preserved from 2025-26**: 23 games and 32 practices, plus 21 published game
  recaps. Nothing was deleted.

### Still to confirm with the league

- **1/30/2027 at Hollydell vs Vineland Sled Stars** — the spreadsheet says 2026,
  which is a Friday in the previous season. Imported as 2027-01-30 (a Saturday,
  matching the sheet's own Day column and its position in the sequence).
- Opponents for 11/28/26, 2/14/27, 2/20/27 and 2/28/27, all currently `TBD`.
- The New York opponent for the 2/27/27 doubleheader.

## Troubleshooting

**A practice does not show on the site.** Its `effective_from` / `effective_to`
are probably null. Re-run the practice bulk import, or run
`npm run check:schedule-db`, which reports exactly this.

**A game recap vanished after an import.** Its game row was recreated with a new
`id`. The recap is still in `game_highlights` pointing at the dead UUID — repoint
`game_highlights.game_id` at the new game row.

**An away game sends people to the wrong rink.** `awayRinks` in
`src/components/Schedule.tsx` is keyed on the exact opponent string; a miss falls
back to the home rink. Add the opponent there.
