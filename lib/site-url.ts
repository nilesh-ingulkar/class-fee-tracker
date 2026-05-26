/**
 * Canonical app URL for auth email links and redirects.
 *
 * Set NEXT_PUBLIC_SITE_URL in `.env.local` and Vercel (e.g. https://your-app.vercel.app).
 * Also set the same value as Supabase Dashboard → Authentication → URL Configuration → Site URL,
 * and add `{SITE_URL}/auth/callback` to Redirect URLs.
 */
export function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

/**
 * Resolves the public site origin.
 * 1. NEXT_PUBLIC_SITE_URL (required in production)
 * 2. requestOrigin (API routes, e.g. local dev)
 * 3. window.location.origin (browser fallback when env unset)
 */
export function resolveSiteUrl(requestOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeSiteUrl(configured);
  }

  if (requestOrigin) {
    return normalizeSiteUrl(requestOrigin);
  }

  if (typeof window !== "undefined") {
    return normalizeSiteUrl(window.location.origin);
  }

  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. Add it to .env.local and Vercel environment variables.",
  );
}
