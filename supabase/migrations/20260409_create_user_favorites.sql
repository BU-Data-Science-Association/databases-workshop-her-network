-- Create the workshop user favorites table and tie each row to auth.users.
create table if not exists public."user" (
  id uuid primary key references auth.users(id) on delete cascade,
  favorite_artist bigint,
  favorite_work bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_set_updated_at on public."user";
create trigger trg_user_set_updated_at
before update on public."user"
for each row
execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."user" (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Backfill rows for any existing auth users
insert into public."user" (id)
select id from auth.users
on conflict (id) do nothing;

alter table public."user" enable row level security;

-- Allow users to read only their own favorites row.
drop policy if exists "Users can read own user row" on public."user";
create policy "Users can read own user row"
on public."user"
for select
to authenticated
using (auth.uid() = id);

-- Allow users to insert their own row if needed (upsert fallback from app).
drop policy if exists "Users can insert own user row" on public."user";
create policy "Users can insert own user row"
on public."user"
for insert
to authenticated
with check (auth.uid() = id);

-- Allow users to update only their own favorites row.
drop policy if exists "Users can update own user row" on public."user";
create policy "Users can update own user row"
on public."user"
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
