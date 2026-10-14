# Membership App (Supabase + Next.js)

A simple membership application built with Next.js and Supabase only.

## Features
- Email/password authentication via Supabase Auth
- Automatic profile + free membership on signup
- Membership tiers: free / pro / vip
- Tiered content protected by Row Level Security (RLS)
- Dashboard showing current membership status

## Setup

1. Create a Supabase project and run the SQL schema (see `supabase/schema.sql`).
2. Copy `.env.example` to `.env.local` and ensure the values are filled.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Supabase SQL
See the `supabase/schema.sql` file and run it in the Supabase SQL Editor.

## Notes
- The publishable/anon key is safe for client-side use when RLS policies are correctly set.
- Make the repository private before committing any additional secrets.
- Membership upgrades currently need to be done manually in the Supabase dashboard (or via a future Edge Function).
