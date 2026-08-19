# Decisions

Append-only. Newest at the bottom. Do not relitigate what is here.

---

## 2026-08-15 — Redesign + stats initiative scoped

Reviewed the whole codebase and the live database. Chose:

- **Full foundation + visual overhaul**, not a surface reskin. The absence of a
  shared layout makes any restyling a 21-file edit, so the foundation goes first.
- **Season-aware stats hub** as the stats goal, building on the `seasons` /
  `season_id` schema that already exists in the database but is unused by code.
- **Feature branch → PR → Netlify deploy preview → merge.** `master`
  auto-deploys to production, so nothing lands there unreviewed.

Full plan: Claude project doc `claude/redesign-and-stats-plan.md`.

---

## 2026-08-15 — Phase 0 changes

**`championship-gold` is now a real Tailwind color (`#F5C518`).**
It was referenced 24 times across `Navigation`, `GolfOuting`, `SponsorshipOptions`
and `ContestSection` but never defined, so every one of those classes emitted
nothing and the affected text and backgrounds fell back to inherited colors.
Value chosen for 6.7:1 contrast both against `dark-steel` (as text) and under
`text-dark-steel` (as a background). A full `gold-50..900` scale was added
alongside it; `gold-700` (`#7A5500`) is the only shade safe for normal-size text
on white and is now used in `ContestSection`, which was the sole light-background
usage.

**The Hero no longer blocks on Supabase.** It previously rendered a full-screen
"Loading…" until `site_sections` returned — i.e. the LCP element waited on a
network round-trip — despite every field having a hardcoded fallback. It now
renders immediately and swaps in CMS content when it arrives.

**The hero background preload was pointing at the wrong file.** `Hero.tsx`
imperatively injected a preload for `/assets/hockey-sticks.webp` in a
`useEffect` (which runs *after* render, so it could not help LCP anyway) while
the section actually renders `/images/hockey-sticks2.webp`. Replaced with a
correct static `<link rel="preload" fetchpriority="high">` in `index.html`.

**One `<h1>` per page.** The Hero had two. The second line is now a `<span>`.
Also removed `role="banner"` from the hero `<section>` — it is not the page
banner landmark.

**One skip link.** It existed both statically in `index.html` and rendered again
by `Navigation`, putting two "Skip to main content" targets in the tab order.
Kept the static one (it works before hydration); removed the React one.

**`<Footer>` moved out of `<main>`** in `TeamSite`.

**Deleted 18 dead files (4,823 lines).** Each was verified to have zero inbound
references, or references only from other dead files:
`NavigationOld`, `TeamLanding`, `TeamSelector`, `TeamIndicator`, `TeamSwitcher`,
`FloatingTeamSwitcher`, `GalleryHero`, `FeaturedHighlights`,
`DonationFloatingButton`, `FeedbackWidget`, `pages/PizzaPinsAndPop` (1,018
unrouted lines), `admin/SiteSectionsEditor` + `V2` + `WithPreview` (three losing
implementations of the job `HeroSectionEditor` does), `admin/TeamAssignmentManager`,
`golf/GolfRegistrationForm` (801 lines), `contexts/TeamContext`,
`styles/popup-fix.css`.

**Deliberately kept despite being unreferenced:**
`AppWrapper` + `InitialShell` (a working loading skeleton to be wired up in
Phase 1 — it is a real LCP win), `OptimizedImage` (a good lazy `<picture>`
component to be adopted in Phase 4), `FeedbackAdmin` (an unfinished real
feature, not abandoned duplicate code).

---

## 2026-08-15 — RLS left as-is, pending a decision

Eight tables have RLS disabled and `player_game_stats` has `USING (true)` write
policies, so anyone with the anon key from the JS bundle can rewrite the roster,
schedule, highlights and stats. **Not fixed in Phase 0 on purpose**: the admin
dashboard writes with the anon key after a browser-side password check, so
enabling RLS without first moving admin writes server-side would lock the team
out of their own admin. Options are written up in `docs/RLS_DECISION.md`;
recommendation is Option A (service-role Netlify functions).

