# Wings of Steel — SEO Audit & Action Plan

_Audit performed: 2026-05-08. Reviewer: Claude (audit-only, no code changes)._

This document is a prioritized action plan for maximizing organic discovery of
[wingsofsteel.org](https://wingsofsteel.org) by four primary audiences:

1. Parents searching for sled hockey / adaptive hockey programs for their kids.
2. Voorhees / South Jersey / Philadelphia metro families.
3. Donors and sponsors seeking accessibility-focused youth sports nonprofits.
4. Existing community members (alumni, families, supporters) finding news and updates.

Each recommendation lists: the SEO problem, the keyword/audience it serves, the
concrete change (file + what to do), and expected impact (High / Medium / Low).

---

## Audit summary — current state

What is already strong:

- A custom `scripts/prerender.mjs` clones `dist/index.html` per route and rewrites
  `<title>`, meta description, canonical, OG, Twitter, and a meaningful `<noscript>`
  block crawlers see before hydration. 15 routes are covered.
- `index.html` ships three solid JSON-LD blocks at the root: `SportsTeam`,
  `FAQPage`, and `LocalBusiness`. Address, schedule, awards are populated.
- Five SEO landing pages already exist with substantive long-form content
  (`/what-is-sled-hockey`, `/sled-hockey-nj`, `/sled-hockey-teams`,
  `/free-youth-hockey`, `/sled-hockey-equipment-guide`). `WhatIsSledHockey.tsx`
  is ~390 lines of well-written, link-dense copy with a per-page FAQ schema.
- `public/robots.txt` and `public/sitemap.xml` exist; `manifest.json` is correct.
- Most image `alt` attributes are descriptive (player names, captions, etc).

What is broken or missing — the headline issues the rest of this doc fixes:

1. **Three new high-value routes are not prerendered, sitemapped, or crawlable.**
   `/stories`, `/stories/<slug>`, `/gallery`, `/game-highlights`, `/game/:gameId`,
   and the event pages (`/golf-outing`, `/topgolf`, `/hockey-for-a-cause`) all
   render through React without per-route HTML, meta, or noscript content.
   `/stories` and individual press story pages are the biggest miss — they are
   long-form editorial content that should be Google's bread and butter.
2. **The site Navigation does not link to any of the SEO landing pages or
   `/donate`.** That makes `/sled-hockey-nj`, `/free-youth-hockey`,
   `/what-is-sled-hockey`, etc. effectively orphan pages from a crawler's
   perspective — they get to them via the sitemap but receive zero internal
   PageRank. Footer also only links to `/accessibility` and `/donate`.
3. **The 2024 USA championship is missing from titles, meta, schema, and copy.**
   Everything says "2025 & 2026 USA Champions". The team has won three years
   running (per the brief). The phrase "three-time defending USA Sled Hockey
   National Champions" is a unique, search-friendly credibility hook.
4. **Every prerendered route shares the same `og:image`** (`hockey-sticks.webp`).
   Social-share previews are identical and visually generic for every link.
5. **Press stories (`/stories/<slug>`) have no `<title>`, no meta description,
   no `Article` JSON-LD, and no prerender entry.** Crawlers see a blank
   `<title>` tag and the team's default site-wide description. Each story is
   long-form unique content but invisible to search.
6. **Sitemap is missing 9+ live routes** including `/stories`, `/gallery`,
   `/game-highlights`, all 3 event pages, `/team/youth`, and `/team/adult` (or
   any policy on whether those are canonicals).
7. **Gallery is bundled as a 1.1 MB static JSON** (`src/data/gallery-manifest.json`)
   imported synchronously into `LocalGallery.tsx`. Hurts LCP/INP for
   mobile parents on poor connections — a Core Web Vitals signal.
8. **Several runtime pages still rely on client-side `document.title`
   updates** (`Donate`, `WhatIsSledHockey`, etc.). Crawlers rendering JS
   eventually see the right title, but the prerendered HTML is the source of
   truth — these pages already have prerender entries, so the `useEffect`
   title-setting is harmless but should be deleted as duplicate-source-of-truth.
9. **No structured data exists for `Event` (games, fundraisers),
   `Article` (press stories), `NonprofitOrganization` (the 501(c)(3)
   credential donors search for), or individual `SportsEvent` games.**
10. **`noscript` SEO blocks are placed inside `<div id="root">` and React
    discards them on hydration.** That's fine for crawlers that read raw HTML
    (Googlebot does both), but the design wastes the chance to carry visible
    fallback content for users with JS disabled (rare but real for some
    accessibility tooling) and means `<h1>` and body content disappear once
    React mounts. Not a blocker, but worth flagging.

---

# 1. Quick wins — ship in a single session

These are concrete edits, low risk, high leverage. Most are file-edit-and-deploy.

## 1.1 — Add the 2024 championship everywhere it matters

**Problem:** The site only references "2025 & 2026 USA Champions". Per the
project brief the team is now a three-time defending national champion (2024,
2025, 2026). "Three-time" / "three-peat" is a stronger, more newsworthy hook
that opens up new query matches like "back-to-back-to-back sled hockey
champions", "three time USA sled hockey champions", and adds credibility for
both donors and parents evaluating program legitimacy.

**Audience:** Donors (credibility), national press, parents researching
program quality.

**Changes:**

- `index.html:9` — meta description: replace `"2025 & 2026 USA Champions"`
  with `"3-time USA Sled Hockey National Champions (2024, 2025, 2026)"`.
- `index.html:19` and `index.html:26` — OG and Twitter descriptions: same
  swap.
- `index.html:80` — the `award` array in the `SportsTeam` JSON-LD: add
  `"2024 USA Sled Hockey Champions"`.
- `scripts/prerender.mjs:31, 35` (homepage `description` and `content`) — same
  three-peat phrasing.
- `scripts/prerender.mjs:131-132` (`/opponents` page content) — replace "2025
  and 2026 USA Champions" with "three-time defending USA Sled Hockey National
  Champions".
- `scripts/prerender.mjs:197` (`/sled-hockey-nj` content) — same.
- `src/pages/SledHockeyNJ.tsx:46, 269, 337` — visible page copy.

**Impact:** High. Title tag + on-page authority for every championship-related
query, and a more memorable share preview.

---

## 1.2 — Prerender the 8 routes that currently ship blank meta

**Problem:** `/stories`, `/gallery`, `/game-highlights`, `/golf-outing`,
`/hockey-for-a-cause`, `/topgolf`, and the team-route variants all serve the
unmodified base `dist/index.html` because they are not in the prerender
ROUTES array. Crawlers see the homepage's `<title>` and meta description for
all of these. No noscript content, no per-page canonical, no per-page OG.

**Audience:** Anyone Googling "Wings of Steel golf outing", "Wings of Steel
gallery", "Wings of Steel game recaps", and most importantly **anyone
sharing a press story link on Facebook/Twitter** (because `/stories` and
`/stories/<slug>` currently produce identical home-page share cards).

**Changes:** add new entries to `scripts/prerender.mjs` ROUTES (around
line 27):

```js
{
  path: '/stories',
  title: 'The Wings Press — Stories from Wings of Steel Sled Hockey',
  description: 'Stories, recaps, and milestones from Wings of Steel Youth Sled Hockey. Three-time USA Sled Hockey National Champions.',
  h1: 'The Wings Press',
  content: `<p>Read the latest stories, game recaps, and milestone moments from
    Wings of Steel Youth Sled Hockey, the three-time defending USA Sled Hockey
    National Champions based in Voorhees, NJ.</p>
    <p><a href="/">Back to home</a> | <a href="/game-highlights">Game highlights</a></p>`,
},
{
  path: '/golf-outing',
  title: 'Tom Brake Memorial Golf Outing | Wings of Steel Fundraiser',
  description: 'Annual Tom Brake Memorial Golf Outing supporting Wings of Steel Youth Sled Hockey. Foursomes, sponsorships, and dinner — all proceeds keep sled hockey free for every child.',
  h1: 'Tom Brake Memorial Golf Outing',
  content: `<p>Join us for the annual Tom Brake Memorial Golf Outing benefiting
    Wings of Steel Youth Sled Hockey. Foursomes, sponsorships, and contests —
    every dollar raised keeps sled hockey free for every child.</p>
    <p><a href="/donate">Donate now</a> | <a href="/events">All events</a></p>`,
},
{
  path: '/hockey-for-a-cause',
  title: 'Hockey for a Cause | Gloucester Catholic vs Wings of Steel',
  description: 'Hockey for a Cause exhibition game — Gloucester Catholic Rams vs Wings of Steel Sled Hockey. Entry by donation. March 22, 2026 at Flyers Skate Zone, Voorhees, NJ.',
  h1: 'Hockey for a Cause',
  content: `<p>Watch the Gloucester Catholic Rams hop into sleds and face off
    against Wings of Steel in a fun exhibition game on March 22, 2026 at
    Flyers Skate Zone in Voorhees, NJ. Entry by donation — all proceeds
    benefit Wings of Steel.</p>
    <p><a href="/donate">Donate</a> | <a href="/events">All events</a></p>`,
},
{
  path: '/topgolf',
  title: 'Topgolf Fundraiser | Wings of Steel Sled Hockey',
  description: 'Topgolf Mt. Laurel fundraiser supporting Wings of Steel Youth Sled Hockey. $20 per person, March 8, 2026.',
  h1: 'Topgolf Fundraiser for Wings of Steel',
  content: `<p>Swing for a cause at Topgolf Mt. Laurel on March 8, 2026.
    $20 per person, includes golf and unlimited soda and lemonade. Baskets,
    50/50, and silent auction. Choose to support youth or adult Wings of
    Steel teams when you register.</p>
    <p><a href="/donate">Make a donation</a> | <a href="/events">All events</a></p>`,
},
```

Also add the matching `<url>` entries to `public/sitemap.xml`. Update the
`smoke-routes.mjs` ROUTES array so future builds don't blank-page on these.

**Impact:** High. Each new page becomes individually rankable and shareable.

---

## 1.3 — Make press story links shareable and rankable

**Problem:** `/stories/<slug>` is a React component (`PressStoryPage.tsx`)
that fetches from Supabase at runtime. There is **no** `document.title`, no
meta description, no `Article` JSON-LD, no prerender pipeline. When a parent
shares a story on Facebook, the preview shows the homepage card. Google
indexes the home page's title for every story URL. This is the single
biggest content surface that should be unlocked.

**Audience:** Anyone sharing a story socially; Google News surfaces; long-tail
queries like "Wings of Steel championship recap", "sled hockey nationals 2026
recap", "Voorhees youth sled hockey article".

**Changes — quick win (deploy-time):** Inside `PressStoryPage.tsx`, add a
`useEffect` that updates `document.title`, `meta[name="description"]`, OG
title/description/image, and injects an `Article` JSON-LD `<script>` once
the story loads. Mirror the pattern in `WhatIsSledHockey.tsx:13-27` and
`:58-82`. The Article schema should include:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",            // or "Article"
  "headline": story.title,
  "description": story.subtitle ?? <first 160 chars of body>,
  "image": story.cover_photo_url,
  "datePublished": story.published_at,
  "dateModified": story.updated_at ?? story.published_at,
  "author": { "@type": "Person", "name": story.author },
  "publisher": {
    "@type": "Organization",
    "name": "Wings of Steel Youth Sled Hockey",
    "logo": { "@type": "ImageObject", "url": "https://wingsofsteel.org/assets/wings-logo.webp" }
  },
  "mainEntityOfPage": "https://wingsofsteel.org/stories/" + story.slug
}
```

**Changes — full win (build-time):** Extend `scripts/prerender.mjs` to query
Supabase for all `is_published = true` press stories at build time and emit
one `dist/stories/<slug>/index.html` per story with the right title/desc/OG
image and an inline `Article` JSON-LD block. The build already runs
`node scripts/prerender.mjs`, so add a Supabase REST fetch (use the public
anon key from `VITE_SUPABASE_*`) and loop. This is the only correct fix —
the runtime `useEffect` helps Googlebot (which executes JS) but does **not**
help Facebook/Twitter/LinkedIn share crawlers, which only read raw HTML.
Estimate: ~80 lines added to `prerender.mjs`.

**Impact:** Very high. Unlocks all editorial content for SEO + social.

---

## 1.4 — Per-route Open Graph images

**Problem:** Every prerendered route ships the same `og:image`
(`hockey-sticks.webp` per `index.html:20`). The prerender script never
rewrites OG image. Social cards for `/donate`, `/sled-hockey-nj`,
`/sled-hockey-equipment-guide`, etc. all look identical, generic, and
unrelated to what the user clicked.

**Audience:** Anyone sharing any link. CTR from social referrals.

**Changes:**

- `scripts/prerender.mjs` — extend each route entry with an `image` field
  (default to `/assets/hockey-sticks.webp`, override per route). Recommended
  per-route images you already have in `public/`:
  - `/` → keep `hockey-sticks.webp` (championship banner).
  - `/donate` → `/images/hero champion.jpg` (used on store mission band).
  - `/free-youth-hockey` → `/images/hero champion.jpg`.
  - `/join-team` → `/images/hockey-goal.jpg`.
  - `/practice-schedule` → `/images/hockey-sticks2.webp`.
  - `/sled-hockey-nj` → use a New Jersey rink photo if available, else
    `/images/hero champion.jpg`.
  - `/sled-hockey-equipment-guide` → an equipment shot.
  - `/golf-outing`, `/topgolf` → `/images/golf-hero.jpg`,
    `/images/topgolf-hero.webp` (already exist).
  - `/hockey-for-a-cause` → `/images/hockey-for-a-cause-flyer.jpg`.
- Add three new `replace` calls in `generateRouteHTML` (around
  `prerender.mjs:286-313`):

```js
const ogImage = `https://wingsofsteel.org${route.image || '/assets/hockey-sticks.webp'}`;
html = html.replace(
  /<meta property="og:image" content="[^"]*">/,
  `<meta property="og:image" content="${ogImage}">`
);
html = html.replace(
  /<meta property="twitter:image" content="[^"]*">/,
  `<meta property="twitter:image" content="${ogImage}">`
);
```

Also add `og:image:alt`, `og:image:width`, `og:image:height` to `index.html`
(width/height help Facebook avoid the "image too small" warning).

**Impact:** Medium-high. Click-through rates from Facebook/Instagram
referrals — which are likely a primary source of new family inquiries — are
materially affected by the share-card image.

---

## 1.5 — Add a `NonprofitOrganization` schema block

**Problem:** Donors search Google with queries like "sled hockey nonprofit",
"adaptive hockey 501(c)(3) NJ", "youth sports charity Voorhees". The
existing `LocalBusiness` and `SportsTeam` schemas don't telegraph the
nonprofit status. There is also no telephone, no `email`, no donation URL
in structured form.

**Audience:** Donors, sponsors, foundation grant researchers, employer
matching-gift programs.

**Changes — append a new `<script type="application/ld+json">` block in
`index.html` (after the existing LocalBusiness block at line 185):

```jsonc
{
  "@context": "https://schema.org",
  "@type": "NonprofitOrganization",
  "name": "Wings of Steel Youth Sled Hockey",
  "alternateName": "Wings of Steel",
  "url": "https://wingsofsteel.org",
  "logo": "https://wingsofsteel.org/assets/wings-logo.webp",
  "description": "501(c)(3) nonprofit youth sled hockey team making the sport accessible to all children regardless of financial ability or physical disability. Three-time USA Sled Hockey National Champions (2024, 2025, 2026).",
  "nonprofitStatus": "Nonprofit501c3",
  "taxID": "<EIN HERE>",                 // <-- ask the team for the EIN
  "sameAs": [
    "https://www.facebook.com/wingsofsteel",
    "https://www.instagram.com/wingsofsteel"
  ],
  "address": { /* same PostalAddress as SportsTeam */ },
  "potentialAction": {
    "@type": "DonateAction",
    "target": "https://wingsofsteel.org/donate"
  }
}
```

The `taxID` (EIN) and a `Charity Navigator` / `GuideStar` profile URL in
`sameAs` materially boost donor-search ranking and let Google verify the
nonprofit status (which can unlock Google Ad Grants — see §3.2).

**Impact:** High for donor traffic. Medium for general organic.

---

## 1.6 — Add the SEO landing pages to the global Navigation

**Problem:** Open `src/components/Navigation.tsx` lines 60-147 — there is no
link from the global header to `/sled-hockey-nj`, `/what-is-sled-hockey`,
`/free-youth-hockey`, `/sled-hockey-equipment-guide`, `/sled-hockey-teams`,
or `/donate`. The footer only links to `/accessibility` and `/donate`.
These five SEO pages are effectively orphan pages — Google sees them only
via the sitemap.xml, which means they receive close-to-zero internal link
equity from the homepage.

**Audience:** All four — but especially Google's crawler, which assigns
PageRank by counting and weighting internal links.

**Changes:** add a new "Resources" or "Learn" section to the main nav in
`src/components/Navigation.tsx` (insert around line 87 alongside Team,
Schedule, Shop, Connect, Events):

```js
{
  name: 'Learn',
  key: 'learn',
  sections: [
    { title: 'About the Sport', items: [
      { name: 'What Is Sled Hockey?', href: '/what-is-sled-hockey' },
      { name: 'Equipment Guide', href: '/sled-hockey-equipment-guide' },
      { name: 'Sled Hockey Teams', href: '/sled-hockey-teams' },
    ]},
    { title: 'Get Involved', items: [
      { name: 'Sled Hockey in NJ', href: '/sled-hockey-nj' },
      { name: 'Free Youth Hockey', href: '/free-youth-hockey' },
      { name: 'Join the Team', href: '/join-team' },
    ]},
  ],
},
```

Also add a "Resources" column to `Footer.tsx` with the same six links plus a
"Donate" CTA — footers are the primary internal-link surface for SEO.

**Impact:** High. Internal link equity is one of the cheapest, most reliable
SEO levers. Expect noticeable rank movement on the keyword pages within
4-8 weeks.

---

## 1.7 — Sitemap completeness + freshness

**Problem:** `public/sitemap.xml` is missing routes that exist
(`/stories`, `/gallery`, `/game-highlights`, `/golf-outing`,
`/hockey-for-a-cause`, `/topgolf`) and lists no individual press story URLs.
Every `lastmod` is hardcoded to `2026-03-13`. Google uses `lastmod` as a
strong signal for crawl scheduling; if it never changes, crawl budget shrinks.

**Audience:** Crawlers. Indirectly, every search query.

**Changes:**

1. Add the six missing routes to `public/sitemap.xml` with realistic
   priorities (events 0.7, gallery 0.6, stories index 0.8).
2. Convert `public/sitemap.xml` to a generated artifact: write a tiny
   `scripts/generate-sitemap.mjs` (or extend `prerender.mjs`) that, at build
   time:
   - emits the static routes with `lastmod = today`,
   - queries Supabase for `is_published = true` press stories and emits a
     `<url>` for each `/stories/<slug>` with `lastmod = updated_at`,
   - emits a `<url>` for `/team/youth` and `/team/adult` if those should be
     indexable (or set them to `noindex` if not — see §1.10).
3. Submit the new sitemap in Google Search Console.

**Impact:** Medium. Mostly accelerates discovery of new press stories.

---

## 1.8 — Press-stories listing on the Wings Press index page

**Problem:** `WingsPressPage.tsx` has no static `<title>`, no meta
description, and no internal SEO copy for the listing. Crawlers see the
home-page title because it's not in `prerender.mjs`. Even users with JS
enabled get a generic intro line — there is no scannable summary of what
Wings Press is or who writes for it, which is a missed E-E-A-T signal.

**Audience:** Search queries like "Wings of Steel news", "Wings of Steel
press release", "sled hockey nationals 2026 recap".

**Changes:**

- Add `/stories` to `scripts/prerender.mjs` ROUTES (covered in §1.2).
- Add a `useEffect` in `WingsPressPage.tsx` that sets a unique title and
  description (matching the prerender entry) for client-side navigation.
- Add a short intro paragraph to the listing page that includes the phrase
  "Wings of Steel news and game recaps" so the listing has body copy for the
  ranking algorithm. Currently the only on-page text is "Stories,
  milestones, and the moments off the scoresheet".

**Impact:** Low-medium today, growing as more stories are published.

---

## 1.9 — Tighten image `alt` attributes

**Problem:** Spot-check across `src/components`:

- `Cart.tsx:74` — `alt={item.product.title}` is fine.
- `FeaturedHighlights.tsx:89` — `alt={highlight.title || \`vs ${info.opponent}\`}` is good.
- `Hero.tsx:64` — `"Tom Brake Memorial Logo - In loving memory"` is good.
- `Navigation.tsx:232` — `"Wings of Steel Youth Sled Hockey Team Logo - Home"` excellent.
- `GalleryHero.tsx:13` — `"Wings of Steel Tournament Action - Intense gameplay moment"` good.
- `Team.tsx:152, 174, 245, 261, 331, 429` — `${player.first_name} ${player.last_name}` — see §1.10 privacy note.
- `admin/PressStoriesManagement.tsx:433` — `<img alt="" />` for added photos. **Fix:** the public `PressStoryPage.tsx:125` uses `photo.caption || ''` which is correct (decorative if no caption), but the admin upload UI (`PressStoriesManagement.tsx`) should require an alt-text field per photo and persist it as `photos[i].alt`. Then update the public renderer to use `photo.alt || photo.caption || ''`.
- `LocalGallery.tsx` — gallery alts come from `gallery-manifest.json`, which has format `"2026 USA Hockey Sled Nationals — Dallas — Championship Game — 117_001"`. That's a useful base but every photo on a single game shares the same `alt` minus the suffix number — Google will treat them all as essentially identical. **Improvement:** include the game opponent and stage (e.g., "Wings of Steel vs. Mid-Iowa Mavericks — 2026 USA Sled Nationals semifinal") in `import-tournament-gallery.mjs` if that data exists in filenames or metadata.

**Audience:** Accessibility (primary), Google Images (secondary, but materially
helpful for "sled hockey" image queries).

**Changes:** see file/line list above. Two small file edits + one
`scripts/import-tournament-gallery.mjs` enhancement.

**Impact:** Low for organic search rank, medium for accessibility compliance,
medium for Google Images traffic.

---

## 1.10 — Privacy + indexing posture for player pages

**Problem flagged for user judgment:** The `Team.tsx` component renders
players' first **and last** names with photos (e.g., `Team.tsx:152`,
`alt={\`${player.first_name} ${player.last_name}\`}`). For a youth team
serving children with disabilities, exposing full last names on a public,
heavily-indexed site is a privacy and child-safety concern that goes beyond
SEO. It also creates risk for Person-schema recommendations (Google wants
`Person` schema for athletes; we should not add it for minors).

