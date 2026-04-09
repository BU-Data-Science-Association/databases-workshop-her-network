# Quick Start Guide for GitHub Codespaces

Follow these steps to get the workshop running in a Codespace:

## 1. Create a Codespace

1. Go to the GitHub repository page
2. Click the green **"Code"** button
3. Select the **"Codespaces"** tab
4. Click **"Create codespace on main"**

Wait for the Codespace to build (usually 1-2 minutes). It will automatically run `npm install`.

## 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# In the terminal, create the file:
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

## 3. Complete Supabase Setup

Before running the app, complete these steps in your Supabase dashboard:

### A. Disable Email Confirmation
- Go to **Authentication** → **Settings** → **Email Auth**
- Turn OFF **"Enable email confirmations"**

### B. Run Database Migrations
- Open **SQL Editor** in Supabase
- Run the first migration:
  - Copy contents of `supabase/migrations/20260409_create_art_tables.sql`
  - Execute it
- Run the second migration:
  - Copy contents of `supabase/migrations/20260409_create_user_favorites.sql`
  - Execute it

### C. Import CSV Data
- Go to **Table Editor** in Supabase
- Import `data/artist.csv` → `artist` table
- Import `data/work.csv` → `work` table
- Import `data/image_link.csv` → `image_link` table

## 4. Start the Development Server

```bash
npm run dev
```

A notification will pop up asking you to open the app in your browser. Click it, or:
- Go to the **Ports** tab in VS Code
- Click the globe icon next to port **5173**

## 5. Create an Account

- Open the app in your browser
- Create an account with any email/password
- You should now see the Paintings and Artists tabs with data!

## Troubleshooting

**App shows "No data rows yet":**
- Make sure you imported the CSV files into Supabase
- Check that your `.env.local` has the correct Supabase credentials
- Refresh the page after adding environment variables

**Port 5173 not forwarding:**
- Check the Ports tab in VS Code
- Manually forward port 5173 if needed
- Vite may auto-select another port (5174, 5175, etc.)

**Authentication not working:**
- Verify email confirmation is disabled in Supabase
- Check that both migrations ran successfully
- Look at the browser console for error messages