---

## 2026-08-15 — Phase 1: design foundation

**`src/design/tokens.js` is now the single source of truth for brand values.**
Plain dependency-free JS so node (tailwind config, the critical-CSS plugin) and
the browser can both import it. Adds real scales — `steel`, `ice`, `gold`,
`steel-neutral` — plus a display type scale, section spacing, `borderRadius`,
`boxShadow`, and motion durations. The legacy class names (`steel-blue`,
`dark-steel`, `ice-blue`, `steel-gray`, `championship-gold`) are kept as aliases
deliberately: renaming them across 100+ components would be one unreviewable
diff, and the visual pass in Phase 4 is a better moment.

Theme values previously lived in six places. Now: `tailwind.config.js` imports
tokens, `vite-plugin-critical-css.ts` imports tokens, `index.css` uses Tailwind's
`theme()` function, and the `.font-sport` override was deleted from `index.html`
(the `sport` font token carries the metric-matched fallback in its stack).

**`Layout` is a React Router layout route** — `src/components/layout/Layout.tsx`.
Nav, the `<main id="main-content">` landmark and the footer are rendered in
exactly one place. 21 page components previously imported `Navigation` and
`Footer` themselves and each applied its own `pt-20` to clear the fixed nav; the
offset is now the `nav` spacing token, so nav height is a one-line change.
`URLTeamProvider` moved into Layout — it had been mounted inside `TeamSite`
only, so `useTeam()` fell back on every other route. `/admin` is deliberately
outside Layout (it renders its own chrome); `/gallery` uses
`<Layout withFooter={false} />`.

**Removed the `fixed inset-0 z-[9999]` overlay wrapper from five pages**
(`Events`, `GolfOuting`, `HockeyForACause`, `TopGolf`, `NotFound`). These pages
were rendering as full-viewport overlays that escaped normal document flow —
inside Layout they would have painted over the fixed nav and made the footer
unreachable. Their background gradients were preserved on the inner div. As a
side effect the 404 page now has navigation, which it never did before.

**Suspense moved inside the shell.** The only boundary was in `App.tsx` wrapping
`<Routes>`, so loading a lazy page chunk replaced the whole page — nav
included — with a full-screen spinner. Nav and footer now stay painted while
only the content area swaps. This also makes the unwired `InitialShell`
skeleton unnecessary; it and `AppWrapper` stay in the tree for now and will be
deleted in Phase 4 unless a use appears.

**`.hero-backdrop` replaces `#home > div:first-child`** in `index.css`, so
reordering the hero's children no longer silently breaks the background.

**`.sr-only` / `.sr-only:focus` overrides deleted from `index.css`.** They
shadowed Tailwind's built-in, and the `:focus` rule made *any* screen-reader-only
element visible on focus — including the global aria-live regions. The skip link
uses Tailwind's `focus:not-sr-only`.

**`src/lib/motion.ts` added** — shared `fadeUp` / `fadeUpLg` / `fade` /
`scaleIn` / `stagger` variants plus `inView` / `onMount` spreads, reading
duration and easing from the tokens.

### Deferred from Phase 1 to Phase 4, on purpose

- **Migrating the 76 files that inline their own Framer variants.** The module
  exists and new code uses it, but rewriting 76 files before the visual redesign
  is risk without visible benefit — Phase 4 touches those files anyway.
- **Icon library consolidation** (react-icons in 58 files, lucide in 33). Same
  reasoning: every `Fa*` → lucide swap is a judgment call about the closest
  equivalent, and doing it blind ahead of the restyle invites regressions.

---

## 2026-08-15 — Phase 2: stats data layer (APPLIED to production Supabase)

Four migrations, `supabase/migrations/013`–`016`, applied to the live
`SledHockey.org` project after a dry-run validation showed 0 duplicate
player/game pairs, 0 unparseable `result` strings and a clean score backfill.

**013 — legacy `game_schedule` renamed to `deprecated_game_schedule`.** Two
similarly named tables was a live footgun: a `from('game_schedule')` typo
returned an empty, stale schedule instead of an error. Reversible with a rename.