**Recommendation (privacy-respecting option):**

1. Display first name + last initial (e.g., "Andrew B.") on the public team
   page. Keep full name in the database for admin/internal use.
2. Use first-name-only in `alt` text: `alt={\`${player.first_name} -
   Wings of Steel sled hockey player\`}`.
3. Do **not** add `Person` schema for individual minor players. Use roster
   schema at the team level only (the existing `SportsTeam` is correct).
4. Consider adding `Disallow: /team/*/players/*` to robots.txt if individual
   player profile pages exist or are planned.
5. Coaches and adult staff are different — full name and a `Person` schema
   block is appropriate for them and is a positive E-E-A-T signal.

**Audience:** Parents (trust), legal/compliance, child safety advocates.

**Changes:**

- `src/components/Team.tsx` lines 152, 174, 331 — render last initial only
  for minors. Sponsors typically request a release for full-name use; if a
  release exists, the team can flag it on the player record (`show_full_name`
  bool) — surface accordingly.
- Coaches' full names + photos are fine as currently rendered.

**Impact:** Low for SEO, but **high for trust and risk management**, which
indirectly supports parent-acquisition.

---

## 1.11 — Trim duplicate `document.title` resets in pages that are prerendered

**Problem:** `WhatIsSledHockey.tsx:13-27`, `Donate.tsx:17-31`,
`SledHockeyNJ.tsx:10-25`, `SledHockeyEquipment.tsx`, `SledHockeyTeams.tsx`,
and `FreeYouthHockey.tsx` each include a `useEffect` that mutates
`document.title` and `meta[name="description"]` on mount, then resets to
`"Wings of Steel Youth Sled Hockey"` on unmount. Several issues:

