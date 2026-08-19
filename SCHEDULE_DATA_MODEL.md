# Schedule Data Model — games, practices, recaps and stats

Reference for anyone touching the schedule. Written while importing the
2026-2027 season. Supabase project `zfiqvovfhkqiucmuwykw`.

---

## 1. The one rule that matters

> **`game_schedules.id` is the anchor for a game's entire history. Never delete
> and re-insert a game that has, or might later have, a recap.**

A game row is not just a calendar entry. Four other things point at its UUID:

```
                         game_schedules.id  (uuid)
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        │                         │                          │
game_highlights            player_game_stats        Supabase Storage
  .game_id                     .game_id             bucket `game-photos`
  (NO foreign key)          (FK, ON DELETE          folder `<game_id>/…`
   soft link only)              CASCADE)             (no FK at all)
        │
        └── player_game_stats.game_highlight_id (FK, ON DELETE CASCADE)
```

Delete a `game_schedules` row and three different things go wrong, each with a
different failure mode:

| What | Mechanism | Symptom |
|---|---|---|
| `player_game_stats` | FK `ON DELETE CASCADE` | Rows are **destroyed**. Silent, unrecoverable. |
| `game_highlights` | No FK — nothing enforces it | Row **survives** pointing at a dead UUID. The recap is invisible forever but still occupies the admin list. |
| `game-photos` storage | No relation at all | Uploaded photos stay in the bucket under an orphan folder, costing storage and reachable by URL. |
| `game_schedules.result` | Column on the deleted row | The `W 5-2` string written by the recap editor is gone. |

Re-inserting "the same" game does **not** repair any of this: `id` is
`gen_random_uuid()`, so the new row gets a new UUID and the old links stay dead.

### Consequence for bulk import

`ScheduleBulkImport` originally did `delete().gte(date).lte(date)` then
`insert()`. That is safe only for a season that has never been played. It is
destructive the moment a single recap exists.

The importer is now **upsert-by-natural-key**: it matches an existing row on
`(game_date, game_time)`, `UPDATE`s it in place so the UUID survives, and only
`INSERT`s genuinely new games. It never deletes. Games that are in the database
but not in the import file are reported for manual review rather than removed.

---

## 2. How a recap gets attached

`src/components/admin/GameHighlightsManagement.tsx`:

1. Loads **all** games via `useGameSchedule()` — there is no season filter, the
   list is every row in `game_schedules` ordered by date.
2. Admin clicks a game → `selectedGame`.
3. `getHighlightByGameId(selectedGame.id)` does
   `game_highlights.select().eq('game_id', gameId).single()` — so **one recap per
   game**, keyed only by that UUID.
4. Photos upload to `game-photos/<selectedGame.id>/<timestamp>.<ext>`.
5. On save, if the admin entered both a result letter and a final score, the
   component also writes `game_schedules.result = 'W 5-2'` back onto the game row.

Public side:

- `src/components/Schedule.tsx` joins in memory:
  `highlights.find(h => h.game_id === game.id && h.is_published)`.
  A game only shows a **HIGHLIGHTS** badge and a `/game/:gameId` link when a
  *published* recap matches on UUID.
- Route `/game/:gameId` (`src/App.tsx:82`) resolves the same
  `game_schedules.id`.

So: an unpublished recap is invisible on the site but present in admin; an
orphaned recap is invisible in both places but still in the table.

---

## 3. Table reference

### `game_schedules`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | **The anchor.** See §1. |
| `game_date` | date | `YYYY-MM-DD`. Always parse as `new Date(d + 'T00:00:00')`. See §5. |
| `game_time` | time | `HH:MM` 24-hour. NOT NULL. |
| `end_time` | time | Optional, unused by the schedule UI. |
| `opponent` | varchar | Free text. Also the lookup key for away-rink directions — see §4. |
| `location` | varchar | NOT NULL. Display string only; directions come from `opponent`. |
| `home_away` | varchar | `'home'` \| `'away'`. Drives the badge and which rink the modal shows. |
| `game_type` | varchar | e.g. `Regular`, `Alumni Game`, `Exhibition`. |
| `result` | varchar | `W 5-2`. Written by the recap editor, read by the "Victories" stat tile. |
| `status` | text | `Scheduled` \| `Complete` \| `Cancelled`. `Cancelled` renders a red badge. |
| `notes` | text | Rendered under the game card with an ℹ️. |
| `season` | varchar | Text label. **Inconsistent historically** — see §6. |
| `season_id` | uuid | FK → `seasons.id`. The newer mechanism. |
| `wings_score` / `opponent_score` | int | Present but not currently written by any UI. |
| `is_active` | bool | Not filtered on by any query today. |