**014 — structured scores.** `game_schedules` gains `wings_score` /
`opponent_score` integers, backfilled from the `result` strings (all 21 parsed;
the migration raises if any row's W/L/T letter disagrees with its own parsed
score). `result` stays a text column because ~15 call sites read it, but it is
now maintained by a database trigger instead of string concatenation in the
admin UI — set the scores and `result` follows; write `result` the legacy way
and the scores follow. This ends the era of computing the team record by
reading `result.trim()[0]`.

**015 — goalies, games played, and a real spine.** `players.is_goalie`
(seeded from `position ILIKE 'goal%'`) replaces inferring goalie-ness from
`saves > 0`. `player_game_stats` gains `goals_against`, `shots_faced`,
`minutes_played` (nullable — NULL means skater, 0 means shutout) and `dressed`
so an all-zero row can exist and count toward games played. Critically it also
gains `game_id`, backfilled from the highlight it hung off, and
`game_highlight_id` is now NULLABLE. **A box score no longer requires a
highlight to exist.** New unique index on `(player_id, game_id)`.

**016 — season-aware views.** `player_season_totals` rebuilt WITH a season
dimension (the old view of that name had none, despite the name, and was read
by zero application code). Adds `player_career_totals`, `goalie_season_totals`
(save %, GAA, shutouts — none previously computable), `team_season_record` and
`head_to_head_records`. All granted SELECT to anon; they expose nothing that
was not already publicly readable.

### What the data actually says now

2025-26: **20-1-0**, 89 GF / 21 GA, 10 shutouts, 21 games played.
Leaders: AJ Gonzales 32-11-43 in 20 GP, Colten Haas 26-8-34 in 17,
Colin Wiederholt 18-3-21 in 13.

**Flag for David:** the hero currently reads "2025 / 2026 Season — UNDEFEATED",
but the database has one loss (L 4-5 on 2026-05-02, during Nationals week). If
"undefeated" means the regular season, the copy should say so; otherwise it is
contradicted by the site's own schedule.

**Also note:** `shots_on_goal` is 0 for every player and no goalie stat row
exists at all. The columns are there; nobody has ever entered the data. The
Phase 3 admin screen should make that easy rather than optional.

---

## 2026-08-15 — Phase 3 (part 1): the /stats hub

**Hero copy corrected.** "2025 / 2026 Season — UNDEFEATED" was contradicted by
the site's own schedule: the season record is 20-1, the loss coming in round
robin at Nationals on 2026-05-02 (they still won the title). The REGULAR season
genuinely was undefeated — 12-0 — so the claim is now scoped to what the data
supports: "2025 / 2026 REGULAR SEASON — UNDEFEATED". `site_sections.hero.content
.undefeated` is NULL in the database, so the hardcoded fallback in `Hero.tsx` is
what actually renders; only that needed changing.

**New route `/stats`**, plus `src/types/stats.ts` and `src/hooks/useStats.ts`.
Everything reads the season-aware views from migration 016 rather than
refetching raw rows and reducing them in the component — which is how "Season
Stats" ended up being career totals without anyone noticing.

Design decisions, following the dataviz guidance:

- **The headline numbers are stat tiles, not charts.** A record and a goal total
  are single values; plotting them adds nothing.
- **The leaderboard's magnitude bar is a sequential single hue**, not
  categorical color. I ran the palette validator on a steel/gold categorical
  pair: it fails the lightness band and, on a light surface, gold is 1.6:1 —
  unusable as a fill. On the dark surface the pair passes CVD separation and
  contrast, but the honest form here is a table plus one sequential magnitude
  cue, so no categorical palette is needed at all. **Gold is reserved for the
  single headline accent** (6.7:1 as text on dark-steel).
- **Win/loss badges carry the record as text**, so status is never color alone.

Two things the real data forced:

- **The default season is not `is_current`.** `is_current` is 2026-27, which in
  August has zero played games — landing on an empty leaderboard is a worse
  answer than showing the season that just finished. `useSeasons` now defaults
  to the current season *if it has games*, else the most recent season that does.