1. `Donate.tsx:29` resets the title to `"Wings of Steel Youth Sled Hockey"` —
   a string that doesn't match `index.html`'s real title. If a user navigates
   `/ → /donate → back to /`, the homepage briefly shows the wrong title.
2. The reset overrides the per-route prerendered title on client-side
   navigation.
3. `SledHockeyTeams.tsx` reset at unmount has the same drift issue.
4. `WhatIsSledHockey.tsx:78-82` injects `<script id="faq-schema">` — fine —
   and removes it on unmount. But the homepage already has FAQ schema, so
   when leaving `/what-is-sled-hockey` and re-mounting the homepage there's
   no resulting issue. Just a code-clarity nit.

**Changes:** keep the on-mount title set (it's needed for client-side
navigation), but remove the cleanup function that resets the title. The
next route's `useEffect` will set its own title; routes without one will
fall back to whatever was last set. For the SPA this is fine because
prerender is only the first paint; subsequent navigation is JS-driven.

Better pattern: extract a `useDocumentMeta({ title, description })` hook
that all pages call uniformly, eliminating the copy-paste blocks.

**Impact:** Low. Code hygiene + minor UX polish.

---

## 1.12 — Robots and canonical hygiene

**Problem:** `public/robots.txt` is reasonable but:

1. `Disallow: /admin` matches `/admin` exactly but not `/admin?foo=bar`.
   Should be `Disallow: /admin/` plus `Disallow: /admin?` to be safe.
