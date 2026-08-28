# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wings of Steel is a championship sled hockey team website built with React, TypeScript, and Vite. The site promotes the team's mission of making sled hockey accessible to all children regardless of financial ability.

## 🚨 CRITICAL: Netlify Deployment Requirements

**THIS SITE DEPLOYS TO NETLIFY - FOLLOW THESE RULES:**

1. **NEVER commit the `dist` folder** - It's in .gitignore. Netlify must build it fresh.
2. **Asset hash mismatches will cause blank pages** - Different environments generate different hashes
3. **The `netlify.toml` clears caches** with `rm -rf dist node_modules/.vite` before building
4. **SPA Routing requires** the `public/_redirects` file with `/*    /index.html   200`
5. **ALWAYS test production build** with `npm run build && npm run preview` before pushing

### Common Netlify Issues:
- **Blank page**: Asset hash mismatch - Netlify's build has different hashes than local
- **MIME type errors**: Files don't exist (wrong hash) so HTML 404 is returned
- **Build failures**: Secrets scanning - public env vars are excluded in netlify.toml

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
<!-- OBSYDIAN-VAULT:BEGIN -->
## Project memory

Long-term memory for this project lives in the Obsidian vault at
`~/Documents/GitHub/Obsydian` (git-synced across machines).

**Read at the start of a session:**
- `10-Projects/WingsWebsite/WingsWebsite.md` — what this is, status, links
- `10-Projects/WingsWebsite/Context.md` — stack, env vars, deploy, integrations, gotchas
- `10-Projects/WingsWebsite/Decisions.md` — last few decisions and why
- `30-Knowledge/Gotchas/` — cross-project traps for this stack

**Note:** this repo's folder is `wings-of-steel-website` but its vault notes live under
`10-Projects/WingsWebsite/` — the folder name and the vault name differ, so the
SessionStart hook (which maps by folder name) will not auto-load them. Open them by hand.
`50-Archive/wings-of-steel-website/` describes a *different*, deleted Windows folder — not this repo.

**Write when you finish something:**
- A decision that changes direction → append a dated entry to `Decisions.md`
- A non-obvious fix or constraint → `Context.md`, or `30-Knowledge/Gotchas/` if it would
  bite another project too
- A meaningful work session → `10-Projects/WingsWebsite/Sessions/YYYY-MM-DD.md`

Never write secrets into the vault — record where a secret lives, not its value.
Commit and push the vault in the same session you edit it.
<!-- OBSYDIAN-VAULT:END -->
