# Devcontainer Configuration

This devcontainer is configured for GitHub Codespaces and local VS Code development.

## What's Included

- **Node.js 20** (LTS version)
- **Git** for version control
- **VS Code Extensions:**
  - ESLint for JavaScript/TypeScript linting
  - Prettier for code formatting
  - Tailwind CSS IntelliSense
  - Supabase VS Code extension

## Automatic Setup

When you open this project in a Codespace or VS Code with Dev Containers:

1. The container will automatically build
2. `npm install` will run to install all dependencies
3. Port 5173 (Vite dev server) will be forwarded

## Getting Started

1. **Set up environment variables:**
   ```bash
   cp .env .env.local  # or create .env.local manually
   ```

   Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Click the "Open in Browser" notification when Vite starts
   - Or go to the Ports tab and click the forwarded port 5173

## Supabase Setup

Remember to complete the Supabase setup steps from the main README:
- Disable email confirmation in Supabase Auth settings
- Run both migration files in Supabase SQL Editor
- Import CSV data into the tables

## Troubleshooting

**Port already in use:**
If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.)

**Environment variables not loading:**
Make sure your `.env.local` file exists and contains the correct Supabase credentials. Restart the dev server after creating/modifying it.