2. No `Disallow` for `/team/*/admin` exists in robots — actually it does,
   line 4 — but worth verifying the ProtectedEventRoute pages
   (`/golf-outing`, `/topgolf`, `/hockey-for-a-cause`) shouldn't be
   `Disallow`-ed when the event is hidden. They currently 404-render via
   `ProtectedEventRoute`, but Google may still crawl.
3. Pages with the `gallery` query string variants (e.g.,
   `/gallery?tournament=foo`) should be canonicalized to `/gallery` to
   prevent duplicate-content dilution. Add a `<link rel="canonical">` from
   `LocalGallery.tsx` pointing to `/gallery` for any combination of query
   params.

**Changes:**

- `public/robots.txt` — tighten admin disallows.
- `src/pages/LocalGallery.tsx` — set canonical to `https://wingsofsteel.org/gallery` regardless of query string.
- Add `Sitemap: https://wingsofsteel.org/sitemap.xml` is already there — good.

**Impact:** Low.

---

## 1.13 — Add `keywords` is removed; replace with `og:locale` + `theme-color`

**Problem:** `index.html:10` includes a `<meta name="keywords">` tag.
Google has not used this since 2009; it's dead weight that some SEO tools
flag as legacy. Worse, listing keywords there can sometimes look like a
weak signal of trying-too-hard.

