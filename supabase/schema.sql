-- FarmaGest demo: ejecutar una vez en Supabase > SQL Editor > New query.
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Demo users can read shared state"
on public.app_state for select
to anon
using (true);

create policy "Demo users can create shared state"
on public.app_state for insert
to anon
with check (true);

create policy "Demo users can update shared state"
on public.app_state for update
to anon
using (true)
with check (true);