### `practice_schedules`
Three date columns exist and **different screens read different ones**:

| Column | Read by |
|---|---|
| `practice_date` | `src/components/admin/PracticeScheduleManagement.tsx` |
| `effective_to` | `src/pages/PracticeSchedule.tsx` (filters `.gte('effective_to', today)`) |
| `effective_from` | `src/components/Location.tsx` (filters `.gte(…)` **and** renders the date block) |

**Always write all three to the same day.** A practice with only
`practice_date` set is invisible on the public site — that is exactly why the
four 2026-27 practices seeded earlier never appeared on the home page. There is
one row per practice session; the `effective_from`/`effective_to` range is a
legacy of a recurring-schedule design that is no longer used.

Other columns: `day_of_week` (full name, e.g. `Thursday`), `day_order`
(**Sunday = 0** per `DAY_NAMES`, but `src/types/practice-schedule.ts`
`DAYS_OF_WEEK` numbers Monday = 1 … Sunday = 7 — the two disagree and the value
is only used for sorting, so keep it consistent within a season),
`team_type` (`'youth'` lowercase — casing has drifted to `'Youth'` before),
`location` + `rink`, `description`, `season`, `notes`.

### `game_highlights`
`game_id` (soft link), `title`, `summary`, `final_score`, `key_moments` jsonb,
`player_highlights` jsonb, `photos` jsonb, `video_url`, `featured_photo_url`,
`is_published`, `is_featured`, `tournament_id` → `tournaments`, `season_id`.

Note it also carries **denormalized copies** of `opponent`, `game_date`,
`game_time`, `game_location`, `home_away`, `game_type`. Nothing writes them
today; do not trust them.

### `player_game_stats`
`player_id` → `players` (CASCADE), `game_id` → `game_schedules` (CASCADE),
`game_highlight_id` → `game_highlights` (CASCADE), plus `goals`, `assists`,
`penalty_minutes`, `saves`, `shots_on_goal`, `goals_against`, `shots_faced`,
`minutes_played`, `dressed`.

### `seasons`
`label`, `start_date`, `end_date`, `is_current`.

> **Seasons run September 1 → August 31.** Not January to December, and not
> August to July. A game in February belongs to the season that started the
> previous autumn. The 2026-2027 practice flyer runs through 2027-08-12, which
> only falls inside 2026-27 under this boundary — that is the check that settled
> it. The table previously held Aug 1 → Jul 31 and was corrected.

| label | range | current |
|---|---|---|
| 2023-24 | 2023-09-01 → 2024-08-31 | |
| 2024-25 | 2024-09-01 → 2025-08-31 | |
| 2025-26 | 2025-09-01 → 2026-08-31 | |
| 2026-27 | 2026-09-01 → 2027-08-31 | ✅ |

Every game and practice row is matched to a season **by date**, never by the
`season` text column — see §6.

---

## 4. Opponent names are a lookup key, not just a label

`src/components/Schedule.tsx` picks the directions modal with:

```ts
const rinkInfo = isHome ? homeRink : awayRinks[game.opponent] || null;
```

`awayRinks` is a hardcoded object keyed by the **exact** opponent string. A typo
or a rename silently falls back to the home-rink modal, i.e. it sends families to
Voorhees for an away game. Current keys:

`Hammerheads` · `Sled Stars` · `Vineland Sled Stars` · `Bennett Blazers` · `DC Sled Sharks`

The league sheet writes "Vineland Sled Stars" where older seasons used "Sled
Stars"; both keys are kept so historical games keep working.

The separate `opponent_teams` table (`team_name`, `rink_name`, `address`,
`head_coach`, colors, …) holds richer data and is managed at
**Admin → Opponent Teams**, but `Schedule.tsx` does **not** read it. Keep the
hardcoded `awayRinks` in sync when adding an opponent.

