# Topgolf Fundraiser — Oct 25, 2026 — social copy

**Status:** DRAFT — nothing has been posted. Every post below is a manual send.

Graphics in `assets/`:

| File | Size | Use |
|---|---|---|
| `topgolf-oct-2026-square.png` | 1080×1080 | Facebook/Instagram feed post — the default |
| `topgolf-oct-2026-link.png` | 1200×630 | Link preview / shared-link card / event cover |

**Layout, revised 2026-09-20.** The first version laid a full-frame scrim over the
photo and put the type across the middle, which buried the player. Both cards now
darken only the right-hand side and keep all type in a right-hand column, so the
hockey player swinging a stick at the tee — the whole reason the photo works — is
completely unobstructed.
| `fb-card-template.html` | — | Source. Re-render to change the copy (see below). |

To re-render after editing the template, from the repo root with a Node script that
inlines `public/fonts/*.woff2` and `public/images/topgolf-hero.webp` as data URIs —
Google Fonts is not reachable from this machine and Playwright's `setContent` will not
load `file://` assets.

---

## 1. Wings of Steel page — main announcement

Attach: `topgolf-oct-2026-square.png`

> 🏌️ We're going back to Topgolf — and you're invited.
>
> **Sunday, October 25 · 11 AM – 2 PM · Topgolf Mount Laurel**
> $25 to play. Food and drink available for purchase.
>
> Basket raffle, 50/50 and a silent auction going all afternoon.
>
> Every ticket benefits our youth team — ice time, sleds, and travel — so that no
> child ever pays to play. You don't need to have swung a club before. Honestly,
> most of the fun is watching the people who haven't.
>
> Grab your spot 👉 wingsofsteel.org/topgolf
>
> #SledHockey #WingsOfSteel #MountLaurel #SouthJersey #Topgolf #NoChildPaysToPlay

**First comment** (keeps the link out of the post body, which Facebook's reach
algorithm tends to prefer):

> Tickets and full details here: https://wingsofsteel.org/topgolf

---

## 2. 322 BBQ page

The real hook: **the owner's son is the team captain.** That is a far stronger
reason for a restaurant to post this than a generic endorsement, and it is true.
Do not name him — he is a minor and the post does not need it.

Attach: `topgolf-oct-2026-square.png`

> Some of you know our owner's son is the captain of Wings of Steel — a South
> Jersey youth sled hockey team where no child ever pays to play.
>
> They're holding their Topgolf fundraiser on **Sunday, October 25, 11 AM – 2 PM
> at Topgolf Mount Laurel**. $25 to play, and every dollar goes to the kids — ice
> time, sleds and travel to tournaments.
>
> We'll be there. Come swing with us 👉 wingsofsteel.org/topgolf

If 322 is donating something concrete — a raffle basket, food, sponsoring a bay —
add one line saying so. That turns a share into a reason for their customers to
show up.

---

## 3. Personal share

Write it as yourself. A personal post beats a page post with identical words,
because it reaches friends rather than followers — and this one has something no
page post has.

> My son is the captain of Wings of Steel, a youth sled hockey team where no kid
> has ever had to pay to play. Watching that team is the best part of my year.
>
> They're running their Topgolf fundraiser on Sunday, October 25, 11–2, at
> Topgolf Mount Laurel. $25 to play. That money is ice time, sleds, and getting
> these kids to tournaments.
>
> I'll be there. Come hit some balls with us — wingsofsteel.org/topgolf

Alternative: hit **Share** on the Wings of Steel page's post and put that text
above it. The share carries the page's post to your friends and sends the
engagement back to the team's page instead of splitting it across two posts.

---

## Suggested timing

| When | What |
|---|---|
| As soon as tickets are live | Wings page announcement + personal share |
| ~3 days later | Business page post |
| Oct 11 (2 weeks out) | Reshare with "two weeks out" |
| Oct 18 (1 week out) | Reminder — note that online registration closes Oct 18 at noon |
| Oct 23–24 | Last call |
| Oct 25 | Day-of photos, then a thank-you post with the amount raised |

Note the registration cutoff is **October 18 at 12:00 PM** — one week before the
event. After that the page shows "registration closed", so any post after the 18th
should point people to paying at the door instead of to the ticket page.
