# Databases Workshop 3: Supabase Art Explorer

This project is intentionally minimal.
Authentication is already built in, and the workshop focuses on data loading plus favorites.

## What is implemented now

1. Users can sign up/sign in with email + password from the start screen.
2. Signed-in users can sign out from the top-right button.
3. Two data views are available: Paintings and Artists.
4. Paintings include image previews sourced by `work_id`.
5. Favorite actions are available for artists and paintings only.

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

## Suggested `user` table shape

Use one row per auth user and match either `id` or `user_id` to `auth.users.id`.

```sql
create table if not exists public."user" (
  id uuid primary key references auth.users(id) on delete cascade,
  favorite_artist bigint,
  favorite_work bigint
);
```

If your workshop uses `user_id` instead of `id`, the app includes fallback update logic for both.

## Workshop flow

1. Start app and sign in with email/password.
2. Add Supabase keys if needed.
3. Import CSV data into `artist`, `work`, and `image_link`.
4. Browse Paintings and Artists.
5. Favorite a painting and artist while signed in.
6. Verify ids are written to `user.favorite_work` and `user.favorite_artist`.

## Auth note

To allow immediate access after sign-up, disable email confirmation in Supabase Auth settings.
