# ClassFeeTracker

ClassFeeTracker is a Next.js app for parents to manage children, teachers, classes, sessions, currencies, and fee payments in one place.

## Features

- Supabase email/password authentication with email verification
- Protected app routes with server-side session refresh
- Children, teachers, classes, sessions, payments, and currency management
- Active/inactive controls for classes and teachers
- Child-centered Sessions and Pay pages
- Multi-currency fee and payment tracking
- Responsive UI with a soft blue background and white content cards

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth and Database
- Tailwind CSS
- Radix UI components

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

The app expects existing Supabase tables for profiles, children, teachers, classes, sessions, fee rules, payments, and currencies.

Run the SQL in `supabase/fix-existing-schema-permissions.sql` in the Supabase SQL editor to apply the grants, RLS support, currency seed data, and compatibility columns used by the app.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

- `app/` - Next.js routes and page UI
- `components/` - shared UI and auth components
- `hooks/` - auth and app data hooks
- `lib/` - auth, Supabase, types, and app data helpers
- `supabase/` - database support SQL

## Notes

- Authentication routes are `/login`, `/signup`, `/verify-email`, and `/forgot-password`.
- Authenticated app routes are protected through `proxy.ts`.
- Sessions and payments can be added, edited, and deleted from the app UI.
