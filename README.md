# Databases Workshop 3: Supabase Art Explorer

This project is intentionally minimal.
Authentication is already built in, and the workshop focuses on data loading plus favorites.

## What is implemented now

1. Users must create an account before any tables are visible.
2. Auth uses a simple email/password signup flow with one submit button.
3. Signed-in users can sign out from the top-right button.
4. Two data views are available: Paintings and Artists.
5. Paintings include image previews sourced by `work_id`.
6. Favorite actions are available for artists and paintings only.

## Quick Start - IMPORTANT SETUP STEPS

**Before creating any accounts, you must:**

1. **Disable email confirmation in Supabase:**
   - Go to Supabase Dashboard → Authentication → Settings → Email Auth
   - Turn OFF "Enable email confirmations"
   - This allows immediate access after account creation

2. **Run the database migration:**
   - Open Supabase SQL Editor
   - Copy and paste the entire contents of `supabase/migrations/20260409_create_user_favorites.sql`
   - Execute the migration (this creates the user table, trigger, and policies)

**If you skip these steps, account creation will fail or users won't be created in the database.**

## Install and run

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Without these values, the app still runs but remains in placeholder mode.

## Supabase tables expected

Source tables:

1. `artist`
2. `work`
3. `image_link` (maps image urls to `work_id`)

User favorites table:

1. `user.favorite_artist`
2. `user.favorite_work`

The app stores one id per favorite column (latest selection wins).

Migration file for this table and policies is included at:

`supabase/migrations/20260409_create_user_favorites.sql`

## User/auth connection

The favorites table is directly keyed by `auth.users.id`.
Each authenticated user has exactly one row in `public."user"`, and favorites update that row.

The included migration also adds:

1. Trigger to auto-create a `public."user"` row when a new auth user is created.
2. Backfill insert so existing auth users also get an empty `public."user"` row.
3. RLS policies so users can read/update only their own row.
4. `updated_at` trigger for audit clarity.

## Run the migration

1. Open Supabase SQL Editor.
2. Paste the SQL in `supabase/migrations/20260409_create_user_favorites.sql`.
3. Run it once per project.

Or if you use Supabase CLI migration workflow, run your normal `supabase migration up` flow.

## Table shape

```sql
create table if not exists public."user" (
  id uuid primary key references auth.users(id) on delete cascade,
  favorite_artist bigint,
  favorite_work bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Workshop flow

1. Complete the setup steps above (disable email confirmation and run migration).
2. Start the app with `npm run dev`.
3. Create an account with email/password.
4. Import CSV data into `artist`, `work`, and `image_link` tables in Supabase.
5. Browse Paintings and Artists tabs.
6. Favorite a painting and artist while signed in.
7. Verify ids are written to `user.favorite_work` and `user.favorite_artist` in Supabase.
