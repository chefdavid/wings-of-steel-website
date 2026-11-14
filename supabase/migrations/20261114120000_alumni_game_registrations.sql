-- Sign-ups for the 25th Anniversary Alumni Game (2027-02-20).
--
-- Written only by the `alumni-game-register` Netlify function, which uses the
-- service-role key. Row level security is on with NO policies, so the public
-- anon key can neither read nor write this table: it holds names, emails and
-- phone numbers, and the admin screens have no real login to gate a read.
-- The team sees each sign-up by email instead.

create table if not exists public.alumni_game_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  shirt_size text not null,
  years_played text not null,
  created_at timestamptz not null default now()
);

alter table public.alumni_game_registrations enable row level security;

revoke all on public.alumni_game_registrations from anon, authenticated;
