# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wings of Steel is a championship sled hockey team website built with React, TypeScript, and Vite. The site promotes the team's mission of making sled hockey accessible to all children regardless of financial ability.

## 🚨 CRITICAL: Netlify Deployment Requirements

**THIS SITE DEPLOYS TO NETLIFY - FOLLOW THESE RULES:**

1. **NEVER commit the `dist` folder** - It's in .gitignore. Netlify must build it fresh.
2. **Asset hash mismatches will cause blank pages** - Different environments generate different hashes
3. **The `netlify.toml` clears caches** with `rm -rf dist node_modules/.vite` before building
4. **NEVER re-create `public/_redirects`** - routing lives in `netlify.toml` now. See "Routing & SEO" below.
5. **ALWAYS test production build** with `npm run build && npm run preview` before pushing

### Common Netlify Issues:
- **Blank page**: Asset hash mismatch - Netlify's build has different hashes than local
- **MIME type errors**: Files don't exist (wrong hash) so HTML 404 is returned
- **Build failures**: Secrets scanning - public env vars are excluded in netlify.toml

## Routing & SEO

`npm run build` runs `vite build` and then `scripts/prerender.mjs`. That script is the single
source of truth for public pages: for each entry in its `ROUTES` table it writes
`dist/<route>/index.html` with a route-specific title, description, canonical, OG/Twitter tags,
optional per-route FAQ schema, and crawler-visible `<noscript>`-style content. It also generates
`dist/sitemap.xml` from the same table.

**Adding a public page** means doing three things, or it will half-work:
1. Add a `ROUTES` entry in `scripts/prerender.mjs` (gets it prerendered + into the sitemap).
2. Add the `<Route>` in `src/App.tsx` (otherwise React mounts NotFound over the prerendered HTML).
3. If the route is client-only (DB-driven or gated) and therefore *not* prerendered, add a
   `status = 200` rule in `netlify.toml` - otherwise it will 404.

**Never re-create `public/_redirects`.** It used to contain `/*  /index.html  200`, which
answered every unknown URL with HTTP 200 and a copy of the homepage. Google reports that as a
soft 404 and it suppresses crawling of real pages. `_redirects` takes precedence over
`netlify.toml`, so re-adding it silently reverts the fix. Unmatched paths must fall through to
`dist/404.html`, which Netlify serves with a real 404 status.

**Canonical URLs carry a trailing slash** (`/donate/`, not `/donate`), because that is the form
Netlify settles on when serving `dist/donate/index.html`. The prerender script and the generated
sitemap derive both from one expression - don't hand-edit one without the other.

Verify routing changes locally against Netlify's own redirect engine, not `vite preview`:

```bash
npm run build && npx netlify dev --dir dist --offline --port 8901
```

## Common Commands

```bash
# Development
npm run dev        # Start Vite dev server (http://localhost:5173)
netlify dev        # Run full stack incl. Netlify functions (http://localhost:8888)
npm run build      # Build for production (TEST BEFORE PUSHING!)
npm run preview    # Preview production build locally (MUST WORK BEFORE DEPLOY!)
npm run lint       # Run ESLint for code quality
```

**When to use which dev command:**
- `npm run dev` — frontend only. A small Vite middleware proxies `/.netlify/functions/printify-products` so the storefront listing renders, but every other Netlify function (`create-store-payment`, `stripe-webhook`, donation/payment flows, etc.) returns 404.
- `netlify dev` — required to test checkout, donations, Stripe payment intents, or any function-backed feature end-to-end.

## ⚠️ CRITICAL: THERE IS ONLY ONE HERO COMPONENT

**NEVER CREATE DUPLICATE HERO COMPONENTS**
- **ONLY USE**: `src/components/Hero.tsx` 
- **DO NOT CREATE**: HeroLight, HeroSimple, HeroV2, or any other variants
- **IF YOU SEE**: Multiple Hero components, DELETE all except `Hero.tsx`
- **LOCATION**: Used in `src/components/TeamSite.tsx`

## Architecture

**Tech Stack:**
- React 19.1.0 with TypeScript
- Vite for build tooling
- Tailwind CSS with custom theme
- Framer Motion for animations

**Component Structure:**
The app is a single-page application with sections rendered in App.tsx:
- Navigation → Hero → About → Team → Schedule → GetInvolved → Contact → Footer

**Styling System:**
- Tailwind CSS with custom theme colors: steel-blue, steel-gray, ice-blue, dark-steel
- Custom fonts: Bebas Neue (sport), Oswald (display)
- Responsive design with mobile-first approach

**Key Files:**
- `src/App.tsx` - Main application component
- `tailwind.config.js` - Custom theme configuration
- `src/components/` - All section components

## Development Notes

- No testing framework currently configured
- All components use TypeScript with strict mode enabled
- Framer Motion is used extensively for animations
- The site emphasizes the "No child pays to play" mission throughout