- **Head-to-head hides opponents with zero games played.** `DC Sled Sharks` and
  `Family Game` are scheduled, not results; rendering "Family Game 0-0" is noise.

**Shots on goal are hidden when the season has none recorded**, with a one-line
note saying so, rather than a column of zeros. Confirmed with David: shots and
goalie stats were not tracked last season, so there is no historical data to
recover — the columns exist for going forward.

**Verification note:** this container's egress blocks `*.supabase.co`, so the
page cannot load live data here. The visual check was done by intercepting the
PostgREST calls in Playwright and serving fixtures pulled from the real
database — same render path, stubbed transport.

### Still open in Phase 3

- `PlayerStatsSection` still labels career totals as "Season Stats"
- `SeasonRecordGrid` still counts every past game ever instead of reading
  `team_season_record`
- Per-game box score on `/game/:gameId`
- Admin box-score entry screen, decoupled from the highlights editor

---

## 2026-08-15 — Phase 3 (part 2): the two components that were lying, and box scores

**`PlayerStatsSection` is season-aware.** It was titled "Season Stats" while
querying `player_game_stats` by `player_id` with no season or date filter — it
was career totals. It only looked right because the bulk importer DELETED the
previous season's rows before importing, so the table never held more than one
season; isolation was enforced by destroying history. It now reads the
season-aware views, offers an explicit season / Career selector, shows games
played, and resolves opponent and date from `game_id` in one hop instead of
going through the highlight and, failing that, splitting the highlight's title
on punctuation. Goalie rows appear when the player is flagged a goalie or has
goalie data — not when `saves > 0`.

**`SeasonRecordGrid` is season-aware.** It counted W/L/T across every past game
the site had ever stored, by reading `result.trim()[0]`. The headline record now
comes from `team_season_record` (integer scores, migration 014) and the tiles are
scoped to a selected season, with goals for/against and shutouts alongside. It
falls back to showing all supplied games if none carry a `season_id`, rather
than rendering an empty grid.

**New `BoxScoreManagement` admin screen** (`/admin` → Box Scores). This is the
screen that makes migration 015 usable:

- **A box score no longer requires a highlight.** Stats were previously a
  sub-panel of the photo/recap editor, so a game either got the full treatment
  or no stats at all.
- **"Dressed" is an explicit checkbox.** The old save dropped any all-zero row,
  which is why games played was uncomputable. A zero line is now a real row;
  unticking Dressed deletes the line rather than storing zeros.
- **One transactional-ish save**: score first (the migration-014 trigger derives
  `result`, so W/L/T is never typed by hand), then a single upsert on the
  `(player_id, game_id)` unique index, then removal of undressed lines. Errors
  surface as one message instead of four.
- **Goalie fields are only editable for players flagged as goalies**, and the
  screen says plainly that 0 goals against is a shutout and should not be left
  blank.
- It warns — without blocking — when entered goals do not sum to the final
  score, since own goals and unrecorded scorers are legitimate.

`Game` in `src/types/database.ts` gained `wings_score`, `opponent_score` and
`season_id` to match the live schema.

---

## 2026-08-15 — Fix: /stats defaulted to an empty season (found on Deploy Preview #4)

The first deploy preview landed on **2026-27**, which has zero played games, so
every panel rendered an empty state. Local verification had missed it because
the fixtures resolved instantly.

Cause was a race, not the selection logic. `useSeasons` runs two queries: the
season list, and `team_season_record` to learn which seasons actually have
games. `defaultSeason` was computed from whatever had arrived so far. The
seasons list answered first, the "has games" set was still empty, so it fell
through to `is_current` — 2026-27. Consumers commit the default to state the
first time it is non-null (`if (!seasonId && defaultSeason)`), so that early
guess was locked in permanently and never corrected when the second query
landed.

Fix: `defaultSeason` stays NULL until both queries resolve, and `useSeasons`
reports `loading` as the OR of the two. Consumers already guard on a truthy
`defaultSeason`, so nothing else changed.