### Home venue naming

All home ice is the Flyers Skate Zone complex, 601 Laurel Oak Rd, Voorhees NJ
08043. The league sheet names the individual sheet — **Flyers Ice / Flyers Ice
Rink / Phantoms Ice / Rink #3 / 1967 Rink** are all the same building. Games
store `location = 'Flyers Skate Zone'` and put the sheet name in `notes`;
practices store `location = 'Flyers Skate Zone'` and the sheet name in `rink`.

---

## 5. Dates: the day-of-week trap

Imports have drifted by a day before. The cause is always the same:

```ts
new Date('2026-09-27')            // ← UTC midnight → Sat Sep 26 in America/New_York
new Date('2026-09-27T00:00:00')   // ← local midnight → Sun Sep 27  ✅
```

Rules:

- Store plain `YYYY-MM-DD` strings. Never `toISOString()` a local `Date` to get
  a date string — that shifts back a day for any evening local time.
- Every component already parses with the `+ 'T00:00:00'` suffix. Keep it.
- Two scripts guard this. **Run both after any schedule edit** — the first
  checks the data file, the second checks what Postgres actually stored:

```bash
npm run verify:schedule
```

```bash
npm run check:schedule-db
```

`verify:schedule` computes every weekday three ways (UTC arithmetic, local
midnight, local noon) and fails if they disagree or if the weekday does not
match the source document. `check:schedule-db` reads the database back and
diffs it field by field against `src/data/schedule-2026-2027.ts`, including the
`effective_from` / `effective_to` columns that decide whether a practice is
visible at all.

Both pass as of the 2026-2027 import: 14 games, 34 practices, zero mismatches.

---

## 6. Season labelling — normalized, and matched by date

Historical data used at least four conventions:

- `game_schedules.season`: `'2025-2026'` (old import) and `'2026-27'`
- `practice_schedules.season`: `'Fall 2025'`, `'Spring 2026'`, `'Summer 2026'`
- `seasons.label`: `'2025-26'`, `'2026-27'`
- 9 tournament games had `season = NULL`

All of it has now been **backfilled from each row's date** against the corrected
Sep→Aug boundaries, so `season` always equals `seasons.label` and `season_id` is
always set. `game_highlights` and `player_game_stats` inherit the season of the
game they belong to. Nothing was deleted — only the two season columns changed.

Result: 23 games + 32 practices under `2025-26`, 14 games + 34 practices under
`2026-27`.

**Filter by date range, not by the label.** The label can drift again; a date
range cannot. `useGameSchedule` and `useCurrentSeason` both compare
`game_date` / `practice_date` against `seasons.start_date`–`end_date`.

---

## 7. Source of truth for 2026-2027

- Games — `Games 2026.2027.xlsx` (league master schedule)
- Practices — the 2026-2027 practice flyer graphic
- Both transcribed into `src/data/schedule-2026-2027.ts`

### Corrections applied during transcription

1. **`2026-01-30` → `2027-01-30`.** The spreadsheet row for the away game at
   Hollydell vs Vineland Sled Stars carried year 2026, which is a Friday and
   sits in the *previous* season. Its own Day column says "Sat", and it is
   sequenced between 12/20/2026 and 2/14/2027. `2027-01-30` is a Saturday.
   Treated as a year typo. **Confirm with the league.**
2. **10/10/2026 vs Bennett Blazers** is listed with Bennett as the home team but
   played on Flyers Ice. Stored as `home_away = 'home'` so the directions modal
   sends families to Voorhees, with the designation recorded in `notes`.
3. **"NY??"** (2/27/2027 doubleheader) stored as opponent `TBD` with the New
   York detail in `notes`.
4. Pre-existing DB row `2026-09-28` "Hammerheads / location TBD" was a
   placeholder off by one day; replaced by the verified `2026-09-27` game.

### Known data issue: a duplicate Amelia Park recap

