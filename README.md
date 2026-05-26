# ClassFeeTracker

ClassFeeTracker is a Next.js app for parents to manage children, teachers, classes, sessions, currencies, and fee payments in one place.

## Features

- Supabase email/password authentication with email verification and server-side invite code gate
- Protected app routes with server-side session refresh
- Children, teachers, classes, sessions, payments, and currency management
- Active/inactive controls for classes and teachers
- Child-centered Sessions and Pay pages
- Export Sessions and Payments to CSV (respects the active child filter; opens in Excel or Google Sheets)
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

Copy [`.env.example`](.env.example) to `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-only — required for signup (never use NEXT_PUBLIC_ prefix)
INVITE_CODE=MYFAMILY2026
```

Signup posts to `/api/auth/signup`, which compares `inviteCode` to `INVITE_CODE` on the server before calling Supabase Auth. The invite code is never embedded in the frontend bundle.

**Vercel:** Project → Settings → Environment Variables → add `INVITE_CODE` (and Supabase vars) for Production/Preview, then redeploy. Without `INVITE_CODE`, signup is rejected.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

Database schema lives in `supabase/migrations/`. Run the migration files in order in the Supabase SQL editor (or via the Supabase CLI):

1. `supabase/migrations/20260525000000_create_app_schema.sql`
2. `supabase/migrations/20260525000001_enable_rls_and_policies.sql`
3. `supabase/migrations/20260525000002_grants_and_auth_trigger.sql`

If you already created tables manually before these migrations existed, run `supabase/fix-existing-schema-permissions.sql` instead to apply grants, currency policies, and compatibility fixes without recreating tables.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
```

## Project Structure

- `app/` - Next.js routes and page UI
- `components/` - shared UI, auth, and export components
- `hooks/` - auth and app data hooks
- `lib/` - auth, Supabase, types, app data helpers, and CSV export utilities
- `supabase/` - database support SQL
- `tests/unit/` - unit tests (mirrors `lib/` structure)

## Notes

- Authentication routes are `/login`, `/signup`, `/verify-email`, and `/forgot-password`.
- Authenticated app routes are protected through `proxy.ts`.
- Sessions and payments can be added, edited, and deleted from the app UI.

## Session security (Supabase)

Session lifetime is managed by **Supabase Auth**, not custom app code. Your app refreshes tokens on each request via [`proxy.ts`](proxy.ts).

**Recommended dashboard settings** ([Authentication → Sessions](https://supabase.com/dashboard/project/_/auth/sessions)):

| Setting | Suggested value | Notes |
|---------|-----------------|-------|
| **JWT expiry** | `3600` (1 hour) | Default; access tokens are short-lived |
| **Refresh token rotation** | On | Industry standard; invalidates reused tokens |
| **Inactivity timeout** | `30m`–`1h` | Ends sessions with no refresh activity (Pro plan) |
| **Time-box user sessions** | `7d`–`30d` | Max session length before re-login (Pro plan) |
| **Single session per user** | Optional | Only the latest login stays active |

**Defaults (if you change nothing):** sessions stay valid until the user signs out or the refresh token is revoked. There is no idle timeout by default.

**How enforcement works:** limits are checked when the session is **refreshed** (navigation/API calls), so the effective timeout is roughly your setting plus up to one JWT expiry window. See [Supabase session docs](https://supabase.com/docs/guides/auth/sessions).

**Free tier:** advanced session controls (inactivity / time-box) may require Pro; JWT expiry and refresh rotation are still available on all plans.