Regression check reproduces the original timing — the stub delays
`team_season_record` by 1500ms while `seasons` answers instantly — and asserts
the page still lands on 2025-26 with the 20-1 record showing.

**Process note:** this class of bug is invisible in this container because
egress to `*.supabase.co` is blocked, so every local check runs against stubs
that answer instantly. Stubs for stats work should deliberately vary latency.

---

## 2026-08-15 — Phase 4 proof: dark-first theme, hero + roster restyled

David picked "like the stats page", "hero + one section first", and "dark mode
yes". Those last two pull against each other — if the whole site goes dark, a
"dark mode" toggle is nearly a no-op. Resolution: **dark is the default look**
and `light` is the opt-in alternate. That is the inverse of the usual
convention, so it is spelled out in the token file and the hook.

**Theme architecture.** `themes` in `src/design/tokens.js` defines semantic
roles — `surface-base/raised/sunken/muted`, `ink/ink-muted/ink-subtle`,
`border-subtle/strong`, `accent` — for each theme. They resolve through CSS
custom properties (`--wos-*`) set on `[data-theme]` in `index.css`, and Tailwind
maps them to utilities (`bg-surface`, `text-ink-muted`, `border-subtle`).
Components reference the ROLE, so a theme switch is a variable swap rather than
a `dark:` variant on every element — which matters given there are ~100
components still to convert.

Note the accent differs per theme by necessity: gold-500 is 6.7:1 on dark but
only 1.6:1 on white, so the light theme resolves `accent` to gold-700.

`useTheme` writes `data-theme` on `<html>`, persists to localStorage, and
honours `prefers-color-scheme` on first visit only. `ThemeToggle` sits in the
nav; its accessible name says which theme it switches TO, which is what a
screen-reader user needs, and `aria-pressed` carries state.

**Hero.** Two-layer scrim (vertical + radial) so the photograph is actually
visible instead of flattened to grey, while type keeps contrast. Headline moved
to the display scale. Killed the spinning puck in favour of a text eyebrow.
The three award placards were solid yellow slabs competing with the headline —
they are outlined cards now, so the gold points at the words instead of
shouting over them. CTAs had three solid fills, two of them the same yellow, so
nothing read as primary; now one gold pill (Donate) and two ghost buttons.
Motion comes from the shared variants in `src/lib/motion.ts` — the first real
consumer of that module.

**Roster.** Section surfaces, headings and card chrome moved to semantic tokens
and the token radius/shadow scale. Cards gained a subtle ring so they hold an
edge on a dark surface.

Nav is deliberately still hardcoded dark — it reads as chrome in both themes.
Revisit if the light theme becomes the common case.

---

## 2026-08-15 — One place to enter stats: Game Highlights

Reversing part of Phase 3. The Box Scores screen worked, but it created a
second place to enter stats, and David enters them weekly under Game
Highlights. Two write paths that can disagree is worse than one imperfect one.

- **`BoxScoreManagement` deleted**, and its sidebar entry with it.
- **The Game Highlights stats panel rebuilt** as a real `<table>` (it was a
  14-column CSS grid with unlabelled inputs), with a **Played** checkbox as the
  first column, a jersey badge, a goalie tag, and per-cell `aria-label`s.
- **Numeric inputs are disabled until Played is ticked**, so an untouched row
  reads as "not in the lineup" rather than "played and scored nothing".
- **Typing a number ticks Played automatically** — nobody should have to tick a
  box to record a goal.
- **"Mark all played"** for the common case, and a live "N of M players marked
  as played" count.
- **The save no longer drops all-zero rows.** Every player marked as played
  gets a row, including a zero one, and the row now carries `game_id` and
  `dressed`. That zero row is the entire point: it is what makes games played
  countable. Unticking Played deletes that player's line.

Related, on the public side: the player card no longer shows a games-played
figure at all, and lists every game of the season with a dash where no line was
recorded. Autumn Donzuso — a newer player who did not score — previously showed
"No game stats recorded", which read as though she had never played.

Once a season has been entered through this panel with Played ticked properly,
a real games-played number can come back. It is not being shown until the data
can support it.
