# Wings of Steel — Vault Home

The map of everything. Start here.

## Core notes

- [[AI_CONTEXT]] — what this project is, in one page
- [[ARCHITECTURE]] — how it is built and why
- [[DECISIONS]] — decisions already made; do not relitigate
- [[TASKS]] — what is in flight

## Current initiative

**Redesign + season-aware stats**, planned 2026-08-15. Full plan lives in the
Claude project doc `claude/redesign-and-stats-plan.md` and is summarised in
[[TASKS]]. Six phases; Phase 0 (stabilize) is complete.

## Open decisions

- **RLS lockdown** — see `docs/RLS_DECISION.md`. Blocking nothing yet, but must
  be answered before the stats admin is rebuilt in Phase 3.

## Quick facts

| | |
|---|---|
| Repo | `github.com/chefdavid/wings-of-steel-website` |
| Host | Netlify, auto-deploys `master` |
| DB | Supabase project `SledHockey.org` (`zfiqvovfhkqiucmuwykw`) |
| Stack | React 19, Vite 7, TypeScript, Tailwind 3, Framer Motion |
| Live | wingsofsteel.org |
