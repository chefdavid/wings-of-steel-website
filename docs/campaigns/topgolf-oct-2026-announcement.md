# Topgolf Fundraiser — Oct 25, 2026 — announcement email

**Status:** DRAFT — not sent. Nothing is queued; sending is a manual step.

## Audience

**Corrected 2026-09-20.** An earlier count of 77 was wrong — it looked only at
`donations` and `store_orders`. Two more tables hold real contacts.

Everyone who has ever given us an email address through the website:
**102 distinct people**, 90 of them with a successful payment.

| Source table | Rows | Distinct emails | Period |
|---|---|---|---|
| `donations` | 106 | 86 | 2026-01-30 → 2026-09-20 |
| `event_registrations` (Pizza, Pins & Pop 2024) | 21 | 16 | 2025-09-16 → 2025-11-13 |
| `team_registrations` (parents signing a player up) | 10 | 7 | 2025-10-21 → 2026-09-03 |
| `store_orders` | 1 | 1 | 2026-04-28 |
| **Deduplicated total** | | **102** | |

Overlap is why 102 < 86+16+7+1 — several people appear in more than one table.

**Deliberately excluded:** `opponent_teams` (8 rows) holds opposing teams' contact
addresses, not supporters. `donation_inquiries`, `golf_donations`,
`golf_sponsorships`, `email_queue`, `teams` and `user_profiles` are all empty.

**Not in the database at all:** anyone who only ever used the contact form or
emailed the team directly. Those live in the inbox, not in Postgres, so this list
cannot see them.

## Personalisation

The list is built and cleaned by a script (kept out of the repo — see below).
Output columns: `email`, `first_name`, `full_name`, `greeting`, `paid`,
`sources`, `last_activity`, `needs_review`.

Cleaning applied, because the raw names are not send-ready:

- **Casing.** 7 names were stored all-lowercase (`adam wade`), 3 ALL CAPS
  (`BART MYLES`). Sending raw would produce "Hi adam," and "Hi BART,".
- **Doubled name.** One row read `Jean M Wiederholt Jean M Wiederholt`.
- **Middle initials** (`Theresa A Sullivan`) are harmless — the first token is
  still the first name.

**9 rows carry a `needs_review` flag. Check these before sending:**

| Issue | Count | Note |
|---|---|---|
| Joint names | 3 | `Eileen & Sean Carlson`, `Patrick & Andrew Rich`, `Cathy and Clare Sullivan`. Greeting uses the first person only. Consider "Hi Eileen and Sean," |
| Conflicting names on one address | 5 | Most are harmless variants (`Kathy`/`Kathryn`, `Jessie`/`Jessie L`). **One is not:** `mrsgregoire1@gmail.com` has both `Kate Gregoire` and `Nicholas Pagano` — two different people sharing an address. The script picks the most recent, which is Nicholas. Decide deliberately. |
| No name | 1 | The store order captured no name. Falls back to "Hi there,". |

101 of 102 have a usable first name.

### Regenerating the list

The CSV contains 102 people's names and email addresses, and **this GitHub repo is
public**. Do not commit it. The builder script reads `.env` directly and writes to a
path you pass it; keep both outside the repo, or in a directory that is gitignored.

## Before sending — check these

- **Consent.** These addresses were collected to process a payment, not
  explicitly to receive marketing. A one-off announcement to past supporters of
  the same organisation is normal nonprofit practice, but the send needs a
  visible unsubscribe link and a postal address to stay CAN-SPAM compliant.
  Neither exists in the current Resend templates.
- **The 37 March Topgolf buyers are the warmest segment** — they already liked
  this exact event. Worth a different subject line if you want to segment. The
  `sources` column carries the event tags, so segmenting is a filter away.
- **12 of the 102 never completed a payment** (`paid` = no). They are still real
  contacts who tried, but treat them as a separate, colder segment.
- The event must be **visible** (`event_visibility.is_visible = true` for
  `topgolf`) before this goes out, or every link in it redirects to the home page.

---

## Subject line options

1. `We're going back to Topgolf — Sunday, October 25` *(recommended)*
2. `$25 to play, and no child pays to play`
3. `You helped last time. We're doing it again — Oct 25 at Topgolf`

**Preheader:** `Sunday, October 25 · 11 AM–2 PM · Topgolf Mount Laurel. $25 to play.`

---

## Body

Hi {{first_name}},

Because of people like you, every child on Wings of Steel played this season
without paying a cent. That is the whole point of what we do, and it only works
because our supporters keep showing up.

So we're going back to Topgolf.

**Topgolf Fundraiser — benefiting the youth team**
**Sunday, October 25, 2026 · 11:00 AM – 2:00 PM**
**Topgolf Mount Laurel · 104 Centerton Rd, Mount Laurel, NJ 08054**
**$25 to play**

Food and drink are available for purchase at the venue. We'll have a basket
raffle, a 50/50 and a silent auction going all afternoon.

**Where the money goes:** every ticket funds the youth team directly — ice time,
sled and equipment maintenance, and travel to tournaments. A single sled runs
well over a thousand dollars, and ice time is billed by the hour whether we fill
it or not. This event is a meaningful part of how the 2026–2027 season gets paid
for.

You don't need to have swung a golf club before. Most of the fun is watching
people who clearly haven't.

[**Get Your Tickets — $25**](https://wingsofsteel.org/topgolf)

Can't make it on the 25th? You can still chip in from the same page — there's an
option to add a donation at checkout, and 100% of it goes to the team.

Thank you for everything you've already done for these kids.

— The Wings of Steel Team

*Wings of Steel is a 501(c)(3) nonprofit. Event tickets cover goods and services
you receive and are generally not tax-deductible; donations are.*

---

## Plain-text version

Hi {{first_name}},

Because of people like you, every child on Wings of Steel played this season
without paying a cent. So we're going back to Topgolf.

TOPGOLF FUNDRAISER - benefiting the youth team
Sunday, October 25, 2026 - 11:00 AM to 2:00 PM
Topgolf Mount Laurel - 104 Centerton Rd, Mount Laurel, NJ 08054
$25 to play

Food and drink available for purchase. Basket raffle, 50/50 and silent auction
on site.

Where the money goes: every ticket funds the youth team directly - ice time,
sled and equipment maintenance, and travel to tournaments.

Get your tickets: https://wingsofsteel.org/topgolf

Can't make it? You can add a donation at checkout on the same page.

Thank you for everything you've already done for these kids.

- The Wings of Steel Team

Wings of Steel is a 501(c)(3) nonprofit. Event tickets cover goods and services
you receive and are generally not tax-deductible; donations are.
