
-- Enable RLS on all tables
alter table public.artist enable row level security;
alter table public.work enable row level security;
alter table public.image_link enable row level security;

-- Allow authenticated users to read artist data
drop policy if exists "Authenticated users can read artists" on public.artist;
create policy "Authenticated users can read artists"
on public.artist
for select
to authenticated
using (true);

-- Allow authenticated users to read work data
drop policy if exists "Authenticated users can read works" on public.work;
create policy "Authenticated users can read works"
on public.work
for select
to authenticated
using (true);

-- Allow authenticated users to read image_link data
drop policy if exists "Authenticated users can read image links" on public.image_link;
create policy "Authenticated users can read image links"
on public.image_link
for select
to authenticated
using (true);
