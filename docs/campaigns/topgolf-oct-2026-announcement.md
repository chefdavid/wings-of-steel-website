# Topgolf Fundraiser — Oct 25, 2026 — announcement email

**Status:** DRAFT — not sent. Nothing is queued; sending is a manual step.

## Audience

Everyone who has paid through wingsofsteel.org. As of 2026-09-20 that is
**77 distinct email addresses** with a successful payment, from `donations`
(plus 1 from `store_orders`):

| Source | People |
|---|---|
| Tom Brake Memorial Golf Outing | 35 |
| Topgolf, March 2026 | 37 |
| General donations | 8 |
| Store orders | 1 |

Pulled with:

```sql
select distinct on (lower(donor_email)) donor_email, donor_name, event_tag, created_at
from donations
where payment_status in ('succeeded','completed','paid')
order by lower(donor_email), created_at desc;
```

Note the overlap: several people appear under more than one tag, hence 77
distinct addresses against 87 successful payments. Deduplicate on
`lower(donor_email)` before sending.

## Before sending — check these

- **Consent.** These addresses were collected to process a payment, not
  explicitly to receive marketing. A one-off announcement to past supporters of
  the same organisation is normal nonprofit practice, but the send needs a
  visible unsubscribe link and a postal address to stay CAN-SPAM compliant.
  Neither exists in the current Resend templates.
- **The 37 March Topgolf buyers are the warmest segment** — they already liked
  this exact event. Worth a different subject line if you want to segment.
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