**Audience:** None (cleanup).

**Changes:**

- Delete `index.html:10` (`<meta name="keywords">`).
- Add `<meta property="og:locale" content="en_US">` and
  `<meta property="og:site_name" content="Wings of Steel">` in the OG block.
- `theme-color` already exists at `index.html:54`, good.

**Impact:** Negligible, but low risk and cleaner.

---

# 2. Medium-term — 1-2 days of focused work

## 2.1 — Build-time press story prerendering

(Detailed in §1.3.) This deserves a dedicated effort because it's the
single largest unlocked surface. Outline of the build job:

- New file: `scripts/prerender-stories.mjs` (or extend `prerender.mjs`).
- Use `@supabase/supabase-js` (already a dependency) with the public URL
  and anon key (bake into env at build time — same pattern Vite uses).
- Query: `select slug, title, subtitle, body, cover_photo_url, author,
  published_at, updated_at from press_stories where is_published = true`.
- For each story, generate `dist/stories/<slug>/index.html` with:
  - unique `<title>` / meta description / canonical / OG including
    `og:image = cover_photo_url`.
  - `<noscript>`-equivalent body content (the full story text in
    semantic HTML — `<article><h1>{title}</h1><p>{body}</p></article>`
    so users with JS off and crawlers both see content).
  - inline `Article` JSON-LD.
- Update `public/sitemap.xml` generator to include each story URL with
  `lastmod = updated_at`.

**Impact:** Very high. Each story becomes its own indexed, shareable
piece of long-form content.

---

## 2.2 — Event JSON-LD for games and fundraisers

**Problem:** No `Event` schema anywhere. Games and fundraisers are
naturally event-shaped data; Google's rich-results panel for events can
appear above blue links and includes date, venue, and ticket/donate info.

