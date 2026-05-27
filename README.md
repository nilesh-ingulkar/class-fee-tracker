# ClassFeeTracker

ClassFeeTracker is a Next.js app for parents to manage children, teachers, classes, sessions, currencies, and fee payments in one place.

## Features

- Supabase email/password authentication with email verification and server-side invite code gate
- Protected app routes with server-side session refresh
- Children, teachers, classes, sessions, payments, and currency management
- **Per-class** and **monthly** billing with balance calculations driven by historical fee rules
- **Fee rate history** (`fee_rules` table): change rates with an effective date; view read-only history on each class detail page
- Class list and **class detail** (`/classes/[id]`) — sessions, payments, financial summary, rate history
- Active/inactive controls for classes and teachers
- Child-centered Sessions and `/payments` pages with add, edit, and delete
- Accessible delete confirmations (no native `window.confirm`)
- Session time picker with **5-minute** increments (custom control; native `<input type="time">` is not used)
- Export Sessions and Payments to CSV (respects the active child filter; opens in Excel or Google Sheets)
- Multi-currency fee and payment tracking (symbols from Settings)
- Dashboard quick actions for sessions and payments
- Theme options (light, dark, professional blue) in Settings
- Responsive UI with a soft blue background and white content cards

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth and Database
- Tailwind CSS
- Radix UI components

## Requirements

- Node.js **20.9+** and npm **10+** (see `package.json` `engines`)

## Getting Started

Install dependencies:

```bash
npm install
```

Copy [`.env.example`](.env.example) to `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only — required for signup (never use NEXT_PUBLIC_ prefix)
INVITE_CODE=MYFAMILY2026
```

Signup posts to `/api/auth/signup`, which compares `inviteCode` to `INVITE_CODE` on the server before calling Supabase Auth. The invite code is never embedded in the frontend bundle.

**Vercel:** Project → Settings → Environment Variables → add `INVITE_CODE`, `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-app.vercel.app`), and Supabase vars for Production, then redeploy.

### Auth email links (fix localhost redirects in production)

Confirmation emails use `NEXT_PUBLIC_SITE_URL` to build `/auth/callback`. If users land on `localhost` after clicking the email link, update **both**:

1. **Vercel** — `NEXT_PUBLIC_SITE_URL=https://your-production-domain` (no trailing slash)
2. **Supabase Dashboard → Authentication → URL Configuration**
   - **Site URL** = same production URL
   - **Redirect URLs** — add `https://your-production-domain/auth/callback`

Redeploy after changing env vars. New signups/resends will use the correct domain.

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
npm run test:watch   # optional — Vitest watch mode
```

## Project Structure

- `app/` — Next.js routes and page UI (`(app)/` authenticated shell, `(auth)/` login/signup)
- `app/(app)/classes/[id]/` — class detail (sessions, payments, rate history)
- `app/api/auth/signup/` — server-side invite validation and Supabase signup
- `app/api/classes/[id]/` — `PATCH` class updates and fee-rule changes (cookie auth)
- `app/api/sessions/[id]/` — `PATCH` session updates (cookie auth)
- `components/` — shared UI, auth (`app-sidebar`, `mobile-nav`), `export-csv-button`, `fee-rate-history-card`, `time-picker`, `confirm-delete-dialog`
- `hooks/` — `use-auth`, `use-app-data` (client data + mutations)
- `lib/` — auth, Supabase, types, `app-data`, `fee-engine`, `fee-rules`, `invite-code`, `site-url`
- `lib/classes/`, `lib/sessions/` — server-side update helpers used by API routes
- `lib/export/` — CSV export and date/time formatting helpers
- `proxy.ts` — session refresh and route protection (not a root `middleware.ts`; `/api` routes are excluded from the matcher)
- `supabase/migrations/` — schema, RLS, grants
- `tests/unit/` — Vitest unit tests (mirrors `lib/` structure)

## Notes

- Authentication routes are `/login`, `/signup`, `/verify-email`, and `/forgot-password`.
- `/forgot-password` is a UI placeholder only (no Supabase password reset yet).
- Authenticated app routes are protected through [`proxy.ts`](proxy.ts), which calls [`lib/supabase/middleware.ts`](lib/supabase/middleware.ts) for session refresh and redirects.
- Main app routes: `/dashboard`, `/children`, `/classes`, `/classes/[id]`, `/teachers`, `/sessions`, `/payments`, `/settings`.
- **Changing a class fee:** use **Classes → Edit**, enter the new amount and **Rate effective from**; prior rules are closed in `fee_rules` automatically. View history on the class detail page.
- Class and session updates that need reliable auth cookies use **`/api/classes/[id]`** and **`/api/sessions/[id]`** from the browser; other reads/writes still use the Supabase client in `use-app-data`.
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
