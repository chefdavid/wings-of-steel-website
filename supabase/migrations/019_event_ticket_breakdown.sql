-- 019_event_ticket_breakdown.sql
--
-- Ticket events (Topgolf, golf outing) ride on the `donations` table: one row per
-- payment, with `amount` holding the whole charge. That was fine while a payment
-- was only tickets. The October 2026 Topgolf event offers an optional add-on
-- donation at checkout, so a single row can now hold tickets AND a gift, and the
-- admin needs to tell them apart -- a $75 row could be three tickets, or one
-- ticket plus a $50 gift.
--
-- Additive and nullable on purpose. Every historical row keeps NULL, which reads
-- as "not a split payment"; nothing that writes to `donations` today breaks.
-- No defaults: a forgotten call site should show up as NULL rather than silently
-- claiming a payment was all tickets.

alter table public.donations
  add column if not exists ticket_count   integer,
  add column if not exists ticket_amount  numeric(10,2),
  add column if not exists addon_donation numeric(10,2);

comment on column public.donations.ticket_count is
  'Number of event tickets in this payment. NULL for non-ticket donations.';
comment on column public.donations.ticket_amount is
  'Portion of `amount` that paid for tickets. NULL for non-ticket donations.';
comment on column public.donations.addon_donation is
  'Optional extra gift added at event checkout. NULL for non-ticket donations, 0 when declined.';

-- Reporting index: the admin lists one event at a time via event_tag.
create index if not exists donations_event_tag_created_at_idx
  on public.donations (event_tag, created_at desc);

-- Verification -- run after applying. ticket_amount + addon_donation must equal
-- amount on every row that carries a breakdown.
--
--   select id, amount, ticket_amount, addon_donation
--   from public.donations
--   where ticket_amount is not null
--     and coalesce(ticket_amount,0) + coalesce(addon_donation,0) <> amount;
--
-- Zero rows expected.
