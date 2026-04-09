# BU DSA x Boston Hacks Databases Workshop: Supabase Art Explorer

Learn Supabase fundamentals by building an authenticated art gallery with user favorites. Authentication is pre-built. You will focus on database setup, data loading, and user-specific data.

## Workshop Goals

1. Set up Supabase tables and Row Level Security policies
2. Import CSV data into PostgreSQL tables
3. Query data through Supabase client
4. Store user-specific data linked to authentication

## Setup

### Option 1: GitHub Codespaces

1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for automatic setup to complete

### Option 2: Local Development

```bash
npm install
npm run dev
```

### Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings under API.

## Workshop Steps

### 1. Configure Supabase Authentication

In Supabase Dashboard:

- Go to Authentication → Settings → Email Auth
- Disable "Enable email confirmations"

### 2. Run Database Migrations

In Supabase SQL Editor, execute in order:

1. Copy and run `supabase/migrations/20260409_create_art_tables.sql`
2. Copy and run `supabase/migrations/20260409_create_user_favorites.sql`

This creates four tables:

- `artist` - Artist records with biographical data
- `work` - Artwork records linked to artists
- `image_link` - Image URLs mapped to works
- `user` - User favorites linked to auth accounts

### 3. Import CSV Data

In Supabase Table Editor, import:

- `data/artist.csv` → `artist` table
- `data/work.csv` → `work` table
- `data/image_link.csv` → `image_link` table

### 4. Test the Application

1. Start the dev server: `npm run dev`
2. Create an account with any email and password
3. Verify you see paintings and artists
4. Click "Favorite" on a painting and an artist
5. In Supabase Table Editor, check the `user` table to see your favorites saved

## Database Architecture

### Authentication Flow

- Supabase handles user authentication in `auth.users`
- A database trigger auto-creates a row in `public.user` for each new user
- RLS policies ensure users can only read/write their own data

### Data Relationships

- Each `work` references an `artist` by `artist_id`
- Each `work` can have an `image_link` by `work_id`
- Each `user` stores one `favorite_artist` and one `favorite_work`

### Key Files

- `src/services/artData.ts` - Data fetching logic
- `src/services/favorites.ts` - User favorites logic
- `src/lib/supabase.ts` - Supabase client setup

## What You'll Learn

1. How to structure PostgreSQL tables in Supabase
2. How Row Level Security (RLS) protects user data
3. How database triggers automate data management
4. How to query related data with the Supabase client
5. How to link application data to authenticated users