`game_highlights` holds two near-identical published recaps of the 2026-03-29
Junior Division championship ("Wings bring home Junior Division title from
Massachusetts tournament"):

| id | created | game_id | is_featured | summary |
|---|---|---|---|---|
| `3889e158…` | 2026-04-03 04:13 | linked to the game | false | 5048 chars |
| `50a24b13…` | 2026-04-03 15:05 | **NULL** | true | 5098 chars |

The second was saved without a `game_id`, so it has never rendered anywhere —
`Schedule.tsx` matches `h.game_id === game.id` and NULL matches nothing. Both
have 4 photos and 3 linked `player_game_stats` rows.

**Do not simply point the orphan at the game.** Two rows sharing a `game_id`
breaks the admin recap editor, whose `getHighlightByGameId` uses `.single()`.
Someone who knows which copy is the good one should merge them: keep one, move
across anything worth keeping (the orphan has `is_featured` set and a slightly
longer summary), repoint its `player_game_stats`, then delete the loser.

### Open items to confirm with the league / coaches

- The `2027-01-30` year correction above.
- Five `TBD` opponents: 11/28/26, 2/14/27, 2/20/27, 2/28/27.
- The New York opponent for the 2/27/27 doubleheader.

---

## 8. Where the schedule surfaces

| Place | File | Reads |
|---|---|---|
| Home page game section | `src/components/Schedule.tsx` | `game_schedules` + `game_highlights` |
| Home page practice preview | `src/components/Location.tsx` | `practice_schedules` via `effective_from` |
| Calendar page `/practice-schedule` | `src/pages/PracticeSchedule.tsx` | `practice_schedules` **and** `game_schedules` |
| Game recap page `/game/:gameId` | `src/pages/GamePage.tsx` | `game_schedules.id` |
| Today banner | `src/components/TodayGameCard.tsx` | `game_schedules` |
| Admin → Game Schedule | `src/components/admin/GameScheduleManagement.tsx` | CRUD, plus bulk import |
| Admin → Game Schedule → Bulk Import | `src/components/admin/ScheduleBulkImport.tsx` | `src/data/schedule-2026-2027.ts` |
| Admin → Practice Schedule | `src/components/admin/PracticeScheduleManagement.tsx` | CRUD, plus bulk import |
| Admin → Game Highlights | `src/components/admin/GameHighlightsManagement.tsx` | recaps keyed on `game_schedules.id` |

Season labels shown to visitors are **not** hardcoded any more — `Schedule.tsx`
and `Navigation.tsx` read `SEASON_LABEL` from `src/data/schedule-2026-2027.ts`.
Bump that one constant when the season rolls over.

---

## 8a. What is scoped to the current season, and what is not

Scoped to the current season (so last year's fixtures never masquerade as this
year's):

- the home page game schedule, results list and the four stat tiles
- the home page practice preview
- the `/practice-schedule` calendar and practice list
- the admin Game Schedule and Practice Schedule lists — these default to the
  current season and carry an **All seasons** dropdown, so history is one click
  away and is never hidden from the data

Deliberately **not** scoped:

- **Game recaps on the home page.** The archive spans every season — the 2024
  and 2025 championship runs are the best content on the site and should not
  vanish each September. `Schedule.tsx` builds them from `games` (all seasons),
  newest first, and says how many come from previous seasons.
- **`useGameSchedule().games`** and `/game/:gameId`, so the admin recap editor
  can attach a recap to any game in history and old recap URLs keep working.

The stat tiles reset to zero each September by design. A caption under them
states which season they cover.

## 9. Rolling over to a new season — checklist

1. Add the season row to `seasons` (**Sep 1 → Aug 31**) and flip `is_current`.
   Everything else keys off this row, so getting the dates right matters more
   than the label.
2. Copy `src/data/schedule-2026-2027.ts` to the new year, update `SEASON_LABEL`,
   games and practices.
3. Point `ScheduleBulkImport.tsx` / `PracticeScheduleBulkImport.tsx` and
   `src/components/Schedule.tsx` / `Navigation.tsx` at the new data file.
4. Copy `verify-schedule-2026-2027.ts` and `check-schedule-db.ts`, fill in the
   expected weekdays from the source document, repoint the `npm run
   verify:schedule` / `check:schedule-db` scripts, and run both until clean.
5. Import from the admin screens. The importer upserts — **it will not touch
   past seasons or destroy any recap.**
6. Add any new opponent to `awayRinks` in `Schedule.tsx` (§4).
