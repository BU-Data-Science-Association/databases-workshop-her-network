# Databases Workshop 3: Supabase Art Explorer

This project is intentionally minimal so workshop participants can add Supabase functionality step by step.

## What is implemented now

1. The app loads immediately.
2. A top-right Sign in button is available.
3. Three table views are available: Paintings, Artists, Museums.
4. By default, no records are shown until Supabase is configured and data is loaded.
5. Favorite buttons are present and become active after sign-in.

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

Without these values, the app still runs but stays in workshop placeholder mode.

## Supabase tables expected

The app expects these source tables:

1. `artist`
2. `work`
3. `museum`

And a user profile table named `user` with favorite columns:

1. `favorite_artist`
2. `favorite_work`
3. `favorite_museum`

The app writes a single selected id per column (latest selection wins).

## Suggested `user` table shape

Use a row-per-auth-user approach and match either `id` or `user_id` to `auth.users.id`.

```sql
create table if not exists public."user" (
  id uuid primary key references auth.users(id) on delete cascade,
  favorite_artist bigint,
  favorite_work bigint,
  favorite_museum bigint
);
```

If your workshop prefers `user_id` instead of `id`, the app includes fallback update logic for both.

## Workshop flow

1. Start app with empty views and review UI shell.
2. Add Supabase keys.
3. Sign up/sign in with email and password.
4. Import CSV data into `artist`, `work`, `museum`.
5. Click Favorite in each tab while signed in.
6. Verify favorite ids are written to `user.favorite_artist`, `user.favorite_work`, `user.favorite_museum`.

## Auth note

To allow immediate sign-in after sign-up in the workshop, disable email confirmation in Supabase Auth settings.
