-- Wings of Steel store orders
-- Source of truth for Printify-fulfilled merch purchases. The Stripe webhook
-- reads from this table to drive Printify order creation, so the customer
-- closing their tab between Stripe charge and Printify call cannot lose work.
--
-- Apply via Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id text unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'fulfilled', 'failed')),
  customer_email text not null,
  shipping_address jsonb not null,
  line_items jsonb not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  donation_amount_cents integer not null default 0 check (donation_amount_cents >= 0),
  fee_cover_cents integer not null default 0 check (fee_cover_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  printify_order_id text,
  printify_response jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_orders_status_idx on public.store_orders (status);
create index if not exists store_orders_created_at_idx on public.store_orders (created_at desc);

create or replace function public.set_store_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists store_orders_set_updated_at on public.store_orders;
create trigger store_orders_set_updated_at
  before update on public.store_orders
  for each row
  execute function public.set_store_orders_updated_at();

alter table public.store_orders enable row level security;

-- No policies are defined: anon and authenticated roles get zero access.
-- Only the service role (used by Netlify functions) bypasses RLS.
