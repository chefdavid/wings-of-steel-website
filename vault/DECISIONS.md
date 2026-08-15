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