**Audience:** Local searches like "sled hockey near me", "Voorhees youth
sports event April 2026", "Tom Brake golf outing".

**Changes:**

- Inject an array of `SportsEvent` objects on the homepage from
  `useGameSchedule()` data once games load. Or generate at build time if
  the schedule is static.
- For each fundraiser page (`/golf-outing`, `/topgolf`,
  `/hockey-for-a-cause`), add a page-level `Event` JSON-LD with
  `name`, `startDate`, `location.address`, `organizer`, and an `offers`
  block linking to `/donate` (use `priceCurrency: USD`, free or per-ticket
  price).
- Build-time: add to the prerender script (matching §1.2 entries).
- For the Hockey for a Cause game, use `@type: SportsEvent` and include
  `homeTeam` / `awayTeam` (`Wings of Steel`, `Gloucester Catholic`).

**Example for `/topgolf`:**

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Topgolf Fundraiser for Wings of Steel",
  "startDate": "2026-03-08T12:00",
  "endDate": "2026-03-08T16:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Topgolf Mt. Laurel",
    "address": { /* PostalAddress */ }
  },
  "organizer": {
    "@type": "NonprofitOrganization",
    "name": "Wings of Steel Youth Sled Hockey",
    "url": "https://wingsofsteel.org"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://wingsofsteel.org/topgolf",
    "price": "20",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

**Impact:** Medium-high. Event rich results are highly visible.

---

## 2.3 — Two new high-intent landing pages

The site's existing keyword pages are well-targeted. Two more would round
out a strong content cluster:

### 2.3.1 — `/sled-hockey-philadelphia` (or `/sled-hockey-philly`)

**Problem:** "sled hockey" + "Philadelphia" is the highest-volume nearby
metro query, and the Philadelphia Flyers Sled Hockey program competes for
this keyword. Wings of Steel is closer to South Philly than the Flyers'
program is for many residents. A targeted page positions Wings of Steel as
the South-Jersey alternative for Philly families.

**Content outline:** "Voorhees, NJ — 20 minutes from Center City via the
Walt Whitman Bridge. Free for all players. ..." Cover commute, bridges,
parking at Flyers Skate Zone, public transit options, comparison to other
regional programs. ~800 words.

### 2.3.2 — `/adaptive-sports-new-jersey`

**Problem:** "Adaptive sports New Jersey" is a parent-search query that
the existing `/sled-hockey-nj` page targets only narrowly. A page that
broadens to adaptive sports in general (with sled hockey as the team's
specific offering) catches families exploring options for their child
before they have decided on hockey specifically.

**Content outline:** Lead with the broader landscape (adaptive
basketball, sled hockey, wheelchair tennis, etc), then funnel to "if your
child is interested in hockey, here's how Wings of Steel works." ~1000
words.

Both pages should be added to prerender, sitemap, and the new "Learn"
nav menu.

**Impact:** Medium-high over 3-6 months as Google indexes and ranks.

---

## 2.4 — Schema for press-story Author / Person

If individual story authors are recurring (e.g., one or two volunteer
writers), build a small `/about/authors/<slug>` system with `Person`
schema. Each author page links to all their stories. Adult authors only —
do not create author pages for minor players.

**Impact:** Low-medium. Mostly a long-term E-E-A-T play.

---

## 2.5 — Move large gallery manifest off the critical bundle

**Problem:** `src/data/gallery-manifest.json` is 1.1 MB and imported
synchronously in `localGalleryImages.ts:6`, making it part of the
`/gallery` chunk. Even with code-splitting, anyone landing on `/gallery`
downloads the entire JSON before paint. Hurts:

- LCP (Largest Contentful Paint) — Core Web Vitals signal.
- INP for interactions until the JSON is parsed.
- Mobile users on cellular (the dominant audience for parent inquiries).

**Audience:** Mobile users, Core Web Vitals (an actual ranking factor).

**Changes:**

- Move `gallery-manifest.json` into `public/data/` and load via `fetch()`
  in `LocalGallery.tsx` on mount. Strip out the per-photo `width`/`height`
  if PhotoSwipe can compute them (it can, with `naturalWidth`).
- Better: ship `tournaments.json` with only tournament-level metadata,
  then lazy-load `tournaments/<slug>.json` only when the user opens a
  tournament. Average tournament file should be ~30-100 KB.
- Even better: serve the manifest from Supabase Storage with the photos.
  Photos are already in Supabase Storage per `localGalleryImages.ts:1-4`,
  so a single `manifest.json` next to them costs nothing extra.

**Impact:** Medium for SEO (Core Web Vitals), high for UX.

---

## 2.6 — `BreadcrumbList` schema on deep pages

**Problem:** Deep pages (`/stories/<slug>`, `/game/<id>`) lack
breadcrumbs both visually and in schema. Breadcrumb rich results give
your snippets a second line in the SERP and are a verified ranking signal.

**Audience:** Anyone clicking from a SERP — visible breadcrumb in the
snippet boosts CTR.

**Changes:** add `BreadcrumbList` JSON-LD to:

- `PressStoryPage.tsx` — Home → Stories → {title}.
- `GamePage.tsx` — Home → Game Highlights → {opponent} {date}.
- Each event page — Home → Events → {event name}.

**Impact:** Medium.

---

## 2.7 — Open Graph and Twitter for the dynamic GamePage

**Problem:** `/game/:gameId` is rendered client-side, dynamic, and not in
prerender. Sharing a game recap link on social shows the homepage card.

**Changes:** either (a) prerender each game page at build time using
Supabase data — same pattern as press stories — or (b) for now, add a
`useEffect` that sets per-game title/description/og:image and at least
gives Googlebot the right info.

Option (a) is recommended once §2.1 is in place — same plumbing.

**Impact:** Medium. Game recaps are highly shareable but currently
indistinguishable from the homepage in social previews.

---

## 2.8 — `hreflang` (skip — not needed)

The site is en-US only. No action.

---

# 3. Long-term / strategic — weeks to months

## 3.1 — Google Business Profile

Create / claim a Google Business Profile for Wings of Steel at the
Flyers Skate Zone address. Categorize as "Nonprofit organization" +
"Sports club". This is the single highest-leverage local-SEO action
because it puts the team in Google Maps, the local pack, and the
right-rail Knowledge Panel for branded queries. Ensure:

- Address: Flyers Skate Zone, 601 Laurel Oak Rd, Voorhees, NJ 08043.
- Hours: Thursdays 6:10-7:10 PM (or "by appointment / practice schedule
  varies").
- Photos: at least 10 (rink, championship, practices, players in action).
- Posts: a Google Business Profile post for each event (Topgolf, Golf
  Outing, Hockey for a Cause).
- Q&A: pre-seed common parent questions ("How much does it cost?",
  "What disabilities can my child have?", "How old does my child have
  to be?").

Note: GBP for an organization that meets at a partner facility (Flyers
Skate Zone has its own GBP) requires careful naming and category choice
to avoid Google merging the two. List Wings of Steel as a separate
"sports club" entity at the same address.

**Impact:** Very high for local-pack and Maps queries. Often the largest
single local-SEO lever.

---

## 3.2 — Google Ad Grants ($10,000/month free Google Ads)

As a verified 501(c)(3), Wings of Steel qualifies for the
[Google Ad Grants program](https://www.google.com/grants/), which
provides up to $10,000/month in free Google Search Ads. Requirements
include a valid TechSoup validation, an active website (already done),
and ongoing campaign management. Strong candidates for ad campaigns:

- "free youth hockey New Jersey" — direct parent-acquisition.
- "sled hockey for kids" — broad parent intent.
- "adaptive sports Voorhees" — local intent.
- "donate to youth sports nonprofit NJ" — donor intent.

The CTR and conversion-tracking requirements take real ongoing
effort; consider partnering with a volunteer who has Google Ads
experience or an agency that runs Ad Grants pro bono.

**Impact:** Very high. $120K/year of free traffic at SEO scale.

---

## 3.3 — Backlink building

Backlinks are still the most durable SEO signal. Realistic targets for a
nonprofit youth team:

- **USA Hockey** — request a profile / mention on the disabled hockey
  page. There is likely already one; verify it links to wingsofsteel.org.
- **NHL team partners** — Philadelphia Flyers, NJ Devils sled hockey
  programs sometimes link to peer programs.
- **Local press** — South Jersey Times, Courier-Post, Inquirer, NJ.com.
  Pitch each championship win as a feature; ensure links to
  wingsofsteel.org are included.
- **Charity Navigator / GuideStar** — claim and complete the profile.
  Link from these sites is high-authority.
- **Foundation sponsors** — when granting orgs publish recipient lists,
  ask for an `https://wingsofsteel.org` link rather than a logo.
- **High school + youth hockey associations** — for cross-promotion of
  Hockey for a Cause and similar events.
- **Adaptive sports directories** — Move United, Disabled Sports USA,
  Challenged Athletes Foundation directories.

**Impact:** Compounding, slow, very durable.

---

## 3.4 — Content cadence: one Wings Press post per week

The press_stories table is the perfect engine for this. A weekly cadence
of 400-800 word posts (game recaps, player spotlights for adult
players/coaches, milestone updates, fundraiser results) drives:

- Continuously fresh content (Google likes recent dates on a domain).
- Long-tail queries ("Wings of Steel vs Mid-Iowa", "sled hockey nationals
  2027 results").
- Internal-link surface for the keyword pages.
- Social-share content for Facebook / Instagram, where the parent
  audience lives.

Every post should:

1. Link to at least two SEO landing pages (`/sled-hockey-nj`,
   `/free-youth-hockey`, etc).
2. Link to `/donate` once.
3. Use a unique cover image with a descriptive filename
   (`2026-march-22-hockey-for-a-cause-recap.webp`, not `IMG_8829.jpg`).

**Impact:** Compounding. The single biggest lever once §2.1 is shipped.

---

## 3.5 — Core Web Vitals monitoring

`web-vitals` is already in `package.json`. Wire it up to a real
monitoring sink (Cloudflare Analytics, Vercel Analytics, or self-hosted
Plausible) so regressions in LCP/CLS/INP get caught before users
complain. Today the metric exists in code but probably isn't reported.

**Impact:** Medium — defensive. Catches the next gallery-bloat or
font-loading regression before it affects rank.

---

## 3.6 — Dedicated press / media kit page

`/press` or `/media-kit` with downloadable logos, player photos with
release status indicated, fact sheet (founding date, championship
history, team size, mission statement), and direct media contact info.
Local journalists check this before writing — its absence is an
implicit "we don't do press". Drives backlinks.

**Impact:** Medium. Compounds with §3.3 backlink building.

---

# 4. Specific file:line changes ready to act on

This section is the tactical "to-do" companion to §1. Each block is the
exact place to edit and the change to make.

## 4.1 — `index.html`

| Line | Current | Change to |
|---|---|---|
| 9 | `description content="...2025 & 2026 USA Champions."` | `...3-time USA Sled Hockey National Champions (2024, 2025, 2026)."` |
| 10 | `<meta name="keywords" ...>` | **Delete** |
| 19 | `og:description ...No child pays to play. Join us at Flyers Skate Zone!` | Mention 3-time championship + Voorhees, NJ |
| 20 | `og:image ...hockey-sticks.webp` | Keep, plus add `og:image:alt`, `og:image:width=1200`, `og:image:height=630` |
| 26 | `twitter:description ...2025 & 2026 USA Champions.` | `3-time USA Sled Hockey National Champions.` |
| 80 | `"award": ["2025 USA Sled Hockey Champions", "2026 USA Sled Hockey Champions"]` | Add `"2024 USA Sled Hockey Champions"` |
| 168 | `"telephone": ""` | Populate or remove the empty field (empty fields are worse than missing) |
| after 185 | _new block_ | Add `NonprofitOrganization` JSON-LD (§1.5) |
| after 31 | _new line_ | `<meta property="og:site_name" content="Wings of Steel">` and `<meta property="og:locale" content="en_US">` |

## 4.2 — `scripts/prerender.mjs`

| Line | Change |
|---|---|
| 27 (ROUTES) | Add 5 new entries: `/stories`, `/golf-outing`, `/topgolf`, `/hockey-for-a-cause`, `/game-highlights` (already partially present — verify), and `/team/youth` if treating it as canonical |
| 31, 35 | Replace "2025 and 2026" → "2024, 2025, and 2026" / three-time |
| 131 | Same for `/opponents` |
| 197 | Same for `/sled-hockey-nj` |
| 286-313 | Add `og:image` and `twitter:image` rewrite logic per route, reading from a new `route.image` field |
| 357 (end of file) | After the `prerender()` call, also invoke `prerenderStories()` (new function — see §2.1) |

## 4.3 — `public/sitemap.xml`

| Action | URL | priority | changefreq |
|---|---|---|---|
| Add | `/stories` | 0.8 | weekly |
| Add | `/golf-outing` | 0.6 | monthly |
| Add | `/topgolf` | 0.6 | monthly |
| Add | `/hockey-for-a-cause` | 0.6 | monthly |
| Add | `/team/youth` | 0.3 (or noindex) | monthly |
| Update all `lastmod` | `2026-05-08` | — | — |
| Convert to generated | — | — | — |

## 4.4 — `public/robots.txt`

```diff
 User-agent: *
 Allow: /
-Disallow: /admin
+Disallow: /admin/
+Disallow: /admin?
 Disallow: /team/*/admin
+Disallow: /*?utm_*
+Disallow: /*?gclid=*

 Sitemap: https://wingsofsteel.org/sitemap.xml
```

## 4.5 — `src/components/Navigation.tsx`

- Insert new "Learn" menu group at line ~87 (alongside Schedule, Shop,
  Connect, Events). See §1.6 for the structure.
- Add a "Donate" CTA button to the right side of the nav (currently the
  donate link is only in the footer). Many existing pages have inline
  donate CTAs but the global header is the highest-visibility surface.

## 4.6 — `src/components/Footer.tsx`

Replace the single-column footer at lines 7-67 with a 4-column grid:

```
Wings of Steel  |  Learn          |  Get Involved  |  Connect
- About         |  - What Is...   |  - Join Team   |  - Contact
- Mission       |  - Equipment    |  - Donate      |  - Facebook
- Schedule      |  - NJ Programs  |  - Volunteer   |  - Instagram
- Stories       |  - All Teams    |  - Sponsor     |  - Newsletter
                |  - Free Hockey  |                |
```

Footer is the single highest-volume internal-link surface; populating it
materially lifts every linked page's PageRank.

## 4.7 — `src/pages/PressStoryPage.tsx`

Add a `useEffect` after line 34 that sets `document.title`,
meta description, OG title/description/image to story values, and
injects an `Article` JSON-LD `<script>`. Mirror
`WhatIsSledHockey.tsx:13-82`. Cleanup: remove the script on unmount.

This is a runtime-only fix; the build-time fix is §2.1.

## 4.8 — `src/pages/Donate.tsx`

| Line | Change |
|---|---|
| 17-31 | Remove the `useEffect` block — the prerendered HTML already sets the right title. The reset-on-unmount currently breaks the homepage title after a back-navigation. Keep client-side title sync via a shared `useDocumentMeta` hook instead. |

(Same applies to `WhatIsSledHockey.tsx`, `SledHockeyNJ.tsx`,
`SledHockeyEquipment.tsx`, `SledHockeyTeams.tsx`, `FreeYouthHockey.tsx`.)

## 4.9 — `src/components/Team.tsx`

| Line | Change |
|---|---|
| 152, 174, 245, 261, 331, 429 | Where players (not coaches) are rendered, replace `${player.first_name} ${player.last_name}` with `${player.first_name} ${player.last_name?.[0] ?? ''}.` for `alt` text and visible name. Gate on `player.show_full_name` if a release is on file. |

## 4.10 — `src/data/localGalleryImages.ts` and `src/pages/LocalGallery.tsx`

| Action | Notes |
|---|---|
| Move `gallery-manifest.json` to `public/data/gallery-manifest.json` | Keeps it out of the JS bundle |
| Convert `localGalleryImages.ts` to async loader | `fetch('/data/gallery-manifest.json')` on demand |
| Add `<link rel="canonical">` to `LocalGallery.tsx` | Always points to `/gallery` regardless of query string |

## 4.11 — `public/manifest.json`

The PWA manifest is fine. Optional:

- Add `"display_override": ["window-controls-overlay", "standalone"]`.
- Add a `purpose: "monochrome"` icon for Android adaptive icons.

Not SEO-critical.

---

# Top 5 priority order

If you can do only 5 things:

1. **§1.3 + §2.1 — Prerender press stories with `Article` schema.** Largest
   uncrawled surface; biggest single SEO unlock.
2. **§1.6 — Add SEO landing pages to global Navigation + Footer.** Cheapest
   fix to a high-leverage problem (orphan pages getting zero link equity).
3. **§1.1 — Update everything to "3-time USA Sled Hockey National
   Champions (2024, 2025, 2026)".** Consistency + new keyword surface.
4. **§1.4 — Per-route OG images.** Massive social-share CTR lift for
   ~20 lines of code.
5. **§3.1 — Google Business Profile.** Largest local-SEO lever; every
   "sled hockey near me" / "Voorhees youth sports" query is decided here.

After those, **§2.1** (build-time story prerender) and **§3.4** (weekly
press cadence) compound forever.

---

_End of audit._
