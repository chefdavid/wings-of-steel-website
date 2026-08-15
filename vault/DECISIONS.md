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